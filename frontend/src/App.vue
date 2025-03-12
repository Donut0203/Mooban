<template>
  <div id="app">
    <div v-if="isLoggedIn && !isLoginPage && !isRegisterPage" class="app-container">
      <!-- Vertical sidebar navigation -->
      <div class="sidebar-nav">
        <div class="sidebar-profile">
        <!--   <div class="profile-image"> -->
            <!-- ใช้ getFullImageUrl สำหรับโหลดรูปจาก backend -->
           <!-- <img :src="getFullImageUrl(profileImageUrl) || 'https://via.placeholder.com/256x256?text=Profile'" alt="Profile Image" @error="handleImageError" class="profile-img"> -->
         <!-- </div> -->

          <div class="profile-info">
            <h3>{{ userFullName || userEmail || '' }}</h3>
            <span class="user-role" :class="'role-' + userStatus">{{ formatRole(userStatus) }}</span>
            <!-- ข้อมูลส่วนตัวที่ซ่อนไว้ -->
            <div class="user-details" v-if="showUserDetails">
              <div class="info-item" v-if="userId">
                <span class="info-label">User ID:</span>
                <span class="info-value">{{ userId }}</span>
              </div>
              <div class="info-item" v-if="userEmail">
                <span class="info-label">Email:</span>
                <span class="info-value">{{ userEmail }}</span>
              </div>
              <div class="info-item" v-if="userPhone">
                <span class="info-label">Phone:</span>
                <span class="info-value">{{ userPhone }}</span>
              </div>
              <div class="info-item" v-if="userAddress">
                <span class="info-label">Address:</span>
                <span class="info-value">{{ userAddress }}</span>
              </div>
            </div>
            <router-link to="/profile" class="profile-btn edit-profile-btn">แก้ไขโปรไฟล์</router-link>
          </div>
        </div>
        <div class="sidebar-divider"></div>
        <div class="sidebar-menu">
          <router-link to="/" class="sidebar-menu-item"><span class="menu-emoji">🏠</span> หน้าหลัก</router-link>
          <router-link to="/member" class="sidebar-menu-item"><span class="menu-emoji">👨‍👩‍👧‍👦</span> จัดการสมาชิก</router-link>

          <!-- เมนูข้อมูลพนักงานแบบเลื่อนลง -->
          <div class="dropdown-menu">
            <div class="dropdown-header" @click="toggleEmployeeMenu">
              <span><span class="menu-emoji">👥</span> ข้อมูลพนักงาน</span>
              <i class="dropdown-icon" :class="{'dropdown-icon-open': showEmployeeMenu}">▼</i>
            </div>
            <div class="dropdown-content" v-show="showEmployeeMenu">
              <router-link v-if="userStatus === 'headman' || userStatus === 'assistant'" to="/pending-users" class="sidebar-menu-item submenu-item"><span class="menu-emoji">⏳</span> รายการรออนุมัติ</router-link>
              <router-link v-if="userStatus === 'headman' || userStatus === 'assistant'" to="/all-users" class="sidebar-menu-item submenu-item"><span class="menu-emoji">👤</span> จัดการผู้ใช้งาน</router-link>
              <router-link to="/dashboard" class="sidebar-menu-item submenu-item"><span class="menu-emoji">📊</span> แดชบอร์ด</router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Main content area with top navigation -->
      <div class="main-content-area">
        <nav class="top-nav">
          <div class="nav-container">
            <div class="nav-left">
              <h2>Village Management System</h2>
            </div>
            <div class="nav-right">
              <div class="notification-container" v-if="userStatus === 'headman' || userStatus === 'assistant'">
                <button class="notification-btn" @click="toggleNotifications">
                  Pending Approvals {{ pendingUsers.length > 0 ? '(' + pendingUsers.length + ')' : '' }}
                </button>
                <div class="notification-dropdown" v-if="showNotifications">
                  <h3>Pending Users</h3>
                  <div v-if="pendingUsers.length > 0">
                    <div v-for="user in pendingUsers" :key="user.user_id" class="pending-user">
                      <div>
                        <strong>{{ user.first_name }} {{ user.last_name }}</strong>
                        <div>{{ user.user_email }}</div>
                        <div>Status: {{ user.status }}</div>
                      </div>
                      <button class="approve-btn" @click="approveUser(user.user_id)" :disabled="!isValidStatus(user.status)">Approve</button>
                    </div>
                  </div>
                  <div v-else class="no-pending">
                    ไม่มีผู้ใช้ที่รอการอนุมัติ
                  </div>
                  <div class="dropdown-footer">
                    <router-link to="/pending-users" class="view-all-btn" @click="showNotifications = false">View All Pending Users</router-link>
                  </div>
                </div>
              </div>
              <button class="logout-btn" @click="logout">Logout</button>
            </div>
          </div>
        </nav>

        <div class="content-wrapper">
          <router-view @user-approved="fetchPendingUsers"/>
        </div>
      </div>
    </div>
    <div v-else>
      <router-view @user-approved="fetchPendingUsers"/>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'App',
  data() {
    // Get stored values
    const storedUserId = localStorage.getItem('userId') || '';
    const storedEmail = localStorage.getItem('email') || '';
    let storedStatus = localStorage.getItem('userStatus') || '';

    // ดึงชื่อและนามสกุลจาก localStorage
    const firstName = localStorage.getItem('userFirstName') || '';
    const lastName = localStorage.getItem('userLastName') || '';
    const userFullName = firstName && lastName ? `${firstName} ${lastName}` : 'ผู้ใช้งาน';

    // ดึงเบอร์โทรและที่อยู่จาก localStorage
    const userPhone = localStorage.getItem('userPhone') || '';
    const userAddress = localStorage.getItem('userAddress') || '';

    return {
      pendingUsers: [],
      showNotifications: false,
      showEmployeeMenu: false, // เพิ่มตัวแปรสำหรับควบคุมการแสดงเมนูย่อย
      showUserDetails: false, // เพิ่มตัวแปรสำหรับควบคุมการแสดง/ซ่อนข้อมูลส่วนตัว
      loading: false,
      userId: storedUserId,
      userEmail: storedEmail,
      userStatus: storedStatus,
      userFullName: userFullName,
      userPhone: userPhone,
      userAddress: userAddress,
      profileImageUrl: '',
      pendingUsersInterval: null // เพิ่มตัวแปรสำหรับเก็บ interval ID
    };
  },
  computed: {
    isLoggedIn() {
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      return !!token;
    },
    isHeadmanOrAssistant() {
      const status = localStorage.getItem('userStatus');
      console.log('User status:', status);
      return status === 'headman' || status === 'assistant';
    },
    isLoginPage() {
      const isLoginPage = this.$route && this.$route.path === '/login';
      console.log('Is login page:', isLoginPage);
      return isLoginPage;
    },
    isRegisterPage() {
      const isRegisterPage = this.$route && this.$route.path === '/register';
      console.log('Is register page:', isRegisterPage);
      return isRegisterPage;
    }
  },
  methods: {
    formatRole(role) {
      if (!role) return 'User';
      return role.charAt(0).toUpperCase() + role.slice(1);
    },
    isValidStatus(status) {
      // Check if status is one of the valid statuses
      return ['headman', 'assistant', 'villager'].includes(status);
    },
    toggleNotifications() {
      this.showNotifications = !this.showNotifications;
    },
    toggleEmployeeMenu() {
      this.showEmployeeMenu = !this.showEmployeeMenu;
    },
    toggleUserDetails() {
      this.showUserDetails = !this.showUserDetails;
    },
    async fetchPendingUsers() {
      const isLoggedIn = !!localStorage.getItem('token');
      const userStatus = localStorage.getItem('userStatus');
      const isHeadmanOrAssistant = userStatus === 'headman' || userStatus === 'assistant';

      if (!isLoggedIn || !isHeadmanOrAssistant) return;

      try {
        this.loading = true;
        console.log('Fetching pending users...');

        // ดึงข้อมูลผู้ใช้ที่รอการอนุมัติ
        const response = await api.getPendingUsers();
        let pendingUsers = response.data.pendingUsers || [];
        console.log('Pending users from API:', pendingUsers);

        // ดึงข้อมูลผู้ใช้ทั้งหมดเพื่อหาผู้ใช้ที่มีสถานะ pending
        try {
          const allUsersResponse = await api.getAllUsers();
          if (allUsersResponse.data && allUsersResponse.data.users) {
            // กรองผู้ใช้ที่มีสถานะ pending
            const pendingStatusUsers = allUsersResponse.data.users.filter(user =>
              user.status === 'pending'
            );

            console.log('Users with pending status:', pendingStatusUsers);

            // รวมรายการผู้ใช้ที่รอการอนุมัติ โดยหลีกเลี่ยงการซ้ำกัน
            const combinedUsers = [...pendingUsers];

            pendingStatusUsers.forEach(user => {
              // ตรวจสอบว่าผู้ใช้นี้มีอยู่ในรายการรวมแล้วหรือไม่
              const isDuplicate = combinedUsers.some(existingUser =>
                existingUser.user_id === user.user_id
              );

              // ถ้าไม่ซ้ำ ให้เพิ่มเข้าไปในรายการรวม
              if (!isDuplicate) {
                combinedUsers.push(user);
              }
            });

            this.pendingUsers = combinedUsers;
            console.log('Combined pending users:', this.pendingUsers);
          }
        } catch (allUsersError) {
          console.error('Error fetching all users:', allUsersError);
          // ถ้าไม่สามารถดึงข้อมูลผู้ใช้ทั้งหมดได้ ให้ใช้ข้อมูลจาก pendingUsers เท่านั้น
          this.pendingUsers = pendingUsers;
        }

        // ถ้ายังไม่มีข้อมูล ให้ลองดึงจำนวนผู้ใช้ที่รอการอนุมัติ
        if (this.pendingUsers.length === 0) {
          try {
            const countResponse = await api.getPendingUsersCount();
            console.log('Pending users count:', countResponse.data);

            if (countResponse.data && countResponse.data.count > 0) {
              console.log('Count shows pending users but list is empty, fetching again...');
              // ลองเรียก getPendingUsers อีกครั้ง
              const retryResponse = await api.getPendingUsers();
              this.pendingUsers = retryResponse.data.pendingUsers || [];
              console.log('Retry pending users:', this.pendingUsers);
            }
          } catch (countError) {
            console.error('Error fetching pending users count:', countError);
          }
        }
      } catch (error) {
        console.error('Error in main fetchPendingUsers:', error);
      } finally {
        this.loading = false;
        console.log('Final pending users list:', this.pendingUsers);
      }
    },
    async approveUser(userId) {
      // Find the user to check their status
      const userToApprove = this.pendingUsers.find(user => user.user_id === userId);

      if (!userToApprove) {
        alert('ไม่พบข้อมูลผู้ใช้');
        return;
      }

      // Check if user has a valid status
      if (!this.isValidStatus(userToApprove.status)) {
        alert('ไม่สามารถอนุมัติผู้ใช้ได้ เนื่องจากสถานะไม่ถูกต้อง กรุณาแก้ไขสถานะให้เป็น headman, assistant หรือ villager ก่อน');
        return;
      }

      try {
        await api.approveUser(userId);
        // Remove the approved user from the list
        this.pendingUsers = this.pendingUsers.filter(user => user.user_id !== userId);
        // Emit event to refresh data if needed
        this.$emit('user-approved');
        alert('อนุมัติผู้ใช้เรียบร้อยแล้ว');
      } catch (error) {
        console.error('Error approving user:', error);
        alert('ไม่สามารถอนุมัติผู้ใช้ได้ กรุณาลองอีกครั้ง');
      }
    },
    logout() {
      // ดึง userId จาก localStorage
      const userId = localStorage.getItem('userId');

      // Save profile picture URL before clearing localStorage
      // ใช้ userId ในการดึงรูปภาพเพื่อไม่ให้ปะปนกัน
      const profilePictureUrl = localStorage.getItem(`profilePictureUrl_${userId}`);

      // Clear all localStorage items except profile picture
      localStorage.clear();

      // If we had a profile picture and it's a base64 image, save it to sessionStorage
      // This will persist until the browser tab is closed
      if (userId && profilePictureUrl && profilePictureUrl.startsWith('data:image/')) {
        // เก็บรูปภาพแยกตาม userId เพื่อไม่ให้ปะปนกัน
        sessionStorage.setItem(`lastProfilePicture_${userId}`, profilePictureUrl);
        console.log(`Saved profile picture to sessionStorage for user ID: ${userId}`);
      }

      // Reset app state
      this.showNotifications = false;
      this.pendingUsers = [];
      this.userId = '';
      this.userEmail = '';
      this.userStatus = '';
      this.userFullName = '';
      this.userPhone = '';
      this.userAddress = '';

      // Force navigation to login page
      window.location.href = '/login';
    },
    // Add debounce to prevent too frequent API calls
    _fetchUserProfileDebounced: null,

    async fetchUserProfile() {
      // If we already have a pending request, don't make another one
      if (this._fetchUserProfileDebounced) {
        console.log('Skipping duplicate profile fetch request');
        return;
      }

      // Set a flag to prevent duplicate requests
      this._fetchUserProfileDebounced = true;

      // Clear the flag after 2 seconds
      setTimeout(() => {
        this._fetchUserProfileDebounced = null;
      }, 2000);

      try {
        console.log('Fetching user profile...');

        // ดึง userId จาก localStorage
        const userId = localStorage.getItem('userId');

        // First check for profile picture in localStorage (base64 data) before API call
        // This ensures we have an image to display immediately
        const storedPictureUrl = localStorage.getItem(`profilePictureUrl_${userId}`);
        if (storedPictureUrl && storedPictureUrl.startsWith('data:image/')) {
          console.log(`Using profile picture from localStorage for user ID: ${userId}`);
          this.profileImageUrl = storedPictureUrl;
        }
        // If no localStorage image, check sessionStorage for last profile picture
        else if (sessionStorage.getItem(`lastProfilePicture_${userId}`)) {
          console.log(`Using last profile picture from sessionStorage for user ID: ${userId}`);
          const lastPicture = sessionStorage.getItem(`lastProfilePicture_${userId}`);
          this.profileImageUrl = lastPicture;
          // Also save it back to localStorage for future use
          localStorage.setItem(`profilePictureUrl_${userId}`, lastPicture);
        }

        // Now fetch the user profile from the API
        const response = await api.getUserProfile();
        const user = response.data.user;
        console.log('User profile data:', user);

        if (user) {
          this.userEmail = user.user_email || this.userEmail;
          this.userStatus = user.status || this.userStatus;
          this.userFullName = user.first_name && user.last_name ?
            `${user.first_name} ${user.last_name}` : this.userFullName;
          this.userPhone = user.phone || this.userPhone;
          this.userAddress = user.address || this.userAddress;

          // ถ้ามีรูปภาพจาก API และไม่มีรูปภาพใน localStorage
          if (user.profile_picture && (!storedPictureUrl || !storedPictureUrl.startsWith('data:image/'))) {
            console.log('Profile picture found in API response:', user.profile_picture);

            // ถ้าเป็น URL ภายนอก (เช่น randomuser.me) ใช้โดยตรง
            if (user.profile_picture.startsWith('http')) {
              this.profileImageUrl = user.profile_picture;
            } else {
              // สำหรับ URL ของเซิร์ฟเวอร์ เพิ่ม timestamp และใช้ path แบบสัมพัทธ์
              const timestamp = new Date().getTime();
              const serverUrl = `${user.profile_picture}?t=${timestamp}`;
              this.profileImageUrl = serverUrl;

              // บันทึก URL ของเซิร์ฟเวอร์ลงใน localStorage
              localStorage.setItem(`serverProfilePictureUrl_${userId}`, user.profile_picture);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);

        // Even if API fails, try to use stored images
        const userId = localStorage.getItem('userId');

        // Try localStorage first
        const storedPictureUrl = localStorage.getItem(`profilePictureUrl_${userId}`);
        if (storedPictureUrl && storedPictureUrl.startsWith('data:image/')) {
          console.log(`Using profile picture from localStorage after API error for user ID: ${userId}`);
          this.profileImageUrl = storedPictureUrl;
        }
        // Then try sessionStorage
        else if (sessionStorage.getItem(`lastProfilePicture_${userId}`)) {
          console.log(`Using last profile picture from sessionStorage after API error for user ID: ${userId}`);
          const lastPicture = sessionStorage.getItem(`lastProfilePicture_${userId}`);
          this.profileImageUrl = lastPicture;
          localStorage.setItem(`profilePictureUrl_${userId}`, lastPicture);
        }
        // ถ้าไม่มีรูปภาพใน localStorage หรือ sessionStorage ให้ใช้รูปภาพจาก serverProfilePictureUrl
        else {
          const serverPictureUrl = localStorage.getItem(`serverProfilePictureUrl_${userId}`);
          if (serverPictureUrl) {
            const timestamp = new Date().getTime();
            this.profileImageUrl = `${serverPictureUrl}?t=${timestamp}`;
          }
        }
      }
    },

    getFullImageUrl(url) {
      try {
        // ดึง userId จาก localStorage
        const userId = localStorage.getItem('userId');

        // ถ้าไม่มี userId ให้ใช้ URL ที่ได้รับ
        if (!userId) {
          console.log('No userId found in localStorage');
          return url || '';
        }

        // ถ้าไม่มี URL ให้ลองดึงจาก localStorage
        if (!url) {
          console.log('No URL provided, trying to get from localStorage');

          // ลองดึงจาก localStorage ก่อน
          const storedPictureUrl = localStorage.getItem(`profilePictureUrl_${userId}`);
          if (storedPictureUrl && storedPictureUrl.startsWith('data:image/')) {
            console.log(`Found profile picture in localStorage for user ID: ${userId}`);
            return storedPictureUrl;
          }

          // ถ้าไม่มีใน localStorage ให้ลองดึงจาก sessionStorage
          const lastProfilePicture = sessionStorage.getItem(`lastProfilePicture_${userId}`);
          if (lastProfilePicture && lastProfilePicture.startsWith('data:image/')) {
            console.log(`Found profile picture in sessionStorage for user ID: ${userId}`);
            // บันทึกกลับไปที่ localStorage เพื่อใช้ในอนาคต
            localStorage.setItem(`profilePictureUrl_${userId}`, lastProfilePicture);
            return lastProfilePicture;
          }

          // ถ้าไม่มีทั้งใน localStorage และ sessionStorage ให้ลองดึงจาก serverProfilePictureUrl
          const serverPictureUrl = localStorage.getItem(`serverProfilePictureUrl_${userId}`);
          if (serverPictureUrl) {
            console.log(`Found server profile picture URL for user ID: ${userId}`);
            const timestamp = new Date().getTime();
            return `${serverPictureUrl}?t=${timestamp}`;
          }

          console.log('No profile picture found in any storage');
          return '';
        }

        // ถ้ามี URL ให้ตรวจสอบว่าเป็น URL ประเภทใด

        // If it's a data URL (base64), return as is
        if (url && typeof url === 'string' && url.startsWith('data:')) {
          return url;
        }

        // If it's a relative URL, prepend the API base URL
        if (url && typeof url === 'string' && url.startsWith('/')) {
          // Add a timestamp to prevent caching
          const timestamp = new Date().getTime();
          // Use the correct API URL
          return `${url}?t=${timestamp}`;
        }

        // If it's an https URL (like picsum.photos), return as is
        if (url && typeof url === 'string' && url.startsWith('http')) {
          return url;
        }

        // Otherwise, return the URL as is
        return url;
      } catch (error) {
        console.error('Error in getFullImageUrl:', error);
        return '';
      }
    },

    handleImageError(e) {
      console.log('Image error occurred for:', e.target.src);

      // Prevent infinite loop by checking if the image has already been processed
      if (e.target.dataset.errorHandled) {
        console.log('Image already handled, using placeholder');
        // If we've already tried to handle this error, just use the placeholder
        e.target.src = 'https://via.placeholder.com/256x256?text=Profile';
        return;
      }

      // Mark this image as being processed to prevent infinite loops
      e.target.dataset.errorHandled = 'true';

      // ดึง userId จาก localStorage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.log('No userId found in localStorage');
        e.target.src = 'https://via.placeholder.com/256x256?text=Profile';
        return;
      }

      console.log('Trying to recover image for userId:', userId);

      // Try to use stored base64 image if available in localStorage
      const storedPictureUrl = localStorage.getItem(`profilePictureUrl_${userId}`);
      if (storedPictureUrl && storedPictureUrl.startsWith('data:image/')) {
        console.log('Using image from localStorage');
        e.target.src = storedPictureUrl;
        // Update the profileImageUrl property
        this.profileImageUrl = storedPictureUrl;
        return;
      }

      // Try to use stored base64 image from sessionStorage if available
      const lastProfilePicture = sessionStorage.getItem(`lastProfilePicture_${userId}`);
      if (lastProfilePicture && lastProfilePicture.startsWith('data:image/')) {
        console.log('Using image from sessionStorage');
        e.target.src = lastProfilePicture;
        // Also save it back to localStorage for future use
        localStorage.setItem(`profilePictureUrl_${userId}`, lastProfilePicture);
        // Update the profileImageUrl property
        this.profileImageUrl = lastProfilePicture;
        return;
      }

      // Try to use server URL if available
      const serverPictureUrl = localStorage.getItem(`serverProfilePictureUrl_${userId}`);
      if (serverPictureUrl) {
        console.log('Using server URL:', serverPictureUrl);
        const timestamp = new Date().getTime();
        const fullUrl = `http://localhost:4000${serverPictureUrl}?t=${timestamp}`;
        e.target.src = fullUrl;
        // Update the profileImageUrl property
        this.profileImageUrl = fullUrl;
        return;
      }

      // If all else fails, fall back to placeholder
      console.log('All recovery attempts failed, using placeholder');
      e.target.src = 'https://via.placeholder.com/256x256?text=Profile';
      // Update the profileImageUrl property
      this.profileImageUrl = '';
    }
  },
  watch: {
    isLoggedIn(newVal) {
      if (newVal) {
        // Update user status from localStorage
        this.userStatus = localStorage.getItem('userStatus') || '';
        this.fetchPendingUsers();
      }
    },
    // Watch for route changes to update user status and pending users
    '$route'() {
      if (this.isLoggedIn) {
        this.userStatus = localStorage.getItem('userStatus') || '';
        // เรียกใช้ fetchPendingUsers เมื่อมีการเปลี่ยนเส้นทาง
        if (this.userStatus === 'headman' || this.userStatus === 'assistant') {
          this.fetchPendingUsers();
        }
      }
    }
  },
  mounted() {
    console.log('App component mounted');

    // Force check login status
    const token = localStorage.getItem('token');
    console.log('Token in mounted:', token);

    // Update user status from localStorage
    this.userStatus = localStorage.getItem('userStatus') || '';
    console.log('User status in mounted:', this.userStatus);

    // ดึง userId จาก localStorage
    const userId = localStorage.getItem('userId');
    console.log('User ID from localStorage:', userId);

    // ดึง userEmail จาก localStorage
    const userEmail = localStorage.getItem('email');
    console.log('User email from localStorage:', userEmail);

    // อัปเดตข้อมูลผู้ใช้
    if (userId) {
      this.userId = userId;
    }

    if (userEmail) {
      this.userEmail = userEmail;
    }

    // Try to load profile image from localStorage immediately
    if (userId) {
      console.log('Attempting to load profile image for user ID:', userId);

      // First check localStorage for base64 image
      const storedPictureUrl = localStorage.getItem(`profilePictureUrl_${userId}`);
      if (storedPictureUrl && storedPictureUrl.startsWith('data:image/')) {
        console.log('Found profile image in localStorage');
        this.profileImageUrl = storedPictureUrl;
      }
      // Then check sessionStorage
      else if (sessionStorage.getItem(`lastProfilePicture_${userId}`)) {
        console.log('Found profile image in sessionStorage');
        const lastPicture = sessionStorage.getItem(`lastProfilePicture_${userId}`);
        this.profileImageUrl = lastPicture;
        // Save to localStorage for future use
        localStorage.setItem(`profilePictureUrl_${userId}`, lastPicture);
      }
      // Then check server URL
      else {
        console.log('Checking for server profile picture URL');
        const serverPictureUrl = localStorage.getItem(`serverProfilePictureUrl_${userId}`);
        if (serverPictureUrl) {
          console.log('Found server profile picture URL:', serverPictureUrl);
          const timestamp = new Date().getTime();
          this.profileImageUrl = `${serverPictureUrl}?t=${timestamp}`;
        } else {
          console.log('No profile image found in any storage');
        }
      }
    } else {
      console.log('No user ID found in localStorage');
    }

    if (token) {
      console.log('User is logged in, fetching profile data');

      // Fetch user data if logged in - with a slight delay to ensure UI is responsive first
      setTimeout(() => {
        this.fetchUserProfile();
      }, 500);

      // ตรวจสอบว่าเป็น headman หรือ assistant หรือไม่
      const userStatus = localStorage.getItem('userStatus');
      console.log('User status before fetching pending users:', userStatus);

      if (userStatus === 'headman' || userStatus === 'assistant') {
        // ดึงข้อมูลผู้ใช้ที่รอการอนุมัติทันที - with a slight delay
        setTimeout(() => {
          this.fetchPendingUsers();
        }, 1000);

        // ตั้งค่าให้ดึงข้อมูลผู้ใช้ที่รอการอนุมัติทุก 30 วินาที
        this.pendingUsersInterval = setInterval(() => {
          this.fetchPendingUsers();
        }, 30000); // 30 วินาที
      }

      // Set up event listener for profile updates
      this.profileUpdateHandler = () => {
        console.log('Profile updated event received');

        // Always reload the profile image from localStorage first
        if (userId) {
          const storedPictureUrl = localStorage.getItem(`profilePictureUrl_${userId}`);
          if (storedPictureUrl && storedPictureUrl.startsWith('data:image/')) {
            console.log('Using profile image from localStorage after update');
            this.profileImageUrl = storedPictureUrl;
          }
        }

        // Then fetch the latest profile data
        this.fetchUserProfile();
      };

      window.addEventListener('profile-updated', this.profileUpdateHandler);

      // Force update user status
      if (userStatus) {
        this.userStatus = userStatus;
      }
    } else if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      // Redirect to login if not logged in and not already on login/register page
      console.log('User not logged in, redirecting to login page');
      window.location.href = '/login';
    }
  },

  beforeUnmount() {
    console.log('App component will be unmounted');

    // ทำความสะอาดตัวจับเวลาและตัวฟังก์ชันเมื่อคอมโพเนนต์ถูกทำลาย
    if (this.pendingUsersInterval) {
      console.log('Clearing pending users interval');
      clearInterval(this.pendingUsersInterval);
    }

    if (this.profileUpdateHandler) {
      console.log('Removing profile update event listener');
      window.removeEventListener('profile-updated', this.profileUpdateHandler);
    }
  },

  beforeDestroy() {
    // ล้าง interval เมื่อ component ถูกทำลาย
    if (this.pendingUsersInterval) {
      clearInterval(this.pendingUsersInterval);
    }

    // Clean up event listener
    window.removeEventListener('profile-updated', this.fetchUserProfile);
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&family=Kanit:wght@300;400;500;600&family=Sarabun:wght@300;400;500;600&display=swap');

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

#app {
  font-family: 'Prompt', 'Kanit', 'Sarabun', Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
  margin: 0;
  padding: 0;
  width: 100%;
  position: relative;
}

.app-container {
  display: flex;
  height: 100vh;
}

/* Sidebar Navigation */
.sidebar-nav {
  width: 320px;
  background-color: #2C3E50;
  color: white;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.sidebar-profile {
  padding: 15px 12px;
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
}

.profile-image {
  width: 128px;
  height: 128px;
  margin: 0 auto 15px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info h3 {
  margin: 0 0 5px;
  font-size: 1.2rem;
  color: white;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Prompt', sans-serif;
  letter-spacing: 0.5px;
}

.user-role {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 8px;
}

.role-headman {
  background-color: #007bff;
  color: white;
}

.role-assistant {
  background-color: #28a745;
  color: white;
}

.role-villager, .role-pending, .role-undefined {
  background-color: #ffc107;
  color: #212529;
}

.user-details {
  margin: 12px 0;
  text-align: left;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 5px;
  font-size: 0.85rem;
}

.info-item {
  margin-bottom: 6px;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-wrap: wrap;
}

.info-label {
  font-weight: bold;
  margin-right: 5px;
  color: rgba(255, 255, 255, 0.7);
  min-width: 70px;
}

.info-value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  margin: 6px auto;
  transition: background-color 0.3s;
  width: 80%;
  text-align: center;
  height: 32px;
  box-sizing: border-box;
}

.toggle-details-btn {
  background-color: #6c757d;
  border: none;
  cursor: pointer;
}

.toggle-details-btn:hover {
  background-color: #5a6268;
}

.toggle-details-btn .dropdown-icon {
  margin-left: 5px;
  font-size: 10px;
  transition: transform 0.3s;
}

.edit-profile-btn {
  display: flex;
  background-color: #dc3545;
  text-decoration: none;
}

.edit-profile-btn:hover {
  background-color: #c82333;
}

.edit-profile-btn:hover {
  background-color: #0069d9;
}

.sidebar-divider {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 0;
}

.sidebar-menu {
  padding: 15px 0;
  display: flex;
  flex-direction: column;
}

.sidebar-menu-item {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 12px 16px;
  transition: all 0.3s;
  border-left: 3px solid transparent;
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: 400;
  letter-spacing: 0.5px;
  font-family: 'Prompt', sans-serif;
}

.sidebar-menu-item > *:first-child {
  margin-right: 8px;
}

/* ทำให้อีโมจิมีสีขาวชัดเจน */
.menu-emoji {
  color: white;
  font-size: 1.1em;
  display: inline-block;
  margin-right: 8px;
  filter: brightness(1.2);
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.4);
}

.sidebar-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border-left-color: #3498DB;
}

.sidebar-menu-item.router-link-active {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  border-left-color: #3498DB;
  font-weight: 500;
}

/* เมนูแบบเลื่อนลง */
.dropdown-menu {
  position: relative;
  width: 100%;
}

.dropdown-header {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 12px 16px;
  transition: all 0.3s;
  border-left: 3px solid transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 24px;
  font-weight: 400;
  letter-spacing: 0.5px;
  font-family: 'Prompt', sans-serif;
  cursor: pointer;
}

.dropdown-header:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border-left-color: #3498DB;
}

.dropdown-icon {
  font-size: 16px;
  transition: transform 0.3s;
  margin-left: 8px;
}

.dropdown-icon-open {
  transform: rotate(180deg);
}

.dropdown-content {
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.submenu-item {
  padding-left: 35px !important;
  font-size: 22px;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
  font-family: 'Prompt', sans-serif;
  font-weight: 300;
  letter-spacing: 0.3px;
}

/* Main Content Area */
.main-content-area {
  flex: 1;
  margin-left: 320px;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.top-nav {
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 0;
  height: 60px;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 100%;
}

.nav-left, .nav-right {
  display: flex;
  align-items: center;
}

.nav-left h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.nav-right {
  gap: 15px;
  display: flex;
  align-items: center;
}

.content-wrapper {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  background-color: #f8f9fa;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #45a049;
}



.logout-btn {
  background-color: #f44336;
}

.logout-btn:hover {
  background-color: #d32f2f;
}

.notification-btn {
  background-color: #ff9800;
  position: relative;
}

.notification-btn:hover {
  background-color: #e68a00;
}

.notification-container {
  position: relative;
  display: inline-block;
}

.notification-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  width: 300px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  z-index: 1000;
  text-align: left;
  margin-top: 5px;
}

.notification-dropdown h3 {
  margin-top: 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  color: #333;
}

.pending-user {
  padding: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pending-user:last-child {
  border-bottom: none;
}

.approve-btn {
  padding: 6px 12px;
  font-size: 14px;
}

.no-pending {
  padding: 10px;
  color: #666;
  font-style: italic;
  text-align: center;
}

.dropdown-footer {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #eee;
  text-align: center;
}

.view-all-btn {
  display: inline-block;
  background-color: #007bff;
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.3s;
}

.view-all-btn:hover {
  background-color: #0056b3;
  text-decoration: none;
  color: white;
}

.form-container {
  background-color: #f2f2f2;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
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
  box-sizing: border-box;
}

.error-message {
  color: red;
  margin-top: 10px;
}

.success-message {
  color: green;
  margin-top: 10px;
}

.link {
  color: #4CAF50;
  text-decoration: none;
  margin-top: 15px;
  display: inline-block;
}

.link:hover {
  text-decoration: underline;
}

.profile-image {
  display: inline-block;
  border: 2px solid #ccc; /* กำหนดกรอบรอบๆ รูปภาพ */
  border-radius: 8px; /* ปรับมุมให้โค้งมน */
  padding: 5px; /* เพิ่มช่องว่างระหว่างกรอบและรูปภาพ */
  background-color: #f9f9f9; /* เพิ่มพื้นหลังให้กรอบ */
  overflow: hidden; /* ทำให้รูปภาพไม่ล้นออกจากกรอบ */
}

.profile-img {
  width: 100%;
  height: auto;
  display: block; /* ทำให้รูปภาพอยู่ในบรรทัดเดียว */
  border-radius: 6px; /* ปรับมุมของรูปภาพให้โค้งมน */
}

</style>