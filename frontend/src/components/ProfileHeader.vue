<template>
  <div class="profile-header">
    <div class="profile-photo">
      <div v-if="profilePictureUrl" class="photo-container">
        <img :src="getFullImageUrl(profilePictureUrl)" alt="Profile Photo" @error="handleImageError">
      </div>
      <div v-else class="photo-placeholder">
        {{ userInitial }}
      </div>
    </div>
    <div class="profile-info">
      <h2>{{ fullName }}</h2>
      <p class="status" :class="statusClass">{{ formattedStatus }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileHeader',
  props: {
    profilePictureUrl: {
      type: String,
      default: null
    },
    firstName: {
      type: String,
      default: ''
    },
    lastName: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: ''
    }
  },
  computed: {
    fullName() {
      return `${this.firstName} ${this.lastName}`.trim() || 'User';
    },
    userInitial() {
      return this.email ? this.email.charAt(0).toUpperCase() : '?';
    },
    statusClass() {
      if (!this.status) return 'status-unknown';
      
      switch(this.status.toLowerCase()) {
        case 'headman': return 'status-headman';
        case 'assistant': return 'status-assistant';
        case 'villager': return 'status-villager';
        case 'pending': return 'status-pending';
        default: return 'status-unknown';
      }
    },
    formattedStatus() {
      if (!this.status) return 'ไม่ทราบสถานะ';
      
      const statusMap = {
        'headman': 'ผู้ใหญ่บ้าน',
        'assistant': 'ผู้ช่วยผู้ใหญ่บ้าน',
        'villager': 'ลูกบ้าน',
        'pending': 'รอการอนุมัติ'
      };
      
      return statusMap[this.status.toLowerCase()] || this.status.charAt(0).toUpperCase() + this.status.slice(1);
    }
  },
  methods: {
    getFullImageUrl(url) {
      if (!url) return '';
      
      // ถ้า URL เป็น base64, แสดงตามเดิม
      if (url.startsWith('data:')) {
        return url;
      }
      
      // ถ้า URL เป็น relative URL, ให้เพิ่ม URL ของ backend
      if (url.startsWith('/uploads')) {
        const timestamp = new Date().getTime();
        return `http://localhost:4000${url}?t=${timestamp}`;
      }
      
      // ถ้า URL ปกติ, ส่ง URL ไปตามเดิม
      return url;
    },
    
    handleImageError(e) {
      console.error('Error loading image:', e);
      console.log('Failed image URL:', e.target.src);
      
      // หากรูปภาพไม่โหลดได้, สามารถเพิ่มรูปภาพสำรองหรือการแสดงข้อความแทน
      e.target.src = 'path/to/your/placeholder-image.jpg'; // หรือรูปภาพที่คุณต้องการแสดงแทน
    }
  }
};
</script>


<style scoped>
.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.profile-photo {
  margin-right: 20px;
}

.photo-container {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
}

.photo-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 36px;
  font-weight: bold;
  color: #757575;
}

.profile-info h2 {
  margin: 0 0 5px 0;
  font-size: 24px;
}

.status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
}

.status-headman {
  background-color: #4CAF50;
  color: white;
}

.status-assistant {
  background-color: #2196F3;
  color: white;
}

.status-villager {
  background-color: #FF9800;
  color: white;
}

.status-pending {
  background-color: #9E9E9E;
  color: white;
}

.status-unknown {
  background-color: #F5F5F5;
  color: #757575;
}
</style>