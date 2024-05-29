import BlogPost from "../model/BlogPost";
import { Request, Response } from "express";
import { BlogPost as BlogType } from "../utils/types";
import { ParsedQs } from "qs";
import { v4 as uuid } from "uuid";

type SearchType = string | ParsedQs | string[] | ParsedQs[];

export const getAllBlogPosts = async (req: Request, res: Response) => {
  const blogPosts = await BlogPost.find().exec();
  if (!blogPosts) return res.status(204).json({ message: "No posts found." });
  res.json(blogPosts);
};

export const getInitialBlogPosts = async (req: Request, res: Response) => {
  const blogPosts = await BlogPost.find().select({ content: 0 }).exec();
  if (!blogPosts) return res.status(204).json({ message: "No posts found." });
  res.json(blogPosts);
};

export const getBlogPost = async (req: Request, res: Response) => {
  if (!req?.params?.uuid)
    return res
      .status(400)
      .json({ message: "UUID for retrieving blog post required." });

  await BlogPost.findOneAndUpdate(
    { uuid: req.params.uuid },
    { $inc: { views: 1 } }
  );
  const blogPost = await BlogPost.findOne({ uuid: req.params.uuid }).exec();
  if (!blogPost) {
    return res
      .status(204)
      .json({ message: `No blog post matching uuid ${req?.params?.uuid}.` });
  }
  res.json(blogPost);
};

export const getAllTags = async (req: Request, res: Response) => {
  const tags = await BlogPost.find().distinct("tags").exec();
  if (!tags) return res.status(204).json({ message: "No tags found." });
  res.json(tags);
};

export const retrievePostLikes = async (req: Request, res: Response) => {
  const { uuidBlog } = req.body;
  try {
    const post = await BlogPost.findOne({ uuid: uuidBlog }).exec();
    if (!post) return res.status(204).json({ message: "No post found" });
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
    await BlogPost.create({
      ...post,
      uuid: uuid(),
    });
    return res.status(201).json({ message: "New post created." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const searchBlogPosts = async (searchTerm: SearchType) => {
  let results = [];
  try {
    // @ts-ignore
    results = await BlogPost.aggregate([
      {
        $search: {
          index: "searchBlogs",
          text: {
            query: searchTerm,
            path: {
              wildcard: "*",
            },
            fuzzy: {
              maxEdits: 1,
            },
          },
        },
      },
      {
        $addFields: {
          score: { $meta: "searchScore" },
        },
      },
      {
        $sort: {
          score: -1,
        },
      },
      {
        $project: {
          tags: 1,
          title: 1,
          summary: 1,
          uuid: 1,
          content: 1,
          categories: 1,
          published: 1,
          score: 1,
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
  searchTerm: SearchType
) => {
  let results = [];
  try {
    results = await searchBlogPosts(searchTerm);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.json(results);
};
