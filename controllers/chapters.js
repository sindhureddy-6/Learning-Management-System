const { Course, Chapter, User, Enrollment} = require("../models");
const Sequelize = require("sequelize");
module.exports.getAllChapters = async (req, res) => {
    try {
        let userId = req.user.id;
        let courseId = req.params.CourseId;
        let course = await Course.findOne({
            where: { id: courseId },
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
                    attributes: [],
                },
            ],
            group: ['Course.id', 'User.id']
        });
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
};
module.exports.getCreateChapter = async (req, res) => {
    let CourseId = req.params.CourseId;
    let course = await Course.findByPk(CourseId);
    res.render("chapters/new.ejs", { course, csrfToken: req.csrfToken() });
};
module.exports.postChapter = async (req, res) => {
    try {
        let c_id = req.params.CourseId;
        let chapter = await Chapter.create({ ...req.body, CourseId: c_id });
        // console.log(chapter);
        res.redirect(`/courses/${c_id}/chapters/${chapter.id}/pages/new`)
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
};
module.exports.getEditChapter = async (req, res) => {
    let courseId = req.params.CourseId;
    let chapterId = req.params.ChapterId;
    try {
        let course = await Course.findByPk(courseId);
        let chapter = await Chapter.findByPk(chapterId);
        res.render("chapters/edit.ejs", { course, chapter, csrfToken: req.csrfToken() });
    } catch (err) {
        console.log(err);
    }
};
module.exports.updateChapter = async (req, res) => {
    let courseId = req.params.CourseId;
    let chapterId = req.params.ChapterId;
    try {
        await Chapter.update({ ...req.body }, {
            where: {
                id: chapterId,
            }
        });
        req.flash("success", "Chapter Updated Succesfully!!");
        res.redirect(`/courses/${courseId}/chapters`);
    }
    catch (err) {
        res.status(500).send("Internal Server Error");
    }

};
module.exports.deleteChapter = async (req, res) => {
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
};