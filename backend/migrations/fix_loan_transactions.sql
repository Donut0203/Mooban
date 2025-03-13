-- แก้ไขปัญหาการแสดงยอดเงินกู้และการแยกธุรกรรมรับเงินกู้ออกจากเงินฝาก

-- 1. เพิ่มคอลัมน์ loan_id ในตาราง transactions ถ้ายังไม่มี
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS loan_id INT(11) NULL AFTER member_id;

-- 2. เพิ่ม foreign key เชื่อมโยงกับตาราง loanagreement
ALTER TABLE transactions 
ADD CONSTRAINT IF NOT EXISTS fk_transactions_loan_id 
FOREIGN KEY (loan_id) REFERENCES loanagreement(loan_id) ON DELETE SET NULL;

-- 3. อัปเดตข้อมูลธุรกรรมเงินกู้ที่มีอยู่ให้เชื่อมโยงกับสินเชื่อ
-- หาธุรกรรมประเภท loan_disbursement และ loan_repayment ที่ยังไม่มี loan_id
UPDATE transactions t
JOIN loanagreement l ON t.member_id = l.member_id
SET t.loan_id = l.loan_id
WHERE t.transaction_status IN ('loan_disbursement', 'loan_repayment') 
AND t.loan_id IS NULL;

-- 4. แก้ไขข้อมูลในตาราง deposit_balance ให้ถูกต้อง
-- ตรวจสอบและแก้ไขข้อมูลที่ไม่ถูกต้อง
UPDATE deposit_balance 
SET loan_balance = 0 
WHERE loan_balance < 0;

-- 5. คำนวณยอดเงินกู้ที่ถูกต้องจากธุรกรรมทั้งหมด
-- สร้างตารางชั่วคราวเพื่อเก็บยอดเงินกู้ที่คำนวณใหม่
CREATE TEMPORARY TABLE temp_loan_balances AS
SELECT 
  member_id,
  SUM(CASE 
    WHEN transaction_status = 'loan_disbursement' THEN amount
    WHEN transaction_status = 'loan_repayment' THEN -amount
    ELSE 0
  END) AS calculated_loan_balance
FROM 
  transactions
WHERE 
  transaction_status IN ('loan_disbursement', 'loan_repayment')
GROUP BY 
  member_id;

-- 6. อัปเดตยอดเงินกู้ในตาราง deposit_balance ด้วยค่าที่คำนวณใหม่
UPDATE deposit_balance db
JOIN temp_loan_balances tlb ON db.member_id = tlb.member_id
SET db.loan_balance = GREATEST(tlb.calculated_loan_balance, 0);

-- 7. สร้างสมาชิกที่ยังไม่มีในตาราง deposit_balance
INSERT INTO deposit_balance (member_id, deposit_balance, loan_balance)
SELECT 
  tlb.member_id, 
  0 AS deposit_balance, 
  GREATEST(tlb.calculated_loan_balance, 0) AS loan_balance
FROM 
  temp_loan_balances tlb
LEFT JOIN 
  deposit_balance db ON tlb.member_id = db.member_id
WHERE 
  db.member_id IS NULL;

-- 8. สร้างวิวสำหรับแสดงข้อมูลสมาชิกพร้อมยอดเงินฝากและยอดเงินกู้
CREATE OR REPLACE VIEW member_with_balance AS
SELECT 
  m.*, 
  COALESCE(db.deposit_balance, 0) AS deposit_balance,
  COALESCE(db.loan_balance, 0) AS loan_balance
FROM 
  member m
LEFT JOIN 
  deposit_balance db ON m.member_id = db.member_id;

-- 9. สร้างวิวสำหรับแสดงข้อมูลธุรกรรมแยกตามประเภท
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
VALUES ('fix_loan_transactions', 'แก้ไขปัญหาการแสดงยอดเงินกู้และการแยกธุรกรรมรับเงินกู้ออกจากเงินฝาก', NOW());