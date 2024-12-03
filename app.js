import express from "express"
import dotenv from "dotenv";
import {connectDB} from "./utils/features.js"
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";

import userRoute from "./routes/user.routes.js";
import chatRoute from "./routes/chat.routes.js"
import adminRoute from "./routes/admin.routes.js"


dotenv.config({
    path: "./.env",
  });
const app = express();
const mongoUri=process.env.MONGO_URI||"";
const port = process.env.PORT || 3000;
connectDB(mongoUri);

//middlewares
app.use(express.json());
app.use(cookieParser());


app.get("/", (req, res) => {
    res.send("API is running....");
  });
app.use("/user", userRoute);
app.use("/chat",chatRoute);
app.use("/admin",adminRoute);


app.use(errorMiddleware)

app.listen(port,()=>{
  console.log(`Server is running on port ${port}`)
})
