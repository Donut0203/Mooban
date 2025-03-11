<template>
  <div class="all-users-view">
    <div class="header-container">
      <div class="title-section">
        <h1>All Employees <span class="user-count">({{ filteredUsers.length }} users)</span></h1>
      </div>
      <div class="action-section">
        <button @click="exportToPDF" class="export-btn">
          <i class="fas fa-file-export"></i> Export PDF
        </button>
      </div>
    </div>
    
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
        <option value="pending">Pending</option>
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
                <small>{{ formatDate(user.approval_date) }}</small>
              </span>
              <span v-else>Not approved yet</span>
            </td>
            <td class="actions">
              <button @click="viewUser(user)" class="btn btn-info">View</button>
              <button @click="editUser(user)" class="btn btn-primary">Edit</button>
              <button
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
          <div class="detail-row" v-if="selectedUser.approval_date">
            <div class="detail-label">Approval Date:</div>
            <div class="detail-value">{{ formatDate(selectedUser.approval_date) }}</div>
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
      currentUserStatus: localStorage.getItem('userStatus') || '',
      isExporting: false
    };
  },
  computed: {
    isHeadmanOrAssistant() {
      return this.currentUserStatus === 'headman' || this.currentUserStatus === 'assistant';
    },
    filteredUsers() {
      let result = [...this.users];
      
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
      
      const date = new Date(dateString);
      return date.toLocaleString();
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
      } catch (error) {
        console.error('Error updating user:', error);
        alert('Failed to update user. Please try again.');
      }
    },
    confirmDelete(user) {
      this.userToDelete = { ...user };
    },
    async deleteUser() {
      // Check if user has permission to delete (only headman can delete)
      if (this.currentUserStatus !== 'headman') {
        alert('เฉพาะผู้ใหญ่บ้านเท่านั้นที่สามารถลบข้อมูลได้ กรุณาติดต่อผู้ดูแลระบบ');
        this.userToDelete = null;
        return;
      }

      // Double confirm to prevent accidental deletion
      const confirmDelete = confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของ ${this.userToDelete.first_name} ${this.userToDelete.last_name}?`);
      if (!confirmDelete) {
        this.userToDelete = null;
        return;
      }

      try {
        await api.deleteUser(this.userToDelete.user_id);

        // Remove the user from the local array
        this.users = this.users.filter(u => u.user_id !== this.userToDelete.user_id);

        // Store the current URL to prevent navigation
        const currentPath = window.location.pathname;

        this.userToDelete = null;
        alert('ลบข้อมูลผู้ใช้เรียบร้อยแล้ว');

        // If the page has changed, navigate back to all-users
        if (window.location.pathname !== currentPath && currentPath.includes('/all-users')) {
          window.location.href = '/all-users';
        }
      } catch (error) {
        console.error('Error deleting user:', error);

        // Provide more specific error message based on the error status
        if (error.response) {
          if (error.response.status === 403) {
            alert('ไม่มีสิทธิ์: เฉพาะผู้ใหญ่บ้านเท่านั้นที่สามารถลบข้อมูลได้');
          } else if (error.response.status === 404) {
            alert('ไม่พบข้อมูลผู้ใช้ อาจถูกลบไปแล้ว');
          } else {
            alert(`เกิดข้อผิดพลาดจากเซิร์ฟเวอร์: ${error.response.data.message || 'ไม่ทราบสาเหตุ'}`);
          }
        } else {
          alert('ไม่สามารถลบข้อมูลผู้ใช้ได้ กรุณาตรวจสอบการเชื่อมต่อเครือข่ายและลองอีกครั้ง');
        }

        this.userToDelete = null;
      }
    },

    exportToPDF() {
      if (this.isExporting) return;

      // Check if user has permission to export
      if (!this.isHeadmanOrAssistant) {
        alert('คุณไม่มีสิทธิ์ในการส่งออกไฟล์ กรุณาติดต่อผู้ดูแลระบบ');
        return;
      }

      this.isExporting = true;

      try {
        // Prepare data for the table
        const title = 'เจ้าหน้าที่กลุ่มออมทรัพย์เพื่อการผลิต หมู่ที่6 ต.เขาขี้ฝอย อ.ทัพทัน จ.อุทัยธานี';
        const date = new Date().toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Create a new window for printing
        const printWindow = window.open('', '_blank');

        // Create HTML content for the print window
        let htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${title}</title>
            <style>
              body {
                font-family: 'Sarabun', 'TH Sarabun New', Arial, sans-serif;
                margin: 20px;
              }
              h1 {
                text-align: center;
                color: #333;
                margin-bottom: 20px;
                font-size: 24px;
              }
              .info {
                margin-bottom: 20px;
                text-align: right;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td {
                border: 1px solid #000;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
                font-weight: bold;
                text-align: center;
              }
              .center {
                text-align: center;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                font-size: 14px;
              }
              @media print {
                .no-print {
                  display: none;
                }
                body {
                  margin: 0;
                  padding: 15px;
                }
                table {
                  page-break-inside: auto;
                }
                tr {
                  page-break-inside: avoid;
                  page-break-after: auto;
                }
                thead {
                  display: table-header-group;
                }
              }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <div class="info">
              <p><strong>วันที่:</strong> ${date}</p>
              <p><strong>จำนวนเจ้าหน้าที่ทั้งหมด:</strong> ${this.filteredUsers.length} คน</p>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 5%;">ลำดับ</th>
                  <th style="width: 20%;">ชื่อ-นามสกุล</th>
                  <th style="width: 15%;">เบอร์โทรศัพท์</th>
                  <th style="width: 25%;">ที่อยู่</th>
                  <th style="width: 15%;">สถานะ</th>
                  <th style="width: 20%;">ยืนยันโดย</th>
                </tr>
              </thead>
              <tbody>
        `;

        // Add table rows
        this.filteredUsers.forEach((user, index) => {
          htmlContent += `
            <tr>
              <td class="center">${index + 1}</td>
              <td>${user.first_name} ${user.last_name}</td>
              <td>${user.phone || '-'}</td>
              <td>${user.address || '-'}</td>
              <td>${this.formatStatus(user.status)}</td>
              <td>${user.approved_by ? this.getApproverName(user.approved_by) : '-'}</td>
            </tr>
          `;
        });

        // Close the table and add footer
        htmlContent += `
              </tbody>
            </table>

            <div class="footer">
              <p>รายงานนี้สร้างขึ้นโดยระบบจัดการเจ้าหน้าที่กลุ่มออมทรัพย์เพื่อการผลิต</p>
            </div>

            <div class="no-print" style="text-align: center; margin-top: 20px;">
              <button onclick="window.print();" style="padding: 10px 20px; background-color: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer;">พิมพ์รายงาน</button>
              <button onclick="window.close();" style="padding: 10px 20px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">ปิด</button>
            </div>
          </body>
          </html>
        `;

        // Write the HTML content to the new window
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Show success message
        alert(`สร้างรายงานเจ้าหน้าที่ ${this.filteredUsers.length} คน สำเร็จแล้ว กรุณาคลิกปุ่ม "พิมพ์รายงาน" เพื่อบันทึกเป็น PDF`);
      } catch (error) {
        console.error('Error exporting to PDF:', error);
        alert('ไม่สามารถสร้างรายงาน PDF ได้ กรุณาลองอีกครั้ง');
      } finally {
        this.isExporting = false;
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
.all-users-view {
  width: 100%;
  padding: 20px;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  margin: 0;
  color: #333;
}

.user-count {
  font-size: 0.6em;
  color: #666;
  margin-left: 10px;
  font-weight: normal;
}

.action-section {
  display: flex;
  gap: 10px;
}

.export-btn {
  display: inline-block;
  background-color: #007bff;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.export-btn:hover {
  background-color: #0069d9;
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
  padding: 0.375rem 0.75rem;
  font-size: 0.9rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  cursor: pointer;
}

.btn-primary {
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  background-color: #0069d9;
  border-color: #0062cc;
}

.btn-info {
  color: #fff;
  background-color: #17a2b8;
  border-color: #17a2b8;
}

.btn-info:hover {
  background-color: #138496;
  border-color: #117a8b;
}

.btn-danger {
  color: #fff;
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-danger:hover {
  background-color: #c82333;
  border-color: #bd2130;
}

.btn-secondary {
  color: #fff;
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
  border-color: #545b62;
}

/* Modal styles */
.modal {
  position: fixed;
  z-index: 1050;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: #fefefe;
  margin: auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 80%;
  max-width: 600px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.close {
  position: absolute;
  right: 15px;
  top: 10px;
  color: #aaa;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close:hover {
  color: #333;
}

.user-details {
  margin-top: 20px;
}

.detail-row {
  display: flex;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: bold;
  width: 120px;
  color: #495057;
}

.detail-value {
  flex: 1;
}

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
  min-height: 100px;
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

@media (max-width: 768px) {
  .actions {
    flex-direction: column;
    gap: 5px;
  }
  
  .btn {
    width: 100%;
  }
  
  .modal-content {
    width: 95%;
    padding: 15px;
  }
  
  .detail-row {
    flex-direction: column;
  }
  
  .detail-label {
    width: 100%;
    margin-bottom: 5px;
  }
}
</style>