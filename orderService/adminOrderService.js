import { sendResponse } from '../../common/common.js';
import { CODES } from '../../common/response-code.js';
import { logger } from '../../logger/logger.js';
import { createNotification } from '../notificationService/NotificationUserServices.js';

export default class AdminOrderService {
    #orderModel;
    #productModel;
    #userModel;

    constructor(orderModel, productModel, userModel) {
        this.#orderModel = orderModel;
        this.#productModel = productModel;
        this.#userModel = userModel;
    }
    getPlacedOrders = async (req) => {
            try {
                // Dynamoose-friendly filter using scan
                const orders = await this.#orderModel
                .scan("status")
                .eq("PLACED")
                .exec();

                const sortedOrders = orders.sort(
                (a, b) => new Date(b.createdOn) - new Date(a.createdOn)
                );

                return sendResponse(CODES.OK, "Placed orders fetched", sortedOrders);

            } catch (err) {
                logger.error(err);
                return sendResponse(
                CODES.INTERNAL_SERVER_ERROR,
                `Failed to fetch placed orders = ${err}`
                );
            }
    };
    getNextWeekOrders = async (req) => {
        try {
            const orders = await this.#orderModel.scan().exec();

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const nextWeek = new Date();
            nextWeek.setDate(today.getDate() + 7);
            nextWeek.setHours(23, 59, 59, 999);

            // 2. Filter only orders having a valid deliveryDate between today and next 7 days
            const upcoming = orders.filter(order => {
            if (!order.deliveryDate) return false;

            const date = new Date(order.deliveryDate);
            if (isNaN(date)) return false; // invalid date protection

            return date >= today && date <= nextWeek;
            });

            return sendResponse(CODES.OK, "Upcoming orders fetched", upcoming);

        } catch (err) {
            logger.error(err);
            return sendResponse(
            CODES.INTERNAL_SERVER_ERROR,
            `Failed to fetch upcoming orders = ${err}`
            );
        }
    };
    updateDeliveryStatus = async (req) => {
        try {
            const { orderId, deliveryStatus, notes, deliveryDate } = req.body;

            if (!orderId || !deliveryStatus) {
            return sendResponse(CODES.BAD_REQUEST, "orderId and deliveryStatus are required");
            }

            const allowedStatuses = ["SCHEDULED", "SHIPPED", "DELIVERED", "MISSED", "CANCELLED"];
            if (!allowedStatuses.includes(deliveryStatus)) {
            return sendResponse(
                CODES.BAD_REQUEST,
                `Invalid delivery status. Allowed: ${allowedStatuses.join(", ")}`
            );
            }

            const order = await this.#orderModel.get(orderId);
            if (!order) {
            return sendResponse(CODES.NOT_FOUND, "Order not found");
            }

            if (order.status === "DELIVERED" && deliveryStatus !== "DELIVERED") {
            return sendResponse(CODES.BAD_REQUEST, "Order already delivered. Cannot change status.");
            }

            if (deliveryStatus === "DELIVERED" && order.paymentStatus !== "PAID") {
                return sendResponse(
                    CODES.BAD_REQUEST,
                    "Cannot mark as delivered. Payment is pending."
                );
            }

            const now = new Date().toISOString();

            const historyEntry = {
            deliveryDate: deliveryDate || now,
            deliveryStatus,
            notes: notes || "",
            updatedAt: now,
            };

            order.deliveryHistory = order.deliveryHistory || [];
            order.deliveryHistory.push(historyEntry);

            if (deliveryStatus === "DELIVERED") {
            order.status = "DELIVERED";
            }

            if (deliveryStatus === "MISSED" || deliveryStatus === "CANCELLED") {
            order.status = "CANCELED";
            if (order.paymentStatus === "PAID") {
                order.paymentStatus = "FAILED";

                order.paymentHistory = order.paymentHistory || [];
                order.paymentHistory.push({
                paymentDate: now,
                amount: order.totalPrice,
                paymentMethod:
                    order.paymentHistory?.[order.paymentHistory.length - 1]?.paymentMethod || null,
                paymentId: null,
                paymentStatus: "FAILED",
                notes: `Delivery ${deliveryStatus.toLowerCase()} - refund required`,
                });
            }
            if (Array.isArray(order.products)) {
                for (const p of order.products) {
                try {
                    const product = await this.#productModel.get({ productId: p.productId });

                    if (product?.productType === "readyToShip") {
                    const reservedQty = p.quantity || p.cartQuantity || 0;

                    if (reservedQty > 0) {
                        await this.#productModel.update(
                        { productId: p.productId },
                        { $ADD: { reserveQuantity: -reservedQty } }
                        );
                    }
                    }
                } catch (err) {
                    logger.error(
                    `Failed to release inventory for product ${p.productId} in order ${orderId}: ${err}`
                    );
                }
                }
            }
            }
            await createNotification({
                userEmail: order.userEmail,
                title: "Order Update",
                message: `Your order ${orderId} status changed to ${deliveryStatus}`,
                data: { orderId, status: deliveryStatus }
            });
            if (deliveryStatus === "SHIPPED" && order.paymentStatus !== "PAID") {
                await createNotification({
                    userEmail: order.userEmail,
                    title: "Payment Pending",
                    message: `Your order ${orderId} has been shipped, but payment is still pending. Please pay before delivery.`,
                    data: { orderId, status: "PAYMENT_PENDING" }
                });
            }

            await order.save();

            return sendResponse(CODES.OK, "Delivery status updated", {
            orderId: order.orderId,
            updatedStatus: deliveryStatus,
            orderStatus: order.status,
            paymentStatus: order.paymentStatus,
            latestHistory: historyEntry,
            });

        } catch (error) {
            logger.error(error);
            return sendResponse(
            CODES.INTERNAL_SERVER_ERROR,
            `Failed to update delivery status = ${error}`
            );
        }
    };

    updateOrderStatus = async (req) => {
        try {
            logger.info("General Update Order API");

            const { orderId, set = {}, push = {}, pull = {} } = req.body;

            if (!orderId) {
            return sendResponse(CODES.BAD_REQUEST, "OrderId is required");
            }

            const order = await this.#orderModel.get(orderId);

            if (!order) {
            return sendResponse(CODES.NOT_FOUND, "Order not found");
            }

            // 1️⃣ Apply SET updates (normal or nested fields)
            for (const key of Object.keys(set)) {
            this._applyNestedSet(order, key, set[key]);
            }

            // 2️⃣ Apply PUSH updates (array fields)
            for (const key of Object.keys(push)) {
            if (!Array.isArray(order[key])) {
                return sendResponse(
                CODES.BAD_REQUEST,
                `Field '${key}' is not an array, cannot push`
                );
            }
            order[key].push(push[key]);
            }

            // 3️⃣ Apply PULL updates (remove items from array)
            for (const key of Object.keys(pull)) {
            if (!Array.isArray(order[key])) {
                return sendResponse(
                CODES.BAD_REQUEST,
                `Field '${key}' is not an array, cannot pull`
                );
            }
            const condition = pull[key];

            order[key] = order[key].filter((item) => {
                return !Object.keys(condition).every(
                (field) => item[field] === condition[field]
                );
            });
            }

            await order.save();

            return sendResponse(CODES.OK, "Order updated successfully");
        } catch (error) {
            logger.error("Error in updateOrder", error);
            return sendResponse(
            CODES.INTERNAL_SERVER_ERROR,
            `Failed to update order = ${error}`
            );
        }
    }

    _applyNestedSet(object, path, value) {
        const keys = path.split(".");
        let curr = object;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!curr[keys[i]]) curr[keys[i]] = {};
            curr = curr[keys[i]];
        }

        curr[keys[keys.length - 1]] = value;
    }
   
updateTrackingDetails = async (req) => {
  try {
    const { trackingId, courierName, notes } = req.body;
    const { orderId } = req.params;

    if (!orderId || !trackingId || !courierName) {
      return sendResponse(
        CODES.BAD_REQUEST,
        "orderId, trackingId and courierName are required"
      );
    }

    const now = new Date().toISOString();

    let deliveryStatus = "SCHEDULED";

    if (notes?.toLowerCase() === "shipped") {
      deliveryStatus = "SHIPPED";
    } 
    else if (notes?.toLowerCase() === "out for delivery") {
      deliveryStatus = "OUT FOR DELIVERY";
    } 
    else if (notes?.toLowerCase() === "delivered") {
      deliveryStatus = "DELIVERED";
    }

    await this.#orderModel.update(
      { orderId: orderId },
      {
        $SET: {
          "trackingDetails.trackingId": trackingId,
          "trackingDetails.courierName": courierName,
          "trackingDetails.notes": notes || ""
        },
        $ADD: {
          deliveryHistory: [{
            deliveryDate: now,
            deliveryStatus: deliveryStatus,
            notes: `Courier: ${courierName} TrackingId: ${trackingId}`
          }]
        }
      },
      {
        validate: false
      }
    );

    return sendResponse(CODES.OK, "Tracking updated");

  } catch (error) {
    logger.error(error);
    return sendResponse(
      CODES.INTERNAL_SERVER_ERROR,
      `Failed to update tracking = ${error}`
    );
  }
};


}