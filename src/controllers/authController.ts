import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user";
import OtpModel from "../models/otp";
import { sendOTPmail } from "../services/sendEmail";
import {  generateAccessToken, generateRefreshToken } from "../services/token";
import jwt,{ JwtPayload }  from "jsonwebtoken";

// user registration
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // Expires in 10 minutes

    const newOtp = new OtpModel({
      name: name,
      email: email,
      otp,
      otpGeneratedAt: new Date(),
      expiresAt,
    });

    await newOtp.save();

    await sendOTPmail(email, otp);

    res.status(200).json({
      message: "OTP sented successfully",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
      },
    });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// verify otp
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ message: "Email and OTP are required" });
      return;
    }

    const otpEntry = await OtpModel.findOne({ email });
    console.log(otpEntry);

    if (!otpEntry) {
      res.status(400).json({ message: "No OTP found for the provided email" });
      return;
    }

    if (otpEntry.otp !== parseInt(otp)) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    const currentTime = new Date();
    if (currentTime > otpEntry.expiresAt) {
      res.status(400).json({ message: "OTP has expired" });
      return;
    }
    await OtpModel.deleteOne({ email });
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Resend otp
export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const existingOtp = await OtpModel.findOne({ email });
    if (existingOtp) {
      // Check if OTP has expired
      const currentTime = new Date();
      if (currentTime < existingOtp.expiresAt) {
        await sendOTPmail(email, existingOtp.otp);
        res.status(200).json({ message: "OTP resent successfully" });
        return;
      } else {
        // OTP has expired, generate a new OTP
        const newOtp = Math.floor(100000 + Math.random() * 900000);
        const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // Set expiry to 10 minutes

        // Update the OTP in the database
        existingOtp.otp = newOtp;
        existingOtp.otpGeneratedAt = new Date();
        existingOtp.expiresAt = expiresAt;
        await existingOtp.save();

        // Send the new OTP
        await sendOTPmail(email, newOtp);
        res
          .status(200)
          .json({ message: "New OTP generated and sent successfully" });
        return;
      }
    } else {
      // No existing OTP record found, generate a new one
      const newOtp = Math.floor(100000 + Math.random() * 900000);
      const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // Set expiry to 10 minutes

      // Save the OTP in the database
      const otpRecord = new OtpModel({
        email,
        otp: newOtp,
        otpGeneratedAt: new Date(),
        expiresAt,
      });
      await otpRecord.save();

      // Send the OTP
      await sendOTPmail(email, newOtp);
      res.status(200).json({ message: "OTP generated and sent successfully" });
      return;
    }
  } catch (error) {
    console.error("Error during resend otp:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

//login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    let { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge:  7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

//logout
export const logout  = async (req: Request, res: Response): Promise<void> => {
    try {
        
        res.clearCookie("refreshToken", {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict', 
            path: '/' 
          });

          res.status(200)
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
}

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
       res.status(401).json({ message: 'Refresh token missing' });
    }

    // Verify the refresh token
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET!) as JwtPayload;

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { id: payload.id, email: payload.email },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' } 
    );

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

