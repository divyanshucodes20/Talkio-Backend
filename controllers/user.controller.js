import { compare } from "bcrypt";
import {User} from "../models/user.model.js"
import {cookieOptions, emitEvent, sendToken} from "../utils/features.js"
import { TryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/utility.js";
import {Chat} from "../models/chat.model.js"
import {Request} from "../models/request.model.js"
import {NEW_REQUEST, REFETCH_CHATS} from "../constants/events.js"

const newUser=TryCatch(async(req,res)=>{

    const {name,username,password,bio}=req.body;
    
    if(!name || !username || !password || !bio){
        return res.status(400).json({message:"Please fill all fields"})
    }    
    
    const user=await User.create({
     name,
     username,
     password,
     bio
    });
    sendToken(res,user,201,"User created")
    })


const login=TryCatch(async(req,res,next)=>{
    const {username,password}=req.body;
    const user=await User.findOne({username}).select("+password")
    if(!user){
        return next(new ErrorHandler("Invalid Username or Password",404))
    }
    const isMatch=await compare(password,user.password);
    if(!isMatch){
        return next(new ErrorHandler("Invalid Password",400))
    }
    sendToken(res,user,200,`Welcome back ${user.name}`)
})

const getMyProfile=TryCatch(
    async(req,res)=>{
        const user=await User.findById(req.user);
        res.status(200).json({
            success:true,
            user
        });
        
        }
)
const logout=TryCatch(
    async(req,res)=>{
        return res.status(200).cookie("talkio-token","",{...cookieOptions,maxAge:0}).json({
            success:true,
            message:"Log out Successfully"
        })
    }
)
const searchUser=TryCatch(
    async(req,res)=>{
        const {name=""}=req.query;
        const myChats=await Chat.find({groupChat:false,members:req.user});

        const allUsersFromMyChats=myChats.flatMap((chat)=>chat.members)
        const allUsersExceptMeAndFreinds=await User.find({
            _id:{$nin:allUsersFromMyChats},
            name:{$regex:name,$options:"i"},
        })
        const users=allUsersExceptMeAndFreinds.map(({_id,name,avatar})=>({
            _id,
            name,
            avatar:avatar.url,
        }))
        return res.status(200).json({
            success:true,
            users,
        })
    }
)

const sendRequest=TryCatch(
    async(req,res,next)=>{
      const {userId}=req.body;

      const request=await Request.findOne({
        $or:[
            {sender:req.user,receiver:userId},
            {sender:userId,receiver:req.user},
        ]
      });

      if(request){
        return next(new ErrorHandler("Request Already Sent",400));
      }
      await Request.create({
        sender:req.user,
        receiver:userId,
      })
      emitEvent(req,NEW_REQUEST,[userId]) 

      return res.status(200).json({
        success:true,
        message:"Freind Request Sent Successfully"
      })
    }
)

const acceptRequest=TryCatch(
    async(req,res,next)=>{
        const {requestId,accept}=req.body;
        const request=await Request.findById(requestId)
        .populate("sender","name")
        .populate("receiver","name")

         if(!request){
            return next(new ErrorHandler("Request Not Found",404));
         }
        if(request.receiver.toString()!==req.user.toString()){
           return next(new ErrorHandler("Unauthorized to accept this request",401)); 
        }
       if(!accept){
        await request.deleteOne();
        return res.status(200).json({
            success:true,
            messsage:"Friend Request Rejected"
        })
       }
       const members=[request.sender._id,req.receiver._id];
       await Promise.all([
        Chat.create({
            members,
            name:`${request.sender.name}-${request.receiver.name}`,
        }),
        request.deleteOne()
       ]),
       emitEvent(req,REFETCH_CHATS,members);
       return res.status(200).json({
        success:true,
        message:"Friend Request Accepted",
        senderId:request.sender._id,
       })
    }
)
const getMyNotifications=TryCatch(
    async(req,res,next)=>{
      const requests=await Request.find({
        receiver:req.user
      }).populate(
        "sender",
        "name avatar"
      );
      const allRequests=requests.map(({_id,sender})=>({
        _id,
        sender:{
            _id:sender._id,
            name:sender.name,
            avatar:sender.avatar.url
        }
      }))
      return res.status(200).json({
        success:true,
        allRequests
      })
    }
)


export {getMyProfile,login,newUser,logout,searchUser,sendRequest,acceptRequest,getMyNotifications}