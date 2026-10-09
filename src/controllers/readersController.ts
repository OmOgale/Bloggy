import BlogPost from "../model/BlogPost";
import Reader from "../model/Reader";
import LikeRateLimit from "../model/LikeRateLimit";
import { hashWord } from "../utils/methods";
import { Request, Response } from "express";

// A soroban rod tops out at 9 (one 5-bead plus four 1-beads), so that's each reader's limit per post.
const MAX_LIKES_PER_READER = 9;

// Reader IDs live in a cookie the reader controls, so the IP caps how many likes one network can send.
const MAX_LIKES_PER_IP_PER_HOUR = 100;

const HOUR_MS = 3_600_000;

// Post uuids and reader IDs are v4 uuids. Checking the shape also keeps `.` and `$` out of the `likes.<uuid>` update path.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DUPLICATE_KEY = 11000;

export const retrieveLikes = async (req: Request, res: Response) => {
  const readerId = req?.params?.reader;
  const uuidBlog = req?.params?.uuidBlog;
  if (!readerId || !uuidBlog || !UUID_PATTERN.test(readerId) || !UUID_PATTERN.test(uuidBlog)) {
    return res
      .status(400)
      .json({ message: "Required fields are missing to retrieve likes." });
  }

  try {
    const reader = await Reader.findOne({ reader: hashWord(readerId) }).exec();
    return res.status(200).json(reader?.likes?.get(uuidBlog) ?? 0);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const handleNewLikes = async (req: Request, res: Response) => {
  const { reader: readerId, uuidBlog, ip } = req.body ?? {};
  if (
    typeof readerId !== "string" ||
    typeof uuidBlog !== "string" ||
    typeof ip !== "string" ||
    !ip ||
    ip.length > 100 ||
    !UUID_PATTERN.test(readerId) ||
    !UUID_PATTERN.test(uuidBlog)
  )
    return res
      .status(400)
      .json({ message: "Required fields are missing to handle likes." });

  try {
    // Count every attempt against the IP's hourly budget, even ones turned away below.
    const hourBucket = Math.floor(Date.now() / HOUR_MS);
    const rateLimit = await LikeRateLimit.findOneAndUpdate(
      { _id: `${hashWord(ip)}:${hourBucket}` },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    ).exec();
    if (rateLimit.count > MAX_LIKES_PER_IP_PER_HOUR) {
      return res.status(429).json({ message: "Too many likes from this network. Try again later." });
    }

    const post = await BlogPost.exists({ uuid: uuidBlog, published: true });
    if (!post) return res.status(404).json({ message: "No post found." });

    const field = `likes.${uuidBlog}`;
    let reader;
    try {
      // Count the like only while the reader is under the limit; the upsert creates them on their first like.
      // At the limit the filter misses, the upsert tries to insert a second copy of the reader,
      // and the unique index on `reader` rejects it.
      reader = await Reader.findOneAndUpdate(
        { reader: hashWord(readerId), [field]: { $not: { $gte: MAX_LIKES_PER_READER } } },
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
    return res.status(201).json({ likes: reader.likes.get(uuidBlog) });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
