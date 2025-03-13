<template>
  <div class="transaction-container">
    <h1>ระบบธุรกรรมการเงิน</h1>
    
    <!-- เลือกสมาชิก -->
    <div class="member-selection">
      <h2>เลือกสมาชิก</h2>
      <div class="form-group">
        <label for="member_id">สมาชิก *</label>
        <select v-model="selectedMemberId" id="member_id" @change="loadMemberData" required>
          <option value="">-- เลือกสมาชิก --</option>
          <option v-for="member in members" :key="member.member_id" :value="member.member_id">
            {{ member.first_name }} {{ member.last_name }} (ID: {{ member.member_id }})
          </option>
        </select>
      </div>
    </div>
    
    <!-- แสดงข้อมูลสมาชิกและยอดเงิน -->
    <div v-if="selectedMemberId && memberData" class="member-info">
      <div class="info-card">
        <h3>ข้อมูลสมาชิก</h3>
        <div class="info-row">
          <div class="info-label">ชื่อ-นามสกุล:</div>
          <div class="info-value">{{ memberData.first_name }} {{ memberData.last_name }}</div>
        </div>
        <div class="info-row">
          <div class="info-label">เบอร์โทรศัพท์:</div>
          <div class="info-value">{{ memberData.phone || '-' }}</div>
        </div>
        <div class="info-row">
          <div class="info-label">ที่อยู่:</div>
          <div class="info-value">{{ formatAddress(memberData) }}</div>
        </div>
      </div>
      
      <div class="balance-card">
        <h3>ยอดเงินปัจจุบัน</h3>
        <div class="balance-row">
          <div class="balance-label">ยอดเงินฝาก:</div>
          <div class="balance-value deposit">{{ formatCurrency(memberBalance.deposit_balance || 0) }}</div>
        </div>
        <div class="balance-row">
          <div class="balance-label">ยอดเงินกู้คงเหลือ:</div>
          <div class="balance-value loan">{{ formatCurrency(memberBalance.loan_balance || 0) }}</div>
        </div>
      </div>
    </div>
    
    <!-- เลือกประเภทธุรกรรม -->
    <div v-if="selectedMemberId" class="transaction-type-selection">
      <h2>เลือกประเภทธุรกรรม</h2>
      <div class="transaction-types">
        <div 
          class="transaction-type-card" 
          :class="{ active: transactionType === 'deposit' }"
          @click="selectTransactionType('deposit')"
        >
          <div class="icon">💰</div>
          <div class="label">ฝากเงิน</div>
        </div>
        <div 
          class="transaction-type-card" 
          :class="{ active: transactionType === 'withdraw', disabled: !canWithdraw }"
          @click="canWithdraw && selectTransactionType('withdraw')"
        >
          <div class="icon">💸</div>
          <div class="label">ถอนเงิน</div>
          <div v-if="!canWithdraw" class="disabled-message">ยอดเงินไม่เพียงพอ</div>
        </div>
        <div 
          class="transaction-type-card" 
          :class="{ active: transactionType === 'loan_repayment', disabled: !hasLoans }"
          @click="hasLoans && selectTransactionType('loan_repayment')"
        >
          <div class="icon">📝</div>
          <div class="label">ชำระเงินกู้</div>
          <div v-if="!hasLoans" class="disabled-message">ไม่มีเงินกู้</div>
        </div>
      </div>
    </div>
    
    <!-- ฟอร์มทำธุรกรรม -->
    <div v-if="transactionType" class="transaction-form">
      <h2>{{ getTransactionTypeTitle() }}</h2>
      
      <!-- ฟอร์มฝากเงิน -->
      <form v-if="transactionType === 'deposit'" @submit.prevent="submitDeposit" class="form">
        <div class="form-group">
          <label for="deposit_amount">จำนวนเงินฝาก (บาท) *</label>
          <input 
            type="number" 
            id="deposit_amount" 
            v-model="amount" 
            min="1" 
            step="0.01" 
            required
            placeholder="กรุณาระบุจำนวนเงิน"
          >
        </div>
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="resetForm">ยกเลิก</button>
          <button type="submit" class="btn-submit">ยืนยันการฝากเงิน</button>
        </div>
      </form>
      
      <!-- ฟอร์มถอนเงิน -->
      <form v-if="transactionType === 'withdraw'" @submit.prevent="submitWithdraw" class="form">
        <div class="form-group">
          <label for="withdraw_amount">จำนวนเงินถอน (บาท) *</label>
          <input 
            type="number" 
            id="withdraw_amount" 
            v-model="amount" 
            min="1" 
            :max="memberBalance.deposit_balance" 
            step="0.01" 
            required
            placeholder="กรุณาระบุจำนวนเงิน"
          >
          <div class="hint">ยอดเงินสูงสุดที่ถอนได้: {{ formatCurrency(memberBalance.deposit_balance) }}</div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="resetForm">ยกเลิก</button>
          <button type="submit" class="btn-submit">ยืนยันการถอนเงิน</button>
        </div>
      </form>
      
      <!-- ฟอร์มชำระเงินกู้ -->
      <form v-if="transactionType === 'loan_repayment'" @submit.prevent="submitLoanRepayment" class="form">
        <div class="form-group">
          <label for="loan_id">เลือกสัญญาเงินกู้ *</label>
          <select v-model="selectedLoanId" id="loan_id" required>
            <option value="">-- เลือกสัญญาเงินกู้ --</option>
            <option v-for="loan in memberLoans" :key="loan.loan_id" :value="loan.loan_id">
              สัญญาเลขที่ {{ loan.loan_id }} - {{ formatCurrency(loan.loan_balance) }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="repayment_amount">จำนวนเงินชำระ (บาท) *</label>
          <input 
            type="number" 
            id="repayment_amount" 
            v-model="amount" 
            min="1" 
            step="0.01" 
            required
            placeholder="กรุณาระบุจำนวนเงิน"
          >
        </div>
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="resetForm">ยกเลิก</button>
          <button type="submit" class="btn-submit">ยืนยันการชำระเงินกู้</button>
        </div>
      </form>
    </div>
    
    <!-- ประวัติธุรกรรม -->
    <div v-if="selectedMemberId && transactions.length > 0" class="transaction-history">
      <h2>ประวัติธุรกรรม</h2>

      <!-- แท็บเลือกประเภทธุรกรรม -->
      <div class="transaction-tabs">
        <button
          class="tab-button"
          :class="{ active: transactionFilter === 'all' }"
          @click="transactionFilter = 'all'"
        >
          ทั้งหมด
        </button>
        <button
          class="tab-button"
          :class="{ active: transactionFilter === 'deposit' }"
          @click="transactionFilter = 'deposit'"
        >
          ฝาก-ถอน
        </button>
        <button
          class="tab-button"
          :class="{ active: transactionFilter === 'loan' }"
          @click="transactionFilter = 'loan'"
        >
          สินเชื่อ
        </button>
      </div>

      <table class="transaction-table">
        <thead>
          <tr>
            <th>วันที่</th>
            <th>ประเภท</th>
            <th>จำนวนเงิน</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in filteredTransactions" :key="transaction.transaction_id">
            <td>{{ formatDate(transaction.transaction_date) }}</td>
            <td>{{ formatTransactionType(transaction.transaction_status) }}</td>
            <td :class="getAmountClass(transaction.transaction_status)">
              {{ formatCurrency(transaction.amount) }}
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredTransactions.length === 0" class="no-transactions">
        ไม่พบรายการธุรกรรมในประเภทที่เลือก
      </div>
    </div>
    
    <!-- Modal แสดงผลการทำรายการ -->
    <div v-if="showResultModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ resultModalTitle }}</h2>
          <span class="close" @click="showResultModal = false">&times;</span>
        </div>
        <div class="modal-body">
          <div class="result-message" :class="{ success: isSuccess, error: !isSuccess }">
            {{ resultMessage }}
          </div>
          <div v-if="isSuccess" class="balance-update">
            <div v-if="resultModalTitle.includes('ฝากเงิน') || resultModalTitle.includes('ถอนเงิน')" class="balance-row">
              <div class="balance-label">ยอดเงินฝากปัจจุบัน:</div>
              <div class="balance-value deposit">{{ formatCurrency(updatedBalance) }}</div>
            </div>
            <div v-if="resultModalTitle.includes('ชำระเงินกู้') || resultModalTitle.includes('รับเงินกู้')" class="balance-row">
              <div class="balance-label">ยอดเงินกู้คงเหลือ:</div>
              <div class="balance-value loan">{{ formatCurrency(updatedBalance) }}</div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-close" @click="closeResultModal">ปิด</button>
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
      members: [],
      selectedMemberId: '',
      memberData: null,
      memberBalance: {
        deposit_balance: 0,
        loan_balance: 0
      },
      memberLoans: [],
      transactionType: '',
      amount: '',
      selectedLoanId: '',
      transactions: [],
      transactionFilter: 'all', // เพิ่มตัวกรองประเภทธุรกรรม: 'all', 'deposit', 'loan'
      showResultModal: false,
      resultModalTitle: '',
      resultMessage: '',
      isSuccess: true,
      updatedBalance: 0
    };
  },
  computed: {
    canWithdraw() {
      return this.memberBalance && this.memberBalance.deposit_balance > 0;
    },
    hasLoans() {
      return this.memberBalance && this.memberBalance.loan_balance > 0;
    },
    // กรองธุรกรรมตามประเภท
    filteredTransactions() {
      if (this.transactionFilter === 'all') {
        return this.transactions;
      } else if (this.transactionFilter === 'deposit') {
        return this.transactions.filter(t =>
          t.transaction_status === 'deposit' || t.transaction_status === 'withdraw'
        );
      } else if (this.transactionFilter === 'loan') {
        return this.transactions.filter(t =>
          t.transaction_status === 'loan_repayment' || t.transaction_status === 'loan_disbursement'
        );
      }
      return this.transactions;
    }
  },
  mounted() {
    this.fetchMembers().then(() => {
      // ตรวจสอบ URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const memberIdParam = urlParams.get('member_id');

      // ถ้ามีการส่ง member_id มาจากหน้าอื่น
      if (memberIdParam) {
        // ตั้งค่า selectedMemberId และโหลดข้อมูล
        this.selectedMemberId = memberIdParam;
        this.loadMemberData();
      }
    });
  },
  methods: {
    async fetchMembers() {
      try {
        const response = await api.getMembers();
        this.members = response.data;
        return response.data;
      } catch (error) {
        console.error('Error fetching members:', error);
        alert('ไม่สามารถดึงข้อมูลสมาชิกได้');
        return [];
      }
    },
    async loadMemberData() {
      if (!this.selectedMemberId) {
        this.resetForm();
        return;
      }

      try {
        // ดึงข้อมูลสมาชิก
        const memberResponse = await api.getMemberById(this.selectedMemberId);
        this.memberData = memberResponse.data;

        // ดึงข้อมูลยอดเงิน
        const balanceResponse = await api.getMemberBalance(this.selectedMemberId);
        this.memberBalance = balanceResponse.data;

        // ดึงข้อมูลเงินกู้
        const loansResponse = await api.getLoans();
        this.memberLoans = loansResponse.data.filter(loan =>
          loan.member_id === parseInt(this.selectedMemberId)
        );

        // ดึงประวัติธุรกรรม
        const transactionsResponse = await api.getMemberTransactions(this.selectedMemberId);
        this.transactions = transactionsResponse.data;

        // รีเซ็ตฟอร์ม
        this.resetTransactionForm();

        // ตรวจสอบ URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const memberIdParam = urlParams.get('member_id');

        // ถ้ามีการส่ง member_id มาจากหน้าอื่น และตรงกับที่เลือก
        if (memberIdParam && memberIdParam === this.selectedMemberId) {
          // ลบ parameter จาก URL โดยไม่ reload หน้า
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      } catch (error) {
        console.error('Error loading member data:', error);
        alert('ไม่สามารถโหลดข้อมูลสมาชิกได้');
      }
    },
    selectTransactionType(type) {
      this.transactionType = type;
      this.amount = '';
      this.selectedLoanId = '';
    },
    getTransactionTypeTitle() {
      switch (this.transactionType) {
        case 'deposit':
          return 'ฝากเงิน';
        case 'withdraw':
          return 'ถอนเงิน';
        case 'loan_repayment':
          return 'ชำระเงินกู้';
        default:
          return '';
      }
    },
    formatAddress(member) {
      if (!member) return '';
      
      const parts = [
        member.address_line1,
        member.subdistrict,
        member.district,
        member.province,
        member.postal_code
      ].filter(part => part && part.trim() !== '');
      
      return parts.join(' ');
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
    async submitDeposit() {
      if (!this.selectedMemberId || !this.amount || this.amount <= 0) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
      }
      
      try {
        const response = await api.depositMoney({
          member_id: this.selectedMemberId,
          amount: parseFloat(this.amount)
        });
        
        this.showSuccessResult(
          'ฝากเงินสำเร็จ',
          `ฝากเงินจำนวน ${this.formatCurrency(this.amount)} เรียบร้อยแล้ว`,
          response.data.current_balance
        );
        
        // รีเฟรชข้อมูล
        this.loadMemberData();
      } catch (error) {
        console.error('Error depositing money:', error);
        this.showErrorResult('เกิดข้อผิดพลาด', 'ไม่สามารถฝากเงินได้ กรุณาลองใหม่อีกครั้ง');
      }
    },
    async submitWithdraw() {
      if (!this.selectedMemberId || !this.amount || this.amount <= 0) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
      }
      
      if (parseFloat(this.amount) > this.memberBalance.deposit_balance) {
        alert('จำนวนเงินที่ต้องการถอนมากกว่ายอดเงินคงเหลือ');
        return;
      }
      
      try {
        const response = await api.withdrawMoney({
          member_id: this.selectedMemberId,
          amount: parseFloat(this.amount)
        });
        
        this.showSuccessResult(
          'ถอนเงินสำเร็จ',
          `ถอนเงินจำนวน ${this.formatCurrency(this.amount)} เรียบร้อยแล้ว`,
          response.data.current_balance
        );
        
        // รีเฟรชข้อมูล
        this.loadMemberData();
      } catch (error) {
        console.error('Error withdrawing money:', error);
        
        let errorMessage = 'ไม่สามารถถอนเงินได้ กรุณาลองใหม่อีกครั้ง';
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        
        this.showErrorResult('เกิดข้อผิดพลาด', errorMessage);
      }
    },
    async submitLoanRepayment() {
      if (!this.selectedMemberId || !this.selectedLoanId || !this.amount || this.amount <= 0) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
      }
      
      try {
        const response = await api.repayLoan({
          member_id: this.selectedMemberId,
          loan_id: this.selectedLoanId,
          amount: parseFloat(this.amount)
        });
        
        this.showSuccessResult(
          'ชำระเงินกู้สำเร็จ',
          `ชำระเงินกู้จำนวน ${this.formatCurrency(this.amount)} เรียบร้อยแล้ว`,
          response.data.current_loan_balance
        );
        
        // รีเฟรชข้อมูล
        this.loadMemberData();
      } catch (error) {
        console.error('Error repaying loan:', error);
        
        let errorMessage = 'ไม่สามารถชำระเงินกู้ได้ กรุณาลองใหม่อีกครั้ง';
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        
        this.showErrorResult('เกิดข้อผิดพลาด', errorMessage);
      }
    },
    showSuccessResult(title, message, balance) {
      this.resultModalTitle = title;
      this.resultMessage = message;
      this.isSuccess = true;
      this.updatedBalance = balance;
      this.showResultModal = true;
    },
    showErrorResult(title, message) {
      this.resultModalTitle = title;
      this.resultMessage = message;
      this.isSuccess = false;
      this.showResultModal = true;
    },
    closeResultModal() {
      this.showResultModal = false;
      this.resetTransactionForm();
    },
    resetTransactionForm() {
      this.transactionType = '';
      this.amount = '';
      this.selectedLoanId = '';
    },
    resetForm() {
      this.memberData = null;
      this.memberBalance = {
        deposit_balance: 0,
        loan_balance: 0
      };
      this.memberLoans = [];
      this.transactions = [];
      this.resetTransactionForm();
    }
  }
};
</script>

<style scoped>
.transaction-container {
  max-width: 1000px;
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

h2 {
  color: #2c3e50;
  margin: 20px 0;
  font-size: 22px;
  border-bottom: 2px solid #4CAF50;
  padding-bottom: 10px;
}

h3 {
  color: #2c3e50;
  margin: 15px 0;
  font-size: 18px;
}

/* Member selection */
.member-selection {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
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

select:focus, input:focus {
  border-color: #4CAF50;
  outline: none;
}

/* Member info */
.member-info {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.info-card, .balance-card {
  flex: 1;
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.info-row, .balance-row {
  display: flex;
  margin-bottom: 10px;
  border-bottom: 1px dotted #eee;
  padding-bottom: 5px;
}

.info-label, .balance-label {
  font-weight: bold;
  width: 120px;
  color: #555;
}

.info-value, .balance-value {
  flex: 1;
}

.balance-value.deposit {
  color: #4CAF50;
  font-weight: bold;
}

.balance-value.loan {
  color: #f44336;
  font-weight: bold;
}

/* Transaction type selection */
.transaction-type-selection {
  margin-bottom: 20px;
}

.transaction-types {
  display: flex;
  gap: 20px;
  justify-content: space-between;
}

.transaction-type-card {
  flex: 1;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.transaction-type-card:hover:not(.disabled) {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.transaction-type-card.active {
  background-color: #e8f5e9;
  border: 2px solid #4CAF50;
}

.transaction-type-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.transaction-type-card .icon {
  font-size: 36px;
  margin-bottom: 10px;
}

.transaction-type-card .label {
  font-weight: bold;
  color: #333;
}

.disabled-message {
  position: absolute;
  bottom: 5px;
  left: 0;
  right: 0;
  font-size: 12px;
  color: #f44336;
}

/* Transaction form */
.transaction-form {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.form {
  max-width: 500px;
  margin: 0 auto;
}

.hint {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.btn-cancel {
  background-color: #f44336;
  color: white;
}

.btn-cancel:hover {
  background-color: #d32f2f;
}

.btn-submit {
  background-color: #4CAF50;
  color: white;
}

.btn-submit:hover {
  background-color: #45a049;
}

.btn-close {
  background-color: #2196F3;
  color: white;
  margin: 0 auto;
  display: block;
}

.btn-close:hover {
  background-color: #0b7dda;
}

/* Transaction history */
.transaction-history {
  margin-top: 30px;
}

.transaction-tabs {
  display: flex;
  margin-bottom: 15px;
  border-bottom: 1px solid #ddd;
}

.tab-button {
  padding: 8px 15px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  margin-right: 5px;
  font-size: 14px;
  color: #555;
}

.tab-button.active {
  background-color: #4CAF50;
  color: white;
  font-weight: bold;
}

.no-transactions {
  text-align: center;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 10px;
  color: #666;
  font-style: italic;
}

.transaction-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
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
}

.amount-positive {
  color: #4CAF50;
  font-weight: bold;
}

.amount-negative {
  color: #f44336;
  font-weight: bold;
}

/* Modal */
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
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  border: none;
  padding: 0;
}

.close {
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  color: #aaa;
}

.close:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.result-message {
  text-align: center;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  font-size: 18px;
}

.result-message.success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.result-message.error {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.balance-update {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.modal-actions {
  text-align: center;
  margin-top: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .member-info {
    flex-direction: column;
  }
  
  .transaction-types {
    flex-direction: column;
  }
  
  .transaction-type-card {
    margin-bottom: 10px;
  }
}
</style>