const express = require("express");
const router = express.Router({ mergeParams: true });
const connectEnsureLogin = require("connect-ensure-login");
const chapterController = require("../controllers/chapters");
//show Chapters
router.get("/", connectEnsureLogin.ensureLoggedIn(), chapterController.getAllChapters);
router.get("/new", connectEnsureLogin.ensureLoggedIn(), chapterController.getCreateChapter);
router.post("/",connectEnsureLogin.ensureLoggedIn(),chapterController.postChapter);
router.get("/:ChapterId/edit",connectEnsureLogin.ensureLoggedIn(),chapterController.getEditChapter);
router.put("/:ChapterId",connectEnsureLogin.ensureLoggedIn(),chapterController.updateChapter);
router.delete("/:ChapterId", connectEnsureLogin.ensureLoggedIn(),chapterController.deleteChapter);
module.exports = router;