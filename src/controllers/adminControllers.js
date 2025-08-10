import { createCanvas } from "canvas";
import { Appointment } from "../models/appointmentModel.js";
import Specialist from "../models/specialistModel.js";
import { User } from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import axios from "axios";
import fs from "fs";
import sendEmail from "../utils/sendEmail.js";

const getDashboardData = asyncHandler(async (req, res) => {
  // Get the total user
  const users = await User.find({}).countDocuments();
  const appointments = await Appointment.find({}).countDocuments();
  const activeSpecialists = await Specialist.find({}).countDocuments();
  const specialists = await User.find({
    userType: "specialist",
  }).countDocuments();
  const patients = await User.find({ userType: "patient" }).countDocuments();

  const count = {
    users,
    appointments,
    activeSpecialists,
    specialists,
    patients,
  };

  const graphData = await User.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalUsers: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { count, graphData }, "Users counted suscessfully")
    );
});

const getAllAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({})
    .populate("specialist", "name")
    .populate("patient", "name");

  const appoitmentGraph = await Appointment.aggregate([
    {
      $group: {
        _id: "$month",
        totalAppointments: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { appointments, appoitmentGraph },
        "Appointmets fetched suscessfully"
      )
    );
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ userType: "patient" });

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Fetched all the patients"));
});

const acceptSpecialist = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Id is required");
  }

  const specialist = await Specialist.findByIdAndUpdate(id, {
    status: "verified",
  });

  if (!specialist) {
    throw new ApiError(400, "No specialist found");
  }

  const user = await User.findById(specialist.specialist);
  if (!user) {
    throw new ApiError(400, "No user found");
  }

  sendEmail({
    email: user.email,
    subject: `Regarding Application to become specialist`,
    message: `Dear ${user.name}, Your application has been accepteed by admin. [ Skin Connect ]`,
  });

  return res
    .status(200)
    .json(200, specialist, "Specialist accepted suscessfully");
});

const rejectSpecialist = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Id is required");
  }

  const specialist = await Specialist.findByIdAndUpdate(id, {
    status: "rejected",
  });

  if (!specialist) {
    throw new ApiError(400, "No specialist found");
  }
  const user = await User.findById(specialist.specialist);
  if (!user) {
    throw new ApiError(400, "No user found");
  }

  sendEmail({
    email: user.email,
    subject: `Regarding application to become specialist`,
    message: `Dear ${user.name}, Your application has been rejected by admin. [ Skin Connect ]`,
  });

  return res
    .status(200)
    .json(200, specialist, "Specialist rejected suscessfully");
});
const deleteSpecialist = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Id is required");
  }

  const specialist = await Specialist.findByIdAndDelete(id);

  if (!specialist) {
    throw new ApiError(400, "No specialist found");
  }

  return res
    .status(200)
    .json(200, specialist, "Specialist deleted suscessfully");
});

const getAllSpecialist = asyncHandler(async (req, res) => {
  const specialist = await Specialist.find({}).populate("specialist");
  if (!specialist) {
    throw new ApiError(400, "Something went wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, specialist, "All the specialist Fetched"));
});

const analyzeDisease = asyncHandler(async (req, res) => {
  const { answers } = req.body;

  const image = req.file;

  if (!answers && !image) {
    throw new ApiError(400, "All the fields are required");
  }
  try {
    const formData = new FormData();

    formData.append("image", fs.createReadStream(image.path));

    Object.keys(answers).forEach((key) => {
      formData.append(key, answers[key]);
    });

    const apiResponse = await axios.post(
      process.env.AI_LAB_TOOLS_SECRET_KEY,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!apiResponse) {
      throw new ApiError(400, "Something went wrong while using api of AI");
    }

    const analysisResult = apiResponse.data;

    const resultText = `
  Diagnosis: ${analysisResult.diagnosis},
  Treatment: ${analysisResult.treatment}
  Recommended: ${analysisResult.specialist}
  `;

    // Creating canvas

    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#fdf4ef";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    (ctx.fillStyle = "#333"), (ctx.font = "20px Arial");

    ctx.fillText(resultText, 20, 40);

    const buffer = canvas.toBuffer("image/png");
    return res.status(200).set("Content-Type", "image/png").send(buffer);
  } catch (error) {
    console.log(error);
  } finally {
    fs.unlinkSync(image.path);
  }
});

export {
  getDashboardData,
  getAllAppointments,
  getAllUsers,
  getAllSpecialist,
  analyzeDisease,
  acceptSpecialist,
  rejectSpecialist,
  deleteSpecialist,
};
