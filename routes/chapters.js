const express = require("express");
const router = express.Router({ mergeParams: true });
const { Course, Chapter, User, Enrollment} = require("../models");
const connectEnsureLogin = require("connect-ensure-login");
const Sequelize = require("sequelize");
//show Chapters
router.get("/", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    try {
        let userId = req.user.id;
        let courseId = req.params.CourseId;
        let course = await Course.findOne({
            where:{id:courseId},
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
        group: ['Course.id', 'User.id']
        });
        console.log(course.CourseName);
        res.locals.enrolled = await Enrollment.findAll({ where: { userId, courseId } });
        
        let chapters = await Chapter.findAll({ where: { CourseId: courseId }, order: [['id']] });
        if (req.accepts("html")) {
            res.render("chapters/show.ejs", { course, chapters, csrfToken: req.csrfToken() });
        } else {
            res.json({ chapters });
        }
    }
    catch (err) {
        console.log(err);
    }
});
router.get("/new",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    let CourseId = req.params.CourseId;
   let course = await Course.findByPk(CourseId);
    res.render("chapters/new.ejs", { course,csrfToken:req.csrfToken() });
})
router.post("/",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    try {
        let c_id = req.params.CourseId;
        let chapter = await Chapter.create({ ...req.body, CourseId: c_id });
        // console.log(chapter);
        res.redirect(`/courses/${c_id}/chapters/${chapter.id}/pages/new`)
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});
router.get("/:ChapterId/edit",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    let courseId = req.params.CourseId;
    let chapterId = req.params.ChapterId;
    try {
        let course = await Course.findByPk(courseId);
        let chapter = await Chapter.findByPk(chapterId);
        res.render("chapters/edit.ejs", { course, chapter,csrfToken:req.csrfToken() });
    } catch (err) {
        console.log(err);
    }

});
router.put("/:ChapterId",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    let courseId = req.params.CourseId;
    let chapterId = req.params.ChapterId;
    try {
         await Chapter.update({...req.body}, {
            where: {
               id:chapterId,
            }
         });
        req.flash("success", "Chapter Updated Succesfully!!");
        res.redirect(`/courses/${courseId}/chapters`);
    }
    catch (err) {
         res.status(500).send("Internal Server Error");
    }

});
router.delete("/:ChapterId", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    let courseId = req.params.CourseId;
    let chapterId = req.params.ChapterId;
    try {
        await Chapter.destroy({
            where: {
                id: chapterId,
            }
        });
        req.flash("success", "Chapter Deleted!!");
        res.redirect(`/courses/${courseId}/chapters`);
    }
    catch (err) {
        res.status(500).send("Internal Server Error");
    }
});
module.exports = router;