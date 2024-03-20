const { checkSchema } = require("express-validator");

module.exports = checkSchema(
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
);
