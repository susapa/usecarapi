// src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import apiRoutes from './routes/userRoutes'; // นำเข้า Routes หลัก
import dashboardRoutes from './routes/dashboardRoutes';
import * as dotenv from 'dotenv';
dotenv.config();


// สร้างอินสแตนซ์ของ Express Application
const app: Application = express();

// Middleware ทั่วไป
app.use(bodyParser.json());
app.use(express.json());

// ใช้งาน Routes
app.use('/api/user', apiRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Middleware สำหรับจัดการ Error (กำหนดประเภทของ Error)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    // ในโปรเจกต์จริงควรมีการจัดการ status code ที่เหมาะสม
    res.status(500).send({ message: 'Something broke!', error: err.message });
});

export default app;