import express from 'express'
const workspaceRouter = express.Router();
import {createSpace,fetchWorkspace,getAllSpaces} from "../controllers/spaceController"

workspaceRouter.post('/createSpace',createSpace)
workspaceRouter.get('/allWorkspace',getAllSpaces)
workspaceRouter.get('/workspace',fetchWorkspace)

export default workspaceRouter;