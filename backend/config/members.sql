-- สร้างตารางสมาชิก
CREATE TABLE IF NOT EXISTS member (
  member_id INT(11) NOT NULL AUTO_INCREMENT,  -- หมายเลขสมาชิกที่ไม่ซ้ำกัน (Auto Increment)
  first_name VARCHAR(100) NOT NULL,  -- ชื่อจริงของสมาชิก
  last_name VARCHAR(100) NOT NULL,  -- นามสกุลของสมาชิก
  phone VARCHAR(20) NOT NULL,  -- เบอร์โทรศัพท์ของสมาชิก
  bank_name VARCHAR(100) NOT NULL,  -- ชื่อธนาคารของสมาชิก
  bank_account VARCHAR(50) NOT NULL,  -- หมายเลขบัญชีธนาคารของสมาชิก
  national_id VARCHAR(20) NOT NULL,  -- หมายเลขบัตรประชาชนของสมาชิก
  address_line1 TEXT NOT NULL,  -- ที่อยู่ของสมาชิก
  subdistrict VARCHAR(100) DEFAULT NULL,  -- ชื่อซอย/ตำบล
  district VARCHAR(100) DEFAULT NULL,  -- อำเภอ/เขต
  province VARCHAR(100) DEFAULT NULL,  -- จังหวัด
  postal_code VARCHAR(10) DEFAULT NULL,  -- รหัสไปรษณีย์
  id_card_copy VARCHAR(255) NOT NULL,  -- ลิงก์ไฟล์สำเนาบัตรประชาชน
  house_registration_copy VARCHAR(255) NOT NULL,  -- ลิงก์ไฟล์สำเนาทะเบียนบ้าน
  balance DECIMAL(15,2) DEFAULT 0.00,  -- ยอดเงินของสมาชิก (เริ่มต้นที่ 0.00)
  created_by INT(11) DEFAULT NULL,  -- ID ผู้ที่สร้างข้อมูล
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- วันที่และเวลาที่สร้างข้อมูล
  updated_by INT(11) DEFAULT NULL,  -- ID ผู้ที่อัพเดทข้อมูล
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- วันที่และเวลาที่อัพเดทข้อมูล
  birth_date DATE DEFAULT NULL,  -- วันเกิดของสมาชิก
  PRIMARY KEY (member_id)  -- กำหนดให้ member_id เป็นคีย์หลัก
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;