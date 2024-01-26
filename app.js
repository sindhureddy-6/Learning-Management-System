const csurf = require("tiny-csrf");
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const app = express();
const Sequelize = require("sequelize");
const ejsMate = require("ejs-mate");
const path = require("path");
const bodyParser = require("body-parser");
var methodOverride = require('method-override');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const connectEnsureLogin = require("connect-ensure-login");
const bcrypt = require("bcrypt");
const db = require("./models");
const { Course, Chapter, Page, User, Enrollment, Progress } = require("./models");
const flash = require("connect-flash");

app.engine('ejs',ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride('_method'));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("cookie-parser-secret"));
app.use(session({
    secret: "my-super-secret-key-156655548662145",
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    }
  }));
app.use(csurf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new LocalStrategy(
    {
      usernameField: "userName",
      passwordField: "Password",
    },
    async (username, password, done) => {
    //   console.log("In authentication", username, password);
      try {
        const user = await User.findOne({
          where: {
            "userName": username,
          },
        });

        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        // console.log("Comparing passwords", user);
        const result = await bcrypt.compare(password, user.Password);

        // console.log("Result", result);

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
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user ? req.user : null;
    req.session.user = req.user?req.user:null;
    next();
});
app.get("/", (req, res) => {
    res.redirect("/login");
});
//all courses
app.get("/courses", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
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
app.post("/courses",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    try {
        await Course.create({ ...req.body, EducatorId: req.user.id });
        req.flash("success","Created Course Successfully!!")
        res.redirect("/courses");
    }
    catch (err) {
        console.log(err);
    }
})
app.get("/courses/new",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    res.render("courses/new.ejs",{csrfToken:req.csrfToken()});
});
//show Chapters
app.get("/courses/:CourseId/chapters", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
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
app.get("/courses/:CourseId/chapters/new",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    let CourseId = req.params.CourseId;
   let course = await Course.findByPk(CourseId);
    res.render("chapters/new.ejs", { course,csrfToken:req.csrfToken() });
})
app.post("/courses/:CourseId/chapters",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    try {
        let c_id = req.params.CourseId;
        let chapter = await Chapter.create({ ...req.body, CourseId: c_id });
        // console.log(chapter);
        res.redirect(`/courses/${c_id}/chapters/${chapter.id}/pages/new`)
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});
app.get("/courses/:CourseId/chapters/:ChapterId/edit",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
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
app.put("/courses/:CourseId/chapters/:ChapterId",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
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
app.delete("/courses/:CourseId/chapters/:ChapterId",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
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
})
//show pages
app.get("/courses/:CourseId/chapters/:ChapterId/Pages",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
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
            res.json( { Pages });
        }
    }
    catch (err) {
        res.status(500).send("Internal Server Error");
    }   
});
//add pages
app.get("/courses/:CourseId/chapters/:ChapterId/Pages/new",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    let courseId = req.params.CourseId;
    let chapterId = req.params.ChapterId;
    let course = await Course.findByPk(courseId);
    let chapter = await Chapter.findByPk(chapterId);
    let chapters = await Chapter.findAll({ where:{ CourseId: courseId },order: [['id']] });
    res.render("pages/new.ejs", { course, chapter,chapters,csrfToken:req.csrfToken() });
});
//get particular page
app.get("/courses/:CourseId/chapters/:ChapterId/Pages/:PageId",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    try {
        let userId = req.user.id;
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
        const isMarked =await Progress.MarkedAsComplete(userId, PageId);
        res.render("pages/show.ejs", { Pages, course, chapter, page,nextIndex,csrfToken:req.csrfToken(),isMarked});
    }
    catch (err) {
         res.status(500).send("Internal Server Error");
    }
});
app.post("/courses/:CourseId/chapters/:ChapterId/Pages",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    try {
        let CourseId = req.params.CourseId;
         let ChapterID = req.params.ChapterId;
        let page = await Page.create({ ...req.body, ChapterID, CourseId });
        req.flash("success", "Added Page Successfully!!");
        res.redirect(`/courses/${CourseId}/chapters`);
    }
    catch (err) {
        res.status(500).send("Internal Server Error");
    }
});
app.get("/courses/:CourseId/chapters/:ChapterId/Pages/:PageId/edit",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
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
app.put("/courses/:CourseId/chapters/:ChapterId/Pages/:PageId",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
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
app.delete("/courses/:CourseId/chapters/:ChapterId/Pages/:PageId",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
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
//enroll
app.post("/courses/:courseId/enroll", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
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
//markAsComplete
app.post("/courses/:courseId/chapters/:chapterId/pages/:pageId", async (req, res) => {
    const userId = req.user.id;
    const courseId = req.params.courseId;
    const pageId = req.params.pageId;
    const chapterId = req.params.chapterId;
    let progress = await Progress.create({ StudentID: userId, CourseID: courseId, PageID: pageId, IsComplete: true });
    req.flash("success", "Great job! Page marked as completed.");
    res.redirect(`/courses/${courseId}/chapters/${chapterId}/pages/${pageId}`)
});
//progress
//get
app.get("/courses/:EducatorId/progress", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
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
//mycourses
//get
app.get("/courses/:EducatorId",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    try {
        let EducatorId = req.params.EducatorId;
        let myCourses = await Course.findAll({ where: { EducatorId } });
        res.render("courses/mycourses.ejs", { myCourses, csrfToken: req.csrfToken() });
    }
    catch (err) {
       return res.status(500).send({ error: 'Internal Server Error' });
    }
})
// Users
//signup get
app.get("/signup", (req, res) => {
    res.render("users/signup.ejs", { csrfToken: req.csrfToken() });
});
app.post("/users", async (req, res) => {
    console.log(req.body._csrf);
    try {
        if (req.body.Email.length == 0) {
            req.flash("error", "Email can not be empty!");
            return res.redirect("/signup");
        }

        if (req.body.userName.length == 0) {
            req.flash("error", "First name cannot be empty!");
            return res.redirect("/signup");
        }

        if (req.body.Password.length < 5) {
            req.flash("error", "Password must be at least 5 characters");
            return res.redirect("/signup");
        }
        const hashedPwd = await bcrypt.hash(req.body.Password, saltRounds);
        let user = await User.create({ ...req.body, Password: hashedPwd });
        req.login(user, (err) => {
            if (err) {
                console.error(err);
                return res.status(422).send({ error: err.message });
            }
            res.redirect("/courses");
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/login", (req, res) => {
    res.render("users/login.ejs",{ csrfToken: req.csrfToken() });
});
app.post(
  "/session",
  passport.authenticate("local",  { failureRedirect: '/login', failureFlash: true }),
    (req, res) => {
        req.flash("success", "Welcome to Eduworld, " + req.user.userName + "!");
        res.redirect("/courses");
  },
);
app.get("/signout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You've been successfully signed out. Come back soon!");
        res.redirect("/login");
    });
});
//reset Password get
app.get("/resetpassword", (request, reponse) => {
  reponse.render("users/resetPassword.ejs", {
    title: "Reset Password",
    csrfToken: request.csrfToken(),
  });
});
// Route for updating the password
app.post("/setpassword", async (request, response) => {
  const userEmail = request.body.email;
  const newPassword = request.body.password;

  try {
    // Find the user by email
    const user = await User.findOne({ where: { Email: userEmail } });

    if (!user) {
      request.flash("error", "User with that email does not exist.");
      return response.redirect("/resetpassword");
    }

    // Hash the new password
    const hashedPwd = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password in the database
    await user.update({ Password: hashedPwd });

      // Redirect to a success page or login page
    request.flash("success", "Password reset successful! You can now log in with your new password.");
    return response.redirect("/login");
  } catch (error) {
    console.log(error);
    request.flash("error", "Error updating the password.");
    return response.redirect("/resetpassword");
  }
});


app.listen(4001, () => {
    console.log("app is listening at port 4001");
});
module.exports = app;