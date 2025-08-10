import { Router } from "express";
import {
  getAllFeedback,
  getFeedbackOfUser,
  registerFeedback,
} from "../controllers/feedbackControllers.js";
import { verifyJwtToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/").get(getAllFeedback);
router.route("/registerFeedback/:slug").post(verifyJwtToken, registerFeedback);
router.route("/getFeedback/:id").get(getFeedbackOfUser);

export default router;
