const express = require("express");
const app = express();
const ejsMate = require("ejs-mate");
const path = require("path");
const markdownIt = require('markdown-it')();
var methodOverride = require('method-override')
const { Course,Chapter,Page} = require("./models");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
    res.render("layouts/boilerplate.ejs");
})
//all courses
app.get("/courses", async (req, res) => {
    let courses = await Course.findAll();
    console.log(courses);
    res.render("courses/home.ejs", { courses });
});
//create course
app.post("/courses", async (req, res) => {
    try {
        await Course.create(req.body);
        res.redirect("/courses");
    }
    catch (err) {
        console.log(err);
    }
})
app.get("/courses/new", async (req, res) => {
    res.render("courses/new.ejs");
});
//show Chapters
app.get("/courses/:CourseId/chapters", async (req, res) => {
    //show chapters
    try {
        let CourseId = req.params.CourseId;
        let course = await Course.findByPk(CourseId);
        let chapters = await Chapter.findAll({ where: { CourseId: CourseId }, order: [['id']] });
        res.render("chapters/show.ejs", { course, chapters });
    }
    catch (err) {
        console.log(err);
    }
})
app.get("/courses/:CourseId/chapters/new", async (req, res) => {
    let CourseId = req.params.CourseId;
    console.log(CourseId);
    res.render("chapters/new.ejs", { CourseId });
})
app.post("/courses/:CourseId/chapters", async (req, res) => {
    try {
        let c_id = req.params.CourseId;
        let chapter = await Chapter.create({ ...req.body, CourseId: c_id });
        // console.log(chapter);
        res.redirect(`/courses/${c_id}/chapters`)
    } catch (error) {
        console.error("Error creating chapter:", error);
        res.status(500).send("Internal Server Error");
    }
});
app.get("/courses/:CourseId/chapters/:ChapterId/edit", async (req, res) => {
    let courseId = req.params.CourseId;
    let chapterId = req.params.ChapterId;
    try {
        let course = await Course.findByPk(courseId);
        let chapter = await Chapter.findByPk(chapterId);
        res.render("chapters/edit.ejs", { course, chapter });
    } catch (err) {
        console.log(err);
    }

});
app.put("/courses/:CourseId/chapters/:ChapterId", async (req, res) => {
    let courseId = req.params.CourseId;
    let chapterId = req.params.ChapterId;
    try {
         await Chapter.update({...req.body}, {
            where: {
               id:chapterId,
            }
        });
        res.redirect(`/courses/${courseId}/chapters`);
    }
    catch (err) {
        console.log(err);
    }

});
app.delete("/courses/:CourseId/chapters/:ChapterId", async (req, res) => {
    let courseId = req.params.CourseId;
    let chapterId = req.params.ChapterId;
    try {
        await Chapter.destroy({
            where: {
                id: chapterId,  
            }
        });
        res.redirect(`/courses/${courseId}/chapters`);
    }
    catch (err) {
        console.log(err);
    }
})
//show pages
app.get("/courses/:CourseId/chapters/:ChapterId/Pages", async (req, res) => {
    try {
        let courseId = req.params.CourseId;
        let chapterId = req.params.ChapterId;
        let course = await Course.findByPk(courseId);
        let chapter = await Chapter.findByPk(chapterId);  
        let Pages = await Page.findAll({
            where: {
                ChapterID: chapterId,
            },
            order:[['id']]
        })
        const formattedPages = Pages.map((page) => {
            return {
                ...page.toJSON(), 
                Content: markdownIt.render(page.Content),
            };
        });
        // console.log(formattedPages[0]);
        res.render("pages/show.ejs", { formattedPages,course,chapter}); 
    }
    catch (err) {
        console.log(err);
    }   
});
//add pages
app.get("/courses/:CourseId/chapters/:ChapterId/Pages/new", async (req, res) => {
    let courseId = req.params.CourseId;
    let chapterId = req.params.ChapterId;
    let course = await Course.findByPk(courseId);
    let chapter = await Chapter.findByPk(chapterId);
    res.render("pages/new.ejs", { course, chapter });
});
app.post("/courses/:CourseId/chapters/:ChapterId/Pages", async (req, res) => {
    try {
        let courseId = req.params.CourseId;
        let ch_id = req.params.ChapterId;
        let page = await Page.create({ ...req.body, ChapterID: ch_id });
        res.redirect(`/courses/${courseId}/chapters/${ch_id}/Pages`)
    }
    catch (err) {
        console.log(err);
    }
});
app.get("/courses/:CourseId/chapters/:ChapterId/Pages/:PageId/edit", async (req, res) => {
    try {
        let courseId = req.params.CourseId;
        let chapterId = req.params.ChapterId;
        let pageId = req.params.PageId;
        let course = await Course.findByPk(courseId);
        let chapter = await Chapter.findByPk(chapterId);
        let page = await Page.findByPk(pageId);
        res.render("pages/edit.ejs", { course, chapter,page });
    }
    catch (err) {
        console.log(err);
    }
});
app.put("/courses/:CourseId/chapters/:ChapterId/Pages/:PageId", async (req, res) => {
    let courseId = req.params.CourseId;
    let chapterId = req.params.ChapterId;
    let pageId = req.params.PageId;
    try {
        await Page.update({ ...req.body }, {
            where: {
                id: pageId,
            }
        });
        res.redirect(`/courses/${courseId}/chapters/${chapterId}/pages`);
    }
    catch (err) {
        console.log(err);
    }
});
app.delete("/courses/:CourseId/chapters/:ChapterId/Pages/:PageId", async (req, res) => {
    let courseId = req.params.CourseId;
    let chapterId = req.params.ChapterId;
    let pageId = req.params.PageId;
    try {
        await Page.destroy({
            where: {
                id: pageId,
            }
        });
        res.redirect(`/courses/${courseId}/chapters/${chapterId}/pages`);
    }
    catch (err) {
        console.log(err);
    }
})

app.listen(4000, () => {
    console.log("app is listening at port 4000");
})