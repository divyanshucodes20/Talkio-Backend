import {TryCatch} from "../middlewares/error.js"
import { ErrorHandler } from "../utils/utility.js";
import {Chat} from "../models/chat.model.js"
import { emitEvent } from "../utils/features.js";
import {ALERT, REFETCH_CHATS} from "../constants/events.js"
import { getOtherMemberOfChat } from "../lib/helper.js";

const newGroupChat=TryCatch(
    async(req,res,next)=>{
      const {name,members}=req.body;
      if(!name){
        return next(new ErrorHandler("Name is required",400))
      }
      if(members.length<2){
        return next(new ErrorHandler("Group chat must have at least 2 members",400))
      }
      const allMembers=[...members,req.user]//all members including the user
      const chat=await Chat.create({
        name,
        groupChat:true,
        creator:req.user,
        members:allMembers
      })
      emitEvent(req,ALERT,allMembers,`Welcome to ${name} Group `);
      emitEvent(req,REFETCH_CHATS,members);
        return res.status(201).json({
            success:true,
            message:"Group  created successfully",
        })
    }
)

const getMyChats=TryCatch(
    async(req,res,next)=>{
        const chats=Chat.find({members:req.user}).populate("members","name  avatar")
        const transformedChats=chats.map(({_id,name,members,groupChat})=>{
        const otherMemberOfChat=getOtherMemberOfChat(members,req.user._id);
            return {
                _id,
                name:groupChat?name:otherMemberOfChat.name,
                members:members.redeuce((prev,curr)=>{
                    if(curr._id.toString()!==req.user._id.toString()){
                        prev.push(curr._id)
                    }
                    return prev 
                },[]),
                groupChat,
                avatar:groupChat?members.slice(0,3).map(({avatar})=>avatar.url):[otherMemberOfChat.avatar.url],

            }
        })
        return res.status(200).json({
            success:true,
            chats:transformedChats
        })
    }
)

const getMyGroups=TryCatch(
    async(req,res,next)=>{
        const chats=Chat.find({
            members:req.user,
            groupChat:true,
            creator:req.user
        }).populate("members","name avatar");
        const groups=(await chats).map(({_id,name,groupChat,members})=>({
            _id,
            name,
            groupChat,
            avatar:members.slice(0,3).map(({avatar})=>avatar.url)
        }));
        return res.status(200).json({
            success:true,
            groups
        });
    }
)

export {newGroupChat,getMyChats,getMyGroups}