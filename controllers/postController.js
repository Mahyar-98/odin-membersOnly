const asyncHandler = require("express-async-handler");
const { validationResult, checkSchema } = require("express-validator");
const User = require("../models/user");
const Post = require("../models/post");

const userLoggedIn = (req, res, next) => {
    if (typeof res.locals.currentUser === 'undefined') {
        res.redirect("/login");
    }
    next()
}

exports.post_create_get = [userLoggedIn, (req, res, next) => {
    res.render("post_form", { title: "New Post" })
}]

exports.post_create_post = [userLoggedIn, checkSchema({
    title: {
        trim: true,
        notEmpty: {
            errorMessage: "Post subject should not be empty."
        },
        escape: true
    },
    body: {
        trim: true,
        notEmpty: {
            errorMessage: "Post content should not be empty."
        },
        escape: true
    }
}, ['body']), asyncHandler(async(req, res, next) => {
    const errors = validationResult(req);
    post = new Post({
        title: req.body.title,
        body: req.body.body,
        user: req.params.id,
    })
    if (!errors.isEmpty()) {
        res.render("post_form", {
            title: "New Message",
            post: post,
            errors: errors.array(),
        })
    }
    await post.save();
    res.redirect("/")
})]