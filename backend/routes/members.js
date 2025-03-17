const express = require('express'); 
const router = express.Router();
const verifyToken = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const db = require('../config/database'); // ตรวจสอบว่าไฟล์ database.js อยู่ใน ../config/

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '../uploads');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    cb(null, 'member-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Get all members
router.get('/', verifyToken, async (req, res) => {
  try {
    const [members] = await db.query('SELECT * FROM member ORDER BY member_id DESC');
    if (!members || members.length === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลสมาชิก' });
    }
    res.json(members);
  } catch (error) {
    console.error('Error getting members:', error.message); // เพิ่มการแสดงข้อความผิดพลาด
    res.status(500).json({ message: 'Server error' });
  }
});

// Get member by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [members] = await db.query('SELECT * FROM member WHERE member_id = ?', [req.params.id]);
    if (!members || members.length === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลสมาชิก' });
    }
    res.json(members[0]);
  } catch (error) {
    console.error('Error getting member:', error.message); // เพิ่มการแสดงข้อความผิดพลาด
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new member
router.post('/', verifyToken, async (req, res) => {
  try {
    // console.log('Request Body:', req.body); // ตรวจสอบข้อมูลที่รับมาจากคำขอ
    const {
      first_name,
      last_name,
      phone,
      birth_date,
      bank_name,
      bank_account,
      national_id,
      address_line1,
      subdistrict,
      district,
      province,
      postal_code,
      id_card_copy,
      house_registration_copy,
      balance
    } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO member (
        first_name, last_name, phone, birth_date, bank_name, bank_account, national_id,
        address_line1, subdistrict, district, province, postal_code,
        id_card_copy, house_registration_copy, balance, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name, last_name, phone, birth_date, bank_name, bank_account, national_id,
        address_line1, subdistrict, district, province, postal_code,
        id_card_copy, house_registration_copy, balance || 0, req.userId, req.userId
      ]
    );
    
    res.status(201).json({
      message: 'Member created successfully',
      member_id: result.insertId
    });
  } catch (error) {
    console.error('Error creating member:', error.message); // เพิ่มการแสดงข้อความผิดพลาด
    res.status(500).json({ message: 'Server error' });
  }
});

// Update member
router.put('/:id', verifyToken, async (req, res) => {
  try {
    // console.log('Request Body:', req.body); // ตรวจสอบข้อมูลที่รับมาจากคำขอ
    const {
      first_name,
      last_name,
      phone,
      birth_date,
      bank_name,
      bank_account,
      national_id,
      address_line1,
      subdistrict,
      district,
      province,
      postal_code,
      id_card_copy,
      house_registration_copy,
    } = req.body;
    
    const [result] = await db.query(
      `UPDATE member SET
        first_name = ?,
        last_name = ?,
        phone = ?,
        birth_date = ?,
        bank_name = ?,
        bank_account = ?,
        national_id = ?,
        address_line1 = ?,
        subdistrict = ?,
        district = ?,
        province = ?,
        postal_code = ?,
        id_card_copy = ?,
        house_registration_copy = ?,
        updated_by = ?,
        updated_at = NOW()
      WHERE member_id = ?`,
      [
        first_name, last_name, phone, birth_date, bank_name, bank_account, national_id,
        address_line1, subdistrict, district, province, postal_code,
        id_card_copy, house_registration_copy, req.userId, req.params.id
      ]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลสมาชิก' });
    }
    
    res.json({ message: 'Member updated successfully' });
  } catch (error) {
    console.error('Error updating member:', error.message); // เพิ่มการแสดงข้อความผิดพลาด
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete member
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM member WHERE member_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลสมาชิก' });
    }
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error.message); // เพิ่มการแสดงข้อความผิดพลาด
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload file
router.post('/upload', verifyToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const fileUrl = '/uploads/' + req.file.filename;
    res.json({
      message: 'File uploaded successfully',
      fileUrl: fileUrl
    });
  } catch (error) {
    console.error('Error uploading file:', error.message); // เพิ่มการแสดงข้อความผิดพลาด
    res.status(500).json({ message: 'Server error during file upload' });
  }
});

module.exports = router;
