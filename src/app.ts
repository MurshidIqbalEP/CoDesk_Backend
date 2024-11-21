
import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import authRoute from "./routes/authRoute"
import spaceRoute from "./routes/spaceRoute"
import morgan from 'morgan';
import cors from 'cors';
import dotenv, { config } from "dotenv";
import {connectDB} from "./config/db"
dotenv.config();



const app: Application = express();


connectDB(); 

// Middleware
app.use(bodyParser.json());
app.use(morgan("dev"));

const corsOptions = {
    origin: process.env.CORS_URL,
    methods: "GET,POST,PUT,PATCH,DELETE",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  };
  
  app.use(cors(corsOptions));

// Routes
app.use('/api/auth', authRoute);
app.use('/api/space', spaceRoute);




export default app;
