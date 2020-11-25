import connection from "../configs/connectDB";
import bcryptjs from "bcryptjs";

const editUser = (user) => {
  return new Promise((resolve, reject) => {
    try {
      // hash the password
      const today = new Date();
      const salt = bcryptjs.genSaltSync(10);
      const id = user.id;
      const password = bcryptjs.hashSync(user.password, salt);
      const role = user.role;
      if (role === "관리자") {
        connection.query(
          "UPDATE administrator SET password = ? WHERE id = ?",
          [password, id],
          function (error, rows) {
            if (error) {
              reject(error);
            }
            resolve("Create a new user successfully");
          }
        );
      }

      if (role === "식당") {
        const name = user.name;
        const gender = user.gender;
        const address = user.address;
        const birthdate = user.birthdate;
        const pnum = user.pnum;
        const age = today.getFullYear() - user.birthdate.substring(0, 4) + 1;
        const rname = user.rname;
        const rlocate = user.rlocate;
        const rpnum = user.rpnum;
        connection.query(
          "UPDATE submitter SET password = ?, name = ?, gender = ?, address = ?, birthdate = ?, pnum = ?, age = ?, rname = ?, rlocate = ?, rpnum = ? WHERE id = ?",
          [
            password,
            name,
            gender,
            address,
            birthdate,
            pnum,
            age,
            rname,
            rlocate,
            rpnum,
            id,
          ],
          function (error, rows) {
            if (error) {
              reject(error);
            }
            resolve("Update a user successfully");
          }
        );
      } else if (role === "보건소") {
        const name = user.name;
        const gender = user.gender;
        const address = user.address;
        const birthdate = user.birthdate;
        const pnum = user.pnum;
        const age = today.getFullYear() - user.birthdate.substring(0, 4) + 1;
        connection.query(
          "UPDATE submitter SET password = ?, name = ?, gender = ?, address = ?, birthdate = ?, pnum = ?, age = ? WHERE id = ?",
          [password, name, gender, address, birthdate, pnum, age, id],
          function (error, rows) {
            if (error) {
              reject(error);
            }
            resolve("Update a user successfully");
          }
        );
      } else if (role === "평가자") {
        const name = user.name;
        const gender = user.gender;
        const address = user.address;
        const birthdate = user.birthdate;
        const pnum = user.pnum;
        const age = today.getFullYear() - user.birthdate.substring(0, 4) + 1;
        connection.query(
          "UPDATE estimator SET password = ?, name = ?, gender = ?, address = ?, birthdate = ?, pnum = ?, age = ? WHERE id =?",
          [password, name, gender, address, birthdate, pnum, age, id],
          function (error, rows) {
            if (error) {
              reject(error);
            }
            resolve("Update a user successfully");
          }
        );
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  editUser: editUser,
};
