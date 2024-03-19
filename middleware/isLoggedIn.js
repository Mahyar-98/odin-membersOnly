module.exports = (req, res, next) => {
  if (!res.locals.loggedIn) {
    res.redirect("/login");
  }
  next();
};
