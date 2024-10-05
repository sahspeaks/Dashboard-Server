import {
  Customer,
  DeliveryPartner,
  Branch,
  Order,
} from "../../models/index.js";
import mongoose from "mongoose";

export const createOrder = async (req, res) => {
  try {
    const { userId } = req.user;

    const { items, branch, totalPrice } = req.body;

    // const customerData1 = await Customer.findOne({
    //   userId: userId.toString(),
    // });
    // console.log("Customer data1:", customerData1);

    // 2. If userId is the actual _id of the customer document
    const customerData = await Customer.findById(userId);

    console.log("Customer data:", customerData);
    if (!customerData) {
      return res.status(404).json({
        message: "Customer not found",
        userId: userId, // Include this for debugging
      });
    }

    const branchData = await Branch.findById(branch);
    console.log("Branch data:", branchData);
    if (!customerData) {
      return res.status(404).json({ message: "Customer not found" });
    }
    const newOrder = new Order({
      customer: userId,
      branch: branch,
      items: items.map((item) => ({
        id: item.id,
        item: item.item,
        count: item.count,
      })),
      totalPrice,
      deliveryLocation: {
        lattitude: customerData.liveLocation.lattitude,
        longitude: customerData.liveLocation.longitude,
        address: customerData.address || "No address Available",
      },
      pickupLocation: {
        lattitude: branchData.location.lattitude,
        longitude: branchData.location.longitude,
        address: branchData.address || "No address Available",
      },
    });
    console.log("New order:", newOrder);
    const savedOrder = await newOrder.save();
    console.log("Saved order:", savedOrder);
    return res.status(201).json(savedOrder);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const confirmOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.user;
    const { deliveryPersonLocation } = req.body;
    // console.log("Order ID:", orderId);
    // console.log("User ID:", typeof userId);
    // console.log("Delivery Person Location:", deliveryPersonLocation);

    const deliveryPerson = await DeliveryPartner.findOne({
      $or: [
        { userId: userId },
        { userId: new mongoose.Types.ObjectId(userId) },
        { _id: userId },
      ],
    });
    // console.log("Delivery Person:", deliveryPerson);
    if (!deliveryPerson) {
      return res.status(404).json({ message: "Delivery Person not found" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.status !== "available") {
      return res
        .status(400)
        .json({ message: "Order already confirmed::Cannot accept" });
    }
    order.status = "confirmed";
    order.deliveryPartner = deliveryPerson._id;
    order.deliveryPartnerLocation = {
      lattitude: deliveryPersonLocation?.lattitude,
      longitude: deliveryPersonLocation?.longitude,
      address: deliveryPersonLocation?.address || "",
    };
    req.io.to(orderId).emit("orderConfirmed", order);
    await order.save();
    return res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, deliveryPersonLocation } = req.body;
    const { userId } = req.user;
    const deliveryPerson = await DeliveryPartner.findOne({
      $or: [
        { userId: userId },
        { userId: new mongoose.Types.ObjectId(userId) },
        { _id: userId },
      ],
    });
    // console.log(orderId, status, deliveryPersonLocation, typeof userId);
    // console.log("Delivery Person:", deliveryPerson);

    if (!deliveryPerson) {
      return res.status(404).json({ message: "Delivery Person not found" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (["cancelled", "delivered"].includes(order.status)) {
      return res
        .status(400)
        .json({ message: "Order is already cancelled or delivered" });
    }
    if (order.deliveryPartner.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this order" });
    }
    console.log(orderId);
    req.io.to(orderId).emit("liveTrackingUpdates", order);

    order.status = status;
    order.deliveryPartnerLocation = deliveryPersonLocation;
    await order.save();
    return res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { status, customerId, deliveryPartnerId, branchId } = req.query;
    let query = {};
    if (status) {
      query.status = status;
    }
    if (customerId) {
      query.customer = customerId;
    }
    if (deliveryPartnerId) {
      query.deliveryPartner = deliveryPartnerId;
      query.branch = branchId;
    }
    const orders = await Order.find(query).populate(
      "customer branch deliveryPartner items.item"
    );

    return res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate(
      "customer branch deliveryPartner items.item"
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
