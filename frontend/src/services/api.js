import axios from 'axios';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: '/api',  // ใช้ URL แบบสัมพัทธ์เพื่อให้ทำงานได้กับ proxy ของ Vue
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  },
  timeout: 15000 // Increased timeout to 15 seconds
});

// Log the base URL for debugging
console.log('API Client Base URL:', apiClient.defaults.baseURL);

// Add a request interceptor
apiClient.interceptors.request.use(
  config => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error logging
apiClient.interceptors.response.use(
  response => {
    console.log(`API Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', {
        status: error.response.status,
        url: error.config.url,
        data: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response Error:', {
        url: error.config.url,
        request: error.request
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

const api = {
  // Auth endpoints
  login(credentials) {
    console.log('Login attempt with:', { email: credentials.email, passwordLength: credentials.password?.length || 0 });
    return apiClient.post('/auth/login', credentials)
      .then(response => {
        // บันทึกข้อมูลผู้ใช้ลงใน localStorage
        if (response.data && response.data.user && response.data.user.user_id) {
          localStorage.setItem('userId', response.data.user.user_id);
          console.log(`Saved user ID to localStorage: ${response.data.user.user_id}`);

          // บันทึกข้อมูลอื่น ๆ ที่จำเป็น
          if (response.data.user.status) {
            localStorage.setItem('userStatus', response.data.user.status);
          }
          if (response.data.user.first_name && response.data.user.last_name) {
            localStorage.setItem('userFullName', `${response.data.user.first_name} ${response.data.user.last_name}`);
          }
          if (response.data.user.user_email) {
            localStorage.setItem('email', response.data.user.user_email);
          }
        }
        return response;
      })
      .catch(error => {
        // Add specific error handling for login
        if (!error.response) {
          console.error('Login failed: Connection error');
        }
        throw error;
      });
  },
  register(userData) {
    return apiClient.post('/auth/register', userData);
  },
  // User management endpoints
  getPendingUsers() {
    return apiClient.get('/auth/pending-users');
  },
  approveUser(userId) {
    return apiClient.put(`/auth/approve/${userId}`);
  },
  // User profile
  getUserProfile() {
    return apiClient.get('/auth/profile');
  },
  updateUserProfile(userData) {
    return apiClient.put('/auth/profile', userData);
  },
  // Upload profile picture - ต้องระบุ userId เพื่อให้ตรงกับ route ที่กำหนดไว้
  uploadProfilePicture(imageData) {
    // ดึง userId จาก localStorage
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('No userId found in localStorage when trying to upload profile picture');
      return Promise.reject(new Error('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่อีกครั้ง'));
    }

    console.log(`Uploading profile picture for user ID: ${userId}`);

    // ตรวจสอบว่า imageData มีรูปแบบที่ถูกต้อง
    if (!imageData || !imageData.startsWith('data:image/')) {
      console.error('Invalid image data format');
      return Promise.reject(new Error('รูปแบบข้อมูลรูปภาพไม่ถูกต้อง'));
    }

    // บันทึกรูปภาพลงใน localStorage ทันทีก่อนส่งไปยังเซิร์ฟเวอร์
    localStorage.setItem(`profilePictureUrl_${userId}`, imageData);
    console.log(`Saved profile picture to localStorage for user ID: ${userId}`);

    // บันทึกลงใน sessionStorage เป็นสำรอง
    sessionStorage.setItem(`lastProfilePicture_${userId}`, imageData);
    console.log(`Saved profile picture to sessionStorage for user ID: ${userId}`);

    // บันทึกเวลาที่อัปโหลดล่าสุด
    const uploadTimestamp = new Date().getTime();
    localStorage.setItem(`profilePictureTimestamp_${userId}`, uploadTimestamp.toString());

    return apiClient.post(`/auth/upload-profile-picture/${userId}`, { imageData }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store'
      }
    }).then(response => {
      console.log('Profile picture upload successful:', response.data);

      // บันทึก URL ของเซิร์ฟเวอร์ลงใน localStorage
      if (response.data && response.data.profilePictureUrl) {
        localStorage.setItem(`serverProfilePictureUrl_${userId}`, response.data.profilePictureUrl);
        console.log(`Saved server profile picture URL for user ID: ${userId}`);
      }

      // ส่งอีเวนต์เพื่ออัปเดตรูปภาพโปรไฟล์ในคอมโพเนนต์อื่น ๆ
      window.dispatchEvent(new CustomEvent('profile-updated'));

      return response;
    }).catch(error => {
      console.error('Error uploading profile picture:', error);

      // แม้ว่าจะมีข้อผิดพลาดในการอัปโหลดไปยังเซิร์ฟเวอร์
      // แต่เรายังคงมีรูปภาพที่บันทึกไว้ใน localStorage และ sessionStorage
      // ส่งอีเวนต์เพื่ออัปเดตรูปภาพโปรไฟล์ในคอมโพเนนต์อื่น ๆ
      window.dispatchEvent(new CustomEvent('profile-updated'));

      throw error;
    });
  },
  // Get all users
  getAllUsers() {
    return apiClient.get('/auth/users');
  },
  // Get user by ID
  getUserById(userId) {
    return apiClient.get(`/auth/users/${userId}`);
  },
  // Update user
  updateUser(userId, userData) {
    return apiClient.put(`/auth/users/${userId}`, userData);
  },
  // Delete user
  deleteUser(userId) {
    return apiClient.delete(`/auth/users/${userId}`);
  },
  // Get pending users count
  getPendingUsersCount() {
    return apiClient.get('/auth/pending-users-count');
  },
  // Get dashboard data
  getDashboardData() {
    return apiClient.get('/auth/dashboard');
  },

  // Member management endpoints
  getMembers() {
    return apiClient.get('/members');
  },
  getMemberById(memberId) {
    return apiClient.get(`/members/${memberId}`);
  },
  createMember(memberData) {
    return apiClient.post('/members', memberData);
  },
  updateMember(memberId, memberData) {
    return apiClient.put(`/members/${memberId}`, memberData);
  },
  deleteMember(memberId) {
    return apiClient.delete(`/members/${memberId}`);
  },
  uploadFile(formData) {
    return apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Loan management endpoints
  getLoans() {
    return apiClient.get('/loans');
  },
  getLoanById(loanId) {
    return apiClient.get(`/loans/${loanId}`);
  },
  createLoan(loanData) {
    return apiClient.post('/loans', loanData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  updateLoan(loanId, loanData) {
    return apiClient.put(`/loans/${loanId}`, loanData);
  },
  deleteLoan(loanId) {
    return apiClient.delete(`/loans/${loanId}`);
  },

  // Guarantor management endpoints
  getGuarantorsByLoanId(loanId) {
    return apiClient.get(`/guarantors/loan/${loanId}`);
  },
  createGuarantor(guarantorData) {
    return apiClient.post('/guarantors', guarantorData);
  },
  updateGuarantor(guarantorId, guarantorData) {
    return apiClient.put(`/guarantors/${guarantorId}`, guarantorData);
  },
  deleteGuarantor(guarantorId) {
    return apiClient.delete(`/guarantors/${guarantorId}`);
  },

  // Transaction management endpoints
  getAllTransactions() {
    return apiClient.get('/transactions');
  },
  getMemberTransactions(memberId) {
    return apiClient.get(`/transactions/member/${memberId}`);
  },
  getMemberBalance(memberId) {
    return apiClient.get(`/transactions/balance/${memberId}`);
  },
  depositMoney(data) {
    return apiClient.post('/transactions/deposit', data);
  },
  withdrawMoney(data) {
    return apiClient.post('/transactions/withdraw', data);
  },
  repayLoan(data) {
    return apiClient.post('/transactions/loan-repayment', data);
  }
};

export default api;