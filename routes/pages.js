const express = require("express");
const router = express.Router({ mergeParams: true });
const connectEnsureLogin = require("connect-ensure-login");
const pageController = require("../controllers/pages");
const { isEducator, isOwner, isOwnerOrEnrolled } = require("../middleware.js");

//show pages
router.get("/",connectEnsureLogin.ensureLoggedIn(),isOwnerOrEnrolled,pageController.getPages);
//add pages
router.get("/new",connectEnsureLogin.ensureLoggedIn(),pageController.getCreatePage);
//get particular page
router.get("/:PageId",connectEnsureLogin.ensureLoggedIn(),isOwnerOrEnrolled,pageController.getParticularPage);
router.post("/",connectEnsureLogin.ensureLoggedIn(),isEducator,isOwner,pageController.postPage);
router.get("/:PageId/edit",connectEnsureLogin.ensureLoggedIn(),pageController.getEditPage);
router.put("/:PageId",connectEnsureLogin.ensureLoggedIn(),isOwner, pageController.updatePage);
router.delete("/:PageId",connectEnsureLogin.ensureLoggedIn(),isOwner,pageController.deletePage);
//markAsComplete
router.post("/:pageId", connectEnsureLogin.ensureLoggedIn(),pageController.markAsComplete);
module.exports = router;
