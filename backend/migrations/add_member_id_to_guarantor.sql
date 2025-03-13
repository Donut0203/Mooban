-- เพิ่มคอลัมน์ member_id ในตาราง guarantor
ALTER TABLE guarantor ADD COLUMN member_id INT NULL AFTER loan_id;

-- เพิ่ม foreign key ไปยังตาราง member
ALTER TABLE guarantor ADD CONSTRAINT fk_guarantor_member FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE SET NULL;

-- อัปเดตคำอธิบายสำหรับการเปลี่ยนแปลง
INSERT INTO migrations (migration_name, description, applied_at) 
VALUES ('add_member_id_to_guarantor', 'เพิ่มคอลัมน์ member_id ในตาราง guarantor และสร้าง foreign key ไปยังตาราง member', NOW());