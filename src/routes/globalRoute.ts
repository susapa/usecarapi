// src/routes/userRoutes.ts
import { Router } from 'express';
import * as globalController from '../controllers/globalController';
import { protect } from '../middleware/auth';

const router: Router = Router();

// เราอ้างถึงฟังก์ชันใน controller แบบมีประเภทข้อมูลที่กำหนดไว้
router.get('/getbrand', protect, globalController.getBrand);

export default router;