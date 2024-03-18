const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const user_controller = require("../controllers/userController");
const Post = require("../models/post");

router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const posts = await Post.find().populate("user").exec();
    console.log(posts);
    res.render("homepage", {
      title: "Homepage",
      messages: req.flash(),
      posts: posts,
    });
  }),
);
router.get("/signup", (req, res, next) => {
  res.redirect("/users/create");
});
router.get("/login", (req, res, next) => {
  res.redirect("/users/login");
});
router.get("/logout", (req, res, next) => {
  res.redirect("/users/logout");
});
router.get("/member", (req, res, next) => {
  res.redirect("/users/member");
});
router.get("/admin", (req, res, next) => {
  res.redirect("/users/admin");
});

module.exports = router;
