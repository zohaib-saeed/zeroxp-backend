import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import { LogError, LogSuccess } from "./utils/Log.js";
import auth from "./routes/auth.routes.js";
import user from "./routes/user.routes.js";
import apiRoutes from "./routes/api.js";
import jobSearchRouter from "./routes/search.routes.js";
import { linkedinAuth } from "../config.js";

const { MODE, DATABASE_URL_DEVELOPMENT, DATABASE_URL_PRODUCTION, PORT } =
  process.env;

const app = express();

// Passport setup
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "SECRET",
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

passport.use(
  new LinkedInStrategy(
    {
      clientID: linkedinAuth.clientID,
      clientSecret: linkedinAuth.clientSecret,
      callbackURL: linkedinAuth.callbackURL,
      scope: ["email", "profile", "openid"],
      state: true,
    },
    function (req, accessToken, refreshToken, profile, done) {
      // asynchronous verification, for effect...
      req.session.accessToken = accessToken;
      process.nextTick(function () {
        return done(null, profile);
      });
    }
  )
);

// Middleware setup
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Home route
app.get("/", async (req, res) => {
  res.send(`Running on port ${PORT} `);
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
    app.use("/api", apiRoutes);
    app.use("/api", jobSearchRouter);
  })
  .catch((err) => {
    LogError("Unable to connect with MongoDB", err);
  });
