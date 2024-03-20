const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const Post = require("../models/post");
const cookieParser = require("cookie-parser");

// Require the custom middleware
const isLoggedIn = require("../middleware/isLoggedIn");
const validatePost = require("../middleware/validatePost");

exports.posts_get = asyncHandler(async (req, res, next) => {
  const posts = await Post.find().populate("user").exec();
  res.render("homepage", {
    title: "Homepage",
    messages: req.flash(),
    posts: posts,
  });
});

exports.post_create_get = [
  isLoggedIn,
  (req, res, next) => {
    res.render("post_form", { title: "New Post", btn: "Create" });
  },
];

exports.post_create_post = [
  isLoggedIn,
  validatePost,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const post = new Post({
      title: req.body.title,
      body: req.body.body,
      user: res.locals.currentUser,
    });
    if (!errors.isEmpty()) {
      res.render("post_form", {
        title: "New Post",
        btn: "Create",
        post: post,
        errors: errors.array(),
      });
    }
    await post.save();
    req.flash("success", "Post was created successfully!");
    res.redirect("/");
  }),
];

exports.post_edit_get = [
  isLoggedIn,
  asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.postId);
    res.render("post_form", { title: "Edit Post", btn: "Edit", post: post });
  }),
];

exports.post_edit_post = [
  isLoggedIn,
  validatePost,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const post = await Post.findById(req.params.postId);
    post.title = req.body.title;
    post.body = req.body.body;
    if (!errors.isEmpty()) {
      res.render("post_form", {
        title: "New Post",
        btn: "Edit",
        post: post,
        errors: errors.array(),
      });
    }
    await post.save();
    req.flash("success", "Post was updated successfully!");
    res.redirect("/");
  }),
];

exports.post_delete_get = [
  isLoggedIn,
  asyncHandler(async (req, res, next) => {
    const post = await Post.findOne({ _id: req.params.postId })
      .populate("user")
      .exec();
    res.render("post_delete", { title: "Delete Post", post: post });
  }),
];

exports.post_delete_post = [
  isLoggedIn,
  asyncHandler(async (req, res, next) => {
    await Post.findByIdAndDelete(req.params.postId);
    req.flash("success", "Post was deleted successfully!");
    res.redirect("/");
  }),
];
