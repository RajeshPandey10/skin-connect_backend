import { Router } from "express";
import { verifyJwtToken } from "../middlewares/authmiddleware.js";
import { upload } from "../middlewares/multerMiddlewares.js";
import {
  addSpecialistData,
  getAllSpecialists,
  getSpecialistAvailabilityStatus,
  getSpecialistById,
  getSpecialistDataFromDashboard,
  getSpecialistDataFromUserId,
  updateSpecialistAvailabilityStatus,
  updateSpecialistData,
} from "../controllers/specialistController.js";

const router = Router();

router
  .route("/")
  .get(getAllSpecialists)
  .put(verifyJwtToken, upload.single("image"), updateSpecialistData);
router
  .route("/register")
  .post(verifyJwtToken, upload.single("image"), addSpecialistData);
router
  .route("/getSpecialistDataFromDashboard/:id")
  .get(getSpecialistDataFromDashboard);

router.route("/:id").get(getSpecialistById);
router
  .route("/getSpecialistAvailabilityStatus/:id")
  .get(getSpecialistAvailabilityStatus);
router
  .route("/updateSpecialistAvailabilityStatus/:id")
  .put(updateSpecialistAvailabilityStatus);
router
  .route("/getSpecialistDataFromUserId/:id")
  .get(getSpecialistDataFromUserId);

export default router;
