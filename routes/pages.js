const express = require("express");
const router = express.Router({ mergeParams: true });
const { Course, Chapter, Page, Progress } = require("../models");
const connectEnsureLogin = require("connect-ensure-login");
//show pages
router.get("/",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    try {
        let userId = req.user.id;
        let courseId = req.params.CourseId;
        let chapterId = req.params.ChapterId;
        let course = await Course.findByPk(courseId);
        let chapter = await Chapter.findByPk(chapterId); 
        let page = await Page.findOne({
            where: {
            ChapterID: chapterId,
        }, limit: 1,
            order: [['id', 'ASC']],
        });
        let Pages = await Page.findAll({
            where: {
                ChapterID: chapterId,
            },
            order: [['id']]
        });
        let nextIndex = (Pages.findIndex((p) => p.id === page.id)) + 1;
        if (nextIndex == Pages.length) {
            nextIndex = 0;
        }
        const isMarked = await Progress.MarkedAsComplete(userId, page.id);
        if (req.accepts("html")) {
            res.render("pages/show.ejs", { Pages, course, chapter, page, nextIndex, csrfToken: req.csrfToken(), isMarked });
        } else {
            res.json( {Pages, course, chapter, page, nextIndex, csrfToken: req.csrfToken(), isMarked  });
        }
    }
    catch (err) {
        res.status(500).send("Internal Server Error");
    }   
});
//add pages
router.get("/new",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    let courseId = req.params.CourseId;
    let chapterId = req.params.ChapterId;
    let course = await Course.findByPk(courseId);
    let chapter = await Chapter.findByPk(chapterId);
    let chapters = await Chapter.findAll({ where:{ CourseId: courseId },order: [['id']] });
    res.render("pages/new.ejs", { course, chapter,chapters,csrfToken:req.csrfToken() });
});
//get particular page
router.get("/:PageId",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    try {
        let userId = req.user.id;
        let courseId = req.params.CourseId;
        console.log(courseId);
        let chapterId = req.params.ChapterId;
        let PageId = req.params.PageId;
        let course = await Course.findByPk(courseId);
        let chapter = await Chapter.findByPk(chapterId);
        let page = await Page.findOne({ where: { id: PageId } });
        let Pages = await Page.findAll({
            where: {
                ChapterID: chapterId,
            },
            order: [['id']]
        });
        let nextIndex = (Pages.findIndex((p) => p.id === page.id)) + 1;
        if (nextIndex == Pages.length) {
            nextIndex = 0;
        }
        const isMarked =await Progress.MarkedAsComplete(userId, PageId);
        res.render("pages/show.ejs", { Pages, course, chapter, page,nextIndex,csrfToken:req.csrfToken(),isMarked});
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
        
    }
});
router.post("/",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    try {
        let CourseId = req.params.CourseId;
         let ChapterID = req.params.ChapterId;
        await Page.create({ ...req.body, ChapterID, CourseId });
        req.flash("success", "Added Page Successfully!!");
        res.redirect(`/courses/${CourseId}/chapters`);
    }
    catch (err) {
        res.status(500).send("Internal Server Error");
    }
});
router.get("/:PageId/edit",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    try {
        let courseId = req.params.CourseId;
        let chapterId = req.params.ChapterId;
        let pageId = req.params.PageId;
        let course = await Course.findByPk(courseId);
        let chapter = await Chapter.findByPk(chapterId);
        let page = await Page.findByPk(pageId);
        res.render("pages/edit.ejs", { course, chapter,page,csrfToken:req.csrfToken() });
    }
    catch (err) {
        res.status(500).send("Internal Server Error");
    }
});
router.put("/:PageId",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    let courseId = req.params.CourseId;
    let chapterId = req.params.ChapterId;
    let pageId = req.params.PageId;
    try {
        await Page.update({ ...req.body }, {
            where: {
                id: pageId,
            }
        });
        req.flash("success", "Page Updated Successfully!!");
        res.redirect(`/courses/${courseId}/chapters/${chapterId}/pages`);
    }
    catch (err) {
          res.status(500).send("Internal Server Error");
    }
});
router.delete("/:PageId",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    let courseId = req.params.CourseId;
    let chapterId = req.params.ChapterId;
    let pageId = req.params.PageId;
    try {
        await Page.destroy({
            where: {
                id: pageId,
            }
        });
         req.flash("success", "Page Deleted!!");
        res.redirect(`/courses/${courseId}/chapters/${chapterId}/pages`);
    }
    catch (err) {
        res.status(500).send("Internal Server Error");
    }
});
//markAsComplete
router.post("/:pageId", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.CourseId;
        const pageId = req.params.pageId;
        const chapterId = req.params.ChapterId;
        await Progress.create({ StudentID: userId, CourseID: courseId, PageID: pageId, IsComplete: true });
        req.flash("success", "Great job! Page marked as completed.");
        res.redirect(`/courses/${courseId}/chapters/${chapterId}/pages/${pageId}`);
    }
    catch (err) {
        console.log(err);
    }
});
module.exports = router;
