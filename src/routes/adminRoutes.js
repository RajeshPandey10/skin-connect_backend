import { Router } from "express";
import { verifyJwtToken } from "../middlewares/authMiddleware.js";
import {
  getAllAppointments,
  getDashboardData,
  getAllUsers,
  getAllSpecialist,
  analyzeDisease,
  acceptSpecialist,
  rejectSpecialist,
  deleteSpecialist,
} from "../controllers/adminControllers.js";
import { upload } from "../middlewares/multerMiddlewares.js";

const router = Router();

router.route("/getDashboardData").get(verifyJwtToken, getDashboardData);
router.route("/getAllAppointments").get(verifyJwtToken, getAllAppointments);
router.route("/getAllPatients").get(verifyJwtToken, getAllUsers);
router.route("/getAllSpecialist").get(verifyJwtToken, getAllSpecialist);
router.route("/acceptSpecialist/:id").put(verifyJwtToken, acceptSpecialist);
router.route("/rejectSpecialist/:id").put(verifyJwtToken, rejectSpecialist);
router.route("/deleteSpecialist/:id").delete(verifyJwtToken, deleteSpecialist);
router
  .route("/analyze")
  .post(verifyJwtToken, upload.single("image"), analyzeDisease);

export default router;
