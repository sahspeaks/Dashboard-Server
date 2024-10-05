import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../../constants/env.constants.js";
import { Customer, DeliveryPartner } from "../../models/index.js";

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
  const refreshToken = jwt.sign(
    { userId: user._id, role: user.role },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
  return { accessToken, refreshToken };
};
export const loginCustomer = async (req, res) => {
  try {
    const { phone } = req.body;
    let customer = await Customer.findOne({ phone });
    if (!customer) {
      customer = new Customer({ phone, role: "customer", isActivated: true });
      await customer.save();
    }
    const { accessToken, refreshToken } = generateTokens(customer);
    return res.status(200).json({
      message: customer ? "Login successful" : "Customer created successfully",
      accessToken,
      refreshToken,
      customer,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const loginDeliveryPartner = async (req, res) => {
  try {
    const { email, password } = req.body;
    const deliveryPartner = await DeliveryPartner.findOne({ email });
    if (!deliveryPartner) {
      return res.status(404).json({ message: "Delivery Partner not found" });
    }
    const isPasswordValid = await deliveryPartner.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const { accessToken, refreshToken } = generateTokens(deliveryPartner);
    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      deliveryPartner,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const { userId, role } = decoded;
    let user;
    if (role === "customer") {
      user = await Customer.findById(userId);
    } else if (role === "deliveryPartner") {
      user = await DeliveryPartner.findById(userId);
    } else {
      return res.status(401).json({ message: "Invalid user role" });
    }
    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid refresh token: User not found" });
    }
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    return res.status(200).json({
      message: "Token refreshed successfully",
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const fetchUser = async (req, res) => {
  try {
    const { userId, role } = req.user;
    let user;
    if (role === "deliveryPartner") {
      user = await DeliveryPartner.findById(userId);
    } else if (role === "customer") {
      user = await Customer.findById(userId);
    } else {
      return res.status(401).json({ message: "Invalid user role" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User fetched Successfully", user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
