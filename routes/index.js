const express = require("express");
const router = express.Router();
const user_controller = require("../controllers/userController");

router.get("/", (req, res, next) => {
  res.send("homepage");
});
router.get("/signup", (req, res, next) => {
  res.redirect("/users/create");
});
router.get("/login", (req, res, next) => {});
router.get("/member", (req, res, next) => {
  res.redirect("/users/member");
});

module.exports = router;
