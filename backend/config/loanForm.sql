-- สร้างตารางข้อตกลงเงินกู้
CREATE TABLE IF NOT EXISTS loanagreement (
  loan_id INT(11) NOT NULL AUTO_INCREMENT,  -- หมายเลขข้อตกลงเงินกู้ (Auto Increment)
  member_id INT(11) NOT NULL,  -- รหัสสมาชิกที่เกี่ยวข้องกับเงินกู้
  loan_amount DECIMAL(15,2) NOT NULL,  -- จำนวนเงินกู้
  interest_rate DECIMAL(5,2) NOT NULL,  -- อัตราดอกเบี้ยของเงินกู้
  repayment_period INT(11) NOT NULL,  -- ระยะเวลาชำระคืน (เดือน)
  start_date DATE NOT NULL,  -- วันที่เริ่มต้นของเงินกู้
  end_date DATE NOT NULL,  -- วันที่สิ้นสุดของเงินกู้
  guarantee_required TINYINT(1) DEFAULT 1,  -- ต้องการหลักประกัน (ค่าเริ่มต้น 1)
  created_by INT(11) DEFAULT NULL,  -- ID ผู้ที่สร้างข้อมูล
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- วันที่และเวลาที่สร้างข้อมูล
  updated_by INT(11) DEFAULT NULL,  -- ID ผู้ที่อัพเดทข้อมูล
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- วันที่และเวลาที่อัพเดทข้อมูล
  PRIMARY KEY (loan_id),  -- กำหนดให้ loan_id เป็นคีย์หลัก
  FOREIGN KEY (member_id) REFERENCES member(member_id)  -- เชื่อมโยงกับสมาชิก (ตาราง members)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- สร้างตารางผู้ค้ำประกัน
CREATE TABLE IF NOT EXISTS guarantor (
  guarantor_id INT(11) NOT NULL AUTO_INCREMENT,  -- รหัสผู้ค้ำประกัน (Auto Increment)
  loan_id INT(11) NOT NULL,  -- รหัสข้อตกลงเงินกู้ที่เชื่อมโยงกับผู้ค้ำประกัน
  guarantor_name VARCHAR(255) NOT NULL,  -- ชื่อของผู้ค้ำประกัน
  guarantor_id_card VARCHAR(20) NOT NULL,  -- หมายเลขบัตรประชาชนของผู้ค้ำประกัน
  guarantor_address TEXT NOT NULL,  -- ที่อยู่ของผู้ค้ำประกัน
  created_by INT(11) DEFAULT NULL,  -- ID ผู้ที่สร้างข้อมูล
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- วันที่และเวลาที่สร้างข้อมูล
  updated_by INT(11) DEFAULT NULL,  -- ID ผู้ที่อัพเดทข้อมูล
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- วันที่และเวลาที่อัพเดทข้อมูล
  borrower_id_card VARCHAR(20) NOT NULL,  -- หมายเลขบัตรประชาชนของผู้กู้
  borrower_house_register VARCHAR(20) NOT NULL,  -- หมายเลขทะเบียนบ้านของผู้กู้
  guarantor1_id_card VARCHAR(20) NOT NULL,  -- หมายเลขบัตรประชาชนของผู้ค้ำประกัน 1
  guarantor1_house_register VARCHAR(20) NOT NULL,  -- หมายเลขทะเบียนบ้านของผู้ค้ำประกัน 1
  guarantor2_id_card VARCHAR(20) NOT NULL,  -- หมายเลขบัตรประชาชนของผู้ค้ำประกัน 2
  guarantor2_house_register VARCHAR(20) NOT NULL,  -- หมายเลขทะเบียนบ้านของผู้ค้ำประกัน 2
  PRIMARY KEY (guarantor_id),  -- กำหนดให้ guarantor_id เป็นคีย์หลัก
  FOREIGN KEY (loan_id) REFERENCES loanagreement(loan_id)  -- เชื่อมโยงกับตาราง loanagreement
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- สร้างตาราง balances
CREATE TABLE IF NOT EXISTS deposit_balance (
  balance_id INT(11) NOT NULL AUTO_INCREMENT,  -- รหัสยอดเงิน (Auto Increment)
  member_id INT(11) NOT NULL,  -- รหัสสมาชิก
  deposit_balance DECIMAL(15,2) DEFAULT 0.00,  -- ยอดเงินฝาก
  loan_balance DECIMAL(15,2) DEFAULT 0.00,  -- ยอดเงินกู้
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- วันที่และเวลาที่สร้างข้อมูล
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- วันที่และเวลาที่อัพเดทข้อมูล
  PRIMARY KEY (balance_id),  -- กำหนดให้ balance_id เป็นคีย์หลัก
  FOREIGN KEY (member_id) REFERENCES member(member_id)  -- เชื่อมโยงกับตาราง members
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- สร้างตาราง dividends
CREATE TABLE IF NOT EXISTS dividends (
  dividend_id INT(11) NOT NULL AUTO_INCREMENT,  -- รหัสปันผล (Auto Increment)
  member_id INT(11) DEFAULT NULL,  -- รหัสสมาชิก (เชื่อมโยงกับสมาชิก)
  total_balance DECIMAL(10,2) DEFAULT NULL,  -- ยอดเงินรวมที่ใช้คำนวณปันผล
  interest_rate DECIMAL(5,2) DEFAULT NULL,  -- อัตราดอกเบี้ย
  dividend_amount DECIMAL(10,2) DEFAULT NULL,  -- จำนวนปันผลที่คำนวณได้
  calculation_date DATETIME DEFAULT NULL,  -- วันที่คำนวณปันผล
  PRIMARY KEY (dividend_id),  -- กำหนดให้ dividend_id เป็นคีย์หลัก
  FOREIGN KEY (member_id) REFERENCES member(member_id)  -- เชื่อมโยงกับตาราง members
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- สร้างตารางธุรกรรม
CREATE TABLE IF NOT EXISTS transactions (
  transaction_id INT(11) NOT NULL AUTO_INCREMENT,  -- รหัสธุรกรรม (Auto Increment)
  member_id INT(11) NOT NULL,  -- รหัสสมาชิกที่ทำธุรกรรม
  transaction_status ENUM('deposit', 'withdraw', 'loan_repayment', 'loan_disbursement') NOT NULL,  -- สถานะของธุรกรรม (ฝาก, ถอน, ชำระหนี้, จ่ายเงินกู้)
  amount DECIMAL(15,2) NOT NULL,  -- จำนวนเงินในธุรกรรม
  transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- วันที่และเวลาที่เกิดธุรกรรม
  created_by INT(11) DEFAULT NULL,  -- ID ผู้ที่สร้างธุรกรรม
  updated_by INT(11) DEFAULT NULL,  -- ID ผู้ที่อัพเดทธุรกรรม
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- วันที่และเวลาที่สร้างข้อมูล
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- วันที่และเวลาที่อัพเดทข้อมูล
  PRIMARY KEY (transaction_id),  -- กำหนดให้ transaction_id เป็นคีย์หลัก
  FOREIGN KEY (member_id) REFERENCES member(member_id)  -- เชื่อมโยงกับตาราง members
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE loan_repayments (
    repayment_id INT(11) PRIMARY KEY AUTO_INCREMENT,  -- รหัสธุรกรรมการชำระเงินกู้
    loan_id INT(11) NOT NULL,                         -- อ้างอิงไปยังตาราง loanagreement
    member_id INT(11) NOT NULL,                       -- อ้างอิงถึงสมาชิกที่ชำระเงินกู้
    payment_date DATE NOT NULL,                       -- วันที่ชำระเงิน
    amount_paid DECIMAL(15,2) NOT NULL,               -- จำนวนเงินที่ชำระ
    remaining_balance DECIMAL(15,2) NOT NULL,         -- ยอดเงินกู้คงเหลือหลังชำระ
    payment_method VARCHAR(50) NOT NULL,              -- วิธีการชำระ (โอนเงิน, เงินสด ฯลฯ)
    transaction_reference VARCHAR(100) DEFAULT NULL,  -- หมายเลขอ้างอิงการทำธุรกรรม (ถ้ามี)
    created_by INT(11) DEFAULT NULL,                  -- ผู้บันทึกข้อมูล
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,   -- เวลาที่สร้างรายการ
    updated_by INT(11) DEFAULT NULL,                  -- ผู้ที่อัปเดตรายการล่าสุด
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES loanagreement(loan_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES loanagreement(member_id) ON DELETE CASCADE
);
