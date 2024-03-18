const asyncHandler = require("express-async-handler");
const { validationResult, checkSchema } = require("express-validator");
const User = require("../models/user");
const Post = require("../models/post");

const isLoggedIn = (req, res, next) => {
  if (!res.locals.loggedIn) {
    res.redirect("/login");
  }
  next();
};

exports.posts_get = asyncHandler(async (req, res, next) => {
  const posts = await Post.find().populate("user").exec();
  res.render("homepage", {
    title: "Homepage",
    messages: req.flash(),
    posts: posts,
  });
})

exports.post_create_get = [
    isLoggedIn,
    (req, res, next) => {
        res.render("post_form", { title: "New Post" });
    },
];

exports.post_create_post = [
  isLoggedIn,
  checkSchema(
    {
      title: {
        trim: true,
        notEmpty: {
          errorMessage: "Post subject should not be empty.",
        },
        escape: true,
      },
      body: {
        trim: true,
        notEmpty: {
          errorMessage: "Post content should not be empty.",
        },
        escape: true,
      },
    },
    ["body"],
  ),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    post = new Post({
      title: req.body.title,
      body: req.body.body,
      user: res.locals.currentUser,
    });
    if (!errors.isEmpty()) {
      res.render("post_form", {
        title: "New Message",
        post: post,
        errors: errors.array(),
      });
    }
    await post.save();
    res.redirect("/");
  }),
];

exports.post_delete_get = asyncHandler(async(req, res, next) => {
  const post = await Post.findOne({ _id: req.params.postId }).populate("user").exec();
  res.render("post_delete", { title: "Delete Post", post: post })
})

exports.post_delete_post = asyncHandler(async(req, res, next) => {
  await Post.findByIdAndDelete(req.params.postId)
  res.redirect("/")
})