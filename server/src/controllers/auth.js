import asyncHandler from '../middlewares/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

import {
    loginService,
    getCurrentUserService,
    logoutService
} from '../services/auth.js';

const login = asyncHandler(async (req, res) => {
    
    const { 
        user, 
        accessToken 
    } = await loginService({
        body: req.body,
        res
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { user, accessToken },
                "Logged in successfully"
            )
        );
});


const getCurrentUser = asyncHandler(async (req, res) => {

    const user = await getCurrentUserService({
        userId: req.user.id
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { user },
                "User profile fetched successfully"
            )
        );
});

const logout = asyncHandler(async (req, res) => {

    await logoutService({ 
        res 
    });
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Logged out successfully"
            )
        );
});


export {
    login,
    getCurrentUser,
    logout
};