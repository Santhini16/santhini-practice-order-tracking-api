import express from 'express';
import { addOrder, getOrders,getOrdersByUser, getPlacedOrdersByUser, getOrderById, updateOrder, deleteOrder, tomorrowOrder, nextOrder, orderPayment, updatePayment, createOrder, verifyAndConfirmPayment, markDeliveryCOD, getAllOrders, getPlacedOrders, getNextWeekOrders, updateDeliveryStatus, completeCODOrder, failedCODOrder, getPaymentDetails, verifyOnlinePayment, updateOrderStatus, updateTrackingDetails  } from '../controller/order.controller.js';
import verifyJWTToken from '../middeleware/auth.js';

const orderRouter = express.Router();

orderRouter.post('/createOrder', verifyJWTToken, createOrder);
orderRouter.post('/payment', verifyJWTToken, orderPayment);
orderRouter.post('/verifyPayment', verifyJWTToken, verifyAndConfirmPayment);
orderRouter.post('/verifyOnlinePayment', verifyJWTToken, verifyOnlinePayment);
orderRouter.put('/markDeliveryCOD', verifyJWTToken, markDeliveryCOD);
orderRouter.post('/addOrder',verifyJWTToken, addOrder);
orderRouter.get('/getOrders',verifyJWTToken, getOrders);
orderRouter.get('/getUserOrder/:email',verifyJWTToken, getOrdersByUser);
orderRouter.get('/getUserPlacedOrder/:email', verifyJWTToken, getPlacedOrdersByUser);
orderRouter.get('/getOne/:id', getOrderById);
orderRouter.put('/updateOrder/:id',verifyJWTToken, updateOrder);
orderRouter.delete('/delete/:id',verifyJWTToken, deleteOrder);
orderRouter.get('/tomorrowOrders', tomorrowOrder);
orderRouter.get('/nextOrders', nextOrder);
orderRouter.put('/updatePayment/:orderId', verifyJWTToken, updatePayment);
orderRouter.get('/getAllOrders', verifyJWTToken, getAllOrders);
orderRouter.get('/getPlacedOrders', verifyJWTToken, getPlacedOrders);
orderRouter.get('/getNextWeekOrders', verifyJWTToken, getNextWeekOrders);
orderRouter.put('/updateDeliveryStatus/:orderId', verifyJWTToken, updateDeliveryStatus);
orderRouter.put('/updateOrderStatus/:orderId', verifyJWTToken, updateOrderStatus);
orderRouter.patch('/:orderId/confirm-cod', verifyJWTToken, completeCODOrder);
orderRouter.patch("/:orderId/fail-cod", verifyJWTToken, failedCODOrder);
orderRouter.get('/getPaymentDetails', verifyJWTToken, getPaymentDetails);
orderRouter.put('/updateTrackingDetails/:orderId', verifyJWTToken, updateTrackingDetails);

export { orderRouter };
