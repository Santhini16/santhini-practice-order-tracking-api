import { logger } from '../logger/logger.js';
import { OrderModel } from '../models/order.model.js';
import { ProductModel } from '../models/product.model.js';
import { userModel } from '../models/user.model.js';
import PostOrderService from '../services/orderService/addOrder.js';
import BasicServices from '../services/basicCRUD.js';
import getUserOrderService from '../services/orderService/getUserOrders.js';
import GetTomorrowOrderServices from '../services/orderService/getTomorowOrders.js';
import GetNextOrderServices from '../services/orderService/getNextOrders.js';
import PaymentService from '../services/paymentService/paymentService.js';
import AdminOrderService from '../services/orderService/adminOrderService.js';
import GetUserOrderServices from '../services/orderService/userOrderService.js';

const createOrder = async (req, res) => {
  logger.info(`Create Order api is Executing`);
  const postOrderService = new PostOrderService(userModel ,OrderModel, ProductModel);
  const responseMessage = await postOrderService.createOrder(req);
  logger.info(`Create Order api is Executed`);
  res.status(responseMessage.status).json(responseMessage);
}


const addOrder = async (req, res) => {
  logger.info(`Post Order api is Executing`);
  const postOrderService = new PostOrderService(OrderModel, ProductModel);
  const responseMessage = await postOrderService.addOrder(req);
  logger.info(`Post Order api is Executed`);
  res.status(responseMessage.status).json(responseMessage);
};



const getOrders = async (req, res) => {
  logger.info(`Get Order api Executing`);
  const getOrderService = new BasicServices(OrderModel);
  const responseMessage = await getOrderService.getAll(req);
  logger.info(`Get Order api Executed`);
  res.status(responseMessage.status).json(responseMessage);
};

const getOrdersByUser = async (req, res) => {
  logger.info(`Get Order by user api Executing`);
  const getOrderService = new getUserOrderService(OrderModel);
  const responseMessage = await getOrderService.getUserOrder(req);
  logger.info(`Get Order by user api Executed`);
  res.status(responseMessage.status).json(responseMessage);
};

const getPlacedOrdersByUser = async (req, res) => {
  logger.info(`Get Order by user api Executing`);
  const getOrderService = new getUserOrderService(OrderModel);
  const responseMessage = await getOrderService.getUserPlcedOrder(req);
  logger.info(`Get Order by user api Executed`);
  res.status(responseMessage.status).json(responseMessage);
};

const getOrderById = async (req, res) => {
  logger.info('Get Order By iD api is Executing');
  const getOrderByIdService = new BasicServices(OrderModel);
  const responseMessage = await getOrderByIdService.getOne(req);
  logger.info(`Get Order By Id Api Executed`);
  res.status(responseMessage.status).json(responseMessage);
};


const updateOrder = async (req, res) => {
  logger.info('Update Order API is Executing');
  const updateOrderService = new BasicServices(OrderModel);
  const responseMessage = await updateOrderService.updateOne(req);
  logger.info('Update Order API is Executed');
  res.status(responseMessage.status).json(responseMessage);
};

const deleteOrder = async (req, res) => {
  logger.info(`delete Order api is executing`);
  const deleteOrderService = new BasicServices(OrderModel);
  const responseMessage = await deleteOrderService.deleteOne(req);
  logger.info(`delete Order api is executed`);
  res.status(responseMessage.status).json(responseMessage);
};

const tomorrowOrder = async (req, res) => {
  logger.info(`tomorrow Order api is executing`);
  const tomorrowOrderService = new GetTomorrowOrderServices(OrderModel);
  const responseMessage = await tomorrowOrderService.getTomorrowOrders(req);
  logger.info(`tomorrow Order api is executed`);
  res.status(responseMessage.status).json(responseMessage);
};

const nextOrder = async (req, res) => {
  logger.info(`next Order api is executing`);
  const nextOrderService = new GetNextOrderServices(OrderModel);
  const responseMessage = await nextOrderService.getNextOrders(req);
  logger.info(`next Order api is executed`);
  res.status(responseMessage.status).json(responseMessage);
};

const orderPayment = async (req, res) => {
  logger.info(`orderPayment API is executing`);
  const orderPaymentService = new PaymentService(ProductModel, OrderModel);
  const responseMessage = await orderPaymentService.addOrderPayment(req);
  logger.info(`orderPayment API is executed`);
  res.status(responseMessage.status).json(responseMessage);
}

const verifyAndConfirmPayment = async (req, res) => {
  logger.info(`Verify and Confirm Order API is executing`);
  const orderPaymentService = new PaymentService(ProductModel, OrderModel);
  const responseMessage = await orderPaymentService.verifyAndConfirmPayment(req);
  logger.info(`verify and Confirm Order API is executed`);
  res.status(responseMessage.status).json(responseMessage);
}

const markDeliveryCOD = async (req, res) => {
  logger.info(`markDeliveryCOD API is executing`);
  const orderPaymentService = new PaymentService(ProductModel, OrderModel);
  const responseMessage = await orderPaymentService.markDeliveryCOD(req);
  logger.info(`markDeliveryCOD API is executed`);
  res.status(responseMessage.status).json(responseMessage);
}

const updatePayment = async (req, res) => {
  logger.info(`updatePayment API is executing`);
  const paymentService = new PaymentService(ProductModel, OrderModel);
  const response = await paymentService.updatePayment(req);
  logger.info(`updatePayment API executed`);
  res.status(response.status).json(response);
}


const getAllOrders = async (req, res) => {
  logger.info(`Get All Orders api Executing`);
  const getOrderService = new GetUserOrderServices(userModel, OrderModel);
  const responseMessage = await getOrderService.getUserOrders(req);
  logger.info(`Get All Orders api Executed`);
  res.status(responseMessage.status).json(responseMessage);
}

const getPlacedOrders = async (req, res) => {
  logger.info(`Get Placed Orders api Executing`);
  const getOrderService = new AdminOrderService(OrderModel);
  const responseMessage = await getOrderService.getPlacedOrders(req);
  logger.info(`Get Placed Orders api Executed`);
  res.status(responseMessage.status).json(responseMessage);
}

const getNextWeekOrders = async (req, res) => {
  logger.info(`Get Next Week Orders api Executing`);
  const getOrderService = new AdminOrderService(OrderModel);
  const responseMessage = await getOrderService.getNextWeekOrders(req);
  logger.info(`Get Next Week Orders api Executed`);
  res.status(responseMessage.status).json(responseMessage);
}

const updateDeliveryStatus = async (req, res) => {
  logger.info(`Update Delivery Status API is Executing`);
  const adminOrderService = new AdminOrderService(OrderModel, ProductModel, userModel);
  const responseMessage = await adminOrderService.updateDeliveryStatus(req);
  logger.info(`Update Delivery Status API is Executed`);
  res.status(responseMessage.status).json(responseMessage);
}

const updateOrderStatus = async (req, res) => {
  logger.info(`Update Order Status API is Executing`);
  const adminOrderService = new AdminOrderService(OrderModel, ProductModel);
  const responseMessage = await adminOrderService.updateOrderStatus(req);
  logger.info(`Update Order Status API is Executed`);
  res.status(responseMessage.status).json(responseMessage);
}

const updateTrackingDetails = async (req, res) => {
  logger.info(`Update Tracking Details API is Executing`);
  const adminOrderService = new AdminOrderService(OrderModel, ProductModel, userModel);
  const responseMessage = await adminOrderService.updateTrackingDetails(req);
  logger.info(`Update Tracking Details API is Executed`);
  res.status(responseMessage.status).json(responseMessage);
}


const completeCODOrder = async (req, res) => {
  logger.info(`Complete COD Order API is Executing`);
  const orderPaymentService = new PaymentService(ProductModel, OrderModel);
  const responseMessage = await orderPaymentService.completeCodPayment(req); 
  logger.info(`Complete COD Order API is Executed`);
  res.status(responseMessage.status).json(responseMessage);
}

const failedCODOrder = async (req, res) => {
  logger.info(`Failed COD Order API is Executing`);
  const orderPaymentService = new PaymentService(ProductModel, OrderModel);
  const responseMessage = await orderPaymentService.failDelivery(req);
  logger.info(`Failed COD Order API is Executed`);
  res.status(responseMessage.status).json(responseMessage);
}

const getPaymentDetails = async (req, res) => {
  logger.info(`Get Payment Details API is Executing`);
  const paymentService = new PaymentService(ProductModel, OrderModel);
  const response = await paymentService.getPaymentDetails(req);
  logger.info(`Get Payment Details API executed`);
  res.status(response.status).json(response);
}

const verifyOnlinePayment = async (req, res) => {
  logger.info(`Verify COD Online Payment API is executing`);
  const paymentService = new PaymentService(ProductModel, OrderModel);
  const response = await paymentService.verifyOnlinePayment(req);
  logger.info(`Verify COD Online Payment API executed`);
  res.status(response.status).json(response);
}
 

export { addOrder, getOrders,getOrdersByUser, getPlacedOrdersByUser, getOrderById, updateOrder, deleteOrder, tomorrowOrder, nextOrder, orderPayment, updatePayment, createOrder, verifyAndConfirmPayment, markDeliveryCOD, getAllOrders, getPlacedOrders, getNextWeekOrders, updateDeliveryStatus, updateTrackingDetails, completeCODOrder, failedCODOrder, getPaymentDetails, verifyOnlinePayment, updateOrderStatus };