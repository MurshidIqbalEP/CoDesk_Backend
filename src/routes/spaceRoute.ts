import express from 'express'
const workspaceRouter = express.Router();
import {createSpace} from "../controllers/spaceController"

workspaceRouter.post('/createSpace',createSpace)

export default workspaceRouter;