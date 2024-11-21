import express from 'express'
const authRouter = express.Router();
import { registerUser,verifyOTP,resendOtp,login,logout,refreshToken } from '../controllers/authController';

authRouter.post("/register",registerUser)
authRouter.post("/submitOTP",verifyOTP)
authRouter.post("/resendOtp",resendOtp)
authRouter.post("/login",login)

authRouter.post("/logout",logout)
authRouter.get("/refresh-token",refreshToken)

export default authRouter

