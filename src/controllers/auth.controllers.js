import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Users from "../models/Users.js";
import { LogError } from "../utils/Log.js";
import MongoDBErrorController from "../utils/MongoDBErrorController.js";
import Sessions from "../models/Sessions.js";

export const signUp = async (req, res) => {
  try {
    // Destructure user data from request body
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists with the provided email
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user object with hashed password
    const newUser = new Users({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // Save the new user to the database
    await newUser.save();

    // Return success message
    return res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    LogError("(auth.controller) {POST}/signup", error);
    const errorHandler = MongoDBErrorController(error);
    return res
      .status(errorHandler?.status || 500)
      .json({ message: errorHandler.message || "Internal server error." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists with the provided email
    const existingUser = await Users.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ message: "Email not exist." });
    }

    // Check if the provided password is correct
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email },
      process.env.JWT_SECRET
    );

    // Create session with user and token
    const session = await Sessions.create({
      user: existingUser?._id,
      token,
    });

    // session
    return res.status(200).json({
      message: "Login successfull.",
      token: session.token,
      tokenExpirationTime: session.expireAt,
      user: {
        name: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
      },
    });
  } catch (error) {
    LogError("(auth.controller) {POST}/login", error);
    const errorHandler = MongoDBErrorController(error);
    return res.status(errorHandler?.status || 500).json({
      message: errorHandler?.message || "Internal server error.",
    });
  }
};
