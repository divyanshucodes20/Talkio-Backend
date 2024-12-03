import express from "express"
import { acceptRequest,getMyFreinds,getMyNotifications, getMyProfile, login, logout, newUser, searchUser, sendRequest } from "../controllers/user.controller.js";
import {singleAvatar } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { acceptRequestValidator, loginValidator, registerValidator, sendRequestValidator, validateHandler } from "../lib/validators.js";

const app=express.Router();


app.post("/new",singleAvatar,registerValidator(),validateHandler,newUser)
app.post("/login",loginValidator(),validateHandler,login)

app.use(isAuthenticated)
app.get("/me",getMyProfile)
app.get("/logout",logout)
app.get("/search",searchUser)
app.put("/sendrequest",sendRequestValidator(),validateHandler,sendRequest)
app.put("/acceptrequest",acceptRequestValidator(),validateHandler,acceptRequest)
app.get("/notifications",getMyNotifications);
app.get("/friends",getMyFreinds);


export default app;