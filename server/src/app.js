import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import ApiError from './utils/ApiError.js';
import errorHandler from './middlewares/errorHandler.js';


const app = express();


app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}));

app.use((req,res,next)=>{
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
});

app.use(express.urlencoded({
    extended: true,
    limit: "50mb"
}));

app.use(express.json({limit: "50mb"}));
app.use(express.static("public"));
app.use(cookieParser());


// API Routes


app.use((req,res,next)=>{
    next(new ApiError(
        404,
        "Route to nhi mila"
    ));
});

app.use(errorHandler);


export default app;
