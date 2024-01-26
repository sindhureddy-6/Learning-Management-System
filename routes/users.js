const express = require("express");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const userController = require("../controllers/users.js");
router.get("/", (req, res) => {
  res.redirect("/login");
});
router.get("/signup", userController.signup);
router.post("/users",userController.postUsers);

router.get("/login",userController.login);
router.post(
  "/session",
  passport.authenticate("local",  { failureRedirect: '/login', failureFlash: true }),
  userController.postSession
);
router.get("/signout",userController.signout);

router.get("/resetpassword", userController.resetPassword);

router.post("/setpassword", userController.setPassword);
module.exports = router;
