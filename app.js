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
const usersRoute = require("./routes/users.js");
const coursesRoute = require("./routes/courses.js");
const chaptersRoute = require("./routes/chapters.js");
const pagesRoute = require("./routes/pages.js");

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
    next();
});

app.use("/", usersRoute);
app.use("/courses", coursesRoute);
app.use("/courses/:CourseId/chapters", chaptersRoute);
app.use("/courses/:CourseId/chapters/:ChapterId/Pages", pagesRoute);

app.listen(4001, () => {
    console.log("app is listening at port 4001");
});
module.exports = app;