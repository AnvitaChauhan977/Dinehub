import mongoose from "mongoose";
const userSchema=new mongoose.Schema({name:{type:String,required:true},email:{type:String,required:true,unique:true},password:{type:String,required:true},role:{type:String,enum:["customer","admin"],default:"customer"}},{timestamps:true});
const foodSchema=new mongoose.Schema({name:{type:String,required:true},price:{type:Number,required:true},category:{type:String,required:true},emoji:{type:String,default:"🍽️"},description:String},{timestamps:true});
const orderSchema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},items:Array,total:Number,status:{type:String,default:"Placed"}},{timestamps:true});
export const User=mongoose.model("User",userSchema);
export const Food=mongoose.model("Food",foodSchema);
export const Order=mongoose.model("Order",orderSchema);
