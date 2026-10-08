import BlogPost from "../model/BlogPost";
import User from "../model/User";
import { hashWord } from "../utils/methods";
import { Request, Response } from "express";

// A soroban rod tops out at 9 (one 5-bead plus four 1-beads), so that's each reader's limit per post.
const MAX_LIKES_PER_READER = 9;

// Post uuids are v4 uuids. Checking the shape also keeps `.` and `$` out of the `likes.<uuid>` update path.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DUPLICATE_KEY = 11000;

export const retrieveLikes = async (req: Request, res: Response) => {
  const ip = req?.params?.ip;
  const uuidBlog = req?.params?.uuidBlog;
  if (!ip || !uuidBlog || !UUID_PATTERN.test(uuidBlog)) {
    return res
      .status(400)
      .json({ message: "Required fields are missing to retrieve likes." });
  }

  try {
    const user = await User.findOne({ ip: hashWord(ip) }).exec();
    return res.status(200).json(user?.likes?.get(uuidBlog) ?? 0);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const handleNewLikes = async (req: Request, res: Response) => {
  const { uuidBlog, ip } = req.body;
  if (typeof uuidBlog !== "string" || typeof ip !== "string" || !ip || !UUID_PATTERN.test(uuidBlog))
    return res
      .status(400)
      .json({ message: "Required fields are missing to handle likes." });

  try {
    const post = await BlogPost.exists({ uuid: uuidBlog, published: true });
    if (!post) return res.status(404).json({ message: "No post found." });

    const field = `likes.${uuidBlog}`;
    let user;
    try {
      // Count the like only while the reader is under the limit; the upsert creates them on their first like.
      // At the limit the filter misses, the upsert tries to insert a second copy of the reader,
      // and the unique index on `ip` rejects it.
      user = await User.findOneAndUpdate(
        { ip: hashWord(ip), [field]: { $not: { $gte: MAX_LIKES_PER_READER } } },
        { $inc: { [field]: 1 } },
        { upsert: true, new: true }
      ).exec();
    } catch (err) {
      if (err.code === DUPLICATE_KEY) {
        return res.status(409).json({ message: "Like limit reached.", likes: MAX_LIKES_PER_READER });
      }
      throw err;
    }

    await BlogPost.updateOne({ uuid: uuidBlog }, { $inc: { likes: 1 } });
    return res.status(201).json({ likes: user.likes.get(uuidBlog) });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
