// src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// ขยายประเภทของ Request เพื่อเพิ่มข้อมูล user ที่ถอดรหัสแล้ว
interface DecodedUser {
    id: number;
}
interface AuthRequest extends Request {
    user?: DecodedUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // 1. ตรวจสอบ Token จากสองแหล่ง: Header และ Cookies
    
    // A. ตรวจสอบ Authorization Header (Bearer Token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } 
    // B. ✅ ตรวจสอบ HTTP-Only Cookie (ถ้าใช้ cookie-parser)
    else if (req.cookies.jwt) {
        token = req.cookies.jwt; // 💡 อ่านค่าจาก req.cookies.jwt
    }

    // 2. ถ้าไม่มี Token
    if (!token) {
        return res.status(401).json({ 
            status: 'fail', 
            message: 'Access denied. No token provided.' 
        });
    }

    // 3. ดำเนินการตรวจสอบ (Verify) Token ต่อไป...
    try {
        if (!process.env.JWT_SECRET) {
             throw new Error('JWT Secret not configured.');
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedUser;
        req.user = decoded; 
        
        next(); 

    } catch (err: any) {
        // ... (จัดการ Error) ...
        return res.status(401).json({ 
            status: 'fail', 
            message: 'Invalid or expired token.' 
        });
    }
};