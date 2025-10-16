// src/controllers/userController.ts
import { Request, Response, NextFunction } from 'express';
import db from '../db'; // นำเข้า db object สำหรับ Query

import bcrypt from 'bcrypt';         // สำหรับการแฮชรหัสผ่าน
import jwt, { SignOptions } from 'jsonwebtoken';      // สำหรับการสร้าง Token
import { QueryResult } from 'pg';



const signToken = (id: number): string => {
    // 1. CRITICAL: Check and assert JWT_SECRET is present at runtime.
    if (!process.env.JWT_SECRET) {
        // This should throw an error on startup if config is missing.
        throw new Error('FATAL ERROR: JWT_SECRET is not configured.');
    }

    // 2. Define the base options object.
    const options: SignOptions = {};

    // 3. Conditionally add expiresIn ONLY if it is defined.
    // This ensures the property is absent if the value is undefined.
    if (process.env.JWT_EXPIRES_IN) {
        // TypeScript now confirms process.env.JWT_EXPIRES_IN is a string 
        // within this block, satisfying the SignOptions type requirement.
        options.expiresIn = '90d';
    }

    // 4. Safely call jwt.sign.
    // The JWT_SECRET is guaranteed to be a string due to the check in step 1.
    return jwt.sign(
        { id },
        process.env.JWT_SECRET, // Guaranteed string
        options
    );
};
// 💡 ฟังก์ชันสำหรับส่ง Token ในรูปแบบ HTTP-Only Cookie
const sendTokenResponse = (user: { id: number; name: string; email: string }, statusCode: number, res: Response) => {
    // 1. สร้าง JWT
    const token = signToken(user.id);

    // 2. กำหนดตัวเลือกสำหรับ Cookie
    const cookieOptions = {
        // กำหนดวันหมดอายุของ Cookie (เช่น 90 วัน)
        expires: new Date(Date.now() +
            (parseInt(process.env.JWT_COOKIE_EXPIRES_IN_DAYS || '90') * 24 * 60 * 60 * 1000)
        ),
        // 🚨 สำคัญที่สุด: ป้องกันการเข้าถึงจาก JavaScript (ป้องกัน XSS)
        httpOnly: true,
        // สำหรับ Production: กำหนดให้ส่งผ่าน HTTPS เท่านั้น
        secure: process.env.NODE_ENV === 'production',
        // ป้องกัน CSRF ระดับพื้นฐาน (แนะนำ 'Lax' หรือ 'Strict')
        sameSite: 'Lax' as 'lax'
    };

    // 3. ส่ง Cookie กลับไป
    // ชื่อ Cookie ที่ใช้เก็บ Token คือ 'jwt'
    res.cookie('jwt', token, cookieOptions);

    // 4. ส่ง Response กลับ (ไม่มี Token ใน JSON)
    res.status(statusCode).json({
        status: 'success',
        // ไม่ต้องส่ง Token กลับใน JSON อีกต่อไป
        data: { user }
    });
};

// ... (interface DecodedUser และ AuthRequest จาก middleware/auth.ts ถ้ายังไม่ได้รวมไว้)
interface DecodedUser {
    id: number;
}
interface AuthRequest extends Request {
    user?: DecodedUser;
}

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
    // 1. ดึง ID ของ User จาก URL Parameter
    const userId = req.params.id; // ค่านี้จะเป็น string เสมอ

    // 2. ตรวจสอบว่า ID ที่ส่งมาเป็นตัวเลขที่ถูกต้อง
    if (isNaN(parseInt(userId))) {
        res.status(400).json({ status: 'fail', message: 'Invalid User ID format.' });
        return;
    }

    // **💡 ตรวจสอบสิทธิ์ (Authorization) เพิ่มเติม:**
    // เพื่อป้องกันไม่ให้ User A ดึงข้อมูลส่วนตัวของ User B ได้
    // เราสามารถบังคับให้ผู้ใช้ดึงข้อมูลได้เฉพาะ ID ของตัวเองเท่านั้น
    if (req.user && req.user.id !== parseInt(userId)) {
        res.status(403).json({ status: 'fail', message: 'Forbidden. You can only view your own data.' });
        return;
    }

    // 3. กำหนด Query SQL
    const queryText = 'SELECT id, name, email, created_at,role,menu FROM usecar.users WHERE id = $1';

    try {
        const result: QueryResult = await db.query(queryText, [userId]);
        let user = result.rows[0];

        // 4. ตรวจสอบว่าพบ User หรือไม่
        if (!user) {
            res.status(404).json({ status: 'fail', message: 'User not found.' });
            return;
        }

        //get Menu for user
        const queryMenu = 'SELECT * FROM usecar.menu WHERE id IN (' + user.menu + ')';
        const resultMenu: QueryResult = await db.query(queryMenu);
        const menuList = resultMenu.rows
         user = {...user,menuList}
            // 5. ส่งข้อมูล User กลับฟหกฟหกฟหกห
            res.status(200).json({
                status: 'success',
                data: user
            });

    } catch (err: any) {
        console.error('Error fetching user by ID:', err.message);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error.'
        });
    }
};

// กำหนดประเภทข้อมูลให้กับฟังก์ชัน Controller
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    // ในความเป็นจริง จะมีการเรียกใช้ User Model

    // const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
    const queryText = 'SELECT * FROM usecar.users';

    try {
        // ใช้ db.query เพื่อส่งคำสั่งไปยัง PostgreSQL
        const result = await db.query(queryText);

        // ส่งข้อมูลที่ได้จากฐานข้อมูล (result.rows) กลับไปในรูปแบบ JSON
        res.status(200).json({
            status: 'success',
            results: result.rows.length, // จำนวนแถวที่พบ
            data: result.rows
        });

    } catch (err) {
        // จัดการข้อผิดพลาดที่อาจเกิดขึ้นระหว่างการ Query
        console.error('Error executing query to get all users:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve users',
            error: err instanceof Error ? err.message : 'Unknown database error'
        });
    }

    // res.status(200).json({ status: 'success', data: users });
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // 1. ตรวจสอบว่ามีอีเมลและรหัสผ่านถูกส่งมาหรือไม่
    if (!email || !password) {
        res.status(400).json({ status: 'fail', message: 'Please provide email and password.' });
        return;
    }

    try {
        // 2. ค้นหา User ในฐานข้อมูลด้วยอีเมล
        const queryText = 'SELECT id, name, email, password,role,menu FROM usecar.users WHERE email = $1';
        const result: QueryResult = await db.query(queryText, [email]);
        const user = result.rows[0];

        // 3. ตรวจสอบว่าพบผู้ใช้และรหัสผ่านถูกต้องหรือไม่
        // ถ้าไม่พบผู้ใช้ หรือรหัสผ่านไม่ตรงกัน
        if (!user || !(await bcrypt.compare(password, user.password))) {
            // ส่งข้อความ Error ที่คลุมเครือเพื่อไม่ให้ผู้โจมตีรู้ว่าผิดที่ Email หรือ Password
            res.status(401).json({ status: 'fail', message: 'Invalid email or password.' });
            return;
        }

        // 4. ถ้าผ่านการตรวจสอบ: สร้าง JWT
        const token = signToken(user.id);

        // 5. ส่ง JWT และข้อมูลผู้ใช้กลับ
        // (เราจะไม่ส่งรหัสผ่านที่แฮชแล้วกลับไป)
        const userData = { id: user.id, name: user.name, email: user.email, role: user.role };

        // res.status(200).json({ 
        //     status: 'success', 
        //     token, // ส่ง Token กลับไปให้ Client
        //     data: { user: userData } 
        // });
        sendTokenResponse(userData, 200, res); // 💡 เรียกใช้

    } catch (err: any) {
        console.error('Error during user login:', err.message);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error during login.'
        });
    }
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    // 1. รับข้อมูลจาก body
    const { name, email, password } = req.body;

    // ตรวจสอบความสมบูรณ์ของข้อมูลพื้นฐาน
    if (!name || !email || !password) {
        res.status(400).json({ status: 'fail', message: 'Please provide name, email, and password' });
        return;
    }

    try {
        // 2. แฮชรหัสผ่าน
        // ใช้ 10 รอบ (saltRounds) ซึ่งเป็นค่ามาตรฐานที่ดี
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. บันทึกผู้ใช้ใหม่ลงใน PostgreSQL
        const queryText = `
            INSERT INTO usecar.users (name, email, password) 
            VALUES ($1, $2, $3) 
            RETURNING id, name, email
        `;
        const values = [name, email, hashedPassword];

        const result: QueryResult = await db.query(queryText, values);
        const newUser = result.rows[0];

        // 4. สร้าง JWT
        const token = signToken(newUser.id);

        // 5. ส่ง JWT และข้อมูลผู้ใช้กลับ
        // res.status(201).json({
        //     status: 'success',
        //     token, // ส่ง Token กลับไปให้ Client
        //     data: { user: newUser }
        // });
        sendTokenResponse(newUser, 200, res); // 💡 เรียกใช้
    } catch (err: any) {
        // จัดการข้อผิดพลาด เช่น อีเมลซ้ำ (Unique Constraint Error)
        if (err.code === '23505') { // รหัสข้อผิดพลาดของ PostgreSQL สำหรับ Unique violation
            res.status(400).json({ status: 'fail', message: 'Email already exists' });
            return;
        }

        console.error('Error during user registration:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to register user',
            error: err.message
        });
    }
};