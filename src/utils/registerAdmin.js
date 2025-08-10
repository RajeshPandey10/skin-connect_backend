import { User } from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config();

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

console.log(adminEmail);


async function insertAdmin() {
  const adminExists = await User.findOne({ email: adminEmail });

  if (adminExists) {
    return console.log("Admin already exist.");
  }

  await User.create({
    email: adminEmail,
    password: adminPassword,
    name:"admin",
    userType:"admin"
  });

  console.log("Admin created successfully.");
}

export { insertAdmin };
