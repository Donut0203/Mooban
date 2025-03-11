<template>
  <div class="profile-container">
    <h1>โปรไฟล์ของฉัน</h1>
    <div class="profile-card">
      <div class="profile-form">
        <div class="form-group">
          <label for="firstName">ชื่อ</label>
          <input type="text" id="firstName" v-model="userProfile.firstName">
        </div>
        
        <div class="form-group">
          <label for="lastName">นามสกุล</label>
          <input type="text" id="lastName" v-model="userProfile.lastName">
        </div>
        
        <div class="form-group">
          <label for="email">อีเมล</label>
          <input type="email" id="email" v-model="userProfile.email" disabled>
        </div>
        
        <div class="form-group">
          <label for="phone">เบอร์โทรศัพท์</label>
          <input type="tel" id="phone" v-model="userProfile.phone">
        </div>
        
        <div class="form-group">
          <label for="address">ที่อยู่</label>
          <textarea id="address" v-model="userProfile.address"></textarea>
        </div>
        
        <div class="form-group">
          <label for="status">สถานะ</label>
          <input type="text" id="status" :value="formatStatus(userProfile.status)" disabled>
        </div>
        
        <div class="form-actions">
          <button @click="saveProfile" class="save-btn">บันทึก</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'Profile',
  data() {
    return {
      userProfile: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        status: ''
      }
    };
  },
  methods: {
    fetchUserProfile() {
      console.log('Fetching user profile...');

      // ดึงข้อมูลจาก localStorage
      this.userProfile = {
        firstName: localStorage.getItem('userFirstName') || '',
        lastName: localStorage.getItem('userLastName') || '',
        email: localStorage.getItem('email') || '',
        phone: localStorage.getItem('userPhone') || '',
        address: localStorage.getItem('userAddress') || '',
        status: localStorage.getItem('userStatus') || localStorage.getItem('status') || ''
      };

      console.log('User profile from localStorage:', this.userProfile);

      // ดึงข้อมูลโปรไฟล์จาก API
      api.getUserProfile()
        .then(response => {
          console.log('API response:', response);
          const userData = response.data.user;

          if (userData) {
            this.userProfile = {
              firstName: userData.first_name || this.userProfile.firstName,
              lastName: userData.last_name || this.userProfile.lastName,
              email: userData.user_email || this.userProfile.email,
              phone: userData.phone || this.userProfile.phone,
              address: userData.address || this.userProfile.address,
              status: userData.status || this.userProfile.status
            };
            console.log('Updated user profile from API:', this.userProfile);
          }
        })
        .catch(error => {
          console.error('Error fetching user profile:', error);
        });
    },
    
    async saveProfile() {
      try {
        await api.updateUserProfile({
          firstName: this.userProfile.firstName,
          lastName: this.userProfile.lastName,
          phone: this.userProfile.phone,
          address: this.userProfile.address
        });
        
        // บันทึกข้อมูลลง localStorage
        localStorage.setItem('userFirstName', this.userProfile.firstName);
        localStorage.setItem('userLastName', this.userProfile.lastName);
        localStorage.setItem('userPhone', this.userProfile.phone);
        localStorage.setItem('userAddress', this.userProfile.address);
        
        alert('อัปเดตโปรไฟล์เรียบร้อยแล้ว');
        
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('ไม่สามารถอัปเดตโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง');
      }
    },
    
    formatStatus(status) {
      if (!status) return 'ไม่ทราบสถานะ';
      
      const statusMap = {
        'headman': 'ผู้ใหญ่บ้าน',
        'assistant': 'ผู้ช่วยผู้ใหญ่บ้าน',
        'villager': 'ลูกบ้าน',
        'pending': 'ผู้ใช้ที่รอการอนุมัติ'
      };
      
      return statusMap[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1);
    }
  },
  created() {
    console.log('Profile component created');
  },

  mounted() {
    console.log('Profile component mounted');
    setTimeout(() => {
      this.fetchUserProfile();
    }, 100);
  }
};
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

.profile-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

input, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

input:disabled, textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.save-btn {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.save-btn:hover {
  background-color: #1976D2;
}
</style>