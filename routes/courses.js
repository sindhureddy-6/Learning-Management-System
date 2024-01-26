const express = require("express");
const router = express.Router({ mergeParams: true });
const db = require("../models");
const { Course, User, Enrollment, Progress } = require("../models");
const connectEnsureLogin = require("connect-ensure-login");
const Sequelize = require("sequelize");
//all courses
router.get("/", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    let userId = req.user.dataValues.id;
    let courses = await Course.findAll({
        attributes: [
            'id',
            'CourseName',
            'EducatorId',
            [Sequelize.fn('COUNT', Sequelize.literal('"Enrollments"."id"')), 'enrollmentCount']
        ],
        include: [
            {
                model: User,
                as: 'User',
                attributes: ['userName'],
                on: {
                    'EducatorId': Sequelize.literal('"User"."id" = "Course"."EducatorId"')
                },
            },
            {
                model: Enrollment,
                as: 'Enrollments',
                attributes:[],
            },
        ],
        group: ['Course.id', 'User.id'],
        subQuery: false,
    });
    let enrolledCourses =await Enrollment.findAll({
        where: {
            userId,
        }
    });
    const courseIds = enrolledCourses.map(enrollment => enrollment.courseId);
    let userCourses = courses.filter((course) => {
        return courseIds.includes(course.id)
    });
    userCourses = await Promise.all(userCourses.map(async (course) => {
    course.progress = 0; // Assuming progress is initially set to 0
    const progress = await Progress.getCompletionProgress(db, userId, course.id);
    course.progress = progress;
    return course;
    }));
   const myCourses = userCourses.map(course => {
    return {
        id: course.id,
        CourseName: course.CourseName,
        EducatorId: course.EducatorId,
        enrollmentCount: course.getDataValue('enrollmentCount'),
        user: course.getDataValue('User'),
        progress: course.progress
    };
   });
    if (req.accepts("html")) {
        res.render("courses/home.ejs", { courses, userCourses, csrfToken: req.csrfToken() });
    } else {
        res.json({ courses, myCourses, csrfToken: req.csrfToken() });
    }
});
//create course
router.get("/new",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    res.render("courses/new.ejs",{csrfToken:req.csrfToken()});
});
router.post("/", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    try {
        await Course.create({ ...req.body, EducatorId: req.user.id });
        req.flash("success", "Created Course Successfully!!")
        res.redirect("/courses");
    }
    catch (err) {
        console.log(err);
    }
});
//mycourses
//get
router.get("/:EducatorId", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    try {
        let EducatorId = req.params.EducatorId;
        let myCourses = await Course.findAll({ where: { EducatorId } });
        res.render("courses/mycourses.ejs", { myCourses, csrfToken: req.csrfToken() });
    }
    catch (err) {
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});
//progress
//get
router.get("/:EducatorId/progress", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    const EducatorId = req.params.EducatorId;
    const Educator = await User.findByPk(EducatorId);
    let courses = await Course.findAll({ where: { EducatorId } });
    let totalEnrollments = await Enrollment.getTotalEnrollments(EducatorId);
    courses = await Promise.all(courses.map(async (course) => {
        course.enrollmentCount = await Enrollment.getEnrollmentCount(course.id);
        course.relativePopularity = Math.floor((course.enrollmentCount / totalEnrollments) * 100);
        return course;
    }));
    courses.sort((a, b) => b.relativePopularity - a.relativePopularity);
    res.render("courses/progress.ejs", { Educator, courses, csrfToken: req.csrfToken() });
});
//enroll
router.post("/:courseId/enroll", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    const userId = req.user.id;
    console.log("userid", userId);
    const { courseId } = req.params;

    try {
        // Check if the course exists
        const course = await Course.findByPk(courseId);
        if (!course) {
            req.flash("error", "Course not found");
            return res.redirect(`/courses`);
        }

        // Check if the user is already enrolled in the course
        const existingEnrollment = await Enrollment.findOne({
            where: {
                userId,
                courseId,
            },
        });

        if (existingEnrollment) {
            req.flash("error", "User is already enrolled in this course");
           return res.redirect(`/courses`);
        }

        // Enroll the user in the course
        const EducatorId = course.EducatorId;
        await Enrollment.create({
            userId,
            courseId,
            EducatorId,
        });
        req.flash("success", "Enrolled Successfully!!");
        return res.redirect(`/courses`);
    } catch (error) {
        
        return res.status(500).send({ error: 'Internal Server Error' });
    }
}
);
module.exports = router;