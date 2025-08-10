import { Feedback } from "../models/feedbackModel.js";
import { User } from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const registerFeedback = asyncHandler(async (req, res) => {
  console.log("entered here");
  
  const { _id } = req.user;
  const { slug } = req.params;
  
  if (!_id) {
    throw new ApiError("User Unauthorized");
  }
  
  const { message, rating } = req.body;
  console.log("message entered upto here");

  console.log("slug", slug);

  const userExist = await User.findById(_id);

  const feedBack = await Feedback.create({
    message,
    name: userExist.name,
    rating,
    user: _id,
    specialist: slug,
  });

  if (!feedBack) {
    throw new ApiError(400, "Error occured while regestering feedback");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, feedBack, "Feedback registered suscessfully"));
});

const getAllFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find({});

  if (!feedback) {
    throw new ApiError(400, "No feedback found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, feedback, "Feedback received suscessfully"));
});

const getFeedbackOfUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    throw new ApiError(400, "Id not found");
  }
  console.log("Entered here2",id);

  const feedback = await Feedback.find({ specialist: id });

  console.log("Feedback",feedback);
  

  if (!feedback) {
    throw new ApiError(400, "No feedback found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, feedback, "Feedback fetched suscessfully"));
});

export { registerFeedback, getAllFeedback, getFeedbackOfUser };
