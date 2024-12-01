import { compare } from "bcrypt";
import {User} from "../models/user.model.js"
import {sendToken} from "../utils/features.js"
import { TryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/utility.js";

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

const getMyProfile=async(req,res)=>{

}

export {getMyProfile,login,newUser}