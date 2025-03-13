import { SessionOptions } from "iron-session";

export interface SessionData {
        id: string;
        userName: string;
        email: string;
        role: string;
}

export const sessionOptions:SessionOptions ={
    password: process.env.SESSION_PASSWORD!,
    cookieName: 'fitpro-session',
    cookieOptions: {    
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
    }
}  