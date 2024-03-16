const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

// Require the models
const User = require("./models/user");
const Post = require("./models/post");

// Require the router
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const app = express();

// Connect to the database
mongoose.connect(process.env.MONGODB_URL).catch((err) => console.error(err));

// Set the view engine and the views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Use the body parser middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Use the routers
app.use("/", indexRouter);
app.use("/users", usersRouter);

const port = 3000;
app.listen(port, () => console.log(`Server listening on port ${port}...`));
