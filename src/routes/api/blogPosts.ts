import { Router } from "express";
import { Request, Response } from "express";
import {
  getAllBlogPosts,
  getInitialBlogPosts,
  getBlogPost,
  getAllTags,
  retrievePostLikes,
  searchBlogs,
  createBlogPost,
} from "../../controllers/blogPostController";
import apicache from "apicache";

const router = Router();

router.route("/").get((req: Request, res: Response) => {
  if (req?.query?.initial) {
    return getInitialBlogPosts(req, res);
  } else {
    return getAllBlogPosts(req, res);
  }
}).post(createBlogPost);

router.route("/tags").get(getAllTags);

router.route("/likes/:uuidBlog").get(retrievePostLikes);

router.route("/search").get((req: Request, res: Response) => {
  const searchTerm = req?.query?.searchTerm;
  if (!searchTerm) return res.status(400).json({ message: "Search term required." });
  return searchBlogs(req, res, searchTerm);
});

router.route("/:slug").get(getBlogPost);

export default router;
