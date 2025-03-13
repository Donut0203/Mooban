-- ปรับปรุงตาราง loanagreement เพื่อรองรับข้อมูลเพิ่มเติม
ALTER TABLE loanagreement
ADD COLUMN full_name VARCHAR(255) NULL AFTER member_id,
ADD COLUMN phone VARCHAR(20) NULL AFTER full_name,
ADD COLUMN bank_name VARCHAR(100) NULL AFTER phone,
ADD COLUMN account_number VARCHAR(50) NULL AFTER bank_name,
ADD COLUMN id_card VARCHAR(20) NULL AFTER account_number,
ADD COLUMN address TEXT NULL AFTER id_card,
ADD COLUMN subdistrict VARCHAR(100) NULL AFTER address,
ADD COLUMN district VARCHAR(100) NULL AFTER subdistrict,
ADD COLUMN province VARCHAR(100) NULL AFTER district,
ADD COLUMN postal_code VARCHAR(10) NULL AFTER province,
ADD COLUMN first_payment_date DATE NULL AFTER postal_code,
ADD COLUMN monthly_interest DECIMAL(15,2) NULL AFTER first_payment_date;

-- ปรับปรุงตาราง guarantor เพื่อรองรับข้อมูลเพิ่มเติม
ALTER TABLE guarantor
ADD COLUMN member_id INT(11) NULL AFTER loan_id,
ADD FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE SET NULL;

-- สร้างตารางเพื่อเก็บข้อมูลไฟล์เอกสาร
CREATE TABLE IF NOT EXISTS loan_documents (
  document_id INT(11) NOT NULL AUTO_INCREMENT,
  loan_id INT(11) NOT NULL,
  document_type ENUM('borrower_id_card', 'borrower_house_registration', 'guarantor1_id_card', 'guarantor1_house_registration', 'guarantor2_id_card', 'guarantor2_house_registration') NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (document_id),
  FOREIGN KEY (loan_id) REFERENCES loanagreement(loan_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- บันทึกการอัปเดตโครงสร้างฐานข้อมูล
CREATE TABLE IF NOT EXISTS migrations (
  migration_id INT(11) NOT NULL AUTO_INCREMENT,
  migration_name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (migration_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO migrations (migration_name, description, applied_at) 
VALUES ('update_loan_tables', 'ปรับปรุงตาราง loanagreement และ guarantor เพื่อรองรับข้อมูลเพิ่มเติม', NOW());