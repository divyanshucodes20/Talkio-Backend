import express from "express"
import { isAuthenticated } from "../middlewares/auth.js";
import { addMembers, deleteChat, getChatDetails, getMessages, getMyChats, getMyGroups, leaveGroup, newGroupChat, removeMembers, renameGroup, sendAttachments } from "../controllers/chat.controller.js";
import {attachmentsMulter} from "../middlewares/multer.js"
import {addMemberValidator, leaveGroupValidator, newGroupValidator, removeMemberValidator, sendAttachmentsValidator, validateHandler} from "../lib/validators.js"

const app=express.Router();

app.use(isAuthenticated);

app.post("/new",newGroupValidator(),validateHandler,newGroupChat)

app.get("/my",getMyChats)

app.get("/my/groups",getMyGroups);

app.put("/addmembers",addMemberValidator(),validateHandler,addMembers);

app.put("/removemembers",removeMemberValidator(),validateHandler,removeMembers);

app.delete("/leave/:id",leaveGroupValidator(),validateHandler,leaveGroup);

app.post("/message",attachmentsMulter,sendAttachmentsValidator(),validateHandler,sendAttachments);

app.get("/message/:id",getMessages);

app.route("/:id").get(getChatDetails).put(renameGroup).delete(deleteChat);

export default app