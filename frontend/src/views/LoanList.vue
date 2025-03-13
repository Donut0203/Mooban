<template>
  <div class="loan-list-container">
    <div class="header">
      <h1>รายการสินเชื่อ</h1>
      <router-link to="/loan-form" class="btn-add">เพิ่มข้อมูลสินเชื่อ</router-link>
    </div>

    <!-- ตารางแสดงข้อมูลสินเชื่อ -->
    <div class="table-container">
      <div class="search-bar">
        <input type="text" v-model="searchQuery" placeholder="ค้นหาผู้กู้...">
      </div>
      <table class="loan-table">
        <thead>
          <tr>
            <th>รหัสสินเชื่อ</th>
            <th>ชื่อผู้กู้</th>
            <th>จำนวนเงินกู้</th>
            <th>อัตราดอกเบี้ย</th>
            <th>ระยะเวลาชำระคืน</th>
            <th>วันที่เริ่มต้น</th>
            <th>วันที่สิ้นสุด</th>
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loan in filteredLoans" :key="loan.loan_id">
            <td>{{ loan.loan_id }}</td>
            <td>{{ loan.borrower_name }}</td>
            <td>{{ formatCurrency(loan.loan_balance) }}</td>
            <td>{{ loan.interest_rate }}%</td>
            <td>{{ loan.repayment_period }} เดือน</td>
            <td>{{ formatDate(loan.start_date) }}</td>
            <td>{{ formatDate(loan.end_date) }}</td>
            <td class="actions">
              <button class="btn-view" @click="viewLoan(loan)">ดู</button>
              <button class="btn-edit" @click="editLoan(loan)">แก้ไข</button>
              <button class="btn-delete" @click="confirmDelete(loan)">ลบ</button>
            </td>
          </tr>
          <tr v-if="loans.length === 0">
            <td colspan="8" class="no-data">ไม่พบข้อมูลสินเชื่อ</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal แสดงรายละเอียดสินเชื่อ -->
    <div class="modal" v-if="showViewModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>รายละเอียดสินเชื่อ</h2>
          <span class="close" @click="showViewModal = false">&times;</span>
        </div>
        <div class="modal-body loan-details">
          <div class="detail-row">
            <div class="detail-label">รหัสสินเชื่อ:</div>
            <div class="detail-value">{{ selectedLoan.loan_id }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">ชื่อผู้กู้:</div>
            <div class="detail-value">{{ selectedLoan.borrower_name }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">จำนวนเงินกู้:</div>
            <div class="detail-value">{{ formatCurrency(selectedLoan.loan_balance) }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">อัตราดอกเบี้ย:</div>
            <div class="detail-value">{{ selectedLoan.interest_rate }}%</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">ระยะเวลาชำระคืน:</div>
            <div class="detail-value">{{ selectedLoan.repayment_period }} เดือน</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">วันที่เริ่มต้น:</div>
            <div class="detail-value">{{ formatDate(selectedLoan.start_date) }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">วันที่สิ้นสุด:</div>
            <div class="detail-value">{{ formatDate(selectedLoan.end_date) }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">ต้องการหลักประกัน:</div>
            <div class="detail-value">{{ selectedLoan.guarantee_required ? 'ใช่' : 'ไม่ใช่' }}</div>
          </div>

          <!-- ข้อมูลผู้ค้ำประกัน -->
          <h3>ข้อมูลผู้ค้ำประกัน</h3>
          <div v-if="selectedLoan.guarantors && selectedLoan.guarantors.length > 0">
            <div v-for="(guarantor, index) in selectedLoan.guarantors" :key="index" class="guarantor-section">
              <h4>ผู้ค้ำประกันคนที่ {{ index + 1 }}</h4>
              <div class="detail-row">
                <div class="detail-label">ชื่อผู้ค้ำประกัน:</div>
                <div class="detail-value">{{ guarantor.guarantor_name }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">เลขบัตรประชาชน:</div>
                <div class="detail-value">{{ guarantor.guarantor_id_card }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">ที่อยู่:</div>
                <div class="detail-value">{{ guarantor.guarantor_address }}</div>
              </div>
            </div>
          </div>
          <div v-else class="no-guarantor">
            <p>ไม่มีข้อมูลผู้ค้ำประกัน</p>
          </div>

          <div class="detail-row">
            <div class="detail-label">ผู้สร้างข้อมูล:</div>
            <div class="detail-value">{{ selectedLoan.created_by }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">วันที่สร้างข้อมูล:</div>
            <div class="detail-value">{{ formatDate(selectedLoan.created_at) }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">ผู้แก้ไขล่าสุด:</div>
            <div class="detail-value">{{ selectedLoan.updated_by }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">วันที่แก้ไขล่าสุด:</div>
            <div class="detail-value">{{ formatDate(selectedLoan.updated_at) }}</div>
          </div>
          
          <!-- ปุ่มปิด -->
          <button class="btn-close" @click="showViewModal = false">ปิด</button>

          <!-- ปุ่มปริ้น PDF -->
          <button class="btn-print" @click="printPDF">พิมพ์ PDF</button>
        </div>
      </div>
    </div>

    <!-- Modal ยืนยันการลบ -->
    <div class="modal" v-if="showDeleteModal">
      <div class="modal-content delete-modal">
        <div class="modal-header">
          <h2>ยืนยันการลบ</h2>
          <span class="close" @click="showDeleteModal = false">&times;</span>
        </div>
        <div class="modal-body">
          <p>คุณต้องการลบข้อมูลสินเชื่อของ {{ selectedLoan.borrower_name }} ใช่หรือไม่?</p>
          <div class="form-actions">
            <button class="btn-cancel" @click="showDeleteModal = false">ยกเลิก</button>
            <button class="btn-delete" @click="deleteLoan">ยืนยันการลบ</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  data() {
    return {
      loans: [], // เก็บข้อมูลสินเชื่อทั้งหมด
      searchQuery: '',
      selectedLoan: null,
      showViewModal: false,
      showDeleteModal: false
    };
  },
  computed: {
    filteredLoans() {
      return this.loans.filter(loan => {
        return (
          loan.borrower_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          loan.loan_id.toString().includes(this.searchQuery)
        );
      });
    }
  },
  mounted() {
    // โหลดข้อมูลสินเชื่อเมื่อคอมโพเนนต์ถูกโหลด
    this.loadLoans();
  },
  methods: {
    // โหลดข้อมูลสินเชื่อทั้งหมด
    async loadLoans() {
      try {
        const response = await api.getLoans();
        this.loans = response.data.map(loan => {
          // เพิ่มชื่อผู้กู้โดยดึงจากข้อมูลสมาชิก
          return {
            ...loan,
            borrower_name: `${loan.member_first_name || ''} ${loan.member_last_name || ''}`.trim() || 'ไม่ระบุชื่อ'
          };
        });
      } catch (error) {
        console.error('Error loading loans:', error);
        alert('ไม่สามารถโหลดข้อมูลสินเชื่อได้');
      }
    },

    // ดูรายละเอียดสินเชื่อ
    async viewLoan(loan) {
      try {
        // ดึงข้อมูลสินเชื่อแบบละเอียดจาก API
        const response = await api.getLoanById(loan.loan_id);
        this.selectedLoan = response.data;
        
        // ดึงข้อมูลผู้ค้ำประกัน
        const guarantorsResponse = await api.getGuarantorsByLoanId(loan.loan_id);
        this.selectedLoan.guarantors = guarantorsResponse.data;
        
        this.showViewModal = true;
      } catch (error) {
        console.error('Error fetching loan details:', error);
        alert('ไม่สามารถดึงข้อมูลรายละเอียดสินเชื่อได้');
      }
    },

    // แก้ไขข้อมูลสินเชื่อ
    editLoan(loan) {
      // นำทางไปยังหน้าแก้ไขสินเชื่อพร้อมส่ง ID
      this.$router.push(`/loan-form/${loan.loan_id}`);
    },

    // ยืนยันการลบ
    confirmDelete(loan) {
      this.selectedLoan = loan;
      this.showDeleteModal = true;
    },

    // ลบสินเชื่อ
    async deleteLoan() {
      try {
        await api.deleteLoan(this.selectedLoan.loan_id);
        alert('ลบข้อมูลสินเชื่อเรียบร้อยแล้ว');
        this.showDeleteModal = false;
        this.loadLoans();
      } catch (error) {
        console.error('Error deleting loan:', error);
        alert('ไม่สามารถลบข้อมูลสินเชื่อได้');
      }
    },

    // พิมพ์ PDF
    printPDF() {
      if (!this.selectedLoan) return;

      // เตรียมข้อมูลสำหรับการพิมพ์
      const printWindow = window.open('', '_blank');

      if (!printWindow) {
        alert('กรุณาอนุญาตให้เปิดหน้าต่างป๊อปอัพเพื่อพิมพ์เอกสาร');
        return;
      }

      // สร้าง HTML สำหรับการพิมพ์
      const loan = this.selectedLoan;
      const guarantors = loan.guarantors || [];

      // สร้าง HTML content
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>รายละเอียดสินเชื่อ - ${loan.loan_id}</title>
          <meta charset="utf-8">
          <style>
            body { font-family: "Sarabun", sans-serif; padding: 20px; line-height: 1.5; }
            .header { text-align: center; margin-bottom: 30px; }
            .loan-info { margin-bottom: 30px; }
            .info-row { display: flex; margin-bottom: 10px; border-bottom: 1px dotted #ccc; padding-bottom: 5px; }
            .label { font-weight: bold; width: 200px; }
            .value { flex: 1; }
            .guarantor-section { margin-top: 20px; margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; }
            h3 { margin-top: 30px; color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 5px; }
            h4 { margin-top: 10px; color: #4CAF50; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>รายละเอียดสินเชื่อ</h1>
          </div>

          <div class="loan-info">
            <div class="info-row">
              <div class="label">รหัสสินเชื่อ:</div>
              <div class="value">${loan.loan_id}</div>
            </div>
            <div class="info-row">
              <div class="label">ชื่อผู้กู้:</div>
              <div class="value">${loan.borrower_name || 'ไม่ระบุชื่อ'}</div>
            </div>
            <div class="info-row">
              <div class="label">จำนวนเงินกู้:</div>
              <div class="value">${this.formatCurrency(loan.loan_balance)}</div>
            </div>
            <div class="info-row">
              <div class="label">อัตราดอกเบี้ย:</div>
              <div class="value">${loan.interest_rate}%</div>
            </div>
            <div class="info-row">
              <div class="label">ระยะเวลาชำระคืน:</div>
              <div class="value">${loan.repayment_period} เดือน</div>
            </div>
            <div class="info-row">
              <div class="label">วันที่เริ่มต้น:</div>
              <div class="value">${this.formatDate(loan.start_date)}</div>
            </div>
            <div class="info-row">
              <div class="label">วันที่สิ้นสุด:</div>
              <div class="value">${this.formatDate(loan.end_date)}</div>
            </div>
            <div class="info-row">
              <div class="label">ต้องการหลักประกัน:</div>
              <div class="value">${loan.guarantee_required ? 'ใช่' : 'ไม่ใช่'}</div>
            </div>
          </div>

          <h3>ข้อมูลผู้ค้ำประกัน</h3>
      `;

      // เพิ่มข้อมูลผู้ค้ำประกัน
      if (guarantors.length > 0) {
        guarantors.forEach((guarantor, index) => {
          htmlContent += `
            <div class="guarantor-section">
              <h4>ผู้ค้ำประกันคนที่ ${index + 1}</h4>
              <div class="info-row">
                <div class="label">ชื่อผู้ค้ำประกัน:</div>
                <div class="value">${guarantor.guarantor_name}</div>
              </div>
              <div class="info-row">
                <div class="label">เลขบัตรประชาชน:</div>
                <div class="value">${guarantor.guarantor_id_card}</div>
              </div>
              <div class="info-row">
                <div class="label">ที่อยู่:</div>
                <div class="value">${guarantor.guarantor_address}</div>
              </div>
            </div>
          `;
        });
      } else {
        htmlContent += `<p>ไม่มีข้อมูลผู้ค้ำประกัน</p>`;
      }

      // เพิ่มข้อมูลการสร้างและแก้ไข
      htmlContent += `
          <div class="info-row">
            <div class="label">ผู้สร้างข้อมูล:</div>
            <div class="value">${loan.created_by || '-'}</div>
          </div>
          <div class="info-row">
            <div class="label">วันที่สร้างข้อมูล:</div>
            <div class="value">${this.formatDate(loan.created_at)}</div>
          </div>
          <div class="info-row">
            <div class="label">ผู้แก้ไขล่าสุด:</div>
            <div class="value">${loan.updated_by || '-'}</div>
          </div>
          <div class="info-row">
            <div class="label">วันที่แก้ไขล่าสุด:</div>
            <div class="value">${this.formatDate(loan.updated_at)}</div>
          </div>

          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print();" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">พิมพ์เอกสาร</button>
            <button onclick="window.close();" style="padding: 10px 20px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">ปิด</button>
          </div>
        </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    },

    // จัดรูปแบบวันที่
    formatDate(dateString) {
      if (!dateString) return '-';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
      }
    },

    // จัดรูปแบบเงิน
    formatCurrency(value) {
      if (value === undefined || value === null) return '-';
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(value);
    }
  }
};
</script>

<style scoped>
/* สไตล์ทั่วไป */
.loan-list-container {
  font-family: 'Sarabun', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  color: #2c3e50;
  font-size: 28px;
  margin: 0;
}

/* สไตล์ปุ่ม */
button, .btn-add {
  cursor: pointer;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-add {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  font-size: 16px;
}

.btn-add:hover {
  background-color: #45a049;
}

.btn-view {
  background-color: #2196F3;
  color: white;
  margin-right: 5px;
}

.btn-view:hover {
  background-color: #0b7dda;
}

.btn-edit {
  background-color: #FFC107;
  color: #333;
  margin-right: 5px;
}

.btn-edit:hover {
  background-color: #e0a800;
}

.btn-delete {
  background-color: #F44336;
  color: white;
}

.btn-delete:hover {
  background-color: #d32f2f;
}

.btn-cancel {
  background-color: #9e9e9e;
  color: white;
  margin-right: 10px;
}

.btn-cancel:hover {
  background-color: #757575;
}

.btn-close, .btn-print {
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
}

.btn-close {
  background-color: #9e9e9e;
  color: white;
  margin-right: 10px;
}

.btn-print {
  background-color: #4CAF50;
  color: white;
}

/* สไตล์ตาราง */
.table-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-top: 20px;
}

.search-bar {
  padding: 15px;
  background-color: #f5f5f5;
}

.search-bar input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.loan-table {
  width: 100%;
  border-collapse: collapse;
}

.loan-table th {
  background-color: #3f51b5;
  color: white;
  text-align: left;
  padding: 12px 15px;
  font-weight: 500;
}

.loan-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
}

.loan-table tr:hover {
  background-color: #f5f5f5;
}

.loan-table .actions {
  white-space: nowrap;
}

.no-data {
  text-align: center;
  padding: 30px;
  color: #757575;
}

/* สไตล์ Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  border-radius: 8px;
  width: 80%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.delete-modal {
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #ddd;
  background-color: #f5f5f5;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.close {
  font-size: 28px;
  font-weight: bold;
  color: #757575;
  cursor: pointer;
}

.close:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

/* สไตล์รายละเอียดสินเชื่อ */
.loan-details {
  padding: 10px;
}

.detail-row {
  display: flex;
  margin-bottom: 15px;
  border-bottom: 1px dotted #ddd;
  padding-bottom: 5px;
}

.detail-label {
  font-weight: bold;
  width: 200px;
  color: #555;
}

.detail-value {
  flex: 1;
}

.guarantor-section {
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.guarantor-section h4 {
  color: #4CAF50;
  margin-top: 0;
  margin-bottom: 15px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
}

.no-guarantor {
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 5px;
  text-align: center;
  color: #757575;
}

h3 {
  margin-top: 30px;
  color: #333;
  border-bottom: 2px solid #4CAF50;
  padding-bottom: 5px;
}

/* Responsive */
@media (max-width: 768px) {
  .loan-list-container {
    padding: 10px;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .btn-add {
    margin-top: 10px;
    width: 100%;
  }
  
  .modal-content {
    width: 95%;
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