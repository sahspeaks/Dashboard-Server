import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Define the Base User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    eum: ["admin", "user", "deliverypartner"],
    required: true,
  },
  isActivated: {
    type: Boolean,
    default: false,
  },
});

// Define the Customer schema

const customerSchema = new mongoose.Schema({
  ...userSchema.obj,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["customer"],
    default: "customer",
  },
  address: {
    type: String,
  },
  liveLocation: {
    lattitude: {
      type: String,
    },
    longitude: {
      type: String,
    },
  },
});
// Define the Delivery Partner schema
const deliveryPartnerSchema = new mongoose.Schema({
  ...userSchema.obj,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    unique: true,
  },
  role: {
    type: String,
    enum: ["deliverypartner"],
    default: "deliverypartner",
  },
  address: {
    type: String,
  },
  liveLocation: {
    lattitude: {
      type: String,
    },
    longitude: {
      type: String,
    },
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
  },
});
// Define the Admin schema
const adminSchema = new mongoose.Schema({
  ...userSchema.obj,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin"],
    default: "admin",
  },
});

deliveryPartnerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

deliveryPartnerSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const Customer = mongoose.model("Customer", customerSchema);
export const DeliveryPartner = mongoose.model(
  "DeliveryPartner",
  deliveryPartnerSchema
);
export const Admin = mongoose.model("Admin", adminSchema);
