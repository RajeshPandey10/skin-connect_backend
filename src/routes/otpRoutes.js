import { Router } from "express";
import { generateOtp, verifyOtp } from "../controllers/optController.js";

const router = Router();

router.route("/generateOtp/:userEmail").put(generateOtp);
router.route("/verifyOtp").put(verifyOtp);

export default router;
