import mongoose from "mongoose";
import { Message } from "../models/messageModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerMessage = asyncHandler(async (req, res) => {
  const { receiver, message } = req.body;

  const { _id } = req.user;

  if ((!receiver, message)) {
    throw new ApiError(400, "All the fields are required");
  }

  const messageDb = await Message.create({
    receiver,
    message,
    sender: _id,
    messageId: [sender, receiver].sort().join(""),
    image: image?.url,
  });

  if (!messageDb) {
    throw new ApiError(400, "Error occured while registering message");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, messageDb, "Suscessfully registered message"));
});

const registerMessageFromSocket = async ({
  sender,
  imageUrl,
  receiver,
  message,
}) => {
  try {
    if (!sender || !receiver) {
      throw new ApiError(400, "All the fields are required");
    }

    const messageDb = await Message.create({
      sender,
      receiver,
      message,
      image: imageUrl,
      messageId: [sender, receiver].sort().join(""),
    });

    if (!messageDb) {
      throw new ApiError(400, "Error occured whlie creating");
    }
    return messageDb;
  } catch (error) {
    console.log(error);
  }
};

const getAllMessages = asyncHandler(async (req, res) => {
  const { sender, receiver } = req.query;

  if (!sender || !receiver) {
    throw new ApiError(400, "All the fields are required");
  }

  const messages = await Message.find({
    messageId: [sender, receiver].sort().join(""),
  });

  console.log(messages);

  if (!messages) {
    throw new ApiError(400, "No messages found or error occured");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, messages, "All the messages fetched suscessfully")
    );
});

const getUniquePersons = asyncHandler(async (req, res) => {
  const userId = req.user?._id; // Current logged-in user ID

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId); // Convert to ObjectId
    console.log(userObjectId);

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ receiver: userObjectId }, { sender: userObjectId }],
        },
      },
      { $sort: { createdAt: -1 } }, // Sort messages by latest first
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userObjectId] },
              then: "$receiver",
              else: "$sender",
            },
          },
          latestMessage: { $first: "$message" }, // Latest message text
          latestMessageId: { $first: "$messageId" }, // Latest message ID
          latestMessageSender: { $first: "$sender" }, // Latest message sender ID
          latestMessageReceiver: { $first: "$receiver" }, // Latest message receiver ID
          latestMessageCreatedAt: { $first: "$createdAt" }, // Latest message timestamp
        },
      },
      {
        $lookup: {
          from: "users", // Ensure this matches your actual users collection name
          localField: "_id", // The other person in the chat
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" }, // Convert array into object
      {
        $project: {
          _id: 0,
          userId: "$_id", // Other person's ID
          userName: "$userDetails.name", // Other person's name
          latestMessage: 1,
          latestMessageId: 1,
          latestMessageSender: 1,
          latestMessageReceiver: 1,
          latestMessageCreatedAt: 1,
        },
      },
      { $sort: { latestMessageCreatedAt: -1 } }, // Sort by latest message timestamp
    ]);

    console.log("conversations", conversations);

    return res
      .status(200)
      .json(new ApiResponse(200, conversations, "All unique persons fetched"));
  } catch (error) {
    console.error("Error fetching unique persons:", error);
    return res.status(500).json({ error: error.message });
  }
});

const uploadChatImage = asyncHandler(async (req, res) => {
  let imageLocalPath = req.file?.path;

  if (!imageLocalPath) {
    throw new ApiError(400, "Image not found");
  }

  console.log(imageLocalPath);

  const image = await uploadOnCloudinary(imageLocalPath, "specialists");
  console.log(image);

  if (!image) {
    console.log(400, "Error occured while uploading image");
    throw new ApiError(400, "Something went wrong while uploading image");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, image.url, "Image uploaded suscessfully"));
});

export {
  registerMessage,
  registerMessageFromSocket,
  getAllMessages,
  getUniquePersons,
  uploadChatImage,
};
