// src/db/index.ts

import { Pool } from 'pg';

// ข้อมูลการเชื่อมต่อฐานข้อมูล (ควรเก็บไว้ในไฟล์ .env)
const pool = new Pool({
  user: process.env.DB_USER || 'your_postgres_user', 
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'your_database_name',
  password: process.env.DB_PASSWORD || 'your_password',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// ตรวจสอบการเชื่อมต่อเมื่อ Pool ถูกสร้าง
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  
  // ✅ วิธีแก้ไข: ตรวจสอบว่า client มีค่าก่อนเรียกใช้ release()
  if (client) {
    console.log('Successfully connected to PostgreSQL database!');
    client.release(); // ปล่อย client กลับสู่ pool
  } else {
    // กรณีที่ err เป็น null แต่ client ก็เป็น undefined (ไม่น่าจะเกิดขึ้นแต่ป้องกันไว้)
    console.error('Connection pool client is missing.');
  }
});


// Export object ที่ใช้สำหรับ Query
export default {
  query: (text: string, params?: any[]) => {
    console.log('Executing query:', text);
    return pool.query(text, params);
  },
};