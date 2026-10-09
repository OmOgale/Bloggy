import { Schema, model } from "mongoose";

// One document per hashed IP per hour, keyed `${hashWord(ip)}:${hourBucket}`.
// The TTL index clears each one out two hours after it was created.
const likeRateLimitSchema = new Schema({
  _id: {
    type: String,
  },
  count: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7200,
  },
});

const likeRateLimitModel = model("LikeRateLimit", likeRateLimitSchema, "LikeRateLimits");

export default likeRateLimitModel;
