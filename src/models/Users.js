import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (value) {
          return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(value);
        },
        message: "Invalid email format",
      },
    },
    linkedinId: { type: String, unique: true }, // Field for LinkedIn ID of the user (Socal login)
    password: { type: String },
  },
  { timestamps: true } // automatically manages createdAt and updatedAt fields
);

const Users = mongoose.model.User || mongoose.model("User", userSchema);

export default Users;
