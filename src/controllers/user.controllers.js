import { LogError } from "../utils/Log.js";
import MongoDBErrorController from "../utils/MongoDBErrorController.js";

export const getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({ user });
  } catch (error) {
    LogError("(user.controllers) {GET}/user/get/profile", error);
    const errorHandler = MongoDBErrorController(error);
    return res.status(errorHandler?.status || 500).json({
      message: errorHandler?.message || "Internal server error.",
    });
  }
};
