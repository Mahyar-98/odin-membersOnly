const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
require("dotenv").config();

/// Require the custom middleware
const isLoggedIn = require("../middleware/isLoggedIn");
const validateUser = require("../middleware/validateUser");

exports.user_create_get = (req, res, next) => {
  res.render("signup", { title: "Sign Up" });
};

exports.user_create_post = [
  validateUser,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: hashedPassword,
    });

    if (!errors.isEmpty()) {
      res.render("signup", {
        title: "Sign Up",
        user: user,
        errors: errors.array(),
      });
      return;
    }

    await user.save();
    req.flash("success", "You've signed up successfully!");
    res.redirect("/");
  }),
];

exports.user_login_get = (req, res, next) => {
  if (typeof res.locals.currentUser !== "undefined") {
    res.redirect("/");
  }
  res.render("login", { title: "Log In", messages: req.flash() });
};

exports.user_login_post = [
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res, next) => {
    req.flash("success", "You've logged in successfully!");
    res.redirect("/");
  },
];

exports.user_logout_get = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You've logged out successfully!");
    res.redirect("/");
  });
};

exports.member_create_get = (req, res, next) => {
  res.render("member", { title: "Join The Club" });
};

exports.member_create_post = [
  isLoggedIn,
  asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ _id: res.locals.currentUser._id });
    if (req.body.secret === process.env.MEMBER_CODE) {
      user.membership_status = "member";
      await user.save();
      res.redirect("/");
    }
  }),
];

exports.admin_create_get = (req, res, next) => {
  res.render("admin", { title: "Admin" });
};

exports.admin_create_post = [
  isLoggedIn,
  asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ _id: res.locals.currentUser._id });
    if (req.body.secret === process.env.ADMIN_CODE) {
      user.membership_status = "admin";
      await user.save();
      res.redirect("/");
    }
  }),
];
