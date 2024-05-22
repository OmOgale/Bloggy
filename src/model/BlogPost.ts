import { Schema, model } from "mongoose";
import { BlogPost } from "../utils/types";

const blogPostSchema = new Schema<BlogPost>({
  uuid: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  title: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  userAvatars: {
    type: [String],
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  usernames: {
    type: [String],
    required: true,
  },
  createdAt: {
    type: String,
    required: true,
  },
  readTime: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    required: true,
    default: 0,
  },
  published: {
    type: Boolean,
    required: true,
  },
});

const blogPostModel =  model("BlogPost", blogPostSchema, "BlogPosts");

export default blogPostModel;
