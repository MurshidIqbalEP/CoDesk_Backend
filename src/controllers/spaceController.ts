import { Request, Response } from "express";
import Workspace from "../models/space";
import mongoose from 'mongoose';
import user from "../models/user";
import { generateInvitationToken, verifyInviteToken } from "../services/token";
import { sendInvitationEmail } from "../services/sendEmail";


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

export const getAllSpaces = async (req: Request, res: Response): Promise<void> => {
    try {
        const userid = req.query.userid;

    const workspaces = await Workspace.find({
      members: userid,
    }).sort({ createdAt: -1 });
     
        res.status(200).json({workspaces});
    } catch (error) {
        console.error("Error during user registration:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
}

export const fetchWorkspace = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.query.id;
        const workspace = await Workspace.findById(id);

        if (!workspace) {
          res.status(404).json({ message: "Workspace not found." });
          return;
        }
    
        // Fetch members and admins manually
        const memberDetails = await user.find({ _id: { $in: workspace.members } }, "name email");
        const adminDetails = await user.find({ _id: { $in: workspace.admins } }, "name email");
    
        // Combine the workspace data with member and admin details
        const result = {
          ...workspace.toObject(),
          members: memberDetails,
          admins: adminDetails,
        };

        console.log(result);
        
    
        res.status(200).json({ workspace: result });
    } catch (error) {
        console.error("Error during user registration:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
}

export const invite = async (req: Request, res: Response): Promise<void> => {
    try {
        const {workspaceId,email} = req.body
        
        const token = generateInvitationToken({workspaceId,email})
        await sendInvitationEmail(email, token);

        res.status(200).json({ message: 'Invitation sent successfully!' });
    } catch (error) {
        console.error("Error during user registration:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
}

export const acceptInvite = async (req: Request, res: Response): Promise<void> => {
    try {
        const {token} = req.body

        if(!token){
            res.status(400).json({ message: 'Token required' });
        }

        let tokenData = await verifyInviteToken(token)
        const tokenExpiration = tokenData.exp * 1000; 
        const currentTime = Date.now();

        if (currentTime > tokenExpiration) {
             res.status(400).json({ message: "The invitation has expired." });
          }
        let User = await user.findOne({email:tokenData.email});
        const workspace = await Workspace.findById(tokenData.workspaceId);
        const userAlreadyMember = workspace?.members.some(member => member === User?._id.toString() as string);
        
        if(userAlreadyMember){
            res.status(400).json({ message: "you are already a member" });
        }else{
            workspace?.members.push(User?._id.toString() as string);  
            await workspace?.save();
            res.status(200).json({ message: "You have successfully joined the workspace.", workspaceId:tokenData.workspaceId  });
        }
       
    } catch (error) {
        console.error("Error during user registration:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
}