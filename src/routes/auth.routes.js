import express from "express";
import { login, signUp } from "../controllers/auth.controllers.js";

//Instances
const router = express.Router();

// =============================
// =========== User ============
// =============================
router.post("/signup", signUp);
router.post("/login", login);

export default router;
