const { checkSchema } = require("express-validator");
const User = require("../models/user");
module.exports = checkSchema(
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
);
