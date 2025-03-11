<template>
  <div>
    <h1>รีเซ็ตรหัสผ่าน</h1>
    <form @submit.prevent="resetPassword">
      <div>
        <label for="email">อีเมล:</label>
        <input type="email" id="email" v-model="email" required>
      </div>
      <div>
        <label for="password">รหัสผ่านใหม่:</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <div>
        <label for="confirmPassword">ยืนยันรหัสผ่านใหม่:</label>
        <input type="password" id="confirmPassword" v-model="confirmPassword" required>
      </div>
      <div v-if="error" style="color: red;">{{ error }}</div>
      <div v-if="success" style="color: green;">{{ success }}</div>
      <button type="submit">รีเซ็ตรหัสผ่าน</button>
    </form>
    <div>
      <router-link to="/login">กลับไปยังหน้าเข้าสู่ระบบ</router-link>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      confirmPassword: '',
      error: '',
      success: ''
    }
  },
  methods: {
    async resetPassword() {
      // Reset messages
      this.error = '';
      this.success = '';
      
      // Validate inputs
      if (!this.email || !this.password || !this.confirmPassword) {
        this.error = 'กรุณากรอกข้อมูลให้ครบถ้วน';
        return;
      }
      
      if (this.password !== this.confirmPassword) {
        this.error = 'รหัสผ่านไม่ตรงกัน';
        return;
      }
      
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
          this.success = data.message || 'รหัสผ่านถูกรีเซ็ตเรียบร้อยแล้ว';
          // Clear form
          this.email = '';
          this.password = '';
          this.confirmPassword = '';
        } else {
          this.error = data.message || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน';
        }
      } catch (error) {
        console.error('Error:', error);
        this.error = 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์';
      }
    }
  }
}
</script>

<style scoped>
div {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
}
input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
}
button {
  padding: 10px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}
</style>