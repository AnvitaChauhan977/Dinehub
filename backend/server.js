import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {User, Food, Order} from "./models.js";

dotenv.config();
const app=express(); app.use(cors()); app.use(express.json());
const PORT=process.env.PORT||5000;

async function connectDB(){try{await mongoose.connect(process.env.MONGO_URI);console.log("MongoDB connected")}catch(e){console.error("MongoDB connection failed:",e.message)}}
connectDB();

function sign(user){return jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET||"dinehub_secret",{expiresIn:"7d"})}
function auth(req,res,next){const h=req.headers.authorization;if(!h)return res.status(401).json({message:"Login required"});try{req.user=jwt.verify(h.split(" ")[1],process.env.JWT_SECRET||"dinehub_secret");next()}catch(e){res.status(401).json({message:"Invalid token"})}}
function admin(req,res,next){if(req.user.role!=="admin")return res.status(403).json({message:"Admin access required"});next()}

app.get("/api/health",(req,res)=>res.json({message:"DineHub API is running"}));

app.post("/api/auth/register",async(req,res)=>{try{const {name,email,password}=req.body;if(!name||!email||!password)return res.status(400).json({message:"All fields are required"});if(await User.findOne({email}))return res.status(409).json({message:"Email already registered"});const hash=await bcrypt.hash(password,10);const user=await User.create({name,email,password:hash});res.status(201).json({token:sign(user),user:{id:user._id,name:user.name,email:user.email,role:user.role}})}catch(e){res.status(500).json({message:e.message})}});

app.post("/api/auth/login",async(req,res)=>{try{const {email,password}=req.body;const user=await User.findOne({email});if(!user||!(await bcrypt.compare(password,user.password)))return res.status(401).json({message:"Invalid email or password"});res.json({token:sign(user),user:{id:user._id,name:user.name,email:user.email,role:user.role}})}catch(e){res.status(500).json({message:e.message})}});

app.get("/api/foods",async(req,res)=>res.json(await Food.find().sort({createdAt:-1})));
app.post("/api/foods",auth,admin,async(req,res)=>res.status(201).json(await Food.create(req.body)));
app.delete("/api/foods/:id",auth,admin,async(req,res)=>{await Food.findByIdAndDelete(req.params.id);res.json({message:"Food deleted"})});

app.post("/api/orders",auth,async(req,res)=>{const order=await Order.create({user:req.user.id,items:req.body.items,total:req.body.total});res.status(201).json(order)});
app.get("/api/orders",auth,async(req,res)=>res.json(await Order.find({user:req.user.id}).sort({createdAt:-1})));

app.get("/api/admin/stats",auth,admin,async(req,res)=>res.json({foods:await Food.countDocuments(),orders:await Order.countDocuments(),users:await User.countDocuments()}));
app.get("/api/admin/orders",auth,admin,async(req,res)=>res.json(await Order.find().populate("user","name email").sort({createdAt:-1})));
app.get("/api/admin/users",auth,admin,async(req,res)=>res.json(await User.find().select("-password").sort({createdAt:-1})));

app.listen(PORT,()=>console.log(`DineHub backend running on http://localhost:${PORT}`));
