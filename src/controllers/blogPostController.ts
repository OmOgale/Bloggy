import BlogPost from "../model/BlogPost";
import { Request, Response } from "express";
import { v4 as uuid } from "uuid";

// Drafts stay in the database but are never served.
const PUBLISHED = { published: true };

export const getAllBlogPosts = async (req: Request, res: Response) => {
  const blogPosts = await BlogPost.find(PUBLISHED).exec();
  if (!blogPosts) return res.status(204).json({ message: "No posts found." });
  res.json(blogPosts);
};

export const getInitialBlogPosts = async (req: Request, res: Response) => {
  const blogPosts = await BlogPost.find(PUBLISHED).select({ content: 0 }).exec();
  if (!blogPosts) return res.status(204).json({ message: "No posts found." });
  res.json(blogPosts);
};

export const getBlogPost = async (req: Request, res: Response) => {
  if (!req?.params?.slug)
    return res
      .status(400)
      .json({ message: "Slug for retrieving blog post required." });

  const blogPost = await BlogPost.findOneAndUpdate(
    { slug: req?.params?.slug, ...PUBLISHED },
    { $inc: { views: 1 } },
    { new: true }
  ).exec();
  if (!blogPost) {
    return res
      .status(404)
      .json({ message: `No blog post matching slug ${req?.params?.slug}.` });
  }
  res.json(blogPost);
};

export const getAllTags = async (req: Request, res: Response) => {
  const tags = await BlogPost.find(PUBLISHED).distinct("tags").exec();
  if (!tags) return res.status(204).json({ message: "No tags found." });
  res.json(tags);
};

export const retrievePostLikes = async (req: Request, res: Response) => {
  const uuidBlog  = req.params?.uuidBlog;
  try {
    const post = await BlogPost.findOne({ uuid: uuidBlog, ...PUBLISHED }).exec();
    if (!post) return res.status(404).json({ message: "No post found" });
    res.json(post.likes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createBlogPost = async (req: Request, res: Response) => {
  const post = req.body;
  if (!post)
    return res
      .status(400)
      .json({ message: "Post required and should be in correct format." });
  try {
    const newPost = new BlogPost({
      ...post,
      uuid: uuid(),
    });
    await newPost.save();
    return res.status(201).json({ message: "New post created." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Returns the uuids of matching published posts, best match first.
const searchBlogPosts = async (searchTerm: string) => {
  let results = [];
  try {
    results = await BlogPost.aggregate([
      {
        $search: {
          index: "searchBlogs",
          text: {
            query: searchTerm,
            path: ["title", "summary", "content", "tags"],
            fuzzy: {
              maxEdits: 1,
            },
          },
        },
      },
      { $match: PUBLISHED },
      {
        $project: {
          _id: 0,
          uuid: 1,
          score: { $meta: "searchScore" },
        },
      },
    ]);

    return results;
  } catch (err) {
    throw err;
  }
};

export const searchBlogs = async (
  req: Request,
  res: Response,
  searchTerm: string
) => {
  let results = [];
  try {
    results = await searchBlogPosts(searchTerm);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.json(results);
};
