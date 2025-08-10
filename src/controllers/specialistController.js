import { Schema } from "mongoose";
import Specialist from "../models/specialistModel.js";
import { User } from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const addSpecialistData = asyncHandler(async (req, res) => {
  console.log("Entered add specialist data fn");

  const { name, honors, awards, works, education, experience } = req.body;

  console.log(name, honors, awards, works, education, experience);

  if (!name || !honors || !awards || !works || !education || !experience) {
    return res
      .status(400)
      .json({ status: "failed", message: "All fields are required" });
  }

  let imageLocalPath = req.file?.path;

  console.log(imageLocalPath);

  const image = await uploadOnCloudinary(imageLocalPath, "specialists");
  console.log(image);

  if (!image) {
    console.log(400, "Error occured while uploading image");
    throw new ApiError(400, "Something went wrong while uploading image");
  }

  const specialist = await Specialist.create({
    specialist: req.user._id,
    name,
    honors,
    awards,
    works,
    education,
    experience,
    image: image.url,
  });

  if (!specialist) {
    throw new ApiError(400, "Error occured while creating specialist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, specialist, "Specialist details added suscessfully")
    );
});

const getAllSpecialists = asyncHandler(async (req, res) => {
  const specialists = await Specialist.find({});

  if (!specialists) {
    throw new ApiError(400, "No specialists found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, specialists, "Specialist fetched suscessfully"));
});

const getSpecialistById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log("id", id);

  if (!id) {
    throw new ApiError(400, "Id is required");
  }

  const specialist = await Specialist.findOne({ _id: id });

  if (!specialist) {
    throw new ApiError(400, "No such specialist found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, specialist, "Specialist fetched suscessfully"));
});

const updateSpecialistData = asyncHandler(async (req, res) => {
  const id = req.user._id;
  if (!id) {
    throw new ApiError(400, "Id is required");
  }

  const { name, honors, awards, works, education, experience } = req.body;

  if (!(name && honors && awards && works && education && experience)) {
    throw new ApiError(400, "All the fields are required");
  }

  await User.findByIdAndUpdate(id, { name });
  const newImageLocalPath = req.file?.path;

  if (newImageLocalPath) {
    let newImage = await uploadOnCloudinary(newImageLocalPath, "rooms");
    if (!newImage) {
      throw new ApiError(
        400,
        "Something went wrong while uploading in cloudinary"
      );
    }

    const oldImageUrl = await Specialist.findOne({ specialist: id });

    await deleteFromCloudinary(oldImageUrl.image, "rooms", "image");

    oldImageUrl.image = newImage.url;
    await oldImageUrl.save({ validateBeforeSave: false });
  }

  const existedSpecialist = await Specialist.findOne({specialist: id});
  console.log(existedSpecialist)

  const specialist = await Specialist.findOneAndUpdate(
    { specialist: id },
    {
      name,
      honors,
      awards,
      works,
      education,
      experience,
      status:
        existedSpecialist.status == "rejected"
          ? "pending"
          : existedSpecialist.status,
    }
  );

  if (!specialist) {
    throw new ApiError(400, "No specialist found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, specialist, "Specialist updated suscessfully"));
});

// Delete Specialist
const deleteSpecialist = async (req, res) => {
  const { id } = req.params;

  try {
    const specialist = await SpecialistModel.findByIdAndDelete(id);
    if (!specialist) {
      return res
        .status(404)
        .json({ status: "failed", message: "Specialist not found" });
    }

    res
      .status(200)
      .json({ status: "success", message: "Specialist deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Error deleting specialist" });
  }
};

const getSpecialistDataFromDashboard = asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log("id", id);

  if (!id) {
    throw new ApiError(400, "Id is required");
  }

  const specialist = await Specialist.findOne({ specialist: id });

  if (!specialist) {
    throw new ApiError(400, "No such specialist found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, specialist, "Specialist fetched suscessfully"));
});

const getSpecialistAvailabilityStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log("Specialist Id", id);

  if (!id) {
    throw new ApiError(400, "Id is required");
  }
  const specialist = await Specialist.findOne({ specialist: id }).select(
    "name availability"
  );

  if (!specialist) {
    throw new ApiError(400, "No specialist found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, specialist, "Suscessfully fetched"));
});

const updateSpecialistAvailabilityStatus = asyncHandler(async (req, res) => {
  const data = req.body;
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "id is required");
  }
  const specialist = await Specialist.updateOne(
    { specialist: id },
    { availability: data }
  );

  if (specialist.matchedCount == 0) {
    throw new ApiError(400, "Something went wrong while updating");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, specialist, "Updated suscessfully"));
});

const getSpecialistDataFromUserId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log("ENtered here 77");

  const speciailst = await Specialist.findOne({ specialist: id });

  return res
    .status(200)
    .json(new ApiResponse(200, speciailst, "the specialist found"));
});

export {
  addSpecialistData,
  getAllSpecialists,
  updateSpecialistData,
  getSpecialistById,
  getSpecialistDataFromDashboard,
  getSpecialistAvailabilityStatus,
  updateSpecialistAvailabilityStatus,
  getSpecialistDataFromUserId,
};
