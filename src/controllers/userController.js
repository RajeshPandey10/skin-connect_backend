import { User } from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Generate token
const generateToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const token = await user.generateToken();
    user.token = token;

    await user.save({ validateBeforeSave: false });
    return token;
  } catch (error) {
    throw new ApiError(400, "Something went wrong while generating token.");
  }
};

// Register User
const registerUser = asyncHandler(async (req, res) => {
  // Register User
  const { name, password, email, userType } = req.body;

  if (!name || !password || !email || !userType) {
    throw new ApiError(400, "All the fields are required");
  }

  let user = await User.findOne({ email });

  if (user) {
    throw new ApiError(400, "User already exists.");
  }

  user = await User.create({
    name,
    email,
    password,
    userType,
  });

  if (!user) {
    throw new ApiError(400, "Error occured while registering user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Suscessfully register user"));
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  // Login user

  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "All the fields are required");
  }

  let user = await User.findOne({ email });

  console.log(password);

  const passwordCorrect = await user.checkPassword(password);

  if (!passwordCorrect) {
    throw new ApiError(400, "Invalid password");
  }

  const token = await generateToken(user._id);

  const loggedUser = await User.findOne({ email }).select("-password");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("token", token)
    .json(new ApiResponse(200, loggedUser, "User logged in suscessfully"));
});

// Get user data
const getUserData = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Fetched user data suscessfully"));
});

// Check User Db
const checkUserInDb = asyncHandler(async (req, res) => {
  const { userEmail } = req.params;

  if (!userEmail) {
    throw new ApiError(400, "User email is required");
  }

  const user = await User.findOne({ email: userEmail });

  return res.status(200).json(new ApiResponse(200, user, "User data fetched"));
});

// Reset User Password
const resetPassword = asyncHandler(async (req, res) => {
  // Reset the password
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    throw new ApiError(400, "All the fields are required");
  }

  let user = await User.findOne({ email });

  user.password = newPassword;

  await user.save();

  user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "Something went wrong while resetting");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User password reset suscessfully."));
});

const updateProfileDetails = asyncHandler(async (req, res) => {
  // Update the profile details

  const { name, password } = req.body;

  if (!name) {
    throw new ApiError(400, "All the details are required");
  }

  const user = await User.findByIdAndUpdate(req.user._id, {
    name,
  }).select("-password");

  if (!user) {
    throw new ApiError(400, "Something went wrong while registering");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Updated Suscessfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  console.log("Entered the logout ");

  const {_id} = req.user;
  await User.findByIdAndUpdate(
    _id,
    {
      $unset: {
        token: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("token", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

export {
  registerUser,
  loginUser,
  checkUserInDb,
  getUserData,
  resetPassword,
  updateProfileDetails,
  logoutUser
};
