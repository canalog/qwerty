import express from "express";
import connection from "../configs/connectDB";
import loginController from "../controllers/loginController";
import registerController from "../controllers/registerController";
import homePageController from "../controllers/homePageController";
import auth from "../validation/authValidation";
import passport from "passport";
import initPassportLocal from "../controllers/passportController";

const router = express.Router();

initPassportLocal();

const initWebRoutes = (app) => {
  router.get(
    "/",
    loginController.checkLoggedIn,
    homePageController.getHomePage
  );
  router.get(
    "/login",
    loginController.checkLoggedOut,
    loginController.getLoginPage
  );
  router.post(
    "/login",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
      successFlash: true,
      failureFlash: true,
    })
  );
  router.get(
    "/register",
    loginController.checkLoggedOut,
    registerController.getRegisterPage
  );
  router.post(
    "/register",
    auth.validateRegister,
    registerController.createNewUser
  );

  router.get("/userInfo", (req, res) => {
    res.send("Hello");
  });

  app.get("/submitterlist", function (req, res) {
    var sql = "SELECT * FROM submitter";
    connection.query(sql, function (err, rows, fields) {
      if (err) console.log("query is not executed. select fail...\n" + err);
      else res.render("submitterlist.ejs", { submitter: rows });
    });
  });

  app.get("/generatetask", function (req, res) {
    res.render("generatetask.ejs");
  });

  app.post("/generatetaskAf", function (req, res) {
    var body = req.body;
    var sql = "INSERT INTO task VALUES(?, ?, ?, ?, ?, ?)";
    var params = [
      req.user.ID,
      body.name,
      body.description,
      body.taskdatatable,
      body.cycle,
      body.role,
    ];
    var sql2 = console.log(sql);
    connection.query(sql, params, function (err) {
      if (err) console.log("query is not executed. insert fail...\n" + err);
      else {
        const updateSQL = "UPDATE submitter SET request = 'W' WHERE id = ?";
        const subid = [req.user.ID];
        connection.query(updateSQL, subid, function (err) {
          if (err) console.log("Update query is not executed. \n" + err);
          else console.log("submitter update success!");
        });
        console.log("Success!");
        res.redirect("/submitterlist");
      }
    });
  });

  router.post("/logout", loginController.postLogOut);

  return app.use("/", router);
};
module.exports = initWebRoutes;
