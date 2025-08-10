import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { insertAdmin } from "../utils/registerAdmin.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DATABASE_URL}/${DB_NAME}`
    );
    console.log(`MongoDb connected on: ${connectionInstance.connection.host}`);
    await insertAdmin();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB