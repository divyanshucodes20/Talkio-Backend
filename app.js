import express from "express"
import dotenv from "dotenv";
import userRoute from "./routes/user.routes.js";
import {connectDB} from "./utils/features.js"
import { errorMiddleware } from "./middlewares/error.js";

dotenv.config({
    path: "./.env",
  });
const app = express();
const mongoUri=process.env.MONGO_URI||"";
const port = process.env.PORT || 3000;
connectDB(mongoUri);

//middlewares
app.use(express.json());



app.get("/", (req, res) => {
    res.send("API is running....");
  });
app.use("/api/v1/user", userRoute);



app.use(errorMiddleware)

app.listen(port,()=>{
  console.log(`Server is running on port ${port}`)
})
