import Sessions from "../models/Sessions.js";
import { LogError } from "../utils/Log.js";
import MongoDBErrorController from "../utils/MongoDBErrorController.js";

export const authenticate = async (req, res, next) => {
  try {
    // Extract the Authorization header
    const authHeader = req.headers["authorization"];
    if (!authHeader)
      return res.status(401).json({ message: "Oops! Unauthorized." });
    // Split the header value to separate "Bearer" from the actual token
    const [bearer, token] = authHeader.split(" ");
    if (bearer.toLowerCase() !== "bearer" || !token)
      return res
        .status(401)
        .json({ message: "Unauthorized - Invalid bearer token format." });

    if (!token) {
      return res.status(401).json({ message: "Oops! Unauthorized." });
    }

    const session = await Sessions.findOne({ token })
      .populate("user", "-password -__v -createdAt -updatedAt")
      .lean()
      .exec();

    if (!session) {
      return res.status(401).json({ message: "Oops! Unauthorized." });
    }

    req.user = session.user;

    next();
  } catch (error) {
    LogError("(middleware.authenticate)", error);
    const errorHandler = MongoDBErrorController(error);
    return res.status(errorHandler?.status || 500).json({
      message: errorHandler?.message || "Internal server error.",
    });
  }
};
