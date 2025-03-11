# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Backend API

## การตั้งค่าอีเมลสำหรับฟีเจอร์ลืมรหัสผ่าน

ระบบใช้ Nodemailer สำหรับการส่งอีเมลในฟีเจอร์ลืมรหัสผ่าน โดยมีขั้นตอนการตั้งค่าดังนี้:

### 1. แก้ไขไฟล์ .env

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### 2. การสร้าง App Password สำหรับ Gmail

หากคุณใช้ Gmail เป็นอีเมลสำหรับส่ง คุณจะต้องสร้าง App Password แทนการใช้รหัสผ่านปกติ:

1. เปิดใช้งาน 2-Step Verification ในบัญชี Google ของคุณ
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิดใช้งาน 2-Step Verification

2. สร้าง App Password
   - ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
   - เลือก "Mail" เป็นแอปพลิเคชัน
   - เลือก "Other (Custom name)" เป็นอุปกรณ์ และตั้งชื่อเป็น "Mooban System"
   - คลิก "Generate"
   - คัดลอกรหัสผ่านที่สร้างขึ้น (รหัส 16 หลักไม่มีช่องว่าง) ไปใส่ในไฟล์ .env ที่ `EMAIL_PASS`

### 3. การใช้บริการอีเมลอื่น

หากต้องการใช้บริการอีเมลอื่นนอกจาก Gmail ให้แก้ไขไฟล์ `config/emailConfig.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## การทดสอบ

ในโหมดพัฒนา (NODE_ENV=development) ระบบจะไม่ส่งอีเมลจริง แต่จะแสดงข้อมูลในคอนโซลแทน# Login & Register Backend API

A Node.js Express backend API for user authentication with MySQL database.

## Features

- User registration
- User login
- Authentication with JWT
- RESTful API endpoints

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

### Database Setup

1. Create a MySQL database
2. Run the SQL script in `config/db.sql` to create the necessary tables

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env` (if available)
   - Update the database connection details in `.env`

3. Start the server:
   ```
   npm start
   ```
   
   For development with auto-reload:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Request body: `{ "email": "user@example.com", "password": "password123" }`
  
- `POST /api/auth/login` - Login a user
  - Request body: `{ "email": "user@example.com", "password": "password123" }`

## Default User

The system comes with a default user:
- Email: natcha@gmail.com
- Password: Natcha1234