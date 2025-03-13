-- อัปเดตตาราง transactions เพื่อแยกการจัดการยอดเงินกู้ออกจากยอดเงินฝาก-ถอน

-- 1. ตรวจสอบว่ามีคอลัมน์ loan_id ในตาราง transactions หรือไม่
-- ถ้าไม่มี ให้เพิ่มคอลัมน์ loan_id
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS loan_id INT(11) NULL AFTER member_id;

-- 2. เพิ่ม foreign key เชื่อมโยงกับตาราง loanagreement
ALTER TABLE transactions 
ADD CONSTRAINT IF NOT EXISTS fk_transactions_loan_id 
FOREIGN KEY (loan_id) REFERENCES loanagreement(loan_id) ON DELETE SET NULL;

-- 3. อัปเดตข้อมูลในตาราง deposit_balance ให้แยกยอดเงินกู้ออกจากยอดเงินฝาก
-- ตรวจสอบและแก้ไขข้อมูลที่ไม่ถูกต้อง
UPDATE deposit_balance 
SET loan_balance = 0 
WHERE loan_balance < 0;

-- 4. สร้างวิวสำหรับแสดงข้อมูลสมาชิกพร้อมยอดเงินฝากและยอดเงินกู้
CREATE OR REPLACE VIEW member_with_balance AS
SELECT 
  m.*, 
  COALESCE(db.deposit_balance, 0) AS deposit_balance,
  COALESCE(db.loan_balance, 0) AS loan_balance
FROM 
  member m
LEFT JOIN 
  deposit_balance db ON m.member_id = db.member_id;

-- 5. สร้างวิวสำหรับแสดงข้อมูลธุรกรรมแยกตามประเภท
CREATE OR REPLACE VIEW transactions_by_type AS
SELECT 
  t.*,
  CASE 
    WHEN t.transaction_status IN ('deposit', 'withdraw') THEN 'deposit'
    WHEN t.transaction_status IN ('loan_repayment', 'loan_disbursement') THEN 'loan'
    ELSE 'other'
  END AS transaction_category
FROM 
  transactions t;

-- บันทึกการอัปเดตโครงสร้างฐานข้อมูล
INSERT INTO migrations (migration_name, description, applied_at) 
VALUES ('separate_loan_deposit_balance', 'แยกการจัดการยอดเงินกู้ออกจากยอดเงินฝาก-ถอน', NOW());