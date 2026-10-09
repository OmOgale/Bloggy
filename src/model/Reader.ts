import { Schema, model } from "mongoose";
import { Reader } from "../utils/types";

const readerSchema = new Schema<Reader>({
  reader: {
    type: String,
    required: true,
    unique: true,
  },
  likes: {
      type: Map,
      of: Number,
      default: {},
  },
});

const readerModel = model("Reader", readerSchema, "Readers");

export default readerModel;
