const csurf = require("tiny-csrf");
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const app = express();
const ejsMate = require("ejs-mate");
const path = require("path");
var methodOverride = require('method-override');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const { Course, Chapter, Page,User ,Enrollment} = require("./models");

app.engine('ejs',ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("cookie-parser-secret"));
app.use(session({
    secret: "my-super-secret-key-156655548662145",
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    }
  }));
app.use(
  csurf(
    "123456789iamasecret987654321look"
  )
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new LocalStrategy(
    {
      usernameField: "userName",
      passwordField: "Password",
    },
    async (username, password, done) => {
      console.log("In authentication", username, password);
      try {
        const user = await User.findOne({
          where: {
            "userName": username,
          },
        });

        if (!user) {
          console.log("User not found");
          return done(null, false, { message: "User not found" });
        }

        console.log("Comparing passwords", user);
        const result = await bcrypt.compare(password, user.Password);

        console.log("Result", result);

        if (result) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Invalid password" });
        }
      } catch (err) {
        console.error("Error during authentication:", err);
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("serializing user in session ", user.id);
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      console.log("deserializing user from session ", user.id);
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});
const saltRounds = 10;


//all courses
app.get("/courses", async (req, res) => {
    let courses = await Course.findAll();
    res.render("courses/home.ejs", { courses,csrfToken:req.csrfToken() });
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
   let course = await Course.findByPk(CourseId);
    res.render("chapters/new.ejs", { course });
})
app.post("/courses/:CourseId/chapters", async (req, res) => {
    try {
        let c_id = req.params.CourseId;
        let chapter = await Chapter.create({ ...req.body, CourseId: c_id });
        // console.log(chapter);
        res.redirect(`/courses/${c_id}/chapters/${chapter.id}/pages/new`)
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
        console.log("nextPage", nextIndex);
        res.render("pages/show.ejs", {Pages,course,chapter,page,nextIndex}); 
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
    let chapters = await Chapter.findAll({ order: [['id']] });
    res.render("pages/new.ejs", { course, chapter,chapters });
});
//get particular page
app.get("/courses/:CourseId/chapters/:ChapterId/Pages/:PageId", async (req, res) => {
    try {
        let courseId = req.params.CourseId;
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
        console.log("nextPage", nextIndex);
        res.render("pages/show.ejs", { Pages, course, chapter, page,nextIndex});
    }
    catch (err) {
        console.log(err);
    }
});
app.post("/courses/:CourseId/chapters/:ChapterId/Pages", async (req, res) => {
    try {
        let courseId = req.params.CourseId;
         let ch_id = req.params.ChapterId;
        let page = await Page.create({ ...req.body});
        res.redirect(`/courses/${courseId}/chapters`);
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
});
//enroll
app.post("/courses/:courseId/enroll", async(req, res) => {
    const userId = req.user.id;
    console.log("userid", userId);
    const { courseId } = req.params;
    console.log("courseid", courseId);

    try {
        // Check if the course exists
        const course = await Course.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Check if the user is already enrolled in the course
        const existingEnrollment = await Enrollment.findOne({
            where: {
                userId,
                courseId,
            },
        });

        if (existingEnrollment) {
            return res.status(400).json({ error: 'User is already enrolled in this course' });
        }

        // Enroll the user in the course
        await Enrollment.create({
            userId,
            courseId,
        });

        return res.redirect(`/courses/${courseId}/chapters`);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
)
// Users
//signup get
app.get("/signup", (req, res) => {
    res.render("users/signup.ejs", { csrfToken: req.csrfToken() });
});
app.post("/users", async (req, res) => {
    console.log("reqBODy,", req.body);
    const hashedPwd = await bcrypt.hash(req.body.Password, saltRounds);
     await User.create({ ...req.body, Password: hashedPwd });
    res.redirect("/login");
});

app.get("/login", (req, res) => {
    res.render("users/login.ejs",{ csrfToken: req.csrfToken() });
});
app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login"
  }),
  (req, res) => {
     res.redirect("/courses");
  },
);
app.get("/signout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/login");
    });
})

app.listen(4000, () => {
    console.log("app is listening at port 4000");
});