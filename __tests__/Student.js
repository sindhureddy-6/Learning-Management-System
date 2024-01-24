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

  await agent.post("/session").send({
    userName: username,
    Password: password,
    _csrf: csrfToken,
  });
};

describe("Learning Management System", function () {
    beforeAll(async () => {
        await db.sequelize.sync({ force: true });
        server = app.listen(4001, () => { });
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

    test("Sign up", async () => {
      let res = await agent.get("/signup");
      console.log(res.text);
      const csrfToken = extractCsrfToken(res);
      console.log(csrfToken);
    res = await agent.post("/users").send({
      userName: "test",
      Email: "test@gmail.com",
      role:"Student",
      Password: "password",
      _csrf: csrfToken,
    });
      console.log(res.text);
    expect(res.statusCode).toBe(302);
    });
    

});