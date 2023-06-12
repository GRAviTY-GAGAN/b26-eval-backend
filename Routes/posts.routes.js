const express = require("express");
const { Authorization } = require("../Middleware/Authorization.middleware");
const { PostModel } = require("../Models/post.model");
const { BlacklistAuth } = require("../Middleware/BlacklistAuth.middleware");

const postsRouter = express.Router();

postsRouter.use(Authorization);
postsRouter.use(BlacklistAuth);

postsRouter.get("/", async (req, res) => {
  const { userID } = req.body;
  try {
    const findPosts = await PostModel.find({ userID });

    if (findPosts) {
      res.json({ posts: findPosts });
    } else {
      res.json({
        msg: "Something went wrong. Please login again and try again!!",
      });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

postsRouter.post("/add", async (req, res) => {
  try {
    const post = new PostModel(req.body);
    await post.save();
    res.json({ msg: `${post.title} post created.`, post });
  } catch (error) {
    res.status(400).json({ error });
  }
});

postsRouter.patch("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { title, body, device, no_of_comments, userID } = req.body;

  const updateQuery = {};

  if (title) {
    updateQuery.title = title;
  }
  if (body) {
    updateQuery.body = body;
  }
  if (device) {
    updateQuery.device = device;
  }
  if (no_of_comments) {
    updateQuery.no_of_comments = no_of_comments;
  }

  try {
    const updatePost = await PostModel.findOneAndUpdate(
      { _id: id, userID },
      updateQuery
    );

    if (updatePost) {
      res.json({ msg: `${updatePost.title} post updated.`, updatePost });
    } else {
      res.json({ msg: "Something went wrong please try again." });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

postsRouter.delete("/delete/:id", async (req, res) => {
  const { userID } = req.body;
  const { id } = req.params;
  try {
    const deletedPost = await PostModel.findOneAndDelete({ _id: id, userID });
    if (deletedPost) {
      res.json({ msg: `${deletedPost.title} post deleted.` });
    } else {
      res.json({ msg: "Something went wrong please try again." });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = { postsRouter };
