<template>
  <div class="pending-users">
    <h1>ผู้ใช้ที่รอการอนุมัติ</h1>
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">กำลังโหลดข้อมูล...</div>
    </div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div v-if="pendingUsers.length === 0" class="no-users">
        No pending users
      </div>
      <table v-else class="users-table">
        <thead>
          <tr>
            <th>รหัส</th>
            <th>อีเมล</th>
            <th>ชื่อ-นามสกุล</th>
            <th>เบอร์โทรศัพท์</th>
            <th>สถานะ</th>
            <th>วันที่สร้าง</th>
            <th>การดำเนินการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in pendingUsers" :key="user.user_id">
            <td>{{ user.user_id }}</td>
            <td>{{ user.user_email }}</td>
            <td>{{ user.first_name }} {{ user.last_name }}</td>
            <td>{{ user.phone }}</td>
            <td>{{ user.status }}</td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td>
              <button v-if="isHeadmanOrAssistant" @click="approveUser(user.user_id)" class="approve-btn" :disabled="!isValidStatus(user.status)">ยืนยัน</button>
              <button @click="editUser(user)" class="edit-btn">แก้ไข</button>
              <button v-if="isHeadmanOrAssistant" @click="confirmDelete(user.user_id)" class="delete-btn">ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeEditModal">&times;</span>
        <h2>{{ editingUser.approveAfterSave ? 'แก้ไขและยืนยันผู้ใช้' : (editingUser.user_id ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้') }}</h2>
        <form @submit.prevent="saveUser">
          <div class="form-group">
            <label for="firstName">ชื่อ</label>
            <input type="text" id="firstName" v-model="editingUser.first_name" required>
          </div>
          <div class="form-group">
            <label for="lastName">นามสกุล</label>
            <input type="text" id="lastName" v-model="editingUser.last_name" required>
          </div>
          <div class="form-group">
            <label for="email">อีเมล</label>
            <input type="email" id="email" v-model="editingUser.user_email" required>
          </div>
          <div class="form-group">
            <label for="phone">เบอร์โทรศัพท์</label>
            <input type="text" id="phone" v-model="editingUser.phone">
          </div>
          <div class="form-group">
            <label for="address">ที่อยู่</label>
            <input type="text" id="address" v-model="editingUser.address">
          </div>
          <div class="form-group">
            <label for="status">สถานะ</label>
            <select id="status" v-model="editingUser.status">
              <option value="pending">รอการอนุมัติ</option>
              <option value="villager">ชาวบ้าน</option>
              <option value="assistant">ผู้ช่วย</option>
              <option value="headman">ผู้ใหญ่บ้าน</option>
            </select>
          </div>
          <div class="modal-buttons">
            <button type="button" class="cancel-btn" @click="closeEditModal">ยกเลิก</button>
            <button type="submit" class="save-btn">{{ editingUser.approveAfterSave ? 'บันทึกและยืนยัน' : 'บันทึก' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeDeleteModal">&times;</span>
        <h2>ยืนยันการลบ</h2>
        <p>คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?</p>
        <div class="modal-buttons">
          <button type="button" class="cancel-btn" @click="closeDeleteModal">ยกเลิก</button>
          <button type="button" class="delete-btn" @click="deleteUser">ลบ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'PendingUsersView',
  data() {
    return {
      pendingUsers: [],
      loading: true,
      error: null,
      showEditModal: false,
      showDeleteModal: false,
      editingUser: {
        user_id: null,
        first_name: '',
        last_name: '',
        user_email: '',
        phone: '',
        address: '',
        status: 'pending',
        approveAfterSave: false
      },
      userToDelete: null,
      currentUserStatus: localStorage.getItem('userStatus') || ''
    };
  },
  computed: {
    isHeadmanOrAssistant() {
      return this.currentUserStatus === 'headman' || this.currentUserStatus === 'assistant';
    }
  },
  created() {
    // Load data immediately
    this.loadPendingUsers();
  },
  methods: {
    isValidStatus(status) {
      // Check if status is one of the valid statuses
      return ['headman', 'assistant', 'villager'].includes(status);
    },
    async loadPendingUsers() {
      this.loading = true;
      this.error = null;

      try {
        console.log('Loading pending users...');

        // First, get all pending users from the API
        const pendingResponse = await api.getPendingUsers();
        let pendingUsers = [];

        if (pendingResponse.data && pendingResponse.data.pendingUsers) {
          pendingUsers = pendingResponse.data.pendingUsers;
        }

        // Then, get all users to find any with 'pending' status
        const allUsersResponse = await api.getAllUsers();
        let allUsers = [];

        if (allUsersResponse.data && allUsersResponse.data.users) {
          // Filter users with 'pending' status
          const pendingStatusUsers = allUsersResponse.data.users.filter(user =>
            user.status === 'pending'
          );

          // Combine both lists, avoiding duplicates by user_id
          const combinedUsers = [...pendingUsers];

          pendingStatusUsers.forEach(user => {
            // Check if this user is already in the combined list
            const isDuplicate = combinedUsers.some(existingUser =>
              existingUser.user_id === user.user_id
            );

            // If not a duplicate, add to the combined list
            if (!isDuplicate) {
              combinedUsers.push(user);
            }
          });

          this.pendingUsers = combinedUsers;
        } else {
          // If we couldn't get all users, just use the pending users
          this.pendingUsers = pendingUsers;
        }

        console.log('Combined pending users:', this.pendingUsers);

        if (this.pendingUsers.length === 0) {
          // If no data or empty array, set empty array
          this.pendingUsers = [];
        }
      } catch (error) {
        console.error('Error loading pending users:', error);
        // Set empty array instead of using sample data
        this.pendingUsers = [];
      } finally {
        // Always set loading to false
        this.loading = false;
      }
    },

    // useSampleData function has been removed as we now show "no users" message instead
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },
    
    async approveUser(userId) {
      // Check if user has permission to approve
      if (!this.isHeadmanOrAssistant) {
        alert('คุณไม่มีสิทธิ์ในการอนุมัติผู้ใช้ กรุณาติดต่อผู้ดูแลระบบ');
        return;
      }

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

        alert('อนุมัติผู้ใช้เรียบร้อยแล้ว');
        this.loadPendingUsers();
      } catch (error) {
        console.error('Error approving user:', error);
        alert('ไม่สามารถอนุมัติผู้ใช้ได้ กรุณาลองอีกครั้ง');
      }
    },
    
    editAndApprove(user) {
      // Check if user has permission to approve
      if (!this.isHeadmanOrAssistant) {
        alert('คุณไม่มีสิทธิ์ในการอนุมัติผู้ใช้ กรุณาติดต่อผู้ดูแลระบบ');
        return;
      }

      this.editingUser = { ...user };
      // Set a flag to indicate that we want to approve after saving
      this.editingUser.approveAfterSave = true;
      this.showEditModal = true;
    },

    editUser(user) {
      this.editingUser = { ...user };
      this.editingUser.approveAfterSave = false;
      this.showEditModal = true;
    },
    
    closeEditModal() {
      this.showEditModal = false;
      this.editingUser = {
        user_id: null,
        first_name: '',
        last_name: '',
        user_email: '',
        phone: '',
        address: '',
        status: 'pending',
        approveAfterSave: false
      };
    },
    
    async saveUser() {
      try {
        const userId = this.editingUser.user_id;
        const shouldApprove = this.editingUser.approveAfterSave;

        // Check if user has permission to approve
        if (shouldApprove && !this.isHeadmanOrAssistant) {
          alert('คุณไม่มีสิทธิ์ในการอนุมัติผู้ใช้ กรุณาติดต่อผู้ดูแลระบบ');
          return;
        }

        if (userId) {
          // Update existing user
          await api.updateUser(userId, {
            firstName: this.editingUser.first_name,
            lastName: this.editingUser.last_name,
            email: this.editingUser.user_email,
            phone: this.editingUser.phone,
            address: this.editingUser.address,
            status: this.editingUser.status
          });
        } else {
          // Add new user
          await api.register({
            firstName: this.editingUser.first_name,
            lastName: this.editingUser.last_name,
            email: this.editingUser.user_email,
            phone: this.editingUser.phone,
            address: this.editingUser.address,
            status: this.editingUser.status,
            password: 'Password123' // Default password
          });
        }

        // Check if we need to approve the user after saving
        if (shouldApprove && userId && this.isHeadmanOrAssistant) {
          // Approve the user
          await api.approveUser(userId);

          this.closeEditModal();
          this.loadPendingUsers();
          alert('อัปเดตและอนุมัติผู้ใช้เรียบร้อยแล้ว');
        } else {
          this.closeEditModal();
          this.loadPendingUsers();
          alert(userId ? 'อัปเดตผู้ใช้เรียบร้อยแล้ว' : 'เพิ่มผู้ใช้เรียบร้อยแล้ว');
        }
      } catch (error) {
        console.error('Error saving user:', error);
        alert('ไม่สามารถบันทึกข้อมูลผู้ใช้ได้ กรุณาลองอีกครั้ง');
      }
    },
    
    confirmDelete(userId) {
      // Check if user has permission to delete
      if (!this.isHeadmanOrAssistant) {
        alert('คุณไม่มีสิทธิ์ในการลบผู้ใช้ กรุณาติดต่อผู้ดูแลระบบ');
        return;
      }

      this.userToDelete = userId;
      this.showDeleteModal = true;
    },
    
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.userToDelete = null;
    },
    
    async deleteUser() {
      if (!this.userToDelete) return;

      // Check if user has permission to delete
      if (!this.isHeadmanOrAssistant) {
        alert('คุณไม่มีสิทธิ์ในการลบผู้ใช้ กรุณาติดต่อผู้ดูแลระบบ');
        this.closeDeleteModal();
        return;
      }

      try {
        await api.deleteUser(this.userToDelete);

        this.closeDeleteModal();
        this.loadPendingUsers();
        alert('ลบผู้ใช้เรียบร้อยแล้ว');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('ไม่สามารถลบผู้ใช้ได้ กรุณาลองอีกครั้ง');
      }
    }
  }
};
</script>

<style scoped>
.pending-users {
  padding: 20px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 50px 0;
  padding: 20px;
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 18px;
  color: #666;
}

.error, .no-users {
  margin: 20px 0;
  padding: 10px;
  text-align: center;
}

.error {
  color: red;
  border: 1px solid red;
  border-radius: 4px;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.users-table th, .users-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.users-table th {
  background-color: #f2f2f2;
}

.users-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.users-table tr:hover {
  background-color: #f1f1f1;
}

.approve-btn, .edit-btn, .delete-btn, .save-btn, .cancel-btn, .edit-approve-btn {
  padding: 5px 10px;
  margin: 0 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.approve-btn {
  background-color: #4CAF50;
  color: white;
}

.edit-approve-btn {
  background-color: #FF9800;
  color: white;
}

.edit-btn {
  background-color: #2196F3;
  color: white;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.save-btn {
  background-color: #4CAF50;
  color: white;
}

.cancel-btn {
  background-color: #f44336;
  color: white;
}

/* Modal styles */
.modal {
  display: block;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0,0,0,0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 500px;
  border-radius: 5px;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>