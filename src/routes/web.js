import express from "express";
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
  router.post("/logout", loginController.postLogOut);

  return app.use("/", router);
};
module.exports = initWebRoutes;
