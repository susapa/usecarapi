// src/controllers/userController.ts
import { Request, Response, NextFunction } from 'express';
import db from '../db'; // นำเข้า db object สำหรับ Query

// กำหนดประเภทข้อมูลให้กับฟังก์ชัน Controller
export const getAllUsers = async (req: Request, res: Response): Promise<void>  => {
    // ในความเป็นจริง จะมีการเรียกใช้ User Model

    // const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
    const queryText = 'SELECT * FROM usecar.user';

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

export const createUser = (req: Request, res: Response): void => {
    // กำหนดประเภทให้กับ body ของ Request (ถ้าจำเป็นต้องใช้ interface)
    const newUser = req.body;
    // ... logic การสร้าง user ...
    res.status(201).json({ status: 'success', message: 'User created', data: newUser });
};

export const getUserById = (req: Request, res: Response): void => {
    // ค่าจาก req.params จะเป็น string เสมอ
    const userId: string = req.params.id;
    // ... logic การค้นหา user ...

    const user = { id: parseInt(userId), name: `User ${userId}` };

    if (!user) {
        // ใช้ return เพื่อหยุดการทำงานของฟังก์ชัน
        res.status(404).json({ status: 'fail', message: 'User not found' });
        return;
    }
    res.status(200).json({ status: 'success', data: user });
};