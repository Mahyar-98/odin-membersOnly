const express = require("express");
const createError = require("http-errors");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
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

// Serve static assests
app.use(express.static(path.join(__dirname, "/public")));

// Use the body parser middleware to be able to parse the body of HTTP POST requests
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Use the cookie-parser middleware for easy access to cookies through req.cookies
app.use(cookieParser());

// Add the session middleware
app.use(
  session({
    name: "session_id",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: true,
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
    },
  }),
);

// Add the PassportJS middleware
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
          return done(null, false, {
            message: "Email address is not valid. Please sign up!",
          });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, {
            message: "Password is incorrect. Please try again!",
          });
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

// Use connect-flash middleware to show flash messages
app.use(flash());

// Use morgan as HTTP logger to show the HTTP method and route of each request
app.use(morgan("dev"));

// Use compression to compress HTTP responses in production
app.use(compression());

// Use helmet to protect the app from well-known web vulnerabilities
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'", "ka-f.fontawesome.com"],
      scriptSrc: ["'self'", "kit.fontawesome.com"],
    },
  }),
);

// User the rate limiter middleware
const limiter = rateLimit({
  windowMs: 1000 * 60, // 1 minute
  max: 20, // maximum number of requests in the mentioned timeframe
});
app.use(limiter);

// Add local variables to make them available in views
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.loggedIn = typeof req.user !== "undefined";
  res.locals.isUser = req.user ? req.user.membership_status === "user" : null;
  res.locals.isMember = req.user
    ? req.user.membership_status === "member"
    : null;
  res.locals.isAdmin = req.user ? req.user.membership_status === "admin" : null;
  next();
});

// Use the routers
app.use("/", indexRouter);
app.use("/users", usersRouter);

// Use http-errors middleware to generate a 404 error in case no route matches
app.use((req, res, next) => {
  next(createError(404));
});

// Use a custom error handler middleware
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error", { title: "Error" });
});

const port = 3000;
app.listen(port, () => console.log(`Server listening on port ${port}...`));
