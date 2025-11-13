import express from "express";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";

import connectDB from "./config/db.config.js";
import userRoutes from "./routes/user.routes.js";
import bodyParser from "body-parser";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(fileUpload(
    {
        useTempFiles: true,
        tempFileDir: "/tmp/",
    }
));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/user", userRoutes);

// Server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
