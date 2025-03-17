# ระบบจัดการหมู่บ้าน

ระบบจัดการหมู่บ้านสำหรับผู้ใหญ่บ้านและผู้ช่วยผู้ใหญ่บ้าน

## การติดตั้ง

### Backend

1. เข้าไปที่โฟลเดอร์ backend
```
cd backend
```

2. ติดตั้ง dependencies
```
npm install
```

3. สร้างฐานข้อมูล MySQL และนำเข้าไฟล์ SQL
```
mysql -u username -p database_name < config/db.sql
mysql -u username -p database_name < config/members.sql
mysql -u username -p database_name < config/loanForm.sql
```

4. รันไฟล์ migrations เพื่ออัปเดตโครงสร้างฐานข้อมูล
```
node run_migrations.js
```

4. สร้างไฟล์ .env และกำหนดค่าต่างๆ
```
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
JWT_SECRET=your_jwt_secret
```

5. รันเซิร์ฟเวอร์
```
npm start
```

### Frontend

1. เข้าไปที่โฟลเดอร์ frontend
```
cd frontend
```

2. ติดตั้ง dependencies
```
npm install
```

3. รันเซิร์ฟเวอร์สำหรับการพัฒนา
```
npm run serve
```

4. สร้างไฟล์สำหรับการใช้งานจริง
```
npm run build
```

## การใช้งาน

### การจัดการสมาชิก

1. เข้าสู่ระบบด้วยบัญชีผู้ใหญ่บ้านหรือผู้ช่วยผู้ใหญ่บ้าน
2. ไปที่เมนู "จัดการสมาชิก"
3. สามารถเพิ่ม แก้ไข ลบ และดูรายละเอียดสมาชิกได้

### API Endpoints

#### สมาชิก

- `GET /api/members` - ดึงข้อมูลสมาชิกทั้งหมด
- `GET /api/members/:id` - ดึงข้อมูลสมาชิกตาม ID
- `POST /api/members` - เพิ่มสมาชิกใหม่
- `PUT /api/members/:id` - แก้ไขข้อมูลสมาชิก
- `DELETE /api/members/:id` - ลบข้อมูลสมาชิก

#### อัปโหลดไฟล์

- `POST /api/upload` - อัปโหลดไฟล์# Login & Register Application

A full-stack application with separate Node.js Express backend and Vue.js frontend.

## Project Structure

This project is divided into two main parts:

1. **Backend** - Node.js Express API with MySQL database
2. **Frontend** - Vue.js application with Axios and Vue Router

## Features

- User registration
- User login
- Authentication with JWT
- Protected routes

## Database Structure

The application uses a MySQL database with the following structure:

```sql
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL UNIQUE,
  user_password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Setup Instructions

### Prerequisites

- Node.js
- MySQL
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - Edit `.env` file with your database connection details

4. Set up the database:
   - Create a MySQL database
   - Run the SQL script in `config/db.sql`

5. Start the server:
   ```
   npm start
   ```
   
   For development with auto-reload:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Install PDF export dependencies:
   ```
   npm install jspdf jspdf-autotable
   ```

3. Configure environment variables:
   - Edit `.env` file with the backend API URL

4. Start the development server:
   ```
   npm run serve
   ```

5. Build for production:
   ```
   npm run build
   ```

## Default User

The system comes with a default user:
- Email: natcha@gmail.com
- Password: Natcha1234