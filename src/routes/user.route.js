import Router from "express";
import {
  loginCustomer,
  loginDeliveryPartner,
  fetchUser,
  refreshToken,
} from "../controllers/auth/auth.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

// Login routes
router.route("/customer/login").post(loginCustomer);
router.route("/delivery-partner/login").post(loginDeliveryPartner);
// Refresh token route
router.route("/refresh-token").post(refreshToken);
// Fetch user route
router.route("/user").get(verifyToken, fetchUser);

export default router;
