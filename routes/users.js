const express = require("express");
const router = express.Router();
const user_controller = require("../controllers/userController");

router.get("/create", user_controller.user_create_get);
router.post("/create", user_controller.user_create_post);
router.get("/member", user_controller.member_create_get);

module.exports = router;
