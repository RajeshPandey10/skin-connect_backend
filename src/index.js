import dotenv from "dotenv";
import connectDB from "./db/connectdb.js";
import { app } from "./app.js";
import {server,io} from "./SocketIo/socketIo.js"

dotenv.config({
    path: "./.env",
  });
  

const port = process.env.PORT || 3002;

// Connect to the database
connectDB()
  .then(() => {
    server.listen(process.env.PORT || 3002, () => {
      console.log(`Server is running in port: ${process.env.PORT || 3002}`);
    });

    server.on("error", (error) => {
      console.log(`Express connection error: ${error}`);
    });
  })
  .catch((error) => {
    console.log(`Mongo Db connection failed: ${error}`);
  });
