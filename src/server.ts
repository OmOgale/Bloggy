import { config } from "dotenv";
import express from "express";
import logger from "./middleware/logEvents";
import path from "path";
import cors from "cors";
import { corsOptions } from "./config/corsOptions";
import mongoose from "mongoose";
import connectDB from "./config/dbConn";
import rootRouter from "./routes/root";
import blogPostRouter from "./routes/api/blogPosts";
import userRouter from "./routes/api/users";
import errorHandler from "./middleware/errorHandler";
import cookieParser from "cookie-parser";
import helmet from "helmet";

config();

const app = express();

const PORT = process.env.PORT || 3500;

// Helmet middleware to set HTTP headers.
app.use(helmet());

// Connect to MongoDB
connectDB();

// custom middleware logger
app.use(logger);

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

app.use(cors(corsOptions)); // TODO: change to corsOptions

//serve static files
app.use("/", express.static(path.join(__dirname, "/public")));

// routes
app.use("/", rootRouter);

app.use("/blog-posts", blogPostRouter);
app.use("/users", userRouter);

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
