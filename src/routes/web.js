import express from "express";
import connection from "../configs/connectDB";
import loginController from "../controllers/loginController";
import registerController from "../controllers/registerController";
import homePageController from "../controllers/homePageController";
import auth from "../validation/authValidation";
import passport from "passport";
import initPassportLocal from "../controllers/passportController";
import editinfoController from "../controllers/editinfoController";
import disconnectController from "../controllers/disconnectController";
import estimatingController from "../controllers/estimatingController";

const router = express.Router();

initPassportLocal();

const initWebRoutes = (app) => {
  // homepage
  router.get(
    "/",
    loginController.checkLoggedIn,
    homePageController.getHomePage
  );
  // login
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
  // register
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
  // edit user info
  router.get("/userinfo", (req, res) => {
    const user = req.user;
    const role = user.ROLE;
    const userTable =
      role === "E" ? "estimator" : role === "A" ? "administrator" : "submitter";
    const userId = [user.ID];
    var sql = `SELECT * FROM ${userTable} WHERE id = ?`;
    connection.query(sql, userId, function (err, rows, fields) {
      if (err) console.log("query is not executed. select fail...\n" + err);
      else res.render("userinfo.ejs", { user: rows });
    });
  });

  router.post(
    "/userinfo",
    auth.validateRegister,
    editinfoController.updateUser
  );

  // view for submitter list
  router.get("/submitterlist", function (req, res) {
    var sql = "SELECT * FROM submitter";
    connection.query(sql, function (err, rows, fields) {
      if (err) console.log("query is not executed. select fail...\n" + err);
      else res.render("submitterlist.ejs", { submitter: rows });
    });
  });

  // create task
  router.get("/generatetask", function (req, res) {
    res.render("generatetask.ejs");
  });

  router.post("/generatetaskAf", function (req, res) {
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

  // check informations about submit file
  router.get("/mypage", function (req, res) {
    res.render("mypage.ejs");
  });

  router.get("/userinfo", (req, res) => {
    const user = req.user;
    const role = user.ROLE;
    const userTable =
      role === "E" ? "estimator" : role === "A" ? "administrator" : "submitter";
    const userId = [user.ID];
    var sql = `SELECT * FROM ${userTable} WHERE id = ?`;
    connection.query(sql, userId, function (err, rows, fields) {
      if (err) console.log("query is not executed. select fail...\n" + err);
      else res.render("userinfo.ejs", { user: rows });
    });
  });

  // number of files user submitted
  router.get("/num_files", function (req, res) {
    const user = req.user;
    const role = user.ROLE;
    const parsingTable = role === "R" ? "rparsing" : "hparsing";
    const userId = [user.ID];
    const sql = `SELECT count(*) AS count,taskname FROM ${parsingTable} WHERE sid = ? GROUP BY taskname`;
    connection.query(sql, userId, function (err, rows) {
      if (err) console.log("query is not executed. select fail...\n" + err);
      else res.render("num_files.ejs", { data: rows });
    });
  });

  // number of tuples in files user submitted
  router.get("/num_tuples", function (req, res) {
    const user = req.user;
    const role = user.ROLE;
    const parsingTable = role === "R" ? "rparsing" : "hparsing";
    const userId = [user.ID];
    const sql = `SELECT SUM(totaltuple),taskname AS sum, taskname FROM ${parsingTable} WHERE ESTATE = "Y" AND SID = ? GROUP BY TASKNAME`;
    connection.query(sql, userId, function (err, rows) {
      if (err) console.log("query is not executed. select fail...\n" + err);
      else res.render("num_tuples.ejs", { data: rows });
    });
  });

  // information about files
  router.get("/file_info", function (req, res) {
    const user = req.user;
    const role = user.ROLE;
    const parsingTable = role === "R" ? "rparsing" : "hparsing";
    const userId = [user.ID];
    const sql = `SELECT TASKNAME,PARSINGID,ROUND,ESTATE,ESCORE,PASS,SID,TID FROM ${parsingTable} WHERE SID = ? ORDER BY ROUND ASC`;
    connection.query(sql, userId, function (err, rows) {
      if (err) console.log("query is not executed. select fail...\n" + err);
      else res.render("file_info.ejs", { data: rows });
    });
  });

  // estimate
  router.get(
    "/estimatormain",
    loginController.checkLoggedIn,
    estimatingController.getREstimatorPage
  );
  router.get(
    "/estimatormain2",
    loginController.checkLoggedIn,
    estimatingController.getHEstimatorPage
  );
  router.get(
    "/notestimated",
    loginController.checkLoggedIn,
    estimatingController.getRNotEstimatingPage
  );
  router.get(
    "/notestimated2",
    loginController.checkLoggedIn,
    estimatingController.getHNotEstimatingPage
  );
  router.get("/restimating", function (req, res) {
    var sql = "SELECT * FROM rparsing WHERE estate='N' AND eid=?";
    connection.query(sql, [req.user.ID], function (err, rows, fields) {
      if (err) console.log("query is not executed. select fail...\n" + err);
      else res.render("restimating.ejs", { rparsed: rows });
    });
  });
  router.post("/restimatingAf", function (req, res) {
    var body = req.body;
    var sql =
      "UPDATE rparsing SET estate='Y', escore=?, pass=? WHERE eid=? AND parsingid=?";
    var sql2 = "SELECT * FROM rparsing WHERE estate='N' AND eid=?";
    var pid;
    connection.query(sql2, [req.user.ID], function (err, rows) {
      if (err) console.log("query is not executed. select fail...\n" + err);
      else {
        pid = rows[0].PARSINGID;
        connection.query(
          sql,
          [body.score, body.pass, req.user.ID, pid],
          function (err, rows, fields) {
            if (err)
              console.log("query is not executed. select fail...\n" + err);
            else res.redirect("/notestimated");
          }
        );
      }
    });
  });
  router.get("/hestimating", function (req, res) {
    var sql = "SELECT * FROM hparsing WHERE estate='N' AND eid=?";
    connection.query(sql, [req.user.ID], function (err, rows, fields) {
      if (err) console.log("query is not executed. select fail...\n" + err);
      else res.render("hestimating.ejs", { hparsed: rows });
    });
  });
  router.post("/hestimatingAf", function (req, res) {
    var body = req.body;
    var sql =
      "UPDATE hparsing SET escore=?, pass=? WHERE eid=? AND parsingid=?";
    var sql2 = "SELECT * FROM hparsing WHERE estate='N' AND eid=?";
    var pid;
    connection.query(sql2, [req.user.ID], function (err, rows, fields) {
      if (err) console.log("query is not executed. select fail...\n" + err);
      else {
        pid = rows[0].PARSINGID;
        connection.query(
          sql,
          [body.score, body.pass, req.user.ID, pid],
          function (err, rows, fields) {
            if (err)
              console.log("query is not executed. select fail...\n" + err);
            else res.redirect("/notestimated2");
          }
        );
      }
    });
  });

  // All the list of users for administrator
  router.get("/allUsers", function (req, res) {
    var sql = "SELECT * FROM submitter";
    var sql2 = "SELECT * FROM ESTIMATOR";
    connection.query(sql, function (err, rows, fields) {
      if (err) console.log("query is not executed. select fail...\n" + err);
      else {
        connection.query(sql2, function (err, results, fields) {
          if (err) console.log("query is not executed. select fail...\n" + err);
          else {
            res.render("allUsers.ejs", { submitter: rows, estimator: results });
          }
        });
      }
    });
  });

  router.get("/searchByRole", (req, res) => {
    var role = req.query.role;
    var sql = "SELECT * FROM submitter WHERE role= ?";
    var sql2 = "SELECT * FROM ESTIMATOR WHERE ROLE= ?";

    connection.query(sql, [role[0]], function (err, rows, fields) {
      if (err) console.log("query is not executed. select fail...\n" + err);
      else {
        connection.query(sql2, [role[0]], function (err, results, fields) {
          if (err) console.log("query is not executed. select fail...\n" + err);
          else {
            res.render("search.ejs", { submitter: rows, estimator: results });
          }
        });
      }
    });
  });

  router.get("/searchByAge", (req, res) => {
    var role = req.query.age;
    var sql = "SELECT * FROM submitter WHERE age= ?";
    var sql2 = "SELECT * FROM ESTIMATOR WHERE age= ?";

    connection.query(sql, [role[0]], function (err, rows, fields) {
      if (err) console.log("query is not executed. select fail...\n" + err);
      else {
        connection.query(sql2, [role[0]], function (err, results, fields) {
          if (err) console.log("query is not executed. select fail...\n" + err);
          else {
            res.render("search.ejs", { submitter: rows, estimator: results });
          }
        });
      }
    });
  });

  router.get("/searchByGender", (req, res) => {
    var role = req.query.Gender;
    var sql = "SELECT * FROM submitter WHERE Gender= ?";
    var sql2 = "SELECT * FROM ESTIMATOR WHERE Gender= ?";

    connection.query(sql, [role[0]], function (err, rows, fields) {
      if (err) console.log("query is not executed. select fail...\n" + err);
      else {
        connection.query(sql2, [role[0]], function (err, results, fields) {
          if (err) console.log("query is not executed. select fail...\n" + err);
          else {
            res.render("search.ejs", { submitter: rows, estimator: results });
          }
        });
      }
    });
  });

  router.get("/searchByTask", (req, res) => {
    var role = req.query.Task;
    var sql0 = "SELECT submitterid FROM APPROVAL WHERE TASKNAME= ?";
    var sql1 = "SELECT * FROM submitter WHERE id= ?";
    var sql2 = "SELECT * FROM ESTIMATOR WHERE id= ?";

    connection.query(sql0, [role[0]], function (err, row, fields) {
      if (err) console.log("query is not executed. select fail...\n" + err);
      else {
        connection.query(
          sql1,
          [row[0].submitterid],
          function (err, result1, fields) {
            if (err)
              console.log("query is not executed. select fail...\n" + err);
            else {
              connection.query(
                sql2,
                [row[0].submitterid],
                function (err, result2, fields) {
                  if (err)
                    console.log(
                      "query is not executed. select fail...\n" + err
                    );
                  else {
                    res.render("search.ejs", {
                      submitter: result1,
                      estimator: result2,
                    });
                  }
                }
              );
            }
          }
        );
      }
    });
  });

  router.get("/searchByID", (req, res) => {
    var role = req.query.ID;
    var sql = "SELECT * FROM submitter WHERE ID= ?";
    var sql2 = "SELECT * FROM ESTIMATOR WHERE ID= ?";

    connection.query(sql, [role[0]], function (err, rows, fields) {
      if (err) console.log("query is not executed. select fail...\n" + err);
      else {
        connection.query(sql2, [role[0]], function (err, results, fields) {
          if (err) console.log("query is not executed. select fail...\n" + err);
          else {
            res.render("search.ejs", { submitter: rows, estimator: results });
          }
        });
      }
    });
  });

  // logout
  router.post("/logout", loginController.postLogOut);

  router.get("/disconnect", (req, res) => {
    const user = req.user;
    const role = user.ROLE;
    const userTable = role === "E" ? "estimator" : "submitter";
    const userId = [user.ID];
    var sql = `SELECT * FROM ${userTable} WHERE id = ?`;
    connection.query(sql, userId, function (err, rows, fields) {
      if (err) console.log("query is not executed. select fail...\n" + err);
      else
        res.render("disconnect.ejs", {
          user: rows,
          errors: req.flash("errors"),
        });
    });
  });

  router.post("/disconnect", disconnectController.deleteUser);

  return app.use("/", router);
};

module.exports = initWebRoutes;
