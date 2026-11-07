import mongoose from "mongoose";
import { envConfig } from "../config";
const {database} = envConfig

export const dbConnection = async ()=>{
    await mongoose.connect(database.MONGO_URI);
    console.log("Database connection established");
}