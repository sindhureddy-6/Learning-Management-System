const express = require("express");
const router = express.Router({ mergeParams: true });
const connectEnsureLogin = require("connect-ensure-login");
const courseController = require("../controllers/courses");
//all courses
router.get("/", connectEnsureLogin.ensureLoggedIn(), courseController.getCourses);
//create course
router.get("/new", connectEnsureLogin.ensureLoggedIn(), courseController.getCreateCourse);
//post new course
router.post("/", connectEnsureLogin.ensureLoggedIn(), courseController.postNewCourse);
//mycourses
router.get("/:EducatorId", connectEnsureLogin.ensureLoggedIn(), courseController.getEducatorCourses);
//progress
router.get("/:EducatorId/progress", connectEnsureLogin.ensureLoggedIn(), courseController.progress);
//enroll
router.post("/:courseId/enroll", connectEnsureLogin.ensureLoggedIn(),courseController.enroll);
module.exports = router;