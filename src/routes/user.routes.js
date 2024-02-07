import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { getUserProfile } from "../controllers/user.controllers.js";

// Instance
const router = express.Router();

// ===========================
// ========== User ===========
// ===========================

router.get("/user/get/profile", authenticate, getUserProfile);

export default router;
