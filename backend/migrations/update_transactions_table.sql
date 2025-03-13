-- อัปเดตตาราง transactions เพื่อเพิ่มฟิลด์ balance
ALTER TABLE transactions ADD COLUMN balance DECIMAL(15,2) DEFAULT 0.00 AFTER amount;

-- อัปเดตตาราง transactions เพื่อเปลี่ยนชนิดของฟิลด์ transaction_status
ALTER TABLE transactions MODIFY COLUMN transaction_status ENUM('deposit', 'withdraw', 'loan_repayment', 'loan_disbursement') NOT NULL;

-- สร้างดัชนีเพื่อเพิ่มประสิทธิภาพในการค้นหา
CREATE INDEX idx_transactions_member_id ON transactions(member_id);
CREATE INDEX idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_transaction_status ON transactions(transaction_status);

-- อัปเดตตาราง deposit_balance เพื่อเพิ่มดัชนี
CREATE INDEX idx_deposit_balance_member_id ON deposit_balance(member_id);

-- บันทึกการอัปเดตโครงสร้างฐานข้อมูล
INSERT INTO migrations (migration_name, description, applied_at) 
VALUES ('update_transactions_table', 'อัปเดตตาราง transactions และเพิ่มดัชนีเพื่อเพิ่มประสิทธิภาพ', NOW());