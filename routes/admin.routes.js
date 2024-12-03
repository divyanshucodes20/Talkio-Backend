import express from 'express';
import { allChats, allMessages, allUsers } from '../controllers/admin.controller.js';

const app=express.Router();

app.get("/");

app.post("/verify");

app.get("/logout");

app.get("/users",allUsers);
app.get("/chats",allChats);
app.get("/messages",allMessages);



export default app;