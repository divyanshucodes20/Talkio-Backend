import mongoose, { Schema, model } from "mongoose"

const requestSchema=new Schema({
status:{
    type:String,
    default:"pending",
    enum:["pending","accepted","rejected"]
},
sender:{
    type:Types.ObjectId,
    ref:"User",
    required:True,
},
receiver:{
    type:Types.ObjectId,
    ref:"User",
    required:True,
},
},{timestamps:true});


export const Request=mongoose.models.Request|| model("Request",requestSchema);