// src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import apiRoutes from './routes/userRoutes'; // นำเข้า Routes หลัก
import dashboardRoutes from './routes/dashboardRoutes';
import globalRoutes from './routes/globalRoute';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors, { CorsOptions } from 'cors'; // 💡 นำเข้า cors


dotenv.config();

const corsOptions: CorsOptions = {
    // 1. Origin: MUST match your Angular frontend URL exactly. 
    // This tells the browser: "I only trust requests coming from this domain."
    origin: 'http://localhost:4200', 
    
    // 2. Credentials: CRITICAL for HTTP-Only Cookies.
    // This allows the browser to send and receive cookies with cross-origin requests.
    credentials: true, 
    
    // 3. Methods: List of HTTP methods your API will accept.
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], 
    
    // 4. Allowed Headers: Headers your API needs to receive (especially for JWT).
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// สร้างอินสแตนซ์ของ Express Application
const app: Application = express();
app.use(cors(corsOptions));
// Middleware ทั่วไป
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
// ใช้งาน Routes
app.use('/api/user', apiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/global', globalRoutes);

// Middleware สำหรับจัดการ Error (กำหนดประเภทของ Error)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    // ในโปรเจกต์จริงควรมีการจัดการ status code ที่เหมาะสม
    res.status(500).send({ message: 'Something broke!', error: err.message });
});

export default app;