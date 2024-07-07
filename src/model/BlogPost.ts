import { Schema, model } from "mongoose";
import { BlogPost } from "../utils/types";
import { parametrizeTitle } from "../utils/methods";

const blogPostSchema = new Schema<BlogPost>({
  uuid: {
    type: String,
    required: true,
    unique: true,
  },
  tags: {
    type: [String],
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  slug: {
    type: String,
    unique: true,
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

blogPostSchema.pre('save', function(next) {
  if (!this.isModified("title")) {
    return next();
  }

  this.slug = parametrizeTitle(this.title);
  next();
});

const blogPostModel =  model("BlogPost", blogPostSchema, "BlogPosts");

export default blogPostModel;
