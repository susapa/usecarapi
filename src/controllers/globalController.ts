// src/controllers/userController.ts
import { Request, Response, NextFunction } from 'express';
import db from '../db'; // นำเข้า db object สำหรับ Query

import bcrypt from 'bcrypt';         // สำหรับการแฮชรหัสผ่าน
import jwt, { SignOptions } from 'jsonwebtoken';      // สำหรับการสร้าง Token
import { QueryResult } from 'pg';


// ... (interface DecodedUser และ AuthRequest จาก middleware/auth.ts ถ้ายังไม่ได้รวมไว้)
interface DecodedUser {
    id: number;
}
interface AuthRequest extends Request {
    user?: DecodedUser;
}

export const getBrand = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.params.id; 

    if (isNaN(parseInt(userId))) {
        res.status(400).json({ status: 'fail', message: 'Invalid User ID format.' });
        return;
    }

    if (req.user && req.user.id !== parseInt(userId)) {
        res.status(403).json({ status: 'fail', message: 'Forbidden. You can only view your own data.' });
        return;
    }

    const queryText = 'SELECT * FROM usecar.brand ';

    try {
        const result: QueryResult = await db.query(queryText);
        let listBrand = result.rows;

        if (!listBrand) {
            res.status(404).json({ status: 'fail', message: 'Brand car not found.' });
            return;
        }

            res.status(200).json({
                status: 'success',
                data: listBrand
            });

    } catch (err: any) {
        res.status(500).json({
            status: 'error',
            message: 'Internal server error.'
        });
    }
};
