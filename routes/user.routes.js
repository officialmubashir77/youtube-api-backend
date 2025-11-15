import express from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.config.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

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


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        channelName: user.channelName,
        email: user.email,
        phone: user.phone,
        logoId: user.logoId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        channelName: user.channelName,
        email: user.email,
        phone: user.phone,
        logoId: user.logoId,
        logoUrl: user.logoUrl,
        subscribers: user.subscribers,
        subscribedChannels: user.subscribedChannels,
      },
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});


export default router;