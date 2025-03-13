-- สร้างฐานข้อมูลสำหรับระบบจัดการสินเชื่อ
-- คุณสามารถเปลี่ยนชื่อฐานข้อมูลได้ตามต้องการ
CREATE DATABASE IF NOT EXISTS mooban_loan_system CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE mooban_loan_system;

-- สร้างตาราง users สำหรับผู้ใช้งานระบบ
CREATE TABLE IF NOT EXISTS users (
  user_id INT(11) NOT NULL AUTO_INCREMENT,
  user_email VARCHAR(255) NOT NULL UNIQUE,
  user_password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) DEFAULT '',
  last_name VARCHAR(100) DEFAULT '',
  phone VARCHAR(20) DEFAULT '',
  address TEXT DEFAULT '',
  status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending',
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by INT DEFAULT NULL,
  approval_date TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  login_attempts INT(11) DEFAULT 0,
  locked_until DATETIME DEFAULT NULL,
  profile_picture VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- สร้างตาราง member สำหรับข้อมูลสมาชิก
CREATE TABLE IF NOT EXISTS member (
  member_id INT(11) NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  bank_account VARCHAR(50) NOT NULL,
  national_id VARCHAR(20) NOT NULL,
  address_line1 TEXT NOT NULL,
  subdistrict VARCHAR(100) DEFAULT NULL,
  district VARCHAR(100) DEFAULT NULL,
  province VARCHAR(100) DEFAULT NULL,
  postal_code VARCHAR(10) DEFAULT NULL,
  id_card_copy VARCHAR(255) NOT NULL,
  house_registration_copy VARCHAR(255) NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0.00,
  created_by INT(11) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by INT(11) DEFAULT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  birth_date DATE DEFAULT NULL,
  PRIMARY KEY (member_id),
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- สร้างตาราง loanagreement สำหรับข้อมูลสัญญาเงินกู้
CREATE TABLE IF NOT EXISTS loanagreement (
  loan_id INT(11) NOT NULL AUTO_INCREMENT,
  member_id INT(11) NOT NULL,
  full_name VARCHAR(255) NULL,
  phone VARCHAR(20) NULL,
  bank_name VARCHAR(100) NULL,
  account_number VARCHAR(50) NULL,
  id_card VARCHAR(20) NULL,
  address TEXT NULL,
  subdistrict VARCHAR(100) NULL,
  district VARCHAR(100) NULL,
  province VARCHAR(100) NULL,
  postal_code VARCHAR(10) NULL,
  first_payment_date DATE NULL,
  loan_amount DECIMAL(15,2) NOT NULL,
  monthly_interest DECIMAL(15,2) NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  repayment_period INT(11) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  guarantee_required TINYINT(1) DEFAULT 1,
  created_by INT(11) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by INT(11) DEFAULT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (loan_id),
  FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- สร้างตาราง guarantor สำหรับข้อมูลผู้ค้ำประกัน
CREATE TABLE IF NOT EXISTS guarantor (
  guarantor_id INT(11) NOT NULL AUTO_INCREMENT,
  loan_id INT(11) NOT NULL,
  member_id INT(11) NULL,
  guarantor_name VARCHAR(255) NOT NULL,
  guarantor_id_card VARCHAR(20) NOT NULL,
  guarantor_address TEXT NOT NULL,
  borrower_id_card VARCHAR(20) NULL,
  borrower_house_register VARCHAR(20) NULL,
  guarantor1_id_card VARCHAR(20) NULL,
  guarantor1_house_register VARCHAR(20) NULL,
  guarantor2_id_card VARCHAR(20) NULL,
  guarantor2_house_register VARCHAR(20) NULL,
  created_by INT(11) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by INT(11) DEFAULT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (guarantor_id),
  FOREIGN KEY (loan_id) REFERENCES loanagreement(loan_id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- สร้างตาราง loan_documents สำหรับเก็บข้อมูลไฟล์เอกสาร
CREATE TABLE IF NOT EXISTS loan_documents (
  document_id INT(11) NOT NULL AUTO_INCREMENT,
  loan_id INT(11) NOT NULL,
  document_type ENUM('borrower_id_card', 'borrower_house_registration', 'guarantor1_id_card', 'guarantor1_house_registration', 'guarantor2_id_card', 'guarantor2_house_registration') NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (document_id),
  FOREIGN KEY (loan_id) REFERENCES loanagreement(loan_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- สร้างตาราง deposit_balance สำหรับเก็บข้อมูลยอดเงินฝากและยอดเงินกู้
CREATE TABLE IF NOT EXISTS deposit_balance (
  balance_id INT(11) NOT NULL AUTO_INCREMENT,
  member_id INT(11) NOT NULL,
  deposit_balance DECIMAL(15,2) DEFAULT 0.00,
  loan_balance DECIMAL(15,2) DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (balance_id),
  FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- สร้างตาราง transactions สำหรับเก็บข้อมูลธุรกรรมทางการเงิน
CREATE TABLE IF NOT EXISTS transactions (
  transaction_id INT(11) NOT NULL AUTO_INCREMENT,
  member_id INT(11) NOT NULL,
  transaction_status ENUM('deposit', 'withdraw', 'loan_repayment', 'loan_disbursement') NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0.00,
  transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INT(11) DEFAULT NULL,
  updated_by INT(11) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (transaction_id),
  FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- สร้างตาราง migrations สำหรับติดตามการเปลี่ยนแปลงโครงสร้างฐานข้อมูล
CREATE TABLE IF NOT EXISTS migrations (
  migration_id INT(11) NOT NULL AUTO_INCREMENT,
  migration_name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (migration_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- เพิ่มข้อมูลผู้ใช้งานเริ่มต้น (รหัสผ่าน: Admin1234)
INSERT INTO users (user_email, user_password, first_name, last_name, status, is_approved)
VALUES ('admin@example.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9MUZWg8CSzXpxD4Oi9Tq0s9vokGhwVi', 'Admin', 'User', 'headman', TRUE);

-- บันทึกการสร้างฐานข้อมูล
INSERT INTO migrations (migration_name, description, applied_at) 
VALUES ('initial_schema', 'สร้างโครงสร้างฐานข้อมูลเริ่มต้นสำหรับระบบจัดการสินเชื่อ', NOW());