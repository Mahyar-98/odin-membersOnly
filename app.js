const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const flash = require("connect-flash");
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

// Add the PassportJS middleware
app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.session());
passport.use(
  new LocalStrategy(
    // custom field names (anything other than username and password)
    // should be mentioned in an object before giving the verify callback
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Incorrect email address" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (error) {
        done(error);
      }
    },
  ),
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
app.use(flash());

// Add currentUser to local variables available in views
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.loggedIn = typeof req.user !== "undefined";
  res.locals.isAdmin = req.user ? req.user.membership_status === "admin" : null;
  next();
});

// Use the routers
app.use("/", indexRouter);
app.use("/users", usersRouter);

const port = 3000;
app.listen(port, () => console.log(`Server listening on port ${port}...`));
