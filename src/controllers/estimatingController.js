import connection from "../configs/connectDB";

const getREstimatorPage = async (req, res) => {
  var sql = "SELECT * FROM rparsing WHERE estate='Y' AND eid=?";
  connection.query(sql, [req.user.ID], function (err, rows, fields) {
    if (err) console.log("query is not executed. select fail...\n" + err);
    else res.render("estimatormain.ejs", { rparsed: rows });
  });
};
const getHEstimatorPage = async (req, res) => {
  var sql = "SELECT * FROM hparsing WHERE estate='Y' AND eid=?";
  connection.query(sql, [req.user.ID], function (err, rows, fields) {
    if (err) console.log("query is not executed. select fail...\n" + err);
    else res.render("estimatormain2.ejs", { hparsed: rows });
  });
};
const getRNotEstimatingPage = async (req, res) => {
  var sql = "SELECT * FROM rparsing WHERE estate='N' AND eid=?";
  connection.query(sql, [req.user.ID], function (err, rows, fields) {
    if (err) console.log("query is not executed. select fail...\n" + err);
    else res.render("notestimated.ejs", { rparsed: rows });
  });
};
const getHNotEstimatingPage = async (req, res) => {
  var sql = "SELECT * FROM hparsing WHERE estate='N' AND eid=?";
  connection.query(sql, [req.user.ID], function (err, rows, fields) {
    if (err) console.log("query is not executed. select fail...\n" + err);
    else res.render("notestimated2.ejs", { hparsed: rows });
  });
};

module.exports = {
  getREstimatorPage: getREstimatorPage,
  getHEstimatorPage: getHEstimatorPage,
  getRNotEstimatingPage: getRNotEstimatingPage,
  getHNotEstimatingPage: getHNotEstimatingPage,
};
