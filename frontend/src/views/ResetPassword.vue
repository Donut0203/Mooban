<template>
  <div class="reset-container">
    <div class="reset-form">
      <h2>รีเซ็ตรหัสผ่าน</h2>
      
      <div v-if="!resetSuccess">
        <div class="form-group">
          <label for="email">อีเมล</label>
          <input 
            type="email" 
            id="email"
            v-model="email" 
            placeholder="กรอกอีเมลของคุณ"
          >
        </div>
        
        <div class="form-group">
          <label for="password">รหัสผ่านใหม่</label>
          <input 
            type="password" 
            id="password"
            v-model="password" 
            placeholder="กรอกรหัสผ่านใหม่"
          >
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">ยืนยันรหัสผ่านใหม่</label>
          <input 
            type="password" 
            id="confirmPassword"
            v-model="confirmPassword" 
            placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
          >
        </div>
        
        <p class="password-hint">
          รหัสผ่านต้องมีความยาวไม่เกิน 10 ตัวอักษร และประกอบด้วยตัวอักษรพิมพ์ใหญ่ ตัวอักษรพิมพ์เล็ก และตัวเลข
        </p>
        
        <div v-if="error" class="error-message">{{ error }}</div>
        
        <button @click="resetPassword" class="reset-button">
          {{ isResetting ? 'กำลังรีเซ็ต...' : 'รีเซ็ตรหัสผ่าน' }}
        </button>
      </div>
      
      <div v-else class="success-message">
        <p>{{ successMessage }}</p>
        <button @click="goToLogin" class="login-button">ไปยังหน้าเข้าสู่ระบบ</button>
      </div>
      
      <div class="back-link">
        <router-link to="/login">กลับไปยังหน้าเข้าสู่ระบบ</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResetPassword',
  data() {
    return {
      email: '',
      password: '',
      confirmPassword: '',
      error: null,
      isResetting: false,
      resetSuccess: false,
      successMessage: ''
    }
  },
  methods: {
    async resetPassword() {
      // Validate inputs
      if (!this.email) {
        this.error = 'กรุณากรอกอีเมล';
        return;
      }
      
      if (!this.password) {
        this.error = 'กรุณากรอกรหัสผ่านใหม่';
        return;
      }
      
      if (this.password !== this.confirmPassword) {
        this.error = 'รหัสผ่านไม่ตรงกัน';
        return;
      }
      
      // Validate password complexity
      if (this.password.length > 10) {
        this.error = 'รหัสผ่านต้องมีความยาวไม่เกิน 10 ตัวอักษร';
        return;
      }
      
      const hasUpperCase = /[A-Z]/.test(this.password);
      const hasLowerCase = /[a-z]/.test(this.password);
      const hasNumbers = /[0-9]/.test(this.password);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        this.error = 'รหัสผ่านต้องประกอบด้วยตัวอักษรพิมพ์ใหญ่ ตัวอักษรพิมพ์เล็ก และตัวเลข';
        return;
      }
      
      this.isResetting = true;
      this.error = null;
      
      try {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.email,
            newPassword: this.password
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          this.resetSuccess = true;
          this.successMessage = data.message || 'รหัสผ่านของคุณได้ถูกรีเซ็ตเรียบร้อยแล้ว';
        } else {
          this.error = data.message || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน';
        }
      } catch (error) {
        console.error('Error resetting password:', error);
        this.error = 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์';
      } finally {
        this.isResetting = false;
      }
    },
    goToLogin() {
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
.reset-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
}

.reset-form {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.password-hint {
  font-size: 12px;
  color: #666;
  margin-bottom: 15px;
}

.error-message {
  color: #d32f2f;
  margin-bottom: 15px;
}

.success-message {
  color: #388e3c;
  text-align: center;
  margin-bottom: 20px;
}

.reset-button, .login-button {
  width: 100%;
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 15px;
}

.reset-button:hover, .login-button:hover {
  background-color: #45a049;
}

.back-link {
  text-align: center;
}

.back-link a {
  color: #2196F3;
  text-decoration: none;
}

.back-link a:hover {
  text-decoration: underline;
}
</style>