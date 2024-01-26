const express = require("express");
const router = express.Router({ mergeParams: true });
const connectEnsureLogin = require("connect-ensure-login");
const pageController = require("../controllers/pages");
//show pages
router.get("/",connectEnsureLogin.ensureLoggedIn(),pageController.getPages);
//add pages
router.get("/new",connectEnsureLogin.ensureLoggedIn(),pageController.getCreatePage);
//get particular page
router.get("/:PageId",connectEnsureLogin.ensureLoggedIn(),pageController.getParticularPage);
router.post("/",connectEnsureLogin.ensureLoggedIn(),pageController.postPage);
router.get("/:PageId/edit",connectEnsureLogin.ensureLoggedIn(),pageController.getEditPage);
router.put("/:PageId",connectEnsureLogin.ensureLoggedIn(), pageController.updatePage);
router.delete("/:PageId",connectEnsureLogin.ensureLoggedIn(),pageController.deletePage);
//markAsComplete
router.post("/:pageId", connectEnsureLogin.ensureLoggedIn(),pageController.markAsComplete);
module.exports = router;
