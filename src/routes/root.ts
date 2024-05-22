import { Router } from "express";
import path from "path";
import apicache from "apicache";

const router = Router();
const rootCache = apicache.middleware;

router.get("^/$|/index(.html)?", rootCache('1 hour'), (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

export default router;
