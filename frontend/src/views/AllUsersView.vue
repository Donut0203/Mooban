<template>
  <div class="all-users">
    <h1>All Employees</h1>
    
    <div class="filters">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search by Full Name..."
        class="search-input"
      />

      <select v-model="statusFilter" class="status-filter">
        <option value="">All Statuses</option>
        <option value="headman">Headman</option>
        <option value="assistant">Assistant</option>
        <option value="villager">Villager</option>
      </select>
    </div>
    
    <div class="table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th @click="sortBy('user_id')" class="sortable">
              ID <span v-if="sortKey === 'user_id'" :class="sortOrder === 1 ? 'asc' : 'desc'"></span>
            </th>
            <th @click="sortBy('fullName')" class="sortable">
              Full Name <span v-if="sortKey === 'fullName'" :class="sortOrder === 1 ? 'asc' : 'desc'"></span>
            </th>
            <th @click="sortBy('phone')" class="sortable">
              Phone <span v-if="sortKey === 'phone'" :class="sortOrder === 1 ? 'asc' : 'desc'"></span>
            </th>
            <th @click="sortBy('status')" class="sortable">
              Status <span v-if="sortKey === 'status'" :class="sortOrder === 1 ? 'asc' : 'desc'"></span>
            </th>
            <th>Approved By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row">
            <td colspan="6">Loading users...</td>
          </tr>
          <tr v-else-if="filteredUsers.length === 0" class="empty-row">
            <td colspan="6">No users found</td>
          </tr>
          <tr v-for="user in filteredUsers" :key="user.user_id">
            <td>{{ user.user_id }}</td>
            <td>{{ user.first_name }} {{ user.last_name }}</td>
            <td>{{ user.phone || 'N/A' }}</td>
            <td>
              <span class="status-badge" :class="getStatusClass(user.status)">
                {{ formatStatus(user.status) }}
              </span>
            </td>
            <td>
              <span v-if="user.approved_by">
                {{ getApproverName(user.approved_by) }}
                <br>
                <small>{{ formatDate(user.updated_at) }}</small>
              </span>
              <span v-else>Not approved yet</span>
            </td>
            <td class="actions">
              <button @click="viewUser(user)" class="btn btn-info">View</button>
              <button @click="editUser(user)" class="btn btn-primary">Edit</button>
              <button 
                v-if="currentUserStatus === 'headman'" 
                @click="confirmDelete(user)" 
                class="btn btn-danger"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- User Details Modal -->
    <div v-if="selectedUser" class="modal">
      <div class="modal-content">
        <span class="close" @click="selectedUser = null">&times;</span>
        <h2>User Details</h2>
        <div class="user-details">
          <div class="detail-row">
            <div class="detail-label">ID:</div>
            <div class="detail-value">{{ selectedUser.user_id }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Email:</div>
            <div class="detail-value">{{ selectedUser.user_email }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Name:</div>
            <div class="detail-value">{{ selectedUser.first_name }} {{ selectedUser.last_name }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Phone:</div>
            <div class="detail-value">{{ selectedUser.phone || 'N/A' }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Address:</div>
            <div class="detail-value">{{ selectedUser.address || 'N/A' }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Status:</div>
            <div class="detail-value">
              <span class="status-badge" :class="getStatusClass(selectedUser.status)">
                {{ formatStatus(selectedUser.status) }}
              </span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Approved:</div>
            <div class="detail-value">{{ selectedUser.is_approved ? 'Yes' : 'No' }}</div>
          </div>
          <div class="detail-row" v-if="selectedUser.approved_by">
            <div class="detail-label">Approved By:</div>
            <div class="detail-value">{{ getApproverName(selectedUser.approved_by) }}</div>
          </div>
          <div class="detail-row" v-if="selectedUser.updated_at">
            <div class="detail-label">Last Updated:</div>
            <div class="detail-value">{{ formatDate(selectedUser.updated_at) }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Created:</div>
            <div class="detail-value">{{ formatDate(selectedUser.created_at) }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Edit User Modal -->
    <div v-if="editingUser" class="modal">
      <div class="modal-content">
        <span class="close" @click="cancelEdit">&times;</span>
        <h2>Edit User</h2>
        <form @submit.prevent="saveUser" class="edit-form">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input type="text" id="firstName" v-model="editingUser.first_name" required>
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input type="text" id="lastName" v-model="editingUser.last_name" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="editingUser.user_email" required>
          </div>
          <div class="form-group">
            <label for="phone">Phone</label>
            <input type="tel" id="phone" v-model="editingUser.phone">
          </div>
          <div class="form-group">
            <label for="address">Address</label>
            <textarea id="address" v-model="editingUser.address"></textarea>
          </div>
          <div class="form-group">
            <label for="status">Status</label>
            <select id="status" v-model="editingUser.status" required>
              <option value="headman">Headman</option>
              <option value="assistant">Assistant</option>
              <option value="villager">Villager</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" @click="cancelEdit" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="userToDelete" class="modal">
      <div class="modal-content">
        <span class="close" @click="userToDelete = null">&times;</span>
        <h2>Confirm Delete</h2>
        <p>Are you sure you want to delete {{ userToDelete.first_name }} {{ userToDelete.last_name }}?</p>
        <p class="warning">This action cannot be undone.</p>
        <div class="form-actions">
          <button @click="userToDelete = null" class="btn btn-secondary">Cancel</button>
          <button @click="deleteUser" class="btn btn-danger">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'AllUsersView',
  data() {
    return {
      users: [],
      approvers: {}, // Map of user IDs to names for approvers
      loading: true,
      error: null,
      searchQuery: '',
      statusFilter: '',
      sortKey: 'user_id',
      sortOrder: 1, // 1 for ascending, -1 for descending
      selectedUser: null,
      editingUser: null,
      userToDelete: null,
      currentUserStatus: localStorage.getItem('userStatus') || ''
    };
  },
  computed: {
    filteredUsers() {
      // First filter out users with status 'pending' - they should only appear in PendingUsersView
      let result = this.users.filter(user => user.status !== 'pending');

      // Apply search filter - only by Full Name
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(user => {
          const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
          return fullName.includes(query);
        });
      }

      // Apply status filter
      if (this.statusFilter) {
        result = result.filter(user => user.status === this.statusFilter);
      }

      // Apply sorting
      result.sort((a, b) => {
        let valueA, valueB;

        if (this.sortKey === 'fullName') {
          valueA = `${a.first_name} ${a.last_name}`.toLowerCase();
          valueB = `${b.first_name} ${b.last_name}`.toLowerCase();
        } else {
          valueA = a[this.sortKey];
          valueB = b[this.sortKey];

          // Handle null or undefined values
          if (valueA === null || valueA === undefined) valueA = '';
          if (valueB === null || valueB === undefined) valueB = '';

          // Convert to lowercase if string
          if (typeof valueA === 'string') valueA = valueA.toLowerCase();
          if (typeof valueB === 'string') valueB = valueB.toLowerCase();
        }

        if (valueA < valueB) return -1 * this.sortOrder;
        if (valueA > valueB) return 1 * this.sortOrder;
        return 0;
      });

      return result;
    }
  },
  methods: {
    async fetchUsers() {
      this.loading = true;
      try {
        const response = await api.getAllUsers();
        this.users = response.data.users;
        
        // Extract unique approver IDs
        const approverIds = [...new Set(
          this.users
            .filter(user => user.approved_by)
            .map(user => user.approved_by)
        )];
        
        // Fetch approver names
        for (const approverId of approverIds) {
          try {
            const response = await api.getUserById(approverId);
            const approver = response.data;
            this.approvers[approverId] = `${approver.first_name} ${approver.last_name}`;
          } catch (error) {
            console.error(`Error fetching approver ${approverId}:`, error);
            this.approvers[approverId] = `User #${approverId}`;
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        this.error = 'Failed to load users. Please try again.';
      } finally {
        this.loading = false;
      }
    },
    sortBy(key) {
      if (this.sortKey === key) {
        // If already sorting by this key, reverse the order
        this.sortOrder = -this.sortOrder;
      } else {
        // Otherwise, sort by the new key in ascending order
        this.sortKey = key;
        this.sortOrder = 1;
      }
    },
    formatStatus(status) {
      if (!status) return 'Unknown';
      
      // Capitalize first letter
      return status.charAt(0).toUpperCase() + status.slice(1);
    },
    getStatusClass(status) {
      if (!status) return 'status-unknown';
      
      switch(status.toLowerCase()) {
        case 'headman': return 'status-headman';
        case 'assistant': return 'status-assistant';
        case 'villager': return 'status-villager';
        case 'pending': return 'status-pending';
        default: return 'status-unknown';
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';

      try {
        // แปลงวันที่เป็นวัตถุ Date
        const date = new Date(dateString);

        // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
        if (isNaN(date.getTime())) {
          return 'Invalid date';
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
        return 'Invalid date';
      }
    },
    getApproverName(approverId) {
      return this.approvers[approverId] || `User #${approverId}`;
    },
    viewUser(user) {
      this.selectedUser = { ...user };
    },
    editUser(user) {
      this.editingUser = { ...user };
    },
    cancelEdit() {
      this.editingUser = null;
    },
    async saveUser() {
      try {
        // Check if status is being changed to 'pending'
        const isPendingStatus = this.editingUser.status === 'pending';

        await api.updateUser(this.editingUser.user_id, {
          firstName: this.editingUser.first_name,
          lastName: this.editingUser.last_name,
          email: this.editingUser.user_email,
          phone: this.editingUser.phone,
          address: this.editingUser.address,
          status: this.editingUser.status
        });

        // Update the user in the local array
        const index = this.users.findIndex(u => u.user_id === this.editingUser.user_id);
        if (index !== -1) {
          this.users[index] = { ...this.editingUser };
        }

        this.editingUser = null;

        // If status was changed to 'pending', inform the user and refresh the page
        if (isPendingStatus) {
          alert('ผู้ใช้ถูกเปลี่ยนสถานะเป็น "รอการอนุมัติ" และจะถูกย้ายไปยังหน้ารายการรออนุมัติ');
          // Refresh the page to update the list
          this.fetchUsers();
        }
      } catch (error) {
        console.error('Error updating user:', error);
        alert('Failed to update user. Please try again.');
      }
    },
    confirmDelete(user) {
      this.userToDelete = { ...user };
    },
    async deleteUser() {
      try {
        await api.deleteUser(this.userToDelete.user_id);
        
        // Remove the user from the local array
        this.users = this.users.filter(u => u.user_id !== this.userToDelete.user_id);
        
        this.userToDelete = null;
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  },
  mounted() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login page if not logged in
      window.location.href = '/login';
      return;
    }

    this.fetchUsers();
  }
};
</script>

<style scoped>
.all-users {
  width: 100%;
  padding: 0;
  margin-left: 0;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}

.filters {
  display: flex;
  margin-bottom: 20px;
  gap: 10px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.status-filter {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 150px;
}

.table-container {
  overflow-x: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th, .users-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.users-table th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #495057;
}

.users-table tr:hover {
  background-color: #f5f5f5;
}

.sortable {
  cursor: pointer;
  position: relative;
}

.sortable:hover {
  background-color: #e9ecef;
}

.asc::after {
  content: " ▲";
  font-size: 0.8em;
}

.desc::after {
  content: " ▼";
  font-size: 0.8em;
}

.loading-row td, .empty-row td {
  text-align: center;
  padding: 30px;
  color: #6c757d;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: bold;
}

.status-headman {
  background-color: #cce5ff;
  color: #004085;
}

.status-assistant {
  background-color: #d4edda;
  color: #155724;
}

.status-villager {
  background-color: #fff3cd;
  color: #856404;
}

.status-pending {
  background-color: #f8d7da;
  color: #721c24;
}

.status-unknown {
  background-color: #e2e3e5;
  color: #383d41;
}

.actions {
  display: flex;
  gap: 5px;
}

.btn {
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 6px 12px;
  font-size: 0.9rem;
  line-height: 1.5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.btn-info {
  color: #fff;
  background-color: #17a2b8;
  border-color: #17a2b8;
}

.btn-primary {
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
}

.btn-danger {
  color: #fff;
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-secondary {
  color: #fff;
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn:hover {
  opacity: 0.9;
}

/* Modal styles */
.modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  color: #aaa;
}

.close:hover {
  color: #333;
}

/* User details styles */
.user-details {
  margin-top: 20px;
}

.detail-row {
  display: flex;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.detail-label {
  font-weight: bold;
  width: 120px;
  color: #495057;
}

.detail-value {
  flex: 1;
}

/* Form styles */
.edit-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #495057;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.warning {
  color: #dc3545;
  font-weight: bold;
}
</style>