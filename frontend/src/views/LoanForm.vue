<template>
  <div class="loan">
    <div>
      <h2>เพิ่มข้อมูลสินเชื่อ</h2>
      <form @submit.prevent="handleSubmit">
        <!-- เลือกสมาชิกที่จะกู้ -->
        <div>
          <label for="member_id">เลือกสมาชิกที่จะกู้ *</label>
          <select v-model="loan.member_id" id="member_id" @change="loadMemberData" required>
            <option value="">-- เลือกสมาชิก --</option>
            <option v-for="member in members" :key="member.member_id" :value="member.member_id">
              {{ member.first_name }} {{ member.last_name }} (ID: {{ member.member_id }})
            </option>
          </select>
        </div>

        <!-- ข้อมูลผู้กู้ (แสดงข้อมูลจากสมาชิกที่เลือก) -->
        <div>
          <label for="full_name">ชื่อ-นามสกุล *</label>
          <input v-model="loan.full_name" type="text" id="full_name" readonly />
        </div>

        <div>
          <label for="phone">เบอร์โทร *</label>
          <input v-model="loan.phone" type="text" id="phone" readonly />
        </div>
    
        <div class="form-group">
          <label for="bank_name">ชื่อธนาคาร <span class="required">*</span></label>
          <select id="bank_name" v-model="loan.bank_name" required>
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
          <label for="loan_balance">จำนวนเงินต้น *</label>
          <input v-model="loan.loan_balance" type="number" id="loan_balance" @input="calculateMonthlyInterest" required />
        </div>

        <div>
          <label for="monthly_interest">ชำระดอกเบี้ยต่อเดือน (1% ของเงินต้น) *</label>
          <input v-model="loan.monthly_interest" type="number" id="monthly_interest" readonly />
        </div>

        <div>
          <label for="total_amount">ยอดเงินรวม (เงินต้น+ดอกเบี้ย)</label>
          <input v-model="loan.total_amount" type="number" id="total_amount" readonly />
          <div class="hint">ยอดเงินรวมทั้งหมดที่ต้องชำระ (เงินต้น + ดอกเบี้ย 1% ต่อเดือน x 12 เดือน)</div>
        </div>

        <div>
          <label for="repayment_period">ระยะเวลาชำระคืน (เดือน)</label>
          <input v-model="loan.repayment_period" type="number" id="repayment_period" value="12" readonly />
          <div class="hint">ระยะเวลาชำระคืนคงที่ 12 เดือน (1 ปี)</div>
        </div>
    
        <!-- ข้อมูลและเอกสารผู้กู้ -->
        <div class="borrower-section">
          <h4>เอกสารผู้กู้</h4>
          <div>
            <label for="id_card_image">สำเนาบัตรประชาชน ผู้กู้ *</label>
            <input type="file" id="id_card_image" @change="handleIdCardUpload" required />
          </div>

          <div>
            <label for="house_registration_image">สำเนาทะเบียนบ้าน ผู้กู้ *</label>
            <input type="file" id="house_registration_image" @change="handleHouseRegistrationUpload" required />
          </div>
        </div>

        <!-- ข้อมูลผู้ค้ำประกัน -->
        <h3>ข้อมูลผู้ค้ำประกัน</h3>

        <!-- ผู้ค้ำประกันคนที่ 1 -->
        <div class="guarantor-section">
          <h4>ผู้ค้ำประกันคนที่ 1</h4>
          <div>
            <label for="guarantor1_member_id">เลือกผู้ค้ำประกัน 1 จากสมาชิก *</label>
            <select v-model="guarantors[0].member_id" id="guarantor1_member_id" @change="loadGuarantor1Data" required>
              <option value="">-- เลือกสมาชิก --</option>
              <option v-for="member in members" :key="member.member_id" :value="member.member_id"
                :disabled="member.member_id === loan.member_id || member.member_id === guarantors[1].member_id">
                {{ member.first_name }} {{ member.last_name }} (ID: {{ member.member_id }})
              </option>
            </select>
          </div>

          <div>
            <label for="guarantor1_name">ชื่อผู้ค้ำประกัน 1 *</label>
            <input v-model="guarantors[0].name" type="text" id="guarantor1_name" readonly />
          </div>

          <div>
            <label for="guarantor1_id_card">เลขบัตรประชาชน ผู้ค้ำประกัน 1 *</label>
            <input v-model="guarantors[0].id_card" type="text" id="guarantor1_id_card" readonly />
          </div>

          <div>
            <label for="guarantor1_address">ที่อยู่ผู้ค้ำประกัน 1 *</label>
            <input v-model="guarantors[0].address" type="text" id="guarantor1_address" readonly />
          </div>

          <!-- อัพโหลดเอกสารผู้ค้ำประกันคนที่ 1 -->
          <div>
            <label for="guarantor1_id_card_image">สำเนาบัตรประชาชน ผู้ค้ำประกันคนที่ 1 *</label>
            <input type="file" id="guarantor1_id_card_image" @change="handleGuarantor1IdCardUpload" required />
          </div>

          <div>
            <label for="guarantor1_house_registration_image">สำเนาทะเบียนบ้าน ผู้ค้ำประกันคนที่ 1 *</label>
            <input type="file" id="guarantor1_house_registration_image" @change="handleGuarantor1HouseRegistrationUpload" required />
          </div>
        </div> <!-- ปิด guarantor-section -->

        <!-- ผู้ค้ำประกันคนที่ 2 -->
        <div class="guarantor-section">
          <h4>ผู้ค้ำประกันคนที่ 2</h4>
          <div>
            <label for="guarantor2_member_id">เลือกผู้ค้ำประกัน 2 จากสมาชิก *</label>
            <select v-model="guarantors[1].member_id" id="guarantor2_member_id" @change="loadGuarantor2Data" required>
              <option value="">-- เลือกสมาชิก --</option>
              <option v-for="member in members" :key="member.member_id" :value="member.member_id"
                :disabled="member.member_id === loan.member_id || member.member_id === guarantors[0].member_id">
                {{ member.first_name }} {{ member.last_name }} (ID: {{ member.member_id }})
              </option>
            </select>
          </div>

          <div>
            <label for="guarantor2_name">ชื่อผู้ค้ำประกัน 2 *</label>
            <input v-model="guarantors[1].name" type="text" id="guarantor2_name" readonly />
          </div>

          <div>
            <label for="guarantor2_id_card">เลขบัตรประชาชน ผู้ค้ำประกัน 2 *</label>
            <input v-model="guarantors[1].id_card" type="text" id="guarantor2_id_card" readonly />
          </div>

          <div>
            <label for="guarantor2_address">ที่อยู่ผู้ค้ำประกัน 2 *</label>
            <input v-model="guarantors[1].address" type="text" id="guarantor2_address" readonly />
          </div>

          <!-- อัพโหลดเอกสารผู้ค้ำประกันคนที่ 2 -->
          <div>
            <label for="guarantor2_id_card_image">สำเนาบัตรประชาชน ผู้ค้ำประกันคนที่ 2 *</label>
            <input type="file" id="guarantor2_id_card_image" @change="handleGuarantor2IdCardUpload" required />
          </div>

          <div>
            <label for="guarantor2_house_registration_image">สำเนาทะเบียนบ้าน ผู้ค้ำประกันคนที่ 2 *</label>
            <input type="file" id="guarantor2_house_registration_image" @change="handleGuarantor2HouseRegistrationUpload" required />
          </div>
        </div> <!-- ปิด guarantor-section -->
    
        <!-- ปุ่มการกระทำ -->
        <div>
          <button type="submit">บันทึก</button>
          <button type="button" @click="handleCancel">ยกเลิก</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import api from '@/services/api';

export default {
  data() {
    return {
      members: [], // เพิ่มตัวแปรเก็บข้อมูลสมาชิกทั้งหมด
      loan: {
        loan_id: null,
        member_id: '', // เพิ่ม member_id สำหรับเลือกสมาชิก
        full_name: '',
        phone: '',
        bank_name: '',
        account_number: '',
        id_card: '',
        address: '',
        subdistrict: '',
        district: '',
        province: '',
        postal_code: '',
        first_payment_date: '',
        loan_balance: '',
        monthly_interest: '',
        total_amount: '',
        interest_rate: null,
        repayment_period: null,
        start_date: null,
        end_date: null,
        guarantee_required: 1,
        created_by: null,
        updated_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        id_card_image: null,
        house_registration_image: null,
      },
      guarantors: [
        {
          member_id: '',
          name: '',
          id_card: '',
          address: '',
          id_card_image: null,
          house_registration_image: null
        },
        {
          member_id: '',
          name: '',
          id_card: '',
          address: '',
          id_card_image: null,
          house_registration_image: null
        },
      ],
    };
    },
  created() {
    // ดึงข้อมูลสมาชิกทั้งหมดเมื่อโหลดหน้า
    this.fetchMembers();

    // ถ้ามีการกรอกจำนวนเงินต้นไว้แล้ว ให้คำนวณดอกเบี้ยอัตโนมัติ
    if (this.loan.loan_balance) {
      this.calculateMonthlyInterest();
    }
  },

  methods: {
    // ดึงข้อมูลสมาชิกทั้งหมด
    async fetchMembers() {
      try {
        const response = await api.getMembers();
        this.members = response.data;
      } catch (error) {
        console.error('Error fetching members:', error);
        alert('ไม่สามารถดึงข้อมูลสมาชิกได้');
      }
    },

    // โหลดข้อมูลสมาชิกเมื่อเลือก member_id
    async loadMemberData() {
      if (!this.loan.member_id) return;

      try {
        const response = await api.getMemberById(this.loan.member_id);
        const member = response.data;

        // นำข้อมูลสมาชิกมาใส่ในฟอร์ม
        this.loan.full_name = `${member.first_name} ${member.last_name}`;
        this.loan.phone = member.phone;
        this.loan.bank_name = member.bank_name || '';
        this.loan.account_number = member.bank_account || '';
        this.loan.id_card = member.national_id || '';
        this.loan.address = member.address_line1 || '';
        this.loan.subdistrict = member.subdistrict || '';
        this.loan.district = member.district || '';
        this.loan.province = member.province || '';
        this.loan.postal_code = member.postal_code || '';

        // ถ้ามีการกรอกจำนวนเงินต้นไว้แล้ว ให้คำนวณดอกเบี้ยอัตโนมัติ
        if (this.loan.loan_balance) {
          this.calculateMonthlyInterest();
        }
      } catch (error) {
        console.error('Error loading member data:', error);
        alert('ไม่สามารถโหลดข้อมูลสมาชิกได้');
      }
    },

    // โหลดข้อมูลผู้ค้ำประกันคนที่ 1 เมื่อเลือก member_id
    async loadGuarantor1Data() {
      if (!this.guarantors[0].member_id) {
        this.guarantors[0].name = '';
        this.guarantors[0].id_card = '';
        this.guarantors[0].address = '';
        return;
      }

      try {
        const response = await api.getMemberById(this.guarantors[0].member_id);
        const member = response.data;

        // นำข้อมูลสมาชิกมาใส่ในฟอร์มผู้ค้ำประกัน
        this.guarantors[0].name = `${member.first_name} ${member.last_name}`;
        this.guarantors[0].id_card = member.national_id || '';
        this.guarantors[0].address = this.formatAddress(member);
      } catch (error) {
        console.error('Error loading guarantor 1 data:', error);
        alert('ไม่สามารถโหลดข้อมูลผู้ค้ำประกันคนที่ 1 ได้');
      }
    },

    // โหลดข้อมูลผู้ค้ำประกันคนที่ 2 เมื่อเลือก member_id
    async loadGuarantor2Data() {
      if (!this.guarantors[1].member_id) {
        this.guarantors[1].name = '';
        this.guarantors[1].id_card = '';
        this.guarantors[1].address = '';
        return;
      }

      try {
        const response = await api.getMemberById(this.guarantors[1].member_id);
        const member = response.data;

        // นำข้อมูลสมาชิกมาใส่ในฟอร์มผู้ค้ำประกัน
        this.guarantors[1].name = `${member.first_name} ${member.last_name}`;
        this.guarantors[1].id_card = member.national_id || '';
        this.guarantors[1].address = this.formatAddress(member);
      } catch (error) {
        console.error('Error loading guarantor 2 data:', error);
        alert('ไม่สามารถโหลดข้อมูลผู้ค้ำประกันคนที่ 2 ได้');
      }
    },

    // ฟังก์ชันจัดรูปแบบที่อยู่
    formatAddress(member) {
      const parts = [
        member.address_line1,
        member.subdistrict,
        member.district,
        member.province,
        member.postal_code
      ].filter(part => part && part.trim() !== '');

      return parts.join(' ');
    },

    // อัพโหลดเอกสารผู้กู้
    handleIdCardUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.loan.id_card_image = file;
      }
    },

    handleHouseRegistrationUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.loan.house_registration_image = file;
      }
    },

    // อัพโหลดเอกสารผู้ค้ำประกันคนที่ 1
    handleGuarantor1IdCardUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.guarantors[0].id_card_image = file;
      }
    },

    handleGuarantor1HouseRegistrationUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.guarantors[0].house_registration_image = file;
      }
    },

    // อัพโหลดเอกสารผู้ค้ำประกันคนที่ 2
    handleGuarantor2IdCardUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.guarantors[1].id_card_image = file;
      }
    },

    handleGuarantor2HouseRegistrationUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.guarantors[1].house_registration_image = file;
      }
    },

    // คำนวณดอกเบี้ยต่อเดือนอัตโนมัติ (1% ของเงินต้น) และตั้งค่าอื่นๆ
    calculateMonthlyInterest() {
      if (this.loan.loan_balance && !isNaN(this.loan.loan_balance)) {
        const principal = parseFloat(this.loan.loan_balance);

        // คำนวณดอกเบี้ย 1% ของเงินต้น
        this.loan.monthly_interest = principal * 0.01;

        // ปัดเศษให้เป็นจำนวนเต็ม (ถ้าต้องการ)
        this.loan.monthly_interest = Math.round(this.loan.monthly_interest);

        // ตั้งค่าอัตราดอกเบี้ยเป็น 1%
        this.loan.interest_rate = 1;

        // ตั้งค่าระยะเวลาชำระคืนเป็น 12 เดือน (1 ปี)
        this.loan.repayment_period = 12;

        // คำนวณยอดเงินรวม (เงินต้น + ดอกเบี้ยทั้งหมด)
        // เงินต้น + (ดอกเบี้ยต่อเดือน x จำนวนเดือน)
        const totalInterest = this.loan.monthly_interest * this.loan.repayment_period;
        this.loan.total_amount = principal + totalInterest;

        // ตั้งค่าวันที่เริ่มต้นเป็นวันที่ปัจจุบัน
        const today = new Date();
        this.loan.start_date = today.toISOString().split('T')[0];

        // ตั้งค่าวันที่สิ้นสุดเป็นวันที่ปัจจุบัน + 1 ปี
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        this.loan.end_date = endDate.toISOString().split('T')[0];
      } else {
        this.loan.monthly_interest = '';
        this.loan.total_amount = '';
      }
    },

    handleSubmit() {
      console.log('Starting form submission validation...');

      // ตรวจสอบว่าได้เลือกสมาชิกหรือไม่
      if (!this.loan.member_id) {
        alert('กรุณาเลือกสมาชิกที่จะกู้');
        return;
      }

      // ตรวจสอบว่าได้กรอกจำนวนเงินกู้หรือไม่
      if (!this.loan.loan_balance || this.loan.loan_balance <= 0) {
        alert('กรุณากรอกจำนวนเงินกู้ให้ถูกต้อง');
        return;
      }

      // ตรวจสอบว่าได้กรอกวันที่ชำระงวดแรกหรือไม่
      if (!this.loan.first_payment_date) {
        alert('กรุณากรอกวันที่ชำระงวดแรก');
        return;
      }

      // ตรวจสอบว่าได้เลือกผู้ค้ำประกันหรือไม่
      if (!this.guarantors[0].member_id || !this.guarantors[1].member_id) {
        alert('กรุณาเลือกผู้ค้ำประกันให้ครบทั้ง 2 คน');
        return;
      }

      // ตรวจสอบว่าผู้ค้ำประกันเป็นคนเดียวกับผู้กู้หรือไม่
      if (
        this.guarantors[0].member_id === this.loan.member_id ||
        this.guarantors[1].member_id === this.loan.member_id
      ) {
        alert('ผู้ค้ำประกันห้ามเป็นผู้กู้');
        return;
      }

      // ตรวจสอบว่าผู้ค้ำประกันทั้งสองคนเป็นคนเดียวกันหรือไม่
      if (this.guarantors[0].member_id === this.guarantors[1].member_id) {
        alert('ผู้ค้ำประกันทั้งสองคนต้องไม่เป็นคนเดียวกัน');
        return;
      }

      // ตรวจสอบว่ามีการอัพโหลดไฟล์ของผู้กู้หรือไม่
      if (!this.loan.id_card_image || !this.loan.house_registration_image) {
        alert('กรุณาอัพโหลดเอกสารของผู้กู้ให้ครบถ้วน');
        return;
      }

      // ตรวจสอบว่ามีการอัพโหลดไฟล์ของผู้ค้ำประกันคนที่ 1 หรือไม่
      if (!this.guarantors[0].id_card_image || !this.guarantors[0].house_registration_image) {
        alert('กรุณาอัพโหลดเอกสารของผู้ค้ำประกันคนที่ 1 ให้ครบถ้วน');
        return;
      }

      // ตรวจสอบว่ามีการอัพโหลดไฟล์ของผู้ค้ำประกันคนที่ 2 หรือไม่
      if (!this.guarantors[1].id_card_image || !this.guarantors[1].house_registration_image) {
        alert('กรุณาอัพโหลดเอกสารของผู้ค้ำประกันคนที่ 2 ให้ครบถ้วน');
        return;
      }

      console.log('Form validation passed, preparing to submit...');

      // ส่งข้อมูลสินเชื่อและผู้ค้ำประกันไปยัง backend
      const formData = new FormData();

      // เพิ่มข้อมูลสินเชื่อ
      Object.keys(this.loan).forEach(key => {
        if (key !== 'id_card_image' && key !== 'house_registration_image') {
          // ส่งข้อมูลโดยตรงไม่ใช่ในรูปแบบ loan[key]
          formData.append(key, this.loan[key]);
        }
      });

      // เพิ่มไฟล์ของผู้กู้
      formData.append('borrower_id_card_image', this.loan.id_card_image);
      formData.append('borrower_house_registration_image', this.loan.house_registration_image);

      // เพิ่มข้อมูลผู้ค้ำประกัน - ส่งเป็น JSON string แทน
      formData.append('guarantors', JSON.stringify(this.guarantors.map(g => ({
        member_id: g.member_id,
        name: g.name,
        id_card: g.id_card,
        address: g.address
      }))));

      // เพิ่มไฟล์ของผู้ค้ำประกัน
      this.guarantors.forEach((guarantor, index) => {
        if (guarantor.id_card_image) {
          formData.append(`guarantor${index+1}_id_card_image`, guarantor.id_card_image);
        }
        if (guarantor.house_registration_image) {
          formData.append(`guarantor${index+1}_house_registration_image`, guarantor.house_registration_image);
        }
      });

      // แสดงข้อมูลที่จะส่งไปยัง backend
      console.log('Form data prepared for submission:');
      console.log('Loan data:', this.loan);
      console.log('Guarantors:', this.guarantors);

      // ตรวจสอบข้อมูลใน FormData
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      // ส่งข้อมูลไปยัง backend โดยใช้ api service
      try {
        console.log('Submitting loan data...');

        // แสดง loading message
        console.log('กำลังบันทึกข้อมูล กรุณารอสักครู่...');

        // ใช้ api service แทน axios โดยตรง
        api.createLoan(formData)
          .then(response => {
            console.log('Loan created successfully:', response.data);
            alert('บันทึกข้อมูลสำเร็จ');

            // สร้างรายการธุรกรรมการรับเงินกู้
            // return api.withdrawLoan({
            //   member_id: this.loan.member_id,
            //   amount: parseFloat(this.loan.total_amount)
            // });
          })
          .then(() => {
            // รีเซ็ตฟอร์มหลังจากบันทึกสำเร็จ
            this.handleCancel();

            // นำทางไปยังหน้ารายการสินเชื่อ
            this.$router.push('/loans');
          })
          .catch(error => {
            console.error('Error creating loan:', error);
            let errorMessage = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';

            // แสดงข้อความผิดพลาดที่เฉพาะเจาะจงมากขึ้น
            if (error.response) {
              console.error('Error response:', error.response.data);
              if (error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;

                // ถ้ามีข้อมูลสินเชื่อที่มีอยู่แล้ว ให้แสดงลิงก์ไปยังหน้าชำระเงินกู้
                if (error.response.data.existingLoan) {
                  const existingLoan = error.response.data.existingLoan;
                  const confirmRedirect = confirm(`${errorMessage}\n\nต้องการไปที่หน้าชำระเงินกู้หรือไม่?`);
                  if (confirmRedirect) {
                    // ตรวจสอบว่า this.loan.member_id มีค่าหรือไม่
                    const memberId = this.loan && this.loan.member_id ? this.loan.member_id : existingLoan.member_id;
                    this.$router.push(`/loan-repayment?member_id=${memberId}`);
                    return;
                  }
                  return; // ไม่ต้องแสดง alert อีก เพราะได้แสดง confirm แล้ว
                }
              }
            }

            alert(errorMessage);
          });
      } catch (error) {
        console.error('Exception during form submission:', error);
        alert('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
      }
    },
    handleCancel() {
      // รีเซ็ตฟอร์ม
      this.loan = {
        loan_id: null,
        member_id: '', // รีเซ็ต member_id
        full_name: '',
        phone: '',
        bank_name: '',
        account_number: '',
        id_card: '',
        address: '',
        subdistrict: '',
        district: '',
        province: '',
        postal_code: '',
        first_payment_date: '',
        loan_balance: '',
        monthly_interest: '',
        total_amount: '',
        interest_rate: null,
        repayment_period: null,
        start_date: null,
        end_date: null,
        guarantee_required: 1,
        created_by: null,
        updated_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        id_card_image: null,
        house_registration_image: null,
      };

      // Reset file input elements ของผู้กู้
      document.getElementById('id_card_image').value = '';
      document.getElementById('house_registration_image').value = '';

      // Reset file input elements ของผู้ค้ำประกัน
      document.getElementById('guarantor1_id_card_image').value = '';
      document.getElementById('guarantor1_house_registration_image').value = '';
      document.getElementById('guarantor2_id_card_image').value = '';
      document.getElementById('guarantor2_house_registration_image').value = '';

      // รีเซ็ตข้อมูลผู้ค้ำประกัน
      this.guarantors = [
        {
          member_id: '',
          name: '',
          id_card: '',
          address: '',
          id_card_image: null,
          house_registration_image: null
        },
        {
          member_id: '',
          name: '',
          id_card: '',
          address: '',
          id_card_image: null,
          house_registration_image: null
        },
      ];
    }
  }
};
</script>

<style scoped>
  /* General styles */
.loan {
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

.hint {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
  font-style: italic;
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
h3, h4 {
  margin-top: 40px;
  margin-bottom: 20px;
  color: #333;
}

h3 {
  font-size: 22px;
}

h4 {
  font-size: 18px;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  border-left: 4px solid #4CAF50;
}

/* Styling for borrower and guarantor sections */
.borrower-section, .guarantor-section {
  margin-top: 30px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.borrower-section h4 {
  margin-top: 0;
  background-color: #e3f2fd;
  border-left: 4px solid #4CAF50;
}

.guarantor-section h4 {
  margin-top: 0;
  background-color: #e8f5e9;
  border-left: 4px solid #2196F3;
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