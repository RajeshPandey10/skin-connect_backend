import { Router } from "express";
import {
  checkUserInDb,
  getUserData,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  updateProfileDetails,
} from "../controllers/userController.js";
import { verifyJwtToken } from "../middlewares/authMiddleware.js";

const router = Router();

// // Public Routes
// router.post('/register', UserController.userRegistration);
// router.post('/login', UserController.userLogin);
// router.post('/sendresetpasswordemail', UserController.sendUserPasswordResetEmail);
// router.post('/reset-password/:_id/:token', UserController.userPasswordReset);

// Protected Routes
// router.use(checkUserAuth); // Protect all routes below
// router.post('/changepassword', UserController.changeUserPassword);

// Routes for user configuration

router.route("/registerUser").post(registerUser);
router.route("/checkUserInDb/:userEmail").get(checkUserInDb);
router.route("/loginUser").put(loginUser);
router.route("/resetPassword").put(resetPassword);
router.route("/updateUserData").put(verifyJwtToken, updateProfileDetails);
router.route("/getUserData").get(verifyJwtToken, getUserData);
router.route("/logout").get(verifyJwtToken, logoutUser);

export default router;
