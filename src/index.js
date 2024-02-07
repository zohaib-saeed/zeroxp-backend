import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { LogError, LogSuccess } from "./utils/Log.js";
import auth from "./routes/auth.routes.js";
import user from "./routes/user.routes.js";
// import apiRoutes from "./src/routes/api.js";
// import jobSearchRouter from "./src/routes/searchapi.js";

const { MODE, DATABASE_URL_DEVELOPMENT, DATABASE_URL_PRODUCTION, PORT } =
  process.env;

const app = express();

// Middleware setup
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Home route
app.get("/", async (req, res) => {
  res.send(`Running on port ${PORT}`);
});

const URL =
  MODE === "development" ? DATABASE_URL_DEVELOPMENT : DATABASE_URL_PRODUCTION;

mongoose
  .connect(URL, {})
  .then(() => {
    app.listen(PORT, () => {
      LogSuccess("app is listening on port", PORT);
    });
    app.use(auth);
    app.use(user);
    // app.use("/api", apiRoutes);
    // app.use("/api", jobSearchRouter);
  })
  .catch((err) => {
    LogError("Unable to connect with MongoDB", err);
  });
