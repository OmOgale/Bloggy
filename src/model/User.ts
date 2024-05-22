import { Schema, model } from "mongoose";
import { User } from "../utils/types";

const userSchema = new Schema<User>({
  ip: {
    type: String,
    required: true,
  },
  likes: {
      type: Map,
      of: Number,
      default: {},
  },
});

const userModel = model("User", userSchema, "Users");

export default userModel;
