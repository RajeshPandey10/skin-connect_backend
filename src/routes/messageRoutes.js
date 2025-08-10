import { Router } from "express";
import { verifyJwtToken } from "../middlewares/authmiddleware.js";
import {
  getAllMessages,
  getUniquePersons,
  registerMessage,
  registerMessageFromSocket,
  uploadChatImage,
} from "../controllers/messageControllers.js";
import { upload } from "../middlewares/multerMiddlewares.js";

const router = Router();
    
router.route("/registerMessage").post(verifyJwtToken, registerMessage);
router
  .route("/uploadChatMessage")
  .post(verifyJwtToken, upload.single("image"), uploadChatImage);
router.route("/getAllMessages").get(verifyJwtToken, getAllMessages);
router
  .route("/saveMessageFromSockets")
  .post(verifyJwtToken, registerMessageFromSocket);
router.route("/getAllUniquePersons").get(verifyJwtToken, getUniquePersons);

export default router;
