import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expireAt: { type: Date, default: Date.now, expires: 604800 }, // 604800 seconds = 7 days
});

const Sessions =
  mongoose.models.Sessions || mongoose.model("Session", sessionSchema);

export default Sessions;
