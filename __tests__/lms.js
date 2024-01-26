const request = require("supertest");
const cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

let server, agent;
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}
let login = async (agent, username, password) => {
  let res = await agent.get("/login");
  const csrfToken = extractCsrfToken(res);

 res= await agent.post("/session").send({
    userName: username,
    Password: password,
    _csrf: csrfToken,
 });
};
describe("Learning Management System", function () {
    beforeAll(async () => {
        await db.sequelize.sync({ force: true });
        server = app.listen(4000, () => { });
        agent = request.agent(server);
    });

    afterAll(async () => {
        try {
            await db.sequelize.close();
            await server.close();
        } catch (error) {
            console.log(error);
        }
    });
     test("Educator Sign-up", async () => {
      let res = await agent.get("/signup");
      let csrfToken = extractCsrfToken(res);
       res = await agent.post("/users").send({
        userName: "educator",
        Email: "eduactor@gmail.com",
        role: "Educator",
         Password: "password",
        _csrf: csrfToken,
       });
     
      expect(res.statusCode).toBe(302);
     });
    
  test("Student Sign-up", async () => {
      let res = await agent.get("/signup");
      let csrfToken = extractCsrfToken(res);
      res = await agent.post("/users").send({
        userName: "student",
        Email: "student@gmail.com",
        role: "Student",
         Password: "password",
        _csrf: csrfToken,
      });
      expect(res.statusCode).toBe(302);
  });
    
    test("Sign-out", async () => {
    let res = await agent.get("/courses");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/courses");
    expect(res.statusCode).toBe(302);
    });
    
  test("Create a Course", async () => {
   const agent = request.agent(server);
    await login(agent, "educator", "password");
   res = await agent.get("/courses/new");
    let csrfToken = extractCsrfToken(res);
    res = await agent.post("/courses").send({
     CourseName: "Web Development 101",
     _csrf:csrfToken,  
    });
    res = await agent.get("/courses/new");
   csrfToken = extractCsrfToken(res);
   res = await agent.post("/courses").send({
     CourseName: "Mathematics 101",
     _csrf:csrfToken,  
   });
    expect(res.statusCode).toBe(302);
  });

  test("Build Chapters", async () => {
    const agent = request.agent(server);
    await login(agent, "educator", "password");
    let res = await agent.get("/courses").set("Accept", "application/json");
    parsedResponse = JSON.parse(res.text);
    console.log(parsedResponse);
    AllCourses = parsedResponse.courses;
    latestCourse = AllCourses[AllCourses.length - 1];
    
    res = await agent.get("/courses");
    csrfToken = extractCsrfToken(res);

    res = await agent.post(`/courses/${latestCourse.id}/chapters`).send({
    ChapterName: "Chapter 1: Algebra Basics",
    Description: "sample description",
    _csrf:csrfToken , 
  });
   expect(res.statusCode).toBe(302);
  });

 test("Add Pages", async () => {
   // Log in the educator
   const agent = request.agent(server);
   await login(agent, "educator", "password");

    let res = await agent.get("/courses").set("Accept", "application/json");
    let parsedResponse = JSON.parse(res.text);
    let AllCourses = parsedResponse.courses;
    let latestCourse = AllCourses[AllCourses.length - 1];
   
   res = await agent.get(`/courses/${latestCourse.id}/chapters`).set("Accept", "application/json");
   parsedResponse = JSON.parse(res.text);
   let AllChapters = parsedResponse.chapters;
   let latestChapter = AllChapters[AllChapters.length - 1];
   
   res = await agent.get(`/courses/${latestCourse.id}/chapters/${latestChapter.id}/pages/new`);
   let csrfToken = extractCsrfToken(res);

   res = await agent.post(`/courses/${latestCourse.id}/chapters/${latestChapter.id}/pages`).send({
     PageName: "Introduction to Algebra",
     Content: "This is an introduction to algebra.",
     _csrf: csrfToken,
  });

  // Assuming successful page creation redirects to the chapter content page
  expect(res.statusCode).toBe(302);
});
   
  test("Enroll in a Course", async () => {
    // Log in the student
    const agent = request.agent(server);
    await login(agent, "student", "password");
     
    let res = await agent.get("/courses").set("Accept", "application/json");
    let parsedResponse = JSON.parse(res.text);
    let AllCourses = parsedResponse.courses;
    let latestCourse = AllCourses[AllCourses.length - 1];
    
    res = await agent.get("/courses");
    csrfToken = extractCsrfToken(res);

    // Enroll in a course 
    res = await agent.post(`/courses/${latestCourse.id}/enroll`).send({_csrf:csrfToken});

    // Assuming successful enrollment redirects to the course content page
     expect(res.statusCode).toBe(302);
  });

  test("View Chapters List Without Enrolling", async () => {
    // Log in the student
    const agent = request.agent(server);
    await login(agent, "student", "password");
    
    let res = await agent.get("/courses").set("Accept", "application/json");
    let parsedResponse = JSON.parse(res.text);
    let AllCourses = parsedResponse.courses;
    let latestCourse = AllCourses[0];

  
    res = await agent.get(`/courses/${latestCourse.id}/chapters`);
    expect(res.statusCode).toBe(200);
  });
  
  test("Mark Pages as Complete", async () => {
  // Log in the student
    const agent = request.agent(server);
    await login(agent, "student", "password");
   
    let res = await agent.get("/courses").set("Accept", "application/json");
    let parsedResponse = JSON.parse(res.text);
    let AllCourses = parsedResponse.courses;
    let latestCourse = AllCourses[AllCourses.length - 1];
    
    res = await agent.get(`/courses/${latestCourse.id}/chapters`).set("Accept", "application/json");
    parsedResponse = JSON.parse(res.text);
    let AllChapters = parsedResponse.chapters;
    let latestChapter = AllChapters[AllChapters.length - 1];
     
    res = await agent.get(`/courses/${latestCourse.id}/chapters/${latestChapter.id}/Pages`).set("Accept", "application/json");
    parsedResponse = JSON.parse(res.text);
    let AllPages = parsedResponse.Pages;
    let page = AllPages[0];
   
    res = await agent.get(`/courses/${latestCourse.id}/chapters/${latestChapter.id}/Pages`);
    csrfToken = extractCsrfToken(res);
    
    res=await agent.post(`/courses/${latestCourse.id}/chapters/${latestChapter.id}/pages/${page.id}`).send({ _csrf: csrfToken });
    expect(res.statusCode).toBe(302);
  });

  test("Show Progress Status", async () => {
   const agent = request.agent(server);
   await login(agent, "student", "password");
  
    res = await agent.get("/courses").set("Accept", "application/json");
    let parsedResponse = JSON.parse(res.text);
    let myCourses = parsedResponse.myCourses;
    // Assuming successful request returns progress status
    expect(res.statusCode).toBe(200);
    expect(myCourses.every(course => course.hasOwnProperty("progress"))).toBe(true);
});
  


});