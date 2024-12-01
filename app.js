import express from "express"
import dotenv from "dotenv";
import userRoute from "./routes/user.routes.js";

dotenv.config({
    path: "./.env",
  });
const app = express();



//middlewares
app.use(express.json());


app.get("/", (req, res) => {
    res.send("API is running....");
  });
app.use("/api/v1/user", userRoute);


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });