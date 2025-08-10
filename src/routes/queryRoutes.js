import { Router } from "express";
import {
  deleteQuery,
  getAllQuery,
  registerUserQuery,
} from "../controllers/queryControllers.js";

const router = Router();

router.route("/").post(registerUserQuery).delete(deleteQuery).get(getAllQuery);

export default router;
