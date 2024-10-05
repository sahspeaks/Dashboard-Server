import {
  createOrder,
  confirmOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from "../controllers/order/order.controller.js";
import Router from "express";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyToken);
//order routes
router.post("/order/add", createOrder);
router.get("/order", getOrders);
router.post("/order/:orderId", getOrderById);
router.patch("/order/:orderId/updateStatus", updateOrderStatus);
router.post("/order/:orderId/confirm", confirmOrder);

export default router;
