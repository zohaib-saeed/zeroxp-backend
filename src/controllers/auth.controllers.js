import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import Users from "../models/Users.js";
import Sessions from "../models/Sessions.js";
import { LogError } from "../utils/Log.js";
import MongoDBErrorController from "../utils/MongoDBErrorController.js";
import { linkedinAuth } from "../../config.js";

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
      {
        userId: existingUser._id,
        email: existingUser.email,
      },
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

export const linkedInAuthCallback = async (req, res) => {
  try {
    //here we get this code from passport linkedin strategy.
    const code = req.query.code;

    const redirect_uri = `${process.env.SERVER_URL}/auth/linkedin/callback`;

    //step 2 : access token retrieval
    var access_token;
    const access_token_url = `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=${code}&redirect_uri=${redirect_uri}&client_id=${linkedinAuth.clientID}&client_secret=${linkedinAuth.clientSecret}`;
    const res_token = await axios
      .post(access_token_url)
      .then((res) => {
        access_token = res.data.access_token;
      })
      .catch((err) => {
        return res.status(400).json({ message: "Access token not found." });
      });

    let user_info;
    let user_info1;

    // step 3: Fetching User Data
    const user_info_url = `https://api.linkedin.com/v2/userinfo`;
    if (access_token) {
      await axios
        .get(user_info_url, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
        .then((response) => {
          user_info = response.data;
        })
        .catch((err) => {
          return res
            .status(400)
            .json({ message: "Failed to fetch user info." });
        });
    } else {
      return res.status(400).json({ message: "Access token not found." });
    }

    let LinkedinID, name, email, picture;

    let token;

    //step 4: Storing User Data
    if (user_info) {
      LinkedinID = user_info.sub;
      name = user_info.name;
      email = user_info.email;
      picture = user_info.picture
        ? user_info.picture
        : "https://t3.ftcdn.net/jpg/03/64/62/36/360_F_364623623_ERzQYfO4HHHyawYkJ16tREsizLyvcaeg.jpg";

      // Check if a user with the provided LinkedIn ID already exists
      const existingUser = await Users.findOne({
        linkedinId: user_info.sub,
      });

      let saved_user;

      if (existingUser) {
        // Update existing user's information if needed
        // Update the user's name or email if it has changed on LinkedIn
        saved_user = await Users.findByIdAndUpdate(existingUser._id, {
          firstName: user_info.given_name,
          lastName: user_info.family_name,
          email: user_info.email,
        });

        //step 5: Generating JWT Token
        token = jwt.sign(
          {
            userId: saved_user._id,
            email: saved_user.email,
          },
          process.env.JWT_SECRET
        );

        // Create session with user id and token
        await Sessions.create({
          user: saved_user?._id,
          token,
        });
      } else {
        // Create a new user using LinkedIn data
        const newUser = new Users({
          firstName: user_info.given_name,
          lastName: user_info.family_name,
          email: user_info.email,
          linkedinId: user_info.sub,
        });
        saved_user = await newUser.save();

        //step 5: Generating JWT Token
        token = jwt.sign(
          {
            userId: saved_user._id,
            email: saved_user.email,
          },
          process.env.JWT_SECRET
        );

        // Create session with user id and token
        await Sessions.create({
          user: saved_user?._id,
          token,
        });
      }
    } else {
      user_info1 = results[0];
      return res.status(400).json({ message: "Failed to get user info." });
    }

    //step 6: this will redirect user to home page after successful login/authentication
    res.redirect(`${process.env.CLIENT_URL}/profile?token=${token}`);
  } catch (error) {
    LogError("(auth.controller) {GET}/auth/linkedin/callback", error);
    const errorHandler = MongoDBErrorController(error);
    return res.status(errorHandler?.status || 500).json({
      message: errorHandler?.message || "Internal server error.",
    });
  }
};
