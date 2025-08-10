import { Otp } from "../models/otpModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import otpGenerator from "otp-generator";
import sendEmail from "../utils/sendEmail.js";

const generateOtp = asyncHandler(async (req, res) => {
  const { userEmail } = req.params;

  const emailExisted = await Otp.findOne({ email: userEmail });

  if (emailExisted) {
    await Otp.deleteOne({ email: userEmail });
  }

  const otpDigits = otpGenerator.generate(4, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
    digits: true,
  });

  await sendEmail({
    email: userEmail,
    subject: "SkinConnect, Otp ",
    message: `Your otp is ${otpDigits}. It expires in 5 minutes. Donot share it.`,
  });

  const otp = await Otp.create({ email: userEmail, otp: otpDigits });

  if (!otp) {
    throw new ApiError(400, "Error ocuured in otp database");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, otp, "Otp send suscessfully "));
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { userEmail, otp } = req.body;

  if (!(userEmail && otp)) {
    throw new ApiError(400, "Missing userEmail or Otp");
  }

  const verifyOtp = await Otp.find({ email: userEmail, otp });

  console.log(verifyOtp);
  

  if (!verifyOtp.length) {
    throw new ApiError(400, "No otp found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, verifyOtp, "Otp verified suscessfullly"));
});

export { generateOtp, verifyOtp };
