const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/user")
const Post = require("./models/post")

const app = express();
mongoose.connect(process.env.MONGODB_URL).catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("hello world");
});

const port = 3000;
app.listen(port, () => console.log(`Server listening on port ${port}...`));
