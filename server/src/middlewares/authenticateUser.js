import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import ApiError from '../utils/ApiError.js';


const authenticateUser = asyncHandler(async (req, _, next) => {
    const authHeader = req.header("Authorization");

    const token =
        req?.cookies?.accessToken ||
        (authHeader?.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : null
        );

    if(!token){
        throw new ApiError(
            401,
            "Access token is missing"
        );
    }

    try{
        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );
        
        req.user = decodedToken;
        next();

    }catch(err){
        throw new ApiError(
            401,
            "Invalid or expired access token"
        );
    }
});


export default authenticateUser;