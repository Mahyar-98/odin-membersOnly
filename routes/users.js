const express = require("express");
const router = express.Router();
const user_controller = require("../controllers/userController");

router.get("/create", user_controller.user_create_get);
router.post("/create", user_controller.user_create_post);
router.get("/login", user_controller.user_login_get);
router.post("/login", user_controller.user_login_post);
router.get("/member", user_controller.member_create_get);
router.post("/member", user_controller.member_create_post);

module.exports = router;
