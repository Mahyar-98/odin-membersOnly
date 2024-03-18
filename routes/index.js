const express = require("express");
const router = express.Router();
const post_controller = require("../controllers/postController");

router.get("/", post_controller.posts_get);
router.get("/about", (req, res, next) => {
  res.render("about", { title: "About" });
});
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
