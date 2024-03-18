const asyncHandler = require("express-async-handler");
const { validationResult, checkSchema } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
require("dotenv").config();

exports.user_create_get = (req, res, next) => {
  res.render("signup", { title: "Sign Up" });
};

exports.user_create_post = [
  checkSchema(
    {
      first_name: {
        trim: true,
        notEmpty: { errorMessage: "First name is required." },
        escape: true,
      },
      last_name: {
        trim: true,
        notEmpty: { errorMessage: "Last name is required." },
        escape: true,
      },
      email: {
        trim: true,
        notEmpty: { errorMessage: "Email address is required." },
        isEmail: { errorMessage: "Email address is not valid." },
        notEmailAlreadyInUse: {
          custom: async (value) => {
            const existingEmail = await User.find({ email: value }).exec();
            if (existingEmail.length !== 0) {
              throw new Error("The provided email is already in use.");
            }
            return true;
          },
        },
        escape: true,
      },
      password: {
        trim: true,
        notEmpty: { errorMessage: "Password field should not be empty" },
        isLength: {
          options: { min: 6 },
          errorMessage: "Password should have a minimum of 6 characters.",
        },
        escape: true,
      },
      password_confirm: {
        trim: true,
        confirmPassword: {
          custom: (value, { req }) => {
            const match = value === req.body.password;
            if (!match) {
              throw new Error("Passwords do not match.");
            }
            return true;
          },
        },
      },
    },
    ["body"],
  ),
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
    res.redirect("/");
  }),
];

exports.user_login_get = (req, res, next) => {
  if (typeof res.locals.currentUser !== "undefined") {
    res.redirect("/");
  }
  res.render("login", { title: "Log In", messages: req.flash() });
};

exports.user_login_post = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  successFlash: true,
  failureFlash: true,
});

exports.user_logout_get = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

exports.member_create_get = (req, res, next) => {
  res.render("member", { title: "Join The Club" });
};

exports.member_create_post = asyncHandler(async (req, res, next) => {
  if (typeof res.locals.currentUser === "undefined") {
    res.redirect("/login");
  }
  const user = await User.findOne({ _id: res.locals.currentUser._id });
  if (!user) {
    res.redirect("/login");
  }
  if (req.body.secret === process.env.MEMBER_CODE) {
    user.membership_status = "member";
    await user.save();
    res.redirect("/");
  }
});
