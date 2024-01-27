# Learning Management System (LMS)

## Overview

The Learning Management System (LMS) is an online platform designed to facilitate learning interactions between educators and students. It allows educators to create courses, organize content into chapters and pages. Students can sign up, enroll in courses, access course content, mark pages as complete, and view their progress status.

## Features

### For Educators

#### Course Management
- **Create a Course:** Begin by providing a name and description for your course.
- **Build Chapters:** Organize your course into chapters for clear structure.
- **Add Pages:** Populate each chapter with pages.

#### Reports
- **View Enrollment Reports:** Access reports displaying the number of students enrolled in their course(s) and relative popularity based on enrollment numbers.

### For Students

#### Account Management
- **Sign up:** New users can sign up effortlessly by providing their name, email address, and creating a password.
- **Sign in:** Returning users can sign in using their registered email and password.
- **Sign out:** All users have the flexibility to log out when needed.

#### Course Enrollment and Content Access
- **Enroll in a Course:** Gain access to course content and participate in the learning experience.
- **View Chapters List:** Preview the table of contents before enrolling.
- **Display Enrolled Courses:** Access enrolled courses in a dedicated section.
- **Mark Pages as Complete:** Track learning progress by marking pages as completed.
- **Show Progress Status:** View progress status, possibly through a completion percentage.

### Dependencies

- **bcrypt**: Securely hashes passwords for user authentication.
- **body-parser**: Middleware for parsing incoming request bodies.
- **cheerio**: Parses and manipulates HTML and XML documents.
- **connect-ensure-login**: Middleware for ensuring user authentication.
- **connect-flash**: Displays temporary messages to users.
- **cookie-parser**: Middleware for parsing cookies.
- **ejs-mate**: EJS layout and partials plugin for Express.
- **express**: Minimal and flexible web application framework.
- **express-session**: Middleware for handling user sessions.
- **jest**: JavaScript testing framework.
- **markdown-it**: Markdown parser for converting Markdown to HTML.
- **method-override**: Middleware for HTTP method override.
- **nodemon**: Utility for automatically restarting Node.js applications.
- **passport**: Authentication middleware for Node.js.
- **passport-local**: Passport strategy for local authentication.
- **pg**: PostgreSQL client for Node.js.
- **pg-hstore**: Serializes and deserializes JSON data for PostgreSQL.
- **quill**: Modern WYSIWYG editor.
- **sequelize**: Promise-based ORM for Node.js.
- **supertest**: Library for testing HTTP servers.
- **tiny-csrf**: Middleware for CSRF token generation and validation.
- **husky**:pre-commit hook to run tests

## MVC Architecture

The Learning Management System follows the Model-View-Controller (MVC) architecture to ensure a clear separation of concerns and maintainability of the codebase.

## Screenshots 
**Sign up Page**
![Sign up Page](images/image.png)

**Login Page**
![image](https://github.com/sindhureddy-6/Learning-Management-System/assets/113305417/210e6b0a-d8ab-4fe0-9342-fbe45af2e832)

**Educator DashBoard**
![image](https://github.com/sindhureddy-6/Learning-Management-System/assets/113305417/b107f836-7c4e-4655-93a9-35864eafa352)

**Create Course**
![image](https://github.com/sindhureddy-6/Learning-Management-System/assets/113305417/0c3c748e-7cba-48aa-beeb-b489aa22fc27)

**Chapters Page**
![image](https://github.com/sindhureddy-6/Learning-Management-System/assets/113305417/29cfcd1e-b2c3-4310-9da6-829dc43fcfd8)

**Add Chapter Page**
![image](https://github.com/sindhureddy-6/Learning-Management-System/assets/113305417/8561cec9-770a-426a-8400-73867ebe21c0)

**Pages**
![image](https://github.com/sindhureddy-6/Learning-Management-System/assets/113305417/38e56749-182d-4a0d-a3d5-77cc884bf313)

**Add Page**
![image](https://github.com/sindhureddy-6/Learning-Management-System/assets/113305417/45879f2e-c4e1-492c-9cab-f3e61f5c9c84)

**Educator's My Courses Pages**
![image](https://github.com/sindhureddy-6/Learning-Management-System/assets/113305417/22b1fb3c-aeee-429b-842b-5d36b498ca17)

**Educator Reports**
![image](https://github.com/sindhureddy-6/Learning-Management-System/assets/113305417/725f4022-fbbd-4ac2-9d08-26b8d5c0c507)

**Student's DashBoard**
![image](https://github.com/sindhureddy-6/Learning-Management-System/assets/113305417/3e6b4178-6f78-480b-a3f5-903f0603b73c)




