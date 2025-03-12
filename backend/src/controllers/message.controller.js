import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../utils/cloudinary.js";
import { getReceivedSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log(`Error in getUsersForSidebar controller : ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;

    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    // }).populate("senderId", "fullName profilePic");

    res.status(200).json(messages);
  } catch (error) {
    console.log(`Error in getMessages controller : ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;

    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let ImageUrl;

    if (image) {
      try {
        // upload base64 image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        console.log("Cloudinary Response:", uploadResponse);
        ImageUrl = uploadResponse.secure_url;
      } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        return res.status(500).json({ message: "Image upload failed" });
      }
    }

    const newMessage = await Message({
      senderId,
      receiverId,
      text,
      image,
    });

    await newMessage.save();

    // TODO: realtime functionality goes here => socket.io

    const receiverSocketId = getReceivedSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);

    // res.status(201).json({
    //   message: "Message sent successfully",
    //   data: newMessage,
    // });
  } catch (error) {
    console.log(`Error in sendMessage controller : ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
