import { Customer, DeliveryPartner } from "../../models/index.js";

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.user;
    const updateData = req.body;

    let user =
      (await Customer.findById(userId)) ||
      (await DeliveryPartner.findById(userId));
    console.log(user);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    let UserModel;
    if (user.role === "customer") {
      UserModel = Customer;
    } else if (user.role === "deliverypartner") {
      UserModel = DeliveryPartner;
    } else {
      return res.status(400).json({
        message: "Invalid Role",
      });
    }
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedUser) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
