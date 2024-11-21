import { Request, Response } from "express";
import Workspace from "../models/space";

export const createSpace = async (req: Request, res: Response): Promise<void> => {
    try {
        const {name,desc,thumbnail,userid} = req.body
        const newWorkspace = new Workspace({
            name:name ,
            description: desc,
            members: [userid],
            admins: [userid],
            mapId: 'default',
            thumbnail:thumbnail
          });
        
          await newWorkspace.save();

          res.status(201).json({message:"new workspace created"})
    } catch (error) {
        console.error("Error during user registration:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
}