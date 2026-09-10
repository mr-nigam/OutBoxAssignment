import axios from 'axios';
import oauth2client from '../config/google.js';
import ApiError from '../utils/ApiError.js';
import { 
    generateAccessToken, 
    generateRefreshToken 
} from '../utils/token.js';
import { 
    setAuthCookies, 
    clearAuthCookies 
} from '../utils/cookie.js';
import {
    upsertGoogleUser,
    findUserById
} from '../repositories/auth.js';


const oauth2client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "postmessage"
    // process.env.GOOGLE_REDIRECT_URI
);

const getGoogleUserInfo = async (body) => {
    const { code, credential, id_token, access_token } = body;
    // Flow 1: Authorization code exchange (recommended for backend/popup)
    if (code) {
        const { tokens } = await oauth2client.getToken(code);
        oauth2client.setCredentials(tokens);
        const response = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
        );
        return {
            google_id: response.data.id,
            email: response.data.email,
            name: response.data.name || response.data.email.split('@')[0],
            avatar_url: response.data.picture
        };
    }
    // Flow 2: ID token / Credential token verification
    if (credential || id_token) {
        const token = credential || id_token;
        const ticket = await oauth2client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        return {
            google_id: payload.sub,
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            avatar_url: payload.picture
        };
    }
        // Flow 3: Direct Google access token
    if (access_token) {
        const response = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`
        );
        return {
            google_id: response.data.id,
            email: response.data.email,
            name: response.data.name || response.data.email.split('@')[0],
            avatar_url: response.data.picture
        };
    }
    throw new ApiError(400, "Google authorization code or token is required");
};

const loginService = async ({ 
    body, 
    res 
}) => {
    
    if(!body){
        throw new ApiError(
            400, 
            "Request body is required"
        );
    }

    let googleUser;
    try{
        googleUser = await getGoogleUserInfo(body);

    }catch(err){
        if (err instanceof ApiError) throw err;
        
        console.error("Google authentication error:", err);
        throw new ApiError(401, `Failed to authenticate with Google: ${err.message || 'Invalid credentials'}`);
    }

    if(!googleUser?.email){
        throw new ApiError(
            400,
            "Unable to extract email from Google account"
        );
    }

        // Upsert user into database
    const user = await upsertGoogleUser({
        google_id: googleUser.google_id,
        name: googleUser.name,
        email: googleUser.email,
        avatar_url: googleUser.avatar_url
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    // Set secure HTTP-only cookies
    
    if(res){
        setAuthCookies(res, accessToken, refreshToken);
    }
    
    return {
        user,
        accessToken,
        refreshToken
    };
};

const getCurrentUserService = async ({ userId }) => {
    if (!userId) {
        throw new ApiError(401, "User ID is required");
    }
    const user = await findUserById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return user;
};

const logoutService = async ({ res }) => {
    if (res) {
        clearAuthCookies(res);
    }
    return true;
};

export {
    loginService,
    getCurrentUserService,
    logoutService
};