import BlogPost from "../model/BlogPost";
import User from "../model/User";
import { hashWord } from "../utils/methods";
import { Request, Response } from "express";

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await User.find().exec();
  if (!users) return res.status(204).json({ message: "No users found" });
  res.json(users);
};

export const retrieveLikes = async (req: Request, res: Response) => {
  const ip = req?.params?.ip;
  const { uuidBlog } = req?.body;
  if (!ip || !uuidBlog) {
    return res
      .status(400)
      .json({ message: "Required fields are missing to retrieve likes." });
  }

  const hashedIp = hashWord(ip);
  const user = await User.findOne({ ip: hashedIp }).exec();
  if (!user) {
    try {
      await handleNewUser(hashedIp);
      res.status(201).json({ message: `New user ${ip} created!` });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  const likes = user.likes[uuidBlog];
  if (!likes) return res.status(204).json(0);
  res.json(likes);
};

const handleNewUser = async (ip: string) => {
  await User.create({
    ip: ip,
    likes: {},
  });
};

const handlePostLikes = async (uuidBlog: string, likes: number) => {
  await BlogPost.findOneAndUpdate(
    { uuid: uuidBlog },
    { $inc: { likes: likes } }
  );
};

export const handleNewLikes = async (req: Request, res: Response) => {
  const { likes, uuidBlog, ip } = req.body;
  if (!uuidBlog || !ip || !likes)
    return res
      .status(400)
      .json({ message: "Required fields are missing to handle likes." });
  // const hashedPwd = await bcrypt.hash(ip, 10);
  // check for duplicate usernames in the db
  const hashedIp = hashWord(ip);
  const duplicate = await User.findOne({ ip: hashedIp }).exec();

  if (!duplicate) {
    try {
      //create and store the new user
      await handleNewUser(hashedIp);
      await User.findOneAndUpdate(
        { ip: hashedIp },
        { $set: { [`likes.${uuidBlog}`]: likes } }
      );
      await handlePostLikes(uuidBlog, likes);
      res
        .status(201)
        .json({ success: `New user ${ip} with like count ${likes} created!` });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    try {
      await User.findOneAndUpdate(
        { ip: hashedIp },
        { $set: { [`likes.${uuidBlog}`]: likes } }
      );
      await handlePostLikes(uuidBlog, likes);
      res
        .status(201)
        .json({ success: `User ${ip} with like count ${likes} updated!` });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};