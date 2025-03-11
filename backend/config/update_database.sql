-- 1. เพิ่มคอลัมน์ใหม่ในตาราง users (ถ้ายังไม่มี)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '' AFTER phone,
ADD COLUMN IF NOT EXISTS status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN IF NOT EXISTS approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- 2. อัปเดตข้อมูลผู้ใช้ที่มีอยู่แล้ว
-- ตั้งค่า natcha@gmail.com เป็นผู้ใหญ่บ้านและอนุมัติแล้ว
UPDATE users 
SET 
  first_name = 'Natcha',
  last_name = 'Admin',
  phone = '0812345678',
  address = 'หมู่บ้านตัวอย่าง',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE user_email = 'natcha@gmail.com';

-- ตั้งค่าผู้ใช้อื่นๆ เป็นลูกบ้านและยังไม่ได้รับการอนุมัติ
UPDATE users 
SET 
  first_name = 'User',
  last_name = CONCAT('No.', user_id),
  phone = CONCAT('08', FLOOR(RAND() * 90000000) + 10000000),
  address = 'หมู่บ้านตัวอย่าง',
  status = 'villager',
  is_approved = FALSE
WHERE user_email != 'natcha@gmail.com';

-- 3. สร้างผู้ใช้ใหม่เพิ่มเติม (ผู้ช่วยผู้ใหญ่บ้าน)
-- ตรวจสอบว่ามีผู้ใช้ assistant@gmail.com หรือไม่
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  approved_by, 
  approval_date, 
  created_at, 
  updated_at
)
SELECT 
  'assistant@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'ผู้ช่วย', 
  'ผู้ใหญ่บ้าน', 
  '0823456789', 
  'หมู่บ้านตัวอย่าง', 
  'assistant', 
  TRUE, 
  (SELECT user_id FROM users WHERE user_email = 'natcha@gmail.com' LIMIT 1), 
  NOW(), 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'assistant@gmail.com');

-- 4. สร้างผู้ใช้ใหม่ที่รอการอนุมัติ
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending1@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 1', 
  '0834567890', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending1@gmail.com');

INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending2@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 2', 
  '0845678901', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending2@gmail.com');

-- หมายเหตุ: รหัสผ่านที่ใช้ ($2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi) คือ hash ของ "Natcha1234"-- 1. เพิ่มคอลัมน์ใหม่ในตาราง users (ถ้ายังไม่มี)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '' AFTER phone,
ADD COLUMN IF NOT EXISTS status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN IF NOT EXISTS approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- 2. อัปเดตข้อมูลผู้ใช้ที่มีอยู่แล้ว
-- ตั้งค่า natcha@gmail.com เป็นผู้ใหญ่บ้านและอนุมัติแล้ว
UPDATE users 
SET 
  first_name = 'Natcha',
  last_name = 'Admin',
  phone = '0812345678',
  address = 'หมู่บ้านตัวอย่าง',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE user_email = 'natcha@gmail.com';

-- ตั้งค่าผู้ใช้อื่นๆ เป็นลูกบ้านและยังไม่ได้รับการอนุมัติ
UPDATE users 
SET 
  first_name = 'User',
  last_name = CONCAT('No.', user_id),
  phone = CONCAT('08', FLOOR(RAND() * 90000000) + 10000000),
  address = 'หมู่บ้านตัวอย่าง',
  status = 'villager',
  is_approved = FALSE
WHERE user_email != 'natcha@gmail.com';

-- 3. สร้างผู้ใช้ใหม่เพิ่มเติม (ผู้ช่วยผู้ใหญ่บ้าน)
-- ตรวจสอบว่ามีผู้ใช้ assistant@gmail.com หรือไม่
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  approved_by, 
  approval_date, 
  created_at, 
  updated_at
)
SELECT 
  'assistant@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'ผู้ช่วย', 
  'ผู้ใหญ่บ้าน', 
  '0823456789', 
  'หมู่บ้านตัวอย่าง', 
  'assistant', 
  TRUE, 
  (SELECT user_id FROM users WHERE user_email = 'natcha@gmail.com' LIMIT 1), 
  NOW(), 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'assistant@gmail.com');

-- 4. สร้างผู้ใช้ใหม่ที่รอการอนุมัติ
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending1@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 1', 
  '0834567890', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending1@gmail.com');

INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending2@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 2', 
  '0845678901', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending2@gmail.com');

-- หมายเหตุ: รหัสผ่านที่ใช้ ($2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi) คือ hash ของ "Natcha1234"-- 1. เพิ่มคอลัมน์ใหม่ในตาราง users (ถ้ายังไม่มี)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '' AFTER phone,
ADD COLUMN IF NOT EXISTS status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN IF NOT EXISTS approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- 2. อัปเดตข้อมูลผู้ใช้ที่มีอยู่แล้ว
-- ตั้งค่า natcha@gmail.com เป็นผู้ใหญ่บ้านและอนุมัติแล้ว
UPDATE users 
SET 
  first_name = 'Natcha',
  last_name = 'Admin',
  phone = '0812345678',
  address = 'หมู่บ้านตัวอย่าง',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE user_email = 'natcha@gmail.com';

-- ตั้งค่าผู้ใช้อื่นๆ เป็นลูกบ้านและยังไม่ได้รับการอนุมัติ
UPDATE users 
SET 
  first_name = 'User',
  last_name = CONCAT('No.', user_id),
  phone = CONCAT('08', FLOOR(RAND() * 90000000) + 10000000),
  address = 'หมู่บ้านตัวอย่าง',
  status = 'villager',
  is_approved = FALSE
WHERE user_email != 'natcha@gmail.com';

-- 3. สร้างผู้ใช้ใหม่เพิ่มเติม (ผู้ช่วยผู้ใหญ่บ้าน)
-- ตรวจสอบว่ามีผู้ใช้ assistant@gmail.com หรือไม่
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  approved_by, 
  approval_date, 
  created_at, 
  updated_at
)
SELECT 
  'assistant@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'ผู้ช่วย', 
  'ผู้ใหญ่บ้าน', 
  '0823456789', 
  'หมู่บ้านตัวอย่าง', 
  'assistant', 
  TRUE, 
  (SELECT user_id FROM users WHERE user_email = 'natcha@gmail.com' LIMIT 1), 
  NOW(), 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'assistant@gmail.com');

-- 4. สร้างผู้ใช้ใหม่ที่รอการอนุมัติ
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending1@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 1', 
  '0834567890', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending1@gmail.com');

INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending2@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 2', 
  '0845678901', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending2@gmail.com');

-- หมายเหตุ: รหัสผ่านที่ใช้ ($2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi) คือ hash ของ "Natcha1234"-- 1. เพิ่มคอลัมน์ใหม่ในตาราง users (ถ้ายังไม่มี)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '' AFTER phone,
ADD COLUMN IF NOT EXISTS status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN IF NOT EXISTS approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- 2. อัปเดตข้อมูลผู้ใช้ที่มีอยู่แล้ว
-- ตั้งค่า natcha@gmail.com เป็นผู้ใหญ่บ้านและอนุมัติแล้ว
UPDATE users 
SET 
  first_name = 'Natcha',
  last_name = 'Admin',
  phone = '0812345678',
  address = 'หมู่บ้านตัวอย่าง',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE user_email = 'natcha@gmail.com';

-- ตั้งค่าผู้ใช้อื่นๆ เป็นลูกบ้านและยังไม่ได้รับการอนุมัติ
UPDATE users 
SET 
  first_name = 'User',
  last_name = CONCAT('No.', user_id),
  phone = CONCAT('08', FLOOR(RAND() * 90000000) + 10000000),
  address = 'หมู่บ้านตัวอย่าง',
  status = 'villager',
  is_approved = FALSE
WHERE user_email != 'natcha@gmail.com';

-- 3. สร้างผู้ใช้ใหม่เพิ่มเติม (ผู้ช่วยผู้ใหญ่บ้าน)
-- ตรวจสอบว่ามีผู้ใช้ assistant@gmail.com หรือไม่
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  approved_by, 
  approval_date, 
  created_at, 
  updated_at
)
SELECT 
  'assistant@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'ผู้ช่วย', 
  'ผู้ใหญ่บ้าน', 
  '0823456789', 
  'หมู่บ้านตัวอย่าง', 
  'assistant', 
  TRUE, 
  (SELECT user_id FROM users WHERE user_email = 'natcha@gmail.com' LIMIT 1), 
  NOW(), 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'assistant@gmail.com');

-- 4. สร้างผู้ใช้ใหม่ที่รอการอนุมัติ
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending1@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 1', 
  '0834567890', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending1@gmail.com');

INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending2@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 2', 
  '0845678901', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending2@gmail.com');

-- หมายเหตุ: รหัสผ่านที่ใช้ ($2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi) คือ hash ของ "Natcha1234"-- 1. เพิ่มคอลัมน์ใหม่ในตาราง users (ถ้ายังไม่มี)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '' AFTER phone,
ADD COLUMN IF NOT EXISTS status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN IF NOT EXISTS approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- 2. อัปเดตข้อมูลผู้ใช้ที่มีอยู่แล้ว
-- ตั้งค่า natcha@gmail.com เป็นผู้ใหญ่บ้านและอนุมัติแล้ว
UPDATE users 
SET 
  first_name = 'Natcha',
  last_name = 'Admin',
  phone = '0812345678',
  address = 'หมู่บ้านตัวอย่าง',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE user_email = 'natcha@gmail.com';

-- ตั้งค่าผู้ใช้อื่นๆ เป็นลูกบ้านและยังไม่ได้รับการอนุมัติ
UPDATE users 
SET 
  first_name = 'User',
  last_name = CONCAT('No.', user_id),
  phone = CONCAT('08', FLOOR(RAND() * 90000000) + 10000000),
  address = 'หมู่บ้านตัวอย่าง',
  status = 'villager',
  is_approved = FALSE
WHERE user_email != 'natcha@gmail.com';

-- 3. สร้างผู้ใช้ใหม่เพิ่มเติม (ผู้ช่วยผู้ใหญ่บ้าน)
-- ตรวจสอบว่ามีผู้ใช้ assistant@gmail.com หรือไม่
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  approved_by, 
  approval_date, 
  created_at, 
  updated_at
)
SELECT 
  'assistant@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'ผู้ช่วย', 
  'ผู้ใหญ่บ้าน', 
  '0823456789', 
  'หมู่บ้านตัวอย่าง', 
  'assistant', 
  TRUE, 
  (SELECT user_id FROM users WHERE user_email = 'natcha@gmail.com' LIMIT 1), 
  NOW(), 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'assistant@gmail.com');

-- 4. สร้างผู้ใช้ใหม่ที่รอการอนุมัติ
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending1@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 1', 
  '0834567890', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending1@gmail.com');

INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending2@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 2', 
  '0845678901', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending2@gmail.com');

-- หมายเหตุ: รหัสผ่านที่ใช้ ($2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi) คือ hash ของ "Natcha1234"-- 1. เพิ่มคอลัมน์ใหม่ในตาราง users (ถ้ายังไม่มี)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '' AFTER phone,
ADD COLUMN IF NOT EXISTS status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN IF NOT EXISTS approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- 2. อัปเดตข้อมูลผู้ใช้ที่มีอยู่แล้ว
-- ตั้งค่า natcha@gmail.com เป็นผู้ใหญ่บ้านและอนุมัติแล้ว
UPDATE users 
SET 
  first_name = 'Natcha',
  last_name = 'Admin',
  phone = '0812345678',
  address = 'หมู่บ้านตัวอย่าง',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE user_email = 'natcha@gmail.com';

-- ตั้งค่าผู้ใช้อื่นๆ เป็นลูกบ้านและยังไม่ได้รับการอนุมัติ
UPDATE users 
SET 
  first_name = 'User',
  last_name = CONCAT('No.', user_id),
  phone = CONCAT('08', FLOOR(RAND() * 90000000) + 10000000),
  address = 'หมู่บ้านตัวอย่าง',
  status = 'villager',
  is_approved = FALSE
WHERE user_email != 'natcha@gmail.com';

-- 3. สร้างผู้ใช้ใหม่เพิ่มเติม (ผู้ช่วยผู้ใหญ่บ้าน)
-- ตรวจสอบว่ามีผู้ใช้ assistant@gmail.com หรือไม่
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  approved_by, 
  approval_date, 
  created_at, 
  updated_at
)
SELECT 
  'assistant@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'ผู้ช่วย', 
  'ผู้ใหญ่บ้าน', 
  '0823456789', 
  'หมู่บ้านตัวอย่าง', 
  'assistant', 
  TRUE, 
  (SELECT user_id FROM users WHERE user_email = 'natcha@gmail.com' LIMIT 1), 
  NOW(), 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'assistant@gmail.com');

-- 4. สร้างผู้ใช้ใหม่ที่รอการอนุมัติ
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending1@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 1', 
  '0834567890', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending1@gmail.com');

INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending2@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 2', 
  '0845678901', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending2@gmail.com');

-- หมายเหตุ: รหัสผ่านที่ใช้ ($2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi) คือ hash ของ "Natcha1234"-- 1. เพิ่มคอลัมน์ใหม่ในตาราง users (ถ้ายังไม่มี)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '' AFTER phone,
ADD COLUMN IF NOT EXISTS status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN IF NOT EXISTS approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- 2. อัปเดตข้อมูลผู้ใช้ที่มีอยู่แล้ว
-- ตั้งค่า natcha@gmail.com เป็นผู้ใหญ่บ้านและอนุมัติแล้ว
UPDATE users 
SET 
  first_name = 'Natcha',
  last_name = 'Admin',
  phone = '0812345678',
  address = 'หมู่บ้านตัวอย่าง',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE user_email = 'natcha@gmail.com';

-- ตั้งค่าผู้ใช้อื่นๆ เป็นลูกบ้านและยังไม่ได้รับการอนุมัติ
UPDATE users 
SET 
  first_name = 'User',
  last_name = CONCAT('No.', user_id),
  phone = CONCAT('08', FLOOR(RAND() * 90000000) + 10000000),
  address = 'หมู่บ้านตัวอย่าง',
  status = 'villager',
  is_approved = FALSE
WHERE user_email != 'natcha@gmail.com';

-- 3. สร้างผู้ใช้ใหม่เพิ่มเติม (ผู้ช่วยผู้ใหญ่บ้าน)
-- ตรวจสอบว่ามีผู้ใช้ assistant@gmail.com หรือไม่
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  approved_by, 
  approval_date, 
  created_at, 
  updated_at
)
SELECT 
  'assistant@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'ผู้ช่วย', 
  'ผู้ใหญ่บ้าน', 
  '0823456789', 
  'หมู่บ้านตัวอย่าง', 
  'assistant', 
  TRUE, 
  (SELECT user_id FROM users WHERE user_email = 'natcha@gmail.com' LIMIT 1), 
  NOW(), 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'assistant@gmail.com');

-- 4. สร้างผู้ใช้ใหม่ที่รอการอนุมัติ
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending1@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 1', 
  '0834567890', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending1@gmail.com');

INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending2@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 2', 
  '0845678901', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending2@gmail.com');

-- หมายเหตุ: รหัสผ่านที่ใช้ ($2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi) คือ hash ของ "Natcha1234"-- 1. เพิ่มคอลัมน์ใหม่ในตาราง users (ถ้ายังไม่มี)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '' AFTER phone,
ADD COLUMN IF NOT EXISTS status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN IF NOT EXISTS approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- 2. อัปเดตข้อมูลผู้ใช้ที่มีอยู่แล้ว
-- ตั้งค่า natcha@gmail.com เป็นผู้ใหญ่บ้านและอนุมัติแล้ว
UPDATE users 
SET 
  first_name = 'Natcha',
  last_name = 'Admin',
  phone = '0812345678',
  address = 'หมู่บ้านตัวอย่าง',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE user_email = 'natcha@gmail.com';

-- ตั้งค่าผู้ใช้อื่นๆ เป็นลูกบ้านและยังไม่ได้รับการอนุมัติ
UPDATE users 
SET 
  first_name = 'User',
  last_name = CONCAT('No.', user_id),
  phone = CONCAT('08', FLOOR(RAND() * 90000000) + 10000000),
  address = 'หมู่บ้านตัวอย่าง',
  status = 'villager',
  is_approved = FALSE
WHERE user_email != 'natcha@gmail.com';

-- 3. สร้างผู้ใช้ใหม่เพิ่มเติม (ผู้ช่วยผู้ใหญ่บ้าน)
-- ตรวจสอบว่ามีผู้ใช้ assistant@gmail.com หรือไม่
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  approved_by, 
  approval_date, 
  created_at, 
  updated_at
)
SELECT 
  'assistant@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'ผู้ช่วย', 
  'ผู้ใหญ่บ้าน', 
  '0823456789', 
  'หมู่บ้านตัวอย่าง', 
  'assistant', 
  TRUE, 
  (SELECT user_id FROM users WHERE user_email = 'natcha@gmail.com' LIMIT 1), 
  NOW(), 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'assistant@gmail.com');

-- 4. สร้างผู้ใช้ใหม่ที่รอการอนุมัติ
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending1@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 1', 
  '0834567890', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending1@gmail.com');

INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending2@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 2', 
  '0845678901', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending2@gmail.com');

-- หมายเหตุ: รหัสผ่านที่ใช้ ($2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi) คือ hash ของ "Natcha1234"-- 1. เพิ่มคอลัมน์ใหม่ในตาราง users (ถ้ายังไม่มี)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '' AFTER phone,
ADD COLUMN IF NOT EXISTS status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN IF NOT EXISTS approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- 2. อัปเดตข้อมูลผู้ใช้ที่มีอยู่แล้ว
-- ตั้งค่า natcha@gmail.com เป็นผู้ใหญ่บ้านและอนุมัติแล้ว
UPDATE users 
SET 
  first_name = 'Natcha',
  last_name = 'Admin',
  phone = '0812345678',
  address = 'หมู่บ้านตัวอย่าง',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE user_email = 'natcha@gmail.com';

-- ตั้งค่าผู้ใช้อื่นๆ เป็นลูกบ้านและยังไม่ได้รับการอนุมัติ
UPDATE users 
SET 
  first_name = 'User',
  last_name = CONCAT('No.', user_id),
  phone = CONCAT('08', FLOOR(RAND() * 90000000) + 10000000),
  address = 'หมู่บ้านตัวอย่าง',
  status = 'villager',
  is_approved = FALSE
WHERE user_email != 'natcha@gmail.com';

-- 3. สร้างผู้ใช้ใหม่เพิ่มเติม (ผู้ช่วยผู้ใหญ่บ้าน)
-- ตรวจสอบว่ามีผู้ใช้ assistant@gmail.com หรือไม่
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  approved_by, 
  approval_date, 
  created_at, 
  updated_at
)
SELECT 
  'assistant@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'ผู้ช่วย', 
  'ผู้ใหญ่บ้าน', 
  '0823456789', 
  'หมู่บ้านตัวอย่าง', 
  'assistant', 
  TRUE, 
  (SELECT user_id FROM users WHERE user_email = 'natcha@gmail.com' LIMIT 1), 
  NOW(), 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'assistant@gmail.com');

-- 4. สร้างผู้ใช้ใหม่ที่รอการอนุมัติ
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending1@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 1', 
  '0834567890', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending1@gmail.com');

INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending2@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 2', 
  '0845678901', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending2@gmail.com');

-- หมายเหตุ: รหัสผ่านที่ใช้ ($2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi) คือ hash ของ "Natcha1234"-- 1. เพิ่มคอลัมน์ใหม่ในตาราง users (ถ้ายังไม่มี)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '' AFTER phone,
ADD COLUMN IF NOT EXISTS status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN IF NOT EXISTS approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- 2. อัปเดตข้อมูลผู้ใช้ที่มีอยู่แล้ว
-- ตั้งค่า natcha@gmail.com เป็นผู้ใหญ่บ้านและอนุมัติแล้ว
UPDATE users 
SET 
  first_name = 'Natcha',
  last_name = 'Admin',
  phone = '0812345678',
  address = 'หมู่บ้านตัวอย่าง',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE user_email = 'natcha@gmail.com';

-- ตั้งค่าผู้ใช้อื่นๆ เป็นลูกบ้านและยังไม่ได้รับการอนุมัติ
UPDATE users 
SET 
  first_name = 'User',
  last_name = CONCAT('No.', user_id),
  phone = CONCAT('08', FLOOR(RAND() * 90000000) + 10000000),
  address = 'หมู่บ้านตัวอย่าง',
  status = 'villager',
  is_approved = FALSE
WHERE user_email != 'natcha@gmail.com';

-- 3. สร้างผู้ใช้ใหม่เพิ่มเติม (ผู้ช่วยผู้ใหญ่บ้าน)
-- ตรวจสอบว่ามีผู้ใช้ assistant@gmail.com หรือไม่
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  approved_by, 
  approval_date, 
  created_at, 
  updated_at
)
SELECT 
  'assistant@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'ผู้ช่วย', 
  'ผู้ใหญ่บ้าน', 
  '0823456789', 
  'หมู่บ้านตัวอย่าง', 
  'assistant', 
  TRUE, 
  (SELECT user_id FROM users WHERE user_email = 'natcha@gmail.com' LIMIT 1), 
  NOW(), 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'assistant@gmail.com');

-- 4. สร้างผู้ใช้ใหม่ที่รอการอนุมัติ
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending1@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 1', 
  '0834567890', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending1@gmail.com');

INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending2@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 2', 
  '0845678901', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending2@gmail.com');

-- หมายเหตุ: รหัสผ่านที่ใช้ ($2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi) คือ hash ของ "Natcha1234"-- 1. เพิ่มคอลัมน์ใหม่ในตาราง users (ถ้ายังไม่มี)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '' AFTER phone,
ADD COLUMN IF NOT EXISTS status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN IF NOT EXISTS approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- 2. อัปเดตข้อมูลผู้ใช้ที่มีอยู่แล้ว
-- ตั้งค่า natcha@gmail.com เป็นผู้ใหญ่บ้านและอนุมัติแล้ว
UPDATE users 
SET 
  first_name = 'Natcha',
  last_name = 'Admin',
  phone = '0812345678',
  address = 'หมู่บ้านตัวอย่าง',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE user_email = 'natcha@gmail.com';

-- ตั้งค่าผู้ใช้อื่นๆ เป็นลูกบ้านและยังไม่ได้รับการอนุมัติ
UPDATE users 
SET 
  first_name = 'User',
  last_name = CONCAT('No.', user_id),
  phone = CONCAT('08', FLOOR(RAND() * 90000000) + 10000000),
  address = 'หมู่บ้านตัวอย่าง',
  status = 'villager',
  is_approved = FALSE
WHERE user_email != 'natcha@gmail.com';

-- 3. สร้างผู้ใช้ใหม่เพิ่มเติม (ผู้ช่วยผู้ใหญ่บ้าน)
-- ตรวจสอบว่ามีผู้ใช้ assistant@gmail.com หรือไม่
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  approved_by, 
  approval_date, 
  created_at, 
  updated_at
)
SELECT 
  'assistant@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'ผู้ช่วย', 
  'ผู้ใหญ่บ้าน', 
  '0823456789', 
  'หมู่บ้านตัวอย่าง', 
  'assistant', 
  TRUE, 
  (SELECT user_id FROM users WHERE user_email = 'natcha@gmail.com' LIMIT 1), 
  NOW(), 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'assistant@gmail.com');

-- 4. สร้างผู้ใช้ใหม่ที่รอการอนุมัติ
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending1@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 1', 
  '0834567890', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending1@gmail.com');

INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending2@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 2', 
  '0845678901', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending2@gmail.com');

-- หมายเหตุ: รหัสผ่านที่ใช้ ($2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi) คือ hash ของ "Natcha1234"-- 1. เพิ่มคอลัมน์ใหม่ในตาราง users (ถ้ายังไม่มี)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '' AFTER phone,
ADD COLUMN IF NOT EXISTS status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN IF NOT EXISTS approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- 2. อัปเดตข้อมูลผู้ใช้ที่มีอยู่แล้ว
-- ตั้งค่า natcha@gmail.com เป็นผู้ใหญ่บ้านและอนุมัติแล้ว
UPDATE users 
SET 
  first_name = 'Natcha',
  last_name = 'Admin',
  phone = '0812345678',
  address = 'หมู่บ้านตัวอย่าง',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE user_email = 'natcha@gmail.com';

-- ตั้งค่าผู้ใช้อื่นๆ เป็นลูกบ้านและยังไม่ได้รับการอนุมัติ
UPDATE users 
SET 
  first_name = 'User',
  last_name = CONCAT('No.', user_id),
  phone = CONCAT('08', FLOOR(RAND() * 90000000) + 10000000),
  address = 'หมู่บ้านตัวอย่าง',
  status = 'villager',
  is_approved = FALSE
WHERE user_email != 'natcha@gmail.com';

-- 3. สร้างผู้ใช้ใหม่เพิ่มเติม (ผู้ช่วยผู้ใหญ่บ้าน)
-- ตรวจสอบว่ามีผู้ใช้ assistant@gmail.com หรือไม่
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  approved_by, 
  approval_date, 
  created_at, 
  updated_at
)
SELECT 
  'assistant@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'ผู้ช่วย', 
  'ผู้ใหญ่บ้าน', 
  '0823456789', 
  'หมู่บ้านตัวอย่าง', 
  'assistant', 
  TRUE, 
  (SELECT user_id FROM users WHERE user_email = 'natcha@gmail.com' LIMIT 1), 
  NOW(), 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'assistant@gmail.com');

-- 4. สร้างผู้ใช้ใหม่ที่รอการอนุมัติ
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending1@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 1', 
  '0834567890', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending1@gmail.com');

INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending2@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 2', 
  '0845678901', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending2@gmail.com');

-- หมายเหตุ: รหัสผ่านที่ใช้ ($2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi) คือ hash ของ "Natcha1234"-- 1. เพิ่มคอลัมน์ใหม่ในตาราง users (ถ้ายังไม่มี)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '' AFTER phone,
ADD COLUMN IF NOT EXISTS status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN IF NOT EXISTS approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- 2. อัปเดตข้อมูลผู้ใช้ที่มีอยู่แล้ว
-- ตั้งค่า natcha@gmail.com เป็นผู้ใหญ่บ้านและอนุมัติแล้ว
UPDATE users 
SET 
  first_name = 'Natcha',
  last_name = 'Admin',
  phone = '0812345678',
  address = 'หมู่บ้านตัวอย่าง',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE user_email = 'natcha@gmail.com';

-- ตั้งค่าผู้ใช้อื่นๆ เป็นลูกบ้านและยังไม่ได้รับการอนุมัติ
UPDATE users 
SET 
  first_name = 'User',
  last_name = CONCAT('No.', user_id),
  phone = CONCAT('08', FLOOR(RAND() * 90000000) + 10000000),
  address = 'หมู่บ้านตัวอย่าง',
  status = 'villager',
  is_approved = FALSE
WHERE user_email != 'natcha@gmail.com';

-- 3. สร้างผู้ใช้ใหม่เพิ่มเติม (ผู้ช่วยผู้ใหญ่บ้าน)
-- ตรวจสอบว่ามีผู้ใช้ assistant@gmail.com หรือไม่
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  approved_by, 
  approval_date, 
  created_at, 
  updated_at
)
SELECT 
  'assistant@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'ผู้ช่วย', 
  'ผู้ใหญ่บ้าน', 
  '0823456789', 
  'หมู่บ้านตัวอย่าง', 
  'assistant', 
  TRUE, 
  (SELECT user_id FROM users WHERE user_email = 'natcha@gmail.com' LIMIT 1), 
  NOW(), 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'assistant@gmail.com');

-- 4. สร้างผู้ใช้ใหม่ที่รอการอนุมัติ
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending1@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 1', 
  '0834567890', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending1@gmail.com');

INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending2@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 2', 
  '0845678901', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending2@gmail.com');

-- หมายเหตุ: รหัสผ่านที่ใช้ ($2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi) คือ hash ของ "Natcha1234"-- 1. เพิ่มคอลัมน์ใหม่ในตาราง users (ถ้ายังไม่มี)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '' AFTER phone,
ADD COLUMN IF NOT EXISTS status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN IF NOT EXISTS approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- 2. อัปเดตข้อมูลผู้ใช้ที่มีอยู่แล้ว
-- ตั้งค่า natcha@gmail.com เป็นผู้ใหญ่บ้านและอนุมัติแล้ว
UPDATE users 
SET 
  first_name = 'Natcha',
  last_name = 'Admin',
  phone = '0812345678',
  address = 'หมู่บ้านตัวอย่าง',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE user_email = 'natcha@gmail.com';

-- ตั้งค่าผู้ใช้อื่นๆ เป็นลูกบ้านและยังไม่ได้รับการอนุมัติ
UPDATE users 
SET 
  first_name = 'User',
  last_name = CONCAT('No.', user_id),
  phone = CONCAT('08', FLOOR(RAND() * 90000000) + 10000000),
  address = 'หมู่บ้านตัวอย่าง',
  status = 'villager',
  is_approved = FALSE
WHERE user_email != 'natcha@gmail.com';

-- 3. สร้างผู้ใช้ใหม่เพิ่มเติม (ผู้ช่วยผู้ใหญ่บ้าน)
-- ตรวจสอบว่ามีผู้ใช้ assistant@gmail.com หรือไม่
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  approved_by, 
  approval_date, 
  created_at, 
  updated_at
)
SELECT 
  'assistant@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'ผู้ช่วย', 
  'ผู้ใหญ่บ้าน', 
  '0823456789', 
  'หมู่บ้านตัวอย่าง', 
  'assistant', 
  TRUE, 
  (SELECT user_id FROM users WHERE user_email = 'natcha@gmail.com' LIMIT 1), 
  NOW(), 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'assistant@gmail.com');

-- 4. สร้างผู้ใช้ใหม่ที่รอการอนุมัติ
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending1@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 1', 
  '0834567890', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending1@gmail.com');

INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending2@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 2', 
  '0845678901', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending2@gmail.com');

-- หมายเหตุ: รหัสผ่านที่ใช้ ($2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi) คือ hash ของ "Natcha1234"-- 1. เพิ่มคอลัมน์ใหม่ในตาราง users (ถ้ายังไม่มี)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '' AFTER phone,
ADD COLUMN IF NOT EXISTS status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN IF NOT EXISTS approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- 2. อัปเดตข้อมูลผู้ใช้ที่มีอยู่แล้ว
-- ตั้งค่า natcha@gmail.com เป็นผู้ใหญ่บ้านและอนุมัติแล้ว
UPDATE users 
SET 
  first_name = 'Natcha',
  last_name = 'Admin',
  phone = '0812345678',
  address = 'หมู่บ้านตัวอย่าง',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE user_email = 'natcha@gmail.com';

-- ตั้งค่าผู้ใช้อื่นๆ เป็นลูกบ้านและยังไม่ได้รับการอนุมัติ
UPDATE users 
SET 
  first_name = 'User',
  last_name = CONCAT('No.', user_id),
  phone = CONCAT('08', FLOOR(RAND() * 90000000) + 10000000),
  address = 'หมู่บ้านตัวอย่าง',
  status = 'villager',
  is_approved = FALSE
WHERE user_email != 'natcha@gmail.com';

-- 3. สร้างผู้ใช้ใหม่เพิ่มเติม (ผู้ช่วยผู้ใหญ่บ้าน)
-- ตรวจสอบว่ามีผู้ใช้ assistant@gmail.com หรือไม่
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  approved_by, 
  approval_date, 
  created_at, 
  updated_at
)
SELECT 
  'assistant@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'ผู้ช่วย', 
  'ผู้ใหญ่บ้าน', 
  '0823456789', 
  'หมู่บ้านตัวอย่าง', 
  'assistant', 
  TRUE, 
  (SELECT user_id FROM users WHERE user_email = 'natcha@gmail.com' LIMIT 1), 
  NOW(), 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'assistant@gmail.com');

-- 4. สร้างผู้ใช้ใหม่ที่รอการอนุมัติ
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending1@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 1', 
  '0834567890', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending1@gmail.com');

INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending2@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 2', 
  '0845678901', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending2@gmail.com');

-- หมายเหตุ: รหัสผ่านที่ใช้ ($2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi) คือ hash ของ "Natcha1234"-- 1. เพิ่มคอลัมน์ใหม่ในตาราง users (ถ้ายังไม่มี)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '' AFTER phone,
ADD COLUMN IF NOT EXISTS status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN IF NOT EXISTS approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- 2. อัปเดตข้อมูลผู้ใช้ที่มีอยู่แล้ว
-- ตั้งค่า natcha@gmail.com เป็นผู้ใหญ่บ้านและอนุมัติแล้ว
UPDATE users 
SET 
  first_name = 'Natcha',
  last_name = 'Admin',
  phone = '0812345678',
  address = 'หมู่บ้านตัวอย่าง',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE user_email = 'natcha@gmail.com';

-- ตั้งค่าผู้ใช้อื่นๆ เป็นลูกบ้านและยังไม่ได้รับการอนุมัติ
UPDATE users 
SET 
  first_name = 'User',
  last_name = CONCAT('No.', user_id),
  phone = CONCAT('08', FLOOR(RAND() * 90000000) + 10000000),
  address = 'หมู่บ้านตัวอย่าง',
  status = 'villager',
  is_approved = FALSE
WHERE user_email != 'natcha@gmail.com';

-- 3. สร้างผู้ใช้ใหม่เพิ่มเติม (ผู้ช่วยผู้ใหญ่บ้าน)
-- ตรวจสอบว่ามีผู้ใช้ assistant@gmail.com หรือไม่
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  approved_by, 
  approval_date, 
  created_at, 
  updated_at
)
SELECT 
  'assistant@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'ผู้ช่วย', 
  'ผู้ใหญ่บ้าน', 
  '0823456789', 
  'หมู่บ้านตัวอย่าง', 
  'assistant', 
  TRUE, 
  (SELECT user_id FROM users WHERE user_email = 'natcha@gmail.com' LIMIT 1), 
  NOW(), 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'assistant@gmail.com');

-- 4. สร้างผู้ใช้ใหม่ที่รอการอนุมัติ
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending1@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 1', 
  '0834567890', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending1@gmail.com');

INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending2@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 2', 
  '0845678901', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending2@gmail.com');

-- หมายเหตุ: รหัสผ่านที่ใช้ ($2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi) คือ hash ของ "Natcha1234"-- 1. เพิ่มคอลัมน์ใหม่ในตาราง users (ถ้ายังไม่มี)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '' AFTER phone,
ADD COLUMN IF NOT EXISTS status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN IF NOT EXISTS approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- 2. อัปเดตข้อมูลผู้ใช้ที่มีอยู่แล้ว
-- ตั้งค่า natcha@gmail.com เป็นผู้ใหญ่บ้านและอนุมัติแล้ว
UPDATE users 
SET 
  first_name = 'Natcha',
  last_name = 'Admin',
  phone = '0812345678',
  address = 'หมู่บ้านตัวอย่าง',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE user_email = 'natcha@gmail.com';

-- ตั้งค่าผู้ใช้อื่นๆ เป็นลูกบ้านและยังไม่ได้รับการอนุมัติ
UPDATE users 
SET 
  first_name = 'User',
  last_name = CONCAT('No.', user_id),
  phone = CONCAT('08', FLOOR(RAND() * 90000000) + 10000000),
  address = 'หมู่บ้านตัวอย่าง',
  status = 'villager',
  is_approved = FALSE
WHERE user_email != 'natcha@gmail.com';

-- 3. สร้างผู้ใช้ใหม่เพิ่มเติม (ผู้ช่วยผู้ใหญ่บ้าน)
-- ตรวจสอบว่ามีผู้ใช้ assistant@gmail.com หรือไม่
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  approved_by, 
  approval_date, 
  created_at, 
  updated_at
)
SELECT 
  'assistant@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'ผู้ช่วย', 
  'ผู้ใหญ่บ้าน', 
  '0823456789', 
  'หมู่บ้านตัวอย่าง', 
  'assistant', 
  TRUE, 
  (SELECT user_id FROM users WHERE user_email = 'natcha@gmail.com' LIMIT 1), 
  NOW(), 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'assistant@gmail.com');

-- 4. สร้างผู้ใช้ใหม่ที่รอการอนุมัติ
INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending1@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 1', 
  '0834567890', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending1@gmail.com');

INSERT INTO users (
  user_email, 
  user_password, 
  first_name, 
  last_name, 
  phone, 
  address, 
  status, 
  is_approved, 
  created_at, 
  updated_at
)
SELECT 
  'pending2@gmail.com', 
  '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', 
  'รอ', 
  'อนุมัติ 2', 
  '0845678901', 
  'หมู่บ้านตัวอย่าง', 
  'villager', 
  FALSE, 
  NOW(), 
  NOW()
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = 'pending2@gmail.com');

-- หมายเหตุ: รหัสผ่านที่ใช้ ($2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi) คือ hash ของ "Natcha1234"