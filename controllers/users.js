const { User } = require("../models");
const bcrypt = require("bcrypt");
const saltRounds = 10;
module.exports.signup = (req, res) => {
    res.render("users/signup.ejs", { csrfToken: req.csrfToken() });
};
module.exports.postUsers = async (req, res) => {
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
         // Check if email already exists
        const existingEmail = await User.findOne({ where: { Email: req.body.Email } });
        if (existingEmail) {
            req.flash("error", "Email already exists!");
            return res.redirect("/signup");
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ where: { userName: req.body.userName } });
        if (existingUsername) {
            req.flash("error", "Username already exists!");
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
};
module.exports.login = (req, res) => {
    res.render("users/login.ejs", { csrfToken: req.csrfToken() });
};
module.exports.postSession = (req, res) => {
    req.flash("success", "Welcome to Eduworld, " + req.user.userName + "!");
    res.redirect("/courses");
};
module.exports.signout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You've been successfully signed out. Come back soon!");
        res.redirect("/login");
    });
};
module.exports.resetPassword = (request, reponse) => {
    reponse.render("users/resetPassword.ejs", {
        title: "Reset Password",
        csrfToken: request.csrfToken(),
    });
};
module.exports.setPassword = async (request, response) => {
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
};
