// src/routes/userRoutes.ts
import { Router } from 'express';
import * as userController from '../controllers/userController';
import { protect } from '../middleware/auth';

const router: Router = Router();

// เราอ้างถึงฟังก์ชันใน controller แบบมีประเภทข้อมูลที่กำหนดไว้
router.get('/', protect, userController.getAllUsers);
router.post('/register', userController.registerUser); 
router.post('/login', userController.loginUser); 
router.get('/getuser/:id', protect, userController.getUserById);

export default router;