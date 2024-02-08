import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  linkedInAuthCallback,
  login,
  signUp,
} from "../controllers/auth.controllers.js";

//Instances
const router = express.Router();

// =============================
// =========== User ============
// =============================
router.post("/signup", signUp);
router.post("/login", login);

// =============================
// ===== LinkedIn Auth =========
// =============================
router.get(
  "/auth/linkedin",
  passport.authenticate("linkedin", {
    state: "some",
    passReqToCallback: true,
  }),
  (req, res) => {}
);

router.get("/auth/linkedin/callback", linkedInAuthCallback);

router.post("/getinfo", (req, res) => {
  try {
    const payload = jwt.verify(req.body.token, process.env.JWT_SECRET);
    console.log("payload.", payload);
    res.status(200).json({
      message: "User Verified",
      user: payload,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

export default router;
