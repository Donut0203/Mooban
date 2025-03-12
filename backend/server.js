require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// ใช้ฐานข้อมูล MySQL ที่ตั้งไว้
const db = require('./config/database');
const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/members');
const uploadRoutes = require('./routes/upload');

const app = express();

// ตั้งค่า middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:5000', 'http://localhost:5001', 'http://localhost:5002', 'http://localhost:4000'],
  credentials: true
}));

// เพิ่มขนาดไฟล์สูงสุดเป็น 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// สร้างโฟลเดอร์ uploads หากยังไม่มี
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory at: ${uploadsDir}`);
} else {
  console.log(`Using existing uploads directory at: ${uploadsDir}`);
}

// ตรวจสอบสิทธิ์การอ่าน/เขียนในโฟลเดอร์ uploads
try {
  fs.accessSync(uploadsDir, fs.constants.R_OK | fs.constants.W_OK);
  console.log('Uploads directory has proper read/write permissions');
} catch (err) {
  console.error('Uploads directory permission error:', err);
  try {
    fs.chmodSync(uploadsDir, 0o755);
    console.log('Fixed uploads directory permissions');
  } catch (chmodErr) {
    console.error('Failed to fix uploads directory permissions:', chmodErr);
  }
}

// ตั้งค่าให้ express สามารถให้บริการไฟล์สแตติกในโฟลเดอร์ uploads
app.use('/uploads', express.static(uploadsDir, {
  etag: false,
  maxAge: 0,
  lastModified: false,
  cacheControl: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/upload', uploadRoutes);

// API info route
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the Login/Register API',
    endpoints: {
      login: '/api/auth/login',
      register: '/api/auth/register'
    }
  });
});

// เพิ่ม API สำหรับ /loan
app.post('/loan', (req, res) => {
  // รับข้อมูลจาก frontend ที่ส่งมา
  const { loan, guarantors } = req.body;

  // แสดงข้อมูลที่รับมาใน console (สามารถลบออกเมื่อไม่ต้องการแล้ว)
  console.log('Received loan data:', loan);
  console.log('Received guarantors data:', guarantors);

  // ตรวจสอบข้อมูลว่ามีครบหรือไม่ เช่น จำนวนผู้ค้ำประกันต้องเป็น 2 คน
  if (!loan || !guarantors || guarantors.length !== 2) {
    return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วนหรือผิดพลาด' });
  }

  // ถ้าทุกอย่างถูกต้อง ส่งข้อมูลกลับไปให้ frontend
  res.status(200).json({
    message: 'ข้อมูลสินเชื่อและผู้ค้ำประกันได้รับแล้ว',
    loanData: loan,
    guarantorsData: guarantors
  });
});

// Serve Vue.js frontend
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  // ถ้าเป็นโหมด production ให้บริการไฟล์ที่สร้างจาก Vue.js
  const vueDistPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(vueDistPath));

  // สำหรับ route ที่ไม่ใช่ /api ให้ส่งไปยังหน้าเว็บของ Vue.js
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(vueDistPath, 'index.html'));
  });
} else {
  // ถ้าเป็นโหมด development ให้ใช้ Vue.js dev server
  console.log('Running in development mode - frontend routes will be handled by Vue.js dev server');

  app.get(/^(?!\/api).*/, (req, res) => {
    res.redirect(`http://localhost:8080${req.originalUrl}`);
  });
}

// ทดสอบการเชื่อมต่อฐานข้อมูล
db.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection error:', err);
    console.log('The application will continue to run, but database features may not work correctly.');
  });

// Start server
const PORT = process.env.PORT || 4000; // ใช้พอร์ต 4000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
