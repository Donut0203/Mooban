<template>
  <div class="profile-container">
    <h1>โปรไฟล์ของฉัน</h1>
    
    <div class="profile-card">
      <div class="profile-header">
        <div class="profile-photo">
          <div v-if="profilePictureUrl" class="photo-container">
            <img :src="getFullImageUrl(profilePictureUrl)" alt="Profile Photo" @error="handleImageError">
          </div>
          <div v-else class="photo-placeholder">
            {{ userInitial }}
          </div>
          <input
            type="file"
            ref="photoInput"
            style="display: none;"
            accept="image/*"
            @change="handleFileSelected"
          >
          <button @click="triggerPhotoUpload" class="upload-btn">อัปโหลดรูปภาพ</button>
        </div>
      </div>

      <!-- แสดงการรออนุมัติ (Pending Approvals) -->
      <div v-if="userProfile.status === 'pending'" class="pending-approval-banner">
        <div class="pending-icon">⏳</div>
        <div class="pending-message">
          <h3>ผู้ใช้ที่รอการอนุมัติ</h3>
          <p>บัญชีของคุณกำลังรอการตรวจสอบและอนุมัติจากผู้ดูแลระบบ</p>
        </div>
      </div>

      <div class="profile-form">
        <div class="form-group">
          <label for="firstName">ชื่อ</label>
          <input 
            type="text" 
            id="firstName" 
            v-model="userProfile.firstName" 
            :class="{ 'error': errors.firstName }"
          >
          <span v-if="errors.firstName" class="error-text">{{ errors.firstName }}</span>
        </div>
        
        <div class="form-group">
          <label for="lastName">นามสกุล</label>
          <input 
            type="text" 
            id="lastName" 
            v-model="userProfile.lastName" 
            :class="{ 'error': errors.lastName }"
          >
          <span v-if="errors.lastName" class="error-text">{{ errors.lastName }}</span>
        </div>
        
        <div class="form-group">
          <label for="email">อีเมล</label>
          <input 
            type="email" 
            id="email" 
            v-model="userProfile.email" 
            disabled
          >
        </div>
        
        <div class="form-group">
          <label for="phone">เบอร์โทรศัพท์</label>
          <input 
            type="tel" 
            id="phone" 
            v-model="userProfile.phone"
          >
        </div>
        
        <div class="form-group">
          <label for="address">ที่อยู่</label>
          <textarea 
            id="address" 
            v-model="userProfile.address"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="status">สถานะ</label>
          <input
            type="text"
            id="status"
            :value="formatStatus(userProfile.status)"
            disabled
          >
        </div>

        <div class="profile-info">
        <button @click="toggleInfoVisibility" class="toggle-info-btn">
          {{ showInfo ? 'ซ่อนข้อมูล' : 'แสดงข้อมูล' }}
        </button>
        <div v-if="showInfo" class="hidden-info">
          <p><strong>ไอดี:</strong> {{ userProfile.id }}</p>
          <p><strong>อีเมล:</strong> {{ userProfile.email }}</p>
        </div>
      </div>
        
        <div class="form-actions">
          <button 
            @click="saveProfile" 
            class="save-btn" 
            :disabled="isLoading"
          >
            {{ isLoading ? 'กำลังบันทึก...' : 'บันทึก' }}
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="alert.show" class="alert" :class="'alert-' + alert.type">
      {{ alert.message }}
    </div>
  </div>
</template>

<script>
import api from '@/services/api';
import axios from 'axios';

export default {
  name: 'ProfileViewSimple',
  data() {
    return {
      userProfile: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        status: '',
        approvedBy: '',
        updatedAt: null
      },
      profilePictureUrl: null,
      isLoading: false,
      errors: {
        firstName: '',
        lastName: ''
      },
      alert: {
        show: false,
        message: '',
        type: 'success'
      }
    };
  },
  computed: {
    userInitial() {
      return this.userProfile.email ? this.userProfile.email.charAt(0).toUpperCase() : '?';
    }
  },
  methods: {
    async fetchUserProfile() {
      try {
        this.isLoading = true;
        console.log('Fetching user profile...');

        // ดึง userId จาก localStorage
        const userId = localStorage.getItem('userId');

        // ตรวจสอบรูปภาพจาก localStorage ก่อน (เพราะเชื่อถือได้มากที่สุด)
        const storedPictureUrl = localStorage.getItem(`profilePictureUrl_${userId}`);
        if (storedPictureUrl && storedPictureUrl.startsWith('data:image/')) {
          console.log(`Using stored profile picture for user ID: ${userId}`);
          this.profilePictureUrl = storedPictureUrl;
        }
        // ถ้าไม่มีใน localStorage ให้ตรวจสอบใน sessionStorage
        else if (sessionStorage.getItem(`lastProfilePicture_${userId}`)) {
          console.log(`Using last profile picture from sessionStorage for user ID: ${userId}`);
          const lastPicture = sessionStorage.getItem(`lastProfilePicture_${userId}`);
          this.profilePictureUrl = lastPicture;
          // บันทึกกลับไปที่ localStorage เพื่อใช้ในอนาคต
          localStorage.setItem(`profilePictureUrl_${userId}`, lastPicture);
        }
        // ถ้าไม่มีทั้งใน localStorage และ sessionStorage ให้ตรวจสอบ URL ของเซิร์ฟเวอร์
        else {
          const serverPictureUrl = localStorage.getItem(`serverProfilePictureUrl_${userId}`);
          if (serverPictureUrl) {
            const timestamp = new Date().getTime();
            this.profilePictureUrl = `${serverPictureUrl}?t=${timestamp}`;
          }
        }

        // ดึงข้อมูลโปรไฟล์จาก API
        const response = await api.getUserProfile();
        console.log('User profile response:', response.data);

        const userData = response.data.user;
        if (!userData) {
          console.error('No user data found in response:', response.data);
          this.showAlert('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่อีกครั้ง', 'error');
          return;
        }

        // แสดงข้อมูลทั้งหมดที่ได้รับจาก API เพื่อตรวจสอบ
        console.log('All user data fields:', userData);

        // ดึงข้อมูลจาก localStorage ถ้าไม่มีข้อมูลจาก API
        this.userProfile = {
          firstName: userData.first_name || localStorage.getItem('userFirstName') || '',
          lastName: userData.last_name || localStorage.getItem('userLastName') || '',
          email: userData.user_email || localStorage.getItem('email') || '',
          phone: userData.phone || localStorage.getItem('userPhone') || '',
          address: userData.address || localStorage.getItem('userAddress') || '',
          status: userData.status || localStorage.getItem('userStatus') || '',
          approvedBy: userData.approved_by || userData.approvedBy || localStorage.getItem('userApprovedBy') || '',
          updatedAt: userData.updated_at || userData.updatedAt || localStorage.getItem('userUpdatedAt') || null
        };

        // บันทึกข้อมูลลง localStorage เพื่อใช้ในกรณีที่ API ไม่ทำงาน
        localStorage.setItem('userFirstName', this.userProfile.firstName);
        localStorage.setItem('userLastName', this.userProfile.lastName);
        localStorage.setItem('userPhone', this.userProfile.phone);
        localStorage.setItem('userAddress', this.userProfile.address);
        localStorage.setItem('userId', userData.user_id || userId);
        localStorage.setItem('userApprovedBy', this.userProfile.approvedBy || '');
        localStorage.setItem('userUpdatedAt', this.userProfile.updatedAt || '');

        // ถ้ายังไม่มีรูปภาพและ API มีรูปภาพ
        if (!this.profilePictureUrl && userData.profile_picture) {
          // For external URLs (like randomuser.me), use directly
          if (userData.profile_picture.startsWith('http')) {
            this.profilePictureUrl = userData.profile_picture;
          } else {
            // For server URLs, add timestamp and use relative path
            const timestamp = new Date().getTime();
            // ใช้ URL แบบสัมพัทธ์เพื่อให้ทำงานได้กับ proxy ของ Vue
            const serverUrl = `${userData.profile_picture}?t=${timestamp}`;
            this.profilePictureUrl = serverUrl;

            // บันทึก URL ของเซิร์ฟเวอร์ลงใน localStorage
            localStorage.setItem(`serverProfilePictureUrl_${userId}`, userData.profile_picture);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);

        // แม้ว่า API จะล้มเหลว ให้พยายามใช้รูปภาพที่เก็บไว้
        const userId = localStorage.getItem('userId');

        // ตรวจสอบ localStorage ก่อน
        const storedPictureUrl = localStorage.getItem(`profilePictureUrl_${userId}`);
        if (storedPictureUrl && storedPictureUrl.startsWith('data:image/')) {
          console.log(`Using profile picture from localStorage after API error for user ID: ${userId}`);
          this.profilePictureUrl = storedPictureUrl;
        }
        // จากนั้นตรวจสอบ sessionStorage
        else if (sessionStorage.getItem(`lastProfilePicture_${userId}`)) {
          console.log(`Using last profile picture from sessionStorage after API error for user ID: ${userId}`);
          const lastPicture = sessionStorage.getItem(`lastProfilePicture_${userId}`);
          this.profilePictureUrl = lastPicture;
          localStorage.setItem(`profilePictureUrl_${userId}`, lastPicture);
        }
        // ถ้าไม่มีรูปภาพใน localStorage หรือ sessionStorage ให้ใช้รูปภาพจาก serverProfilePictureUrl
        else {
          const serverPictureUrl = localStorage.getItem(`serverProfilePictureUrl_${userId}`);
          if (serverPictureUrl) {
            const timestamp = new Date().getTime();
            this.profilePictureUrl = `${serverPictureUrl}?t=${timestamp}`;
          }
        }

        this.showAlert('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง', 'error');
      } finally {
        this.isLoading = false;
      }
    },
    
    validateForm() {
      let isValid = true;
      this.errors.firstName = '';
      this.errors.lastName = '';
      
      if (!this.userProfile.firstName.trim()) {
        this.errors.firstName = 'กรุณากรอกชื่อ';
        isValid = false;
      }
      
      if (!this.userProfile.lastName.trim()) {
        this.errors.lastName = 'กรุณากรอกนามสกุล';
        isValid = false;
      }
      
      return isValid;
    },
    
    async saveProfile() {
      if (!this.validateForm()) {
        return;
      }

      try {
        this.isLoading = true;
        console.log('Saving profile data:', this.userProfile);

        const response = await api.updateUserProfile({
          firstName: this.userProfile.firstName,
          lastName: this.userProfile.lastName,
          phone: this.userProfile.phone,
          address: this.userProfile.address
        });

        console.log('Profile updated:', response.data);

        // บันทึกข้อมูลลง localStorage เพื่อใช้ในกรณีที่ API ไม่ทำงาน
        localStorage.setItem('userFirstName', this.userProfile.firstName);
        localStorage.setItem('userLastName', this.userProfile.lastName);
        localStorage.setItem('userPhone', this.userProfile.phone);
        localStorage.setItem('userAddress', this.userProfile.address);

        this.showAlert('อัปเดตโปรไฟล์เรียบร้อยแล้ว', 'success');

        // โหลดข้อมูลใหม่เพื่อให้แน่ใจว่าข้อมูลถูกต้อง
        await this.fetchUserProfile();
      } catch (error) {
        console.error('Error updating profile:', error);
        this.showAlert('ไม่สามารถอัปเดตโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง', 'error');
      } finally {
        this.isLoading = false;
      }
    },
    
    triggerPhotoUpload() {
      // Trigger the file input click
      this.$refs.photoInput.click();
    },

    async handleFileSelected(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file is an image - ตรวจสอบว่าเป็นไฟล์รูปภาพ
      if (!file.type.startsWith('image/')) {
        this.showAlert('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น', 'error');
        return;
      }

      // ตรวจสอบขนาดไฟล์ - เพิ่มขนาดสูงสุดเป็น 50MB
      const maxSizeInBytes = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSizeInBytes) {
        this.showAlert(`ไฟล์มีขนาดใหญ่เกินไป (${(file.size / (1024 * 1024)).toFixed(2)} MB) กรุณาอัปโหลดไฟล์ขนาดไม่เกิน 50MB`, 'error');
        return;
      }

      // Show loading state
      this.isLoading = true;

      // Show loading alert
      this.showAlert('กำลังอัปโหลดรูปโปรไฟล์...', 'info');

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          let imageData = e.target.result;

          // Ensure correct MIME type for all image files
          if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            if (!imageData.startsWith('data:image/jpeg')) {
              imageData = imageData.replace(/^data:image\/[^;]+/, 'data:image/jpeg');
            }
          } else if (file.type === 'image/png' && !imageData.startsWith('data:image/png')) {
            imageData = imageData.replace(/^data:image\/[^;]+/, 'data:image/png');
          } else if (file.type === 'image/gif' && !imageData.startsWith('data:image/gif')) {
            imageData = imageData.replace(/^data:image\/[^;]+/, 'data:image/gif');
          } else if (file.type === 'image/webp' && !imageData.startsWith('data:image/webp')) {
            imageData = imageData.replace(/^data:image\/[^;]+/, 'data:image/webp');
          } else if (file.type === 'image/svg+xml' && !imageData.startsWith('data:image/svg+xml')) {
            imageData = imageData.replace(/^data:image\/[^;]+/, 'data:image/svg+xml');
          } else if (file.type === 'image/bmp' && !imageData.startsWith('data:image/bmp')) {
            imageData = imageData.replace(/^data:image\/[^;]+/, 'data:image/bmp');
          }

          // ตรวจสอบว่า imageData มีรูปแบบที่ถูกต้อง
          if (!imageData.includes('base64,')) {
            console.error('Invalid image data format');
            this.showAlert('รูปแบบข้อมูลรูปภาพไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง', 'error');
            this.isLoading = false;
            return;
          }

          // Show preview immediately
          this.profilePictureUrl = imageData;

          // ดึง userId จาก localStorage
          const userId = localStorage.getItem('userId');
          if (!userId) {
            console.error('No user ID found in localStorage');
            this.showAlert('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่อีกครั้ง', 'error');
            this.isLoading = false;
            return;
          }

          // บันทึกลงใน localStorage ทันทีเพื่อป้องกันการสูญหายเมื่อรีเฟรชหน้า
          localStorage.setItem(`profilePictureUrl_${userId}`, imageData);
          console.log(`Saved profile picture to localStorage for user ID: ${userId}`);

          // บันทึกลงใน sessionStorage เป็นสำรอง
          sessionStorage.setItem(`lastProfilePicture_${userId}`, imageData);
          console.log(`Saved profile picture to sessionStorage for user ID: ${userId}`);

          // บันทึกเวลาที่อัปโหลดล่าสุด
          const uploadTimestamp = new Date().getTime();
          localStorage.setItem(`profilePictureTimestamp_${userId}`, uploadTimestamp.toString());

          // ส่งอีเวนต์เพื่ออัปเดตรูปภาพโปรไฟล์ในคอมโพเนนต์อื่น ๆ ทันที
          window.dispatchEvent(new CustomEvent('profile-updated'));

          // อัปโหลดไปยังเซิร์ฟเวอร์โดยใช้ api.uploadProfilePicture
          // ซึ่งจะบันทึกรูปภาพลงใน localStorage และ sessionStorage อีกครั้ง
          // และส่งอีเวนต์ profile-updated เมื่อสำเร็จหรือล้มเหลว
          try {
            const response = await api.uploadProfilePicture(imageData);

            if (response.data && response.data.profilePictureUrl) {
              this.showAlert('อัปโหลดรูปโปรไฟล์เรียบร้อยแล้ว', 'success');
            }
          } catch (error) {
            console.error('Error uploading profile picture:', error);

            // ยังคงแสดงความสำเร็จเนื่องจากเราได้บันทึกรูปภาพไว้ในเครื่องแล้ว
            this.showAlert('บันทึกรูปโปรไฟล์เรียบร้อยแล้ว (แบบออฟไลน์)', 'success');
          } finally {
            // รีเซ็ตสถานะการโหลดเสมอ
            this.isLoading = false;
          }
        } catch (error) {
          console.error('Error processing image:', error);
          this.showAlert('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ กรุณาลองใหม่อีกครั้ง', 'error');
          this.isLoading = false;
        }
      };

      // จัดการข้อผิดพลาดของ reader
      reader.onerror = () => {
        console.error('FileReader error');
        this.showAlert('เกิดข้อผิดพลาดในการอ่านไฟล์ กรุณาลองใหม่อีกครั้ง', 'error');
        this.isLoading = false;
      };

      reader.readAsDataURL(file);
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
    },

    formatDate(dateString) {
      if (!dateString) return 'ไม่มีข้อมูล';

      try {
        // แปลงวันที่เป็นวัตถุ Date
        const date = new Date(dateString);

        // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
        if (isNaN(date.getTime())) {
          return 'วันที่ไม่ถูกต้อง';
        }

        // กำหนดตัวเลือกการจัดรูปแบบวันที่แบบไทย
        const options = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };

        // แปลงเป็นวันที่ภาษาไทย
        return date.toLocaleDateString('th-TH', options) + ' น.';
      } catch (error) {
        console.error('Error formatting date:', error);
        return 'วันที่ไม่ถูกต้อง';
      }
    },
    
    showAlert(message, type = 'success') {
      this.alert = {
        show: true,
        message,
        type
      };

      // Hide alert after 3 seconds
      setTimeout(() => {
        this.alert.show = false;
      }, 3000);
    },

    getFullImageUrl(url) {
      if (!url) return '';

      // If it's a data URL (base64), return as is
      if (url.startsWith('data:')) {
        return url;
      }

      // If it's a relative URL, use it as is (proxy will handle it)
      if (url.startsWith('/')) {
        // Add a timestamp to prevent caching
        const timestamp = new Date().getTime();
        // Use relative URL for proxy
        return `${url}?t=${timestamp}`;
      }

      // If it's an https URL (like randomuser.me), return as is
      if (url.startsWith('http')) {
        return url;
      }

      // Otherwise, return the URL as is
      return url;
    },

    handleImageError(e) {
      // ป้องกันการวนซ้ำโดยตรวจสอบว่ารูปภาพได้รับการประมวลผลแล้วหรือไม่
      if (e.target.dataset.errorHandled) {
        // ถ้าเราได้พยายามจัดการกับข้อผิดพลาดนี้แล้ว ให้ใช้ placeholder
        this.profilePictureUrl = null;
        return;
      }

      // ทำเครื่องหมายว่ารูปภาพนี้กำลังถูกประมวลผลเพื่อป้องกันการวนซ้ำ
      e.target.dataset.errorHandled = 'true';

      // ดึง userId จาก localStorage
      const userId = localStorage.getItem('userId');

      // ลำดับการตรวจสอบ:
      // 1. ตรวจสอบ localStorage ก่อน
      const storedPictureUrl = localStorage.getItem(`profilePictureUrl_${userId}`);
      if (storedPictureUrl && storedPictureUrl.startsWith('data:image/')) {
        console.log(`Using stored base64 image for user ID: ${userId}`);
        this.profilePictureUrl = storedPictureUrl;
        return;
      }

      // 2. ตรวจสอบ sessionStorage
      const lastProfilePicture = sessionStorage.getItem(`lastProfilePicture_${userId}`);
      if (lastProfilePicture && lastProfilePicture.startsWith('data:image/')) {
        console.log(`Using last profile picture from sessionStorage for user ID: ${userId}`);
        this.profilePictureUrl = lastProfilePicture;
        // บันทึกกลับไปที่ localStorage เพื่อใช้ในอนาคต
        localStorage.setItem(`profilePictureUrl_${userId}`, lastProfilePicture);
        return;
      }

      // 3. ตรวจสอบ URL ของเซิร์ฟเวอร์
      const serverPictureUrl = localStorage.getItem(`serverProfilePictureUrl_${userId}`);
      if (serverPictureUrl) {
        // ลองใช้ URL ของเซิร์ฟเวอร์โดยตรง
        const timestamp = new Date().getTime();
        const newUrl = `${serverPictureUrl}?t=${timestamp}`;
        console.log('Trying server URL:', newUrl);

        // ใช้ URL ใหม่โดยตรงกับ profilePictureUrl แทนที่จะกำหนดให้กับ e.target.src
        // เพื่อหลีกเลี่ยงการเรียก handleImageError ซ้ำ
        this.profilePictureUrl = newUrl;
        return;
      }

      // 4. ลองโหลดรูปภาพโดยตรงจากเซิร์ฟเวอร์เป็นทางเลือกสุดท้าย
      const url = e.target.src;
      if (url.includes('/uploads/')) {
        const imagePath = url.split('?')[0]; // ลบพารามิเตอร์การสอบถาม
        const newUrl = `${imagePath.substring(imagePath.indexOf('/uploads/'))}`;
        console.log('Trying alternative URL:', newUrl);

        // ใช้ URL ใหม่โดยตรงกับ profilePictureUrl แทนที่จะกำหนดให้กับ e.target.src
        this.profilePictureUrl = newUrl;
        return;
      }

      // ถ้าทุกอย่างล้มเหลว ให้กลับไปใช้ placeholder
      this.profilePictureUrl = null;
    }
  },
  mounted() {
    // ดึง userId จาก localStorage
    const userId = localStorage.getItem('userId');

    // ตรวจสอบรูปภาพจาก localStorage ก่อน (เพราะเชื่อถือได้มากที่สุด)
    if (userId) {
      const storedPictureUrl = localStorage.getItem(`profilePictureUrl_${userId}`);
      if (storedPictureUrl && storedPictureUrl.startsWith('data:image/')) {
        console.log(`Mounted: Using stored profile picture for user ID: ${userId}`);
        this.profilePictureUrl = storedPictureUrl;
      }
      // ถ้าไม่มีใน localStorage ให้ตรวจสอบใน sessionStorage
      else if (sessionStorage.getItem(`lastProfilePicture_${userId}`)) {
        console.log(`Mounted: Using last profile picture from sessionStorage for user ID: ${userId}`);
        const lastPicture = sessionStorage.getItem(`lastProfilePicture_${userId}`);
        this.profilePictureUrl = lastPicture;
        // บันทึกกลับไปที่ localStorage เพื่อใช้ในอนาคต
        localStorage.setItem(`profilePictureUrl_${userId}`, lastPicture);
      }
      // ถ้าไม่มีทั้งใน localStorage และ sessionStorage ให้ตรวจสอบ URL ของเซิร์ฟเวอร์
      else {
        const serverPictureUrl = localStorage.getItem(`serverProfilePictureUrl_${userId}`);
        if (serverPictureUrl) {
          const timestamp = new Date().getTime();
          this.profilePictureUrl = `${serverPictureUrl}?t=${timestamp}`;
        }
      }
    }

    // ดึงข้อมูลโปรไฟล์จาก API
    this.fetchUserProfile();

    // ตั้งค่าตัวจับเวลาเพื่อตรวจสอบการเปลี่ยนแปลงของรูปภาพโปรไฟล์
    this.profileUpdateHandler = () => {
      // ดึง userId จาก localStorage
      const userId = localStorage.getItem('userId');
      if (userId) {
        // ตรวจสอบรูปภาพจาก localStorage
        const storedPictureUrl = localStorage.getItem(`profilePictureUrl_${userId}`);
        if (storedPictureUrl && storedPictureUrl.startsWith('data:image/')) {
          this.profilePictureUrl = storedPictureUrl;
        }
      }
    };

    window.addEventListener('profile-updated', this.profileUpdateHandler);
  },

  beforeUnmount() {
    // ทำความสะอาดตัวจับเวลาและตัวฟังก์ชันเมื่อคอมโพเนนต์ถูกทำลาย
    if (this.profileUpdateHandler) {
      window.removeEventListener('profile-updated', this.profileUpdateHandler);
    }
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

.profile-header {
  padding: 20px;
  display: flex;
  justify-content: center;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.profile-photo {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.photo-container {
  width: 256px;
  height: 256px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 15px;
  border: 3px solid white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.photo-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 256px;
  height: 256px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 72px; /* เพิ่มขนาดตัวอักษรให้เหมาะสมกับขนาดที่ใหญ่ขึ้น */
  font-weight: bold;
  color: #757575;
  margin-bottom: 15px;
}

.upload-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.upload-btn:hover {
  background-color: #45a049;
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

input.error {
  border-color: #d32f2f;
}

.error-text {
  color: #d32f2f;
  font-size: 14px;
  margin-top: 5px;
  display: block;
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

.save-btn:disabled {
  background-color: #9e9e9e;
  cursor: not-allowed;
}

.alert {
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  animation: fadeIn 0.3s;
}

.alert-success {
  background-color: #dff0d8;
  color: #3c763d;
  border: 1px solid #d6e9c6;
}

.alert-error {
  background-color: #f2dede;
  color: #a94442;
  border: 1px solid #ebccd1;
}

.alert-info {
  background-color: #d9edf7;
  color: #31708f;
  border: 1px solid #bce8f1;
}

.pending-approval-banner {
  display: flex;
  align-items: center;
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 4px;
  padding: 15px;
  margin: 0 20px 20px;
}

.pending-icon {
  font-size: 24px;
  margin-right: 15px;
}

.pending-message {
  flex: 1;
}

.pending-message h3 {
  margin: 0 0 5px 0;
  color: #856404;
}

.pending-message p {
  margin: 0;
  color: #856404;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.profile-info {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
}

.toggle-info-btn {
  background-color: #4CAF50;
  color: white;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
}

.toggle-info-btn:hover {
  background-color: #45a049;
}

.hidden-info {
  margin-left: 20px;
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 5px;
  width: 200px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.hidden-info p {
  margin: 5px 0;
}
</style>