<template>
  <div class="reset-password-container">
    <div class="reset-password-form">
      <h2>รีเซ็ตรหัสผ่าน</h2>
      
      <div v-if="!resetSuccess">
        <p>กรอกอีเมลและรหัสผ่านใหม่ของคุณ</p>
        
        <div class="form-group">
          <label for="email">อีเมล</label>
          <input 
            type="email" 
            id="email"
            v-model="email" 
            placeholder="กรอกอีเมลของคุณ"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="newPassword">รหัสผ่านใหม่</label>
          <div class="password-input-container">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="newPassword"
              v-model="newPassword" 
              placeholder="กรอกรหัสผ่านใหม่"
              required
            >
            <button 
              type="button"
              class="toggle-password-btn"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">ยืนยันรหัสผ่านใหม่</label>
          <div class="password-input-container">
            <input 
              :type="showConfirmPassword ? 'text' : 'password'" 
              id="confirmPassword"
              v-model="confirmPassword" 
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              required
            >
            <button 
              type="button"
              class="toggle-password-btn"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
        
        <p class="password-requirements">
          รหัสผ่านต้องมีความยาวไม่เกิน 10 ตัวอักษร และประกอบด้วยตัวอักษรพิมพ์ใหญ่ ตัวอักษรพิมพ์เล็ก และตัวเลข
        </p>
        
        <div class="error-message" v-if="error">{{ error }}</div>
        
        <button 
          @click="resetPassword" 
          :disabled="isResetting || !isFormValid"
          class="reset-btn"
        >
          {{ isResetting ? 'กำลังรีเซ็ตรหัสผ่าน...' : 'รีเซ็ตรหัสผ่าน' }}
        </button>
      </div>
      
      <div v-else class="success-message">
        <p>{{ successMessage }}</p>
        <button @click="goToLogin" class="login-btn">ไปยังหน้าเข้าสู่ระบบ</button>
      </div>
      
      <div class="back-to-login">
        <router-link to="/login">กลับไปยังหน้าเข้าสู่ระบบ</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SimpleResetPassword',
  data() {
    return {
      email: '',
      newPassword: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false,
      error: null,
      isResetting: false,
      resetSuccess: false,
      successMessage: ''
    }
  },
  computed: {
    isFormValid() {
      return (
        this.email && 
        this.newPassword && 
        this.confirmPassword && 
        this.newPassword === this.confirmPassword &&
        this.isPasswordValid
      );
    },
    isPasswordValid() {
      // Check password length (max 10 characters)
      if (this.newPassword.length > 10) {
        return false;
      }
      
      // Check password complexity
      const hasUpperCase = /[A-Z]/.test(this.newPassword);
      const hasLowerCase = /[a-z]/.test(this.newPassword);
      const hasNumbers = /[0-9]/.test(this.newPassword);
      
      return hasUpperCase && hasLowerCase && hasNumbers;
    }
  },
  methods: {
    async resetPassword() {
      if (!this.isFormValid) {
        if (this.newPassword !== this.confirmPassword) {
          this.error = 'รหัสผ่านไม่ตรงกัน';
        } else if (!this.isPasswordValid) {
          this.error = 'รหัสผ่านต้องมีความยาวไม่เกิน 10 ตัวอักษร และประกอบด้วยตัวอักษรพิมพ์ใหญ่ ตัวอักษรพิมพ์เล็ก และตัวเลข';
        } else {
          this.error = 'กรุณากรอกข้อมูลให้ครบถ้วน';
        }
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
            newPassword: this.newPassword
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
.reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.reset-password-form {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.password-input-container {
  position: relative;
}

.toggle-password-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #777;
}

.password-requirements {
  font-size: 12px;
  color: #666;
  margin-bottom: 20px;
}

.error-message {
  color: #d32f2f;
  margin-bottom: 15px;
  font-size: 14px;
}

.success-message {
  color: #388e3c;
  text-align: center;
  margin-bottom: 20px;
}

.reset-btn, .login-btn {
  width: 100%;
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.reset-btn:hover, .login-btn:hover {
  background-color: #45a049;
}

.reset-btn:disabled {
  background-color: #9e9e9e;
  cursor: not-allowed;
}

.back-to-login {
  text-align: center;
  margin-top: 20px;
}

.back-to-login a {
  color: #2196F3;
  text-decoration: none;
}

.back-to-login a:hover {
  text-decoration: underline;
}
</style>