// src/routes/userRoutes.ts
import { Router } from 'express';
import * as userController from '../controllers/userController';
// import { protect } from '../middleware/auth'; // ถ้ามี Middleware

const router: Router = Router();

// เราอ้างถึงฟังก์ชันใน controller แบบมีประเภทข้อมูลที่กำหนดไว้
router.get('/d', userController.getAllUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);

export default router;