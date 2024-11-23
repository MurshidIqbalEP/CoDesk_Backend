import express from 'express'
const workspaceRouter = express.Router();
import {createSpace,fetchWorkspace,getAllSpaces,invite,acceptInvite} from "../controllers/spaceController"

workspaceRouter.post('/createSpace',createSpace)
workspaceRouter.get('/allWorkspace',getAllSpaces)
workspaceRouter.get('/workspace',fetchWorkspace)
workspaceRouter.post('/invite',invite)
workspaceRouter.post('/acceptInvite',acceptInvite)

export default workspaceRouter;