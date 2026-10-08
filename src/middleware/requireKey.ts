import crypto from "crypto";
import { NextFunction, Request, Response } from "express";

// Only lets a request through if its `x-api-key` header matches the named env var.
// Fails closed: if the env var isn't set, every request is rejected.
const requireKey = (envName: string) => (req: Request, res: Response, next: NextFunction) => {
  const expected = process.env[envName];
  const given = req.get("x-api-key");
  if (!expected || !given) return res.status(401).json({ message: "Unauthorized." });

  // Compare digests so the comparison takes the same time whatever the input.
  const a = crypto.createHash("sha256").update(given).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  if (!crypto.timingSafeEqual(a, b)) return res.status(401).json({ message: "Unauthorized." });
  next();
};

export default requireKey;
