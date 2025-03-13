<template>
  <div class="transaction-history-container">
    <h1>ประวัติธุรกรรมทั้งหมด</h1>
    
    <!-- ตัวกรองข้อมูล -->
    <div class="filters">
      <div class="filter-group">
        <label for="member-filter">กรองตามสมาชิก</label>
        <select id="member-filter" v-model="memberFilter">
          <option value="">ทั้งหมด</option>
          <option v-for="member in uniqueMembers" :key="member.member_id" :value="member.member_id">
            {{ member.name }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="type-filter">กรองตามประเภทธุรกรรม</label>
        <select id="type-filter" v-model="typeFilter">
          <option value="">ทั้งหมด</option>
          <option value="deposit">ฝากเงิน</option>
          <option value="withdraw">ถอนเงิน</option>
          <option value="loan_repayment">ชำระเงินกู้</option>
          <option value="loan_disbursement">รับเงินกู้</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="date-filter">กรองตามวันที่</label>
        <div class="date-range">
          <input type="date" id="date-from" v-model="dateFrom" placeholder="จาก">
          <span>ถึง</span>
          <input type="date" id="date-to" v-model="dateTo" placeholder="ถึง">
        </div>
      </div>
      
      <button class="btn-reset" @click="resetFilters">รีเซ็ตตัวกรอง</button>
    </div>
    
    <!-- สรุปข้อมูล -->
    <div class="summary">
      <div class="summary-card">
        <div class="summary-title">จำนวนธุรกรรมทั้งหมด</div>
        <div class="summary-value">{{ filteredTransactions.length }}</div>
      </div>
      
      <div class="summary-card">
        <div class="summary-title">ยอดฝากรวม</div>
        <div class="summary-value deposit">{{ formatCurrency(totalDeposit) }}</div>
      </div>
      
      <div class="summary-card">
        <div class="summary-title">ยอดถอนรวม</div>
        <div class="summary-value withdraw">{{ formatCurrency(totalWithdraw) }}</div>
      </div>
      
      <div class="summary-card">
        <div class="summary-title">ยอดชำระเงินกู้รวม</div>
        <div class="summary-value repayment">{{ formatCurrency(totalRepayment) }}</div>
      </div>
    </div>
    
    <!-- ตารางแสดงข้อมูล -->
    <div class="table-container">
      <table class="transaction-table">
        <thead>
          <tr>
            <th @click="sortBy('transaction_id')">
              รหัสธุรกรรม
              <span v-if="sortKey === 'transaction_id'" :class="sortOrder === 1 ? 'sort-asc' : 'sort-desc'"></span>
            </th>
            <th @click="sortBy('name')">
              ชื่อสมาชิก
              <span v-if="sortKey === 'name'" :class="sortOrder === 1 ? 'sort-asc' : 'sort-desc'"></span>
            </th>
            <th @click="sortBy('transaction_status')">
              ประเภทธุรกรรม
              <span v-if="sortKey === 'transaction_status'" :class="sortOrder === 1 ? 'sort-asc' : 'sort-desc'"></span>
            </th>
            <th @click="sortBy('amount')">
              จำนวนเงิน
              <span v-if="sortKey === 'amount'" :class="sortOrder === 1 ? 'sort-asc' : 'sort-desc'"></span>
            </th>
            <th @click="sortBy('transaction_date')">
              วันที่ทำรายการ
              <span v-if="sortKey === 'transaction_date'" :class="sortOrder === 1 ? 'sort-asc' : 'sort-desc'"></span>
            </th>
            <th>ผู้บันทึกรายการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="loading">กำลังโหลดข้อมูล...</td>
          </tr>
          <tr v-else-if="filteredTransactions.length === 0">
            <td colspan="6" class="no-data">ไม่พบข้อมูลธุรกรรม</td>
          </tr>
          <tr v-for="transaction in paginatedTransactions" :key="transaction.transaction_id">
            <td>{{ transaction.transaction_id }}</td>
            <td>{{ transaction.name }}</td>
            <td>{{ formatTransactionType(transaction.transaction_status) }}</td>
            <td :class="getAmountClass(transaction.transaction_status)">
              {{ formatCurrency(transaction.amount) }}
            </td>
            <td>{{ formatDate(transaction.transaction_date) }}</td>
            <td>{{ getCreatorName(transaction.created_by) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- การแบ่งหน้า -->
    <div class="pagination" v-if="totalPages > 1">
      <button 
        class="page-btn" 
        :class="{ disabled: currentPage === 1 }"
        @click="currentPage > 1 && (currentPage--)"
      >
        &laquo; ก่อนหน้า
      </button>
      
      <div class="page-info">
        หน้า {{ currentPage }} จาก {{ totalPages }}
      </div>
      
      <button 
        class="page-btn" 
        :class="{ disabled: currentPage === totalPages }"
        @click="currentPage < totalPages && (currentPage++)"
      >
        ถัดไป &raquo;
      </button>
    </div>
    
    <!-- ปุ่มพิมพ์รายงาน -->
    <div class="export-actions">
      <button class="btn-export" @click="exportToPDF">
        <i class="fas fa-file-pdf"></i> พิมพ์รายงาน PDF
      </button>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  data() {
    return {
      transactions: [],
      users: {},
      loading: true,
      memberFilter: '',
      typeFilter: '',
      dateFrom: '',
      dateTo: '',
      sortKey: 'transaction_date',
      sortOrder: -1, // -1 for descending, 1 for ascending
      currentPage: 1,
      itemsPerPage: 10
    };
  },
  computed: {
    uniqueMembers() {
      const members = [];
      const memberIds = new Set();
      
      this.transactions.forEach(transaction => {
        if (!memberIds.has(transaction.member_id)) {
          memberIds.add(transaction.member_id);
          members.push({
            member_id: transaction.member_id,
            name: transaction.name
          });
        }
      });
      
      return members.sort((a, b) => a.name.localeCompare(b.name));
    },
    filteredTransactions() {
      return this.transactions.filter(transaction => {
        // Filter by member
        if (this.memberFilter && transaction.member_id !== parseInt(this.memberFilter)) {
          return false;
        }
        
        // Filter by transaction type
        if (this.typeFilter && transaction.transaction_status !== this.typeFilter) {
          return false;
        }
        
        // Filter by date range
        if (this.dateFrom || this.dateTo) {
          const transactionDate = new Date(transaction.transaction_date);
          
          if (this.dateFrom) {
            const fromDate = new Date(this.dateFrom);
            if (transactionDate < fromDate) {
              return false;
            }
          }
          
          if (this.dateTo) {
            const toDate = new Date(this.dateTo);
            toDate.setHours(23, 59, 59, 999); // End of the day
            if (transactionDate > toDate) {
              return false;
            }
          }
        }
        
        return true;
      }).sort((a, b) => {
        let valueA = a[this.sortKey];
        let valueB = b[this.sortKey];
        
        // Handle special case for sorting by name
        if (this.sortKey === 'name') {
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
        }
        
        // Handle date sorting
        if (this.sortKey === 'transaction_date') {
          valueA = new Date(valueA).getTime();
          valueB = new Date(valueB).getTime();
        }
        
        if (valueA < valueB) return -1 * this.sortOrder;
        if (valueA > valueB) return 1 * this.sortOrder;
        return 0;
      });
    },
    paginatedTransactions() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredTransactions.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
    },
    totalDeposit() {
      return this.filteredTransactions
        .filter(t => t.transaction_status === 'deposit')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    },
    totalWithdraw() {
      return this.filteredTransactions
        .filter(t => t.transaction_status === 'withdraw')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    },
    totalRepayment() {
      return this.filteredTransactions
        .filter(t => t.transaction_status === 'loan_repayment')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    }
  },
  mounted() {
    this.fetchTransactions();
    this.fetchUsers();
  },
  methods: {
    async fetchTransactions() {
      this.loading = true;
      try {
        const response = await api.getAllTransactions();
        this.transactions = response.data;
      } catch (error) {
        console.error('Error fetching transactions:', error);
        alert('ไม่สามารถดึงข้อมูลธุรกรรมได้');
      } finally {
        this.loading = false;
      }
    },
    async fetchUsers() {
      try {
        const response = await api.getAllUsers();
        const users = response.data.users;
        
        // Create a map of user IDs to names
        this.users = users.reduce((map, user) => {
          map[user.user_id] = `${user.first_name} ${user.last_name}`;
          return map;
        }, {});
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },
    sortBy(key) {
      if (this.sortKey === key) {
        this.sortOrder = -this.sortOrder;
      } else {
        this.sortKey = key;
        this.sortOrder = 1;
      }
      
      // Reset to first page when sorting changes
      this.currentPage = 1;
    },
    resetFilters() {
      this.memberFilter = '';
      this.typeFilter = '';
      this.dateFrom = '';
      this.dateTo = '';
      this.currentPage = 1;
    },
    formatCurrency(value) {
      if (value === undefined || value === null) return '0.00 บาท';
      
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 2
      }).format(value);
    },
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    formatTransactionType(type) {
      switch (type) {
        case 'deposit':
          return 'ฝากเงิน';
        case 'withdraw':
          return 'ถอนเงิน';
        case 'loan_repayment':
          return 'ชำระเงินกู้';
        case 'loan_disbursement':
          return 'รับเงินกู้';
        default:
          return type;
      }
    },
    getAmountClass(type) {
      switch (type) {
        case 'deposit':
        case 'loan_disbursement':
          return 'amount-positive';
        case 'withdraw':
        case 'loan_repayment':
          return 'amount-negative';
        default:
          return '';
      }
    },
    getCreatorName(userId) {
      return this.users[userId] || `ผู้ใช้ #${userId}`;
    },
    exportToPDF() {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        alert('กรุณาอนุญาตให้เปิดหน้าต่างป๊อปอัพเพื่อพิมพ์เอกสาร');
        return;
      }
      
      // Prepare data for the report
      const title = 'รายงานธุรกรรมทางการเงิน';
      const date = new Date().toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Create filters description
      let filtersText = 'ทั้งหมด';
      if (this.memberFilter) {
        const member = this.uniqueMembers.find(m => m.member_id === parseInt(this.memberFilter));
        filtersText = `สมาชิก: ${member ? member.name : this.memberFilter}`;
      }
      if (this.typeFilter) {
        filtersText += ` | ประเภท: ${this.formatTransactionType(this.typeFilter)}`;
      }
      if (this.dateFrom || this.dateTo) {
        filtersText += ` | วันที่: ${this.dateFrom || '-'} ถึง ${this.dateTo || '-'}`;
      }
      
      // Create HTML content for the print window
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Sarabun', sans-serif;
              margin: 20px;
              line-height: 1.5;
            }
            h1 {
              text-align: center;
              margin-bottom: 10px;
            }
            .report-info {
              text-align: right;
              margin-bottom: 20px;
            }
            .filters {
              margin-bottom: 20px;
              padding: 10px;
              background-color: #f5f5f5;
              border-radius: 5px;
            }
            .summary {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .summary-card {
              flex: 1;
              padding: 10px;
              border: 1px solid #ddd;
              border-radius: 5px;
              text-align: center;
              margin: 0 5px;
            }
            .summary-title {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .deposit {
              color: #4CAF50;
            }
            .withdraw {
              color: #f44336;
            }
            .repayment {
              color: #2196F3;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .amount-positive {
              color: #4CAF50;
            }
            .amount-negative {
              color: #f44336;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 14px;
              color: #666;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          
          <div class="report-info">
            <p>วันที่พิมพ์: ${date}</p>
          </div>
          
          <div class="filters">
            <strong>ตัวกรอง:</strong> ${filtersText}
          </div>
          
          <div class="summary">
            <div class="summary-card">
              <div class="summary-title">จำนวนธุรกรรม</div>
              <div>${this.filteredTransactions.length} รายการ</div>
            </div>
            
            <div class="summary-card">
              <div class="summary-title">ยอดฝากรวม</div>
              <div class="deposit">${this.formatCurrency(this.totalDeposit)}</div>
            </div>
            
            <div class="summary-card">
              <div class="summary-title">ยอดถอนรวม</div>
              <div class="withdraw">${this.formatCurrency(this.totalWithdraw)}</div>
            </div>
            
            <div class="summary-card">
              <div class="summary-title">ยอดชำระเงินกู้รวม</div>
              <div class="repayment">${this.formatCurrency(this.totalRepayment)}</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>รหัสธุรกรรม</th>
                <th>ชื่อสมาชิก</th>
                <th>ประเภทธุรกรรม</th>
                <th>จำนวนเงิน</th>
                <th>วันที่ทำรายการ</th>
                <th>ผู้บันทึกรายการ</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      // Add table rows
      this.filteredTransactions.forEach(transaction => {
        htmlContent += `
          <tr>
            <td>${transaction.transaction_id}</td>
            <td>${transaction.name}</td>
            <td>${this.formatTransactionType(transaction.transaction_status)}</td>
            <td class="${this.getAmountClass(transaction.transaction_status)}">
              ${this.formatCurrency(transaction.amount)}
            </td>
            <td>${this.formatDate(transaction.transaction_date)}</td>
            <td>${this.getCreatorName(transaction.created_by)}</td>
          </tr>
        `;
      });
      
      // Close the table and add footer
      htmlContent += `
            </tbody>
          </table>
          
          <div class="footer">
            <p>รายงานนี้สร้างขึ้นโดยระบบจัดการธุรกรรมทางการเงิน</p>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print();" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">พิมพ์รายงาน</button>
            <button onclick="window.close();" style="padding: 10px 20px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">ปิด</button>
          </div>
        </body>
        </html>
      `;
      
      // Write the HTML content to the new window
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  },
  watch: {
    // Reset to first page when filters change
    memberFilter() {
      this.currentPage = 1;
    },
    typeFilter() {
      this.currentPage = 1;
    },
    dateFrom() {
      this.currentPage = 1;
    },
    dateTo() {
      this.currentPage = 1;
    }
  }
};
</script>

<style scoped>
.transaction-history-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Sarabun', sans-serif;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 28px;
}

/* Filters */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  align-items: flex-end;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

select, input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-range input {
  flex: 1;
}

.btn-reset {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  height: 42px;
}

.btn-reset:hover {
  background-color: #d32f2f;
}

/* Summary */
.summary {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.summary-card {
  flex: 1;
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.summary-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #555;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
}

.summary-value.deposit {
  color: #4CAF50;
}

.summary-value.withdraw {
  color: #f44336;
}

.summary-value.repayment {
  color: #2196F3;
}

/* Table */
.table-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

.transaction-table {
  width: 100%;
  border-collapse: collapse;
}

.transaction-table th, .transaction-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.transaction-table th {
  background-color: #f5f5f5;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  position: relative;
}

.transaction-table th:hover {
  background-color: #e9ecef;
}

.sort-asc::after {
  content: " ▲";
  font-size: 0.8em;
}

.sort-desc::after {
  content: " ▼";
  font-size: 0.8em;
}

.loading, .no-data {
  text-align: center;
  padding: 30px;
  color: #666;
}

.amount-positive {
  color: #4CAF50;
  font-weight: bold;
}

.amount-negative {
  color: #f44336;
  font-weight: bold;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.page-btn {
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.page-btn:hover:not(.disabled) {
  background-color: #0b7dda;
}

.page-btn.disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.page-info {
  font-size: 16px;
  color: #555;
}

/* Export actions */
.export-actions {
  text-align: center;
  margin-top: 20px;
}

.btn-export {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.btn-export:hover {
  background-color: #45a049;
}

/* Responsive */
@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .summary {
    flex-wrap: wrap;
  }
  
  .summary-card {
    min-width: calc(50% - 15px);
    margin-bottom: 15px;
  }
}
</style>