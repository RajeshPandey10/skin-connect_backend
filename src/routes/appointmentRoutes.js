import { Router } from "express";
import { verifyJwtToken } from "../middlewares/authmiddleware.js";
import {
  acceptAppointment,
  deleteAppointment,
  getIdOfSpecialist,
  getPatientAppointment,
  getSpecialistAppointment,
  registerAppointment,
  rejectAppointment,
} from "../controllers/appointmentController.js";

const router = Router();

router.route("/").post(verifyJwtToken, registerAppointment);
router.route("/:id").delete(verifyJwtToken, deleteAppointment);
router.route("/:id").put(verifyJwtToken, acceptAppointment);
router.route("/rejectAppointment/:id").get(verifyJwtToken, rejectAppointment);
router
  .route("/getPatientAppointment/:id")
  .get(verifyJwtToken, getPatientAppointment);
router
  .route("/getSpecialistAppointment/:id")
  .get(verifyJwtToken, getSpecialistAppointment);
router.route("/getIdOfSpecialist/:id").get(verifyJwtToken,getIdOfSpecialist)

export default router;
