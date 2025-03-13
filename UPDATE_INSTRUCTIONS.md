# คำแนะนำในการอัปเดตระบบ

## 1. อัปเดตโครงสร้างฐานข้อมูล

ไฟล์ SQL สำหรับอัปเดตโครงสร้างฐานข้อมูลอยู่ที่ `backend/migrations/update_loan_tables.sql`

### วิธีการอัปเดตฐานข้อมูล:

1. เข้าสู่ MySQL ด้วยคำสั่ง:
```
mysql -u username -p
```

2. เลือกฐานข้อมูลที่ต้องการอัปเดต:
```
USE mooban;
```

3. นำเข้าไฟล์ SQL:
```
source /path/to/Mooban/backend/migrations/update_loan_tables.sql
```

หรือใช้ phpMyAdmin:
1. เข้าสู่ phpMyAdmin
2. เลือกฐานข้อมูล mooban
3. ไปที่แท็บ "SQL"
4. คัดลอกเนื้อหาจากไฟล์ `update_loan_tables.sql` และวางลงในช่อง
5. คลิก "Go" เพื่อรันคำสั่ง SQL

## 2. อัปเดตไฟล์ backend

1. แทนที่ไฟล์ `backend/routes/loans.js` ด้วยไฟล์ `backend/routes/loans.js.new`:
```
mv backend/routes/loans.js.new backend/routes/loans.js
```

2. ตรวจสอบว่ามีการติดตั้ง multer แล้ว:
```
cd backend
npm install multer --save
```

## 3. ทดสอบระบบ

1. รีสตาร์ท backend server:
```
cd backend
npm run dev
```

2. รีสตาร์ท frontend server:
```
cd frontend
npm run serve
```

3. ทดสอบการเพิ่มข้อมูลสินเชื่อใหม่

## หมายเหตุ

การแก้ไขนี้ได้ทำการเปลี่ยนแปลงดังนี้:

1. เพิ่มฟิลด์ในตาราง loanagreement เพื่อรองรับข้อมูลเพิ่มเติม
2. เพิ่มฟิลด์ member_id ในตาราง guarantor เพื่อเชื่อมโยงกับตาราง member
3. สร้างตาราง loan_documents เพื่อเก็บข้อมูลไฟล์เอกสาร
4. สร้างตาราง migrations เพื่อติดตามการเปลี่ยนแปลงโครงสร้างฐานข้อมูล
5. ปรับปรุงการบันทึกข้อมูลสินเชื่อให้รองรับการอัปโหลดไฟล์
6. เพิ่มการบันทึกธุรกรรมการรับเงินกู้และอัปเดตยอดเงินกู้ในตาราง deposit_balance

หากมีปัญหาในการอัปเดต กรุณาติดต่อผู้ดูแลระบบ