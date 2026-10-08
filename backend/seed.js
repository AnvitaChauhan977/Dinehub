import dotenv from "dotenv";import mongoose from "mongoose";import bcrypt from "bcryptjs";import {User,Food} from "./models.js";
dotenv.config();await mongoose.connect(process.env.MONGO_URI);
await Food.deleteMany({});
await Food.insertMany([
{name:"Margherita Pizza",category:"Pizza",price:249,emoji:"🍕",description:"Classic tomato, mozzarella and herbs."},
{name:"Veg Burger",category:"Burger",price:149,emoji:"🍔",description:"Crispy veggie patty with fresh vegetables."},
{name:"Pasta Alfredo",category:"Pasta",price:219,emoji:"🍝",description:"Creamy pasta with herbs and parmesan."},
{name:"Paneer Tikka",category:"Indian",price:229,emoji:"🥘",description:"Tandoori paneer with aromatic spices."},
{name:"French Fries",category:"Sides",price:99,emoji:"🍟",description:"Crispy golden fries."},
{name:"Chocolate Cake",category:"Dessert",price:129,emoji:"🍰",description:"Rich chocolate cake slice."}
]);
const email="admin@dinehub.com";if(!await User.findOne({email}))await User.create({name:"DineHub Admin",email,password:await bcrypt.hash("admin123",10),role:"admin"});
console.log("Seed complete. Admin: admin@dinehub.com / admin123");await mongoose.disconnect();
