<template> 
<div class="loan"></div>
    <div>
      <h2>เพิ่มข้อมูลสินเชื่อ</h2>
      <form @submit.prevent="handleSubmit">
        <!-- ข้อมูลผู้กู้ -->
        <div>
          <label for="full_name">ชื่อ-นามสกุล *</label>
          <input v-model="loan.full_name" type="text" id="full_name" required />
        </div>
        
        <div>
          <label for="phone">เบอร์โทร *</label>
          <input v-model="loan.phone" type="text" id="phone" required />
        </div>
    
        <div class="form-group">
              <label for="bank_name">ชื่อธนาคาร <span class="required">*</span></label>
              <select id="bank_name" v-model="formData.bank_name" required>
                <option value="">เลือกธนาคาร</option>
                <option value="กรุงเทพ">ธนาคารกรุงเทพ</option>
                <option value="กสิกรไทย">ธนาคารกสิกรไทย</option>
                <option value="กรุงไทย">ธนาคารกรุงไทย</option>
                <option value="ไทยพาณิชย์">ธนาคารไทยพาณิชย์</option>
                <option value="ออมสิน">ธนาคารออมสิน</option>
                <option value="ธกส">ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>
    
        <div>
          <label for="account_number">เลขบัญชี *</label>
          <input v-model="loan.account_number" type="text" id="account_number" required />
        </div>
    
        <div>
          <label for="id_card">เลขบัตรประชาชน *</label>
          <input v-model="loan.id_card" type="text" id="id_card" required />
        </div>
    
        <div>
          <label for="address">ที่อยู่ *</label>
          <input v-model="loan.address" type="text" id="address" required />
        </div>
    
        <div>
          <label for="subdistrict">ตำบล *</label>
          <input v-model="loan.subdistrict" type="text" id="subdistrict" required />
        </div>
    
        <div>
          <label for="district">อำเภอ *</label>
          <input v-model="loan.district" type="text" id="district" required />
        </div>
    
        <div>
          <label for="province">จังหวัด *</label>
          <input v-model="loan.province" type="text" id="province" required />
        </div>
    
        <div>
          <label for="postal_code">รหัสไปรษณีย์ *</label>
          <input v-model="loan.postal_code" type="text" id="postal_code" required />
        </div>
    
        <div>
          <label for="first_payment_date">กำหนดวันชำระงวดแรก *</label>
          <input v-model="loan.first_payment_date" type="date" id="first_payment_date" required />
        </div>
    
        <div>
          <label for="loan_amount">จำนวนเงินต้น *</label>
          <input v-model="loan.loan_amount" type="number" id="loan_amount" required />
        </div>
    
        <div>
          <label for="monthly_interest">ชำระดอกเบี้ยต่อเดือน *</label>
          <input v-model="loan.monthly_interest" type="number" id="monthly_interest" required />
        </div>
    
        <!-- อัพโหลดเอกสาร -->
        <div>
          <label for="id_card_image">สำเนาบัตรประชาชน ผู้กู้ *</label>
          <input type="file" id="id_card_image" required />
        </div>
    
        <div>
          <label for="house_registration_image">สำเนาทะเบียนบ้าน ผู้กู้ *</label>
          <input type="file" id="house_registration_image" required />
        </div>
    
        <!-- ข้อมูลผู้ค้ำประกัน -->
        <h3>ข้อมูลผู้ค้ำประกัน</h3>
        
        <div>
          <label for="guarantor1_name">ชื่อผู้ค้ำประกัน 1 *</label>
          <input v-model="guarantors[0].name" type="text" id="guarantor1_name" required />
        </div>
    
        <div>
          <label for="guarantor1_id_card">เลขบัตรประชาชน ผู้ค้ำประกัน 1 *</label>
          <input v-model="guarantors[0].id_card" type="text" id="guarantor1_id_card" required />
        </div>
    
        <div>
          <label for="guarantor1_address">ที่อยู่ผู้ค้ำประกัน 1 *</label>
          <input v-model="guarantors[0].address" type="text" id="guarantor1_address" required />
        </div>
    
        <div>
          <label for="guarantor2_name">ชื่อผู้ค้ำประกัน 2 *</label>
          <input v-model="guarantors[1].name" type="text" id="guarantor2_name" required />
        </div>
    
        <div>
          <label for="guarantor2_id_card">เลขบัตรประชาชน ผู้ค้ำประกัน 2 *</label>
          <input v-model="guarantors[1].id_card" type="text" id="guarantor2_id_card" required />
        </div>
    
        <div>
          <label for="guarantor2_address">ที่อยู่ผู้ค้ำประกัน 2 *</label>
          <input v-model="guarantors[1].address" type="text" id="guarantor2_address" required />
        </div>
    
        <!-- ปุ่มการกระทำ -->
        <div>
          <button type="submit">บันทึก</button>
          <button type="button" @click="handleCancel">ยกเลิก</button>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        loan: {
          loan_id: null, // เพิ่ม loan_id
          full_name: '',
          phone: '',
          banks: [],
          account_number: '',
          id_card: '',
          address: '',
          subdistrict: '',
          district: '',
          province: '',
          postal_code: '',
          first_payment_date: '',
          loan_amount: '',
          monthly_interest: '',
          interest_rate: null, // เพิ่ม interest_rate
          repayment_period: null, // เพิ่ม repayment_period
          start_date: null, // เพิ่ม start_date
          end_date: null, // เพิ่ม end_date
          guarantee_required: 1, // ค่า default guarantee_required
          created_by: null, // ค่า default created_by
          updated_by: null, // ค่า default updated_by
          created_at: new Date().toISOString(), // เพิ่ม created_at
          updated_at: new Date().toISOString(), // เพิ่ม updated_at
        },
        guarantors: [
          { name: '', id_card: '', address: '' },
          { name: '', id_card: '', address: '' },
        ],
      };
    },
    methods: {
      handleSubmit() {
        // ตรวจสอบว่าผู้ค้ำประกันเป็นคนเดียวกับผู้กู้หรือไม่
        if (
          this.guarantors[0].id_card === this.loan.id_card ||
          this.guarantors[1].id_card === this.loan.id_card
        ) {
          alert('ผู้ค้ำประกันห้ามเป็นผู้กู้');
          return;
        }
    
        // ส่งข้อมูลสินเชื่อและผู้ค้ำประกันไปยัง backend
        const loanData = {
          loan: this.loan,
          guarantors: this.guarantors,
        };
    
        console.log(loanData);
        // เพิ่มโค้ดเพื่อส่งข้อมูลไปที่ backend
      },
      handleCancel() {
        // รีเซ็ตฟอร์ม
        this.loan = {
          loan_id: null,
          full_name: '',
          phone: '',
          banks: [],
          account_number: '',
          id_card: '',
          address: '',
          subdistrict: '',
          district: '',
          province: '',
          postal_code: '',
          first_payment_date: '',
          loan_amount: '',
          monthly_interest: '',
          interest_rate: null,
          repayment_period: null,
          start_date: null,
          end_date: null,
          guarantee_required: 1,
          created_by: null,
          updated_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        this.guarantors = [
          { name: '', id_card: '', address: '' },
          { name: '', id_card: '', address: '' },
        ];
      },
    },
  };
  </script>

  <style scoped>
  /* General styles */
body {
  font-family: 'Arial', sans-serif;
  background-color: #f4f7fa;
  margin: 0;
  padding: 0;
}

h2, h3 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

form {
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

input[type="text"],
input[type="number"],
input[type="date"],
select,
input[type="file"] {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  background-color: #f9f9f9;
}

input[type="text"]:focus,
input[type="number"]:focus,
input[type="date"]:focus,
select:focus,
input[type="file"]:focus {
  border-color: #0056b3;
  outline: none;
  background-color: #fff;
}

/* For required fields */
.required {
  color: red;
}

/* Form buttons */
button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-right: 10px;
}

button[type="submit"]:hover {
  background-color: #45a049;
}

button[type="button"] {
  background-color: #f44336;
}

button[type="button"]:hover {
  background-color: #e53935;
}

/* Styling for sections */
h3 {
  margin-top: 40px;
  margin-bottom: 20px;
  color: #333;
  font-size: 22px;
}

/* Form group with select input */
.form-group {
  margin-bottom: 20px;
}

/* Responsiveness */
@media (max-width: 768px) {
  form {
    padding: 20px;
  }

  label, input, select {
    font-size: 14px;
  }

  button {
    width: 100%;
    margin-top: 10px;
  }

  .form-group {
    margin-bottom: 15px;
  }
}

</style>