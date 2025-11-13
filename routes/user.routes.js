import express from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.config.js';
import User from '../models/user.model.js';
const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { channelName, email, phone, password } = req.body;

    if (!channelName || !email || !phone || !password || !req.files?.logoUrl) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload logo to Cloudinary
    const uploadImage = await cloudinary.uploader.upload(req.files.logoUrl.tempFilePath);
    console.log("Uploaded image: 👉 ", uploadImage);

    // Create new user
    const user = await User.create({
      _id: new mongoose.Types.ObjectId(),
      channelName,
      email,
      phone,
      password: hashedPassword,
      logoUrl: uploadImage.secure_url,
      logoId: uploadImage.public_id,
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
});

router.post("/login", (req, res) => {
  res.send("Login route working fine");
});

export default router;