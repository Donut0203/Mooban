<template>
  <div class="member-container">
    <div class="header">
      <h1>จัดการข้อมูลสมาชิก</h1>
      <button class="btn-add" @click="showAddForm = true">เพิ่มสมาชิกใหม่</button>
    </div>

    <!-- ฟอร์มเพิ่มสมาชิก -->
    <div class="modal" v-if="showAddForm">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEditing ? 'แก้ไขข้อมูลสมาชิก' : 'เพิ่มสมาชิกใหม่' }}</h2>
          <span class="close" @click="closeForm">&times;</span>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label for="first_name">ชื่อจริง <span class="required">*</span></label>
              <input type="text" id="first_name" v-model="formData.first_name" required>
            </div>
            
            <div class="form-group">
              <label for="last_name">นามสกุล <span class="required">*</span></label>
              <input type="text" id="last_name" v-model="formData.last_name" required>
            </div>
            
            <div class="form-group">
              <label for="phone">เบอร์โทรศัพท์ <span class="required">*</span></label>
              <input type="text" id="phone" v-model="formData.phone" required>
            </div>
            
            <div class="form-group">
               <label for="birth_date">วันเกิด <span class="required">*</span></label>
                <input type="date" id="birth_date" v-model="formData.birth_date" required>
            </div>

            <div class="form-group">
              <label for="national_id">หมายเลขบัตรประชาชน <span class="required">*</span></label>
              <input type="text" id="national_id" v-model="formData.national_id" required>
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
            
            <div class="form-group">
              <label for="bank_account">หมายเลขบัญชีธนาคาร <span class="required">*</span></label>
              <input type="text" id="bank_account" v-model="formData.bank_account" required>
            </div>
            
            <div class="form-group">
              <label for="address_line1">ที่อยู่ <span class="required">*</span></label>
              <textarea id="address_line1" v-model="formData.address_line1" required></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group half">
                <label for="subdistrict">ตำบล</label>
                <input type="text" id="subdistrict" v-model="formData.subdistrict">
              </div>
              
              <div class="form-group half">
                <label for="district">อำเภอ</label>
                <input type="text" id="district" v-model="formData.district">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group half">
                <label for="province">จังหวัด</label>
                <input type="text" id="province" v-model="formData.province">
              </div>
              
              <div class="form-group half">
                <label for="postal_code">รหัสไปรษณีย์</label>
                <input type="text" id="postal_code" v-model="formData.postal_code">
              </div>
            </div>
            
            <div class="form-group">
              <label for="id_card_copy">สำเนาบัตรประชาชน <span class="required">*</span></label>
              <input type="file" id="id_card_copy" @change="handleIdCardUpload">
              <div class="preview" v-if="formData.id_card_copy">
                <img :src="formData.id_card_copy" alt="สำเนาบัตรประชาชน">
              </div>
            </div>
            
            <div class="form-group">
              <label for="house_registration_copy">สำเนาทะเบียนบ้าน <span class="required">*</span></label>
              <input type="file" id="house_registration_copy" @change="handleHouseRegUpload">
              <div class="preview" v-if="formData.house_registration_copy">
                <img :src="formData.house_registration_copy" alt="สำเนาทะเบียนบ้าน">
              </div>
            </div>
            
            <div class="form-group" v-if="isEditing">
              <label for="deposit_balance">ยอดเงินฝาก</label>
              <input type="number" id="deposit_balance" v-model="formData.deposit_balance" step="0.01" readonly>
              <div class="form-hint">ยอดเงินฝากจะถูกปรับปรุงอัตโนมัติผ่านระบบธุรกรรมการเงิน</div>
            </div>

            <div class="form-group" v-if="isEditing">
              <label for="loan_balance">ยอดเงินกู้คงเหลือ</label>
              <input type="number" id="loan_balance" v-model="formData.loan_balance" step="0.01" readonly>
              <div class="form-hint">ยอดเงินกู้จะถูกปรับปรุงอัตโนมัติผ่านระบบธุรกรรมการเงิน</div>
            </div>

            <div class="form-actions" v-if="isEditing">
              <router-link :to="'/transactions?member_id=' + formData.member_id" class="btn-transaction">
                ไปที่หน้าธุรกรรมการเงิน
              </router-link>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeForm">ยกเลิก</button>
              <button type="submit" class="btn-submit">{{ isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มสมาชิก' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ตารางแสดงข้อมูลสมาชิก -->
    <div class="table-container">
      <div class="search-bar">
        <input type="text" v-model="searchQuery" placeholder="ค้นหาสมาชิก...">
      </div>
      <table class="member-table">
        <thead>
          <tr>
            <th>รหัสสมาชิก</th>
            <th>ชื่อ-นามสกุล</th>
            <th>เบอร์โทรศัพท์</th>
            <th>อายุ</th>
            <th>ธนาคาร</th>
            <th>เลขบัญชี</th>
            <th>เลขบัตรประชาชน</th>
            <th>ที่อยู่</th>
            <th>ยอดเงินฝาก</th>
            <th>ยอดเงินกู้คงเหลือ</th>
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in filteredMembers" :key="member.member_id">
            <td>{{ member.member_id }}</td>
            <td>{{ member.first_name }} {{ member.last_name }}</td>
            <td>{{ member.phone }}</td>
            <td>{{ member.birth_date }}</td>
            <td>{{ member.bank_name }}</td>
            <td>{{ member.bank_account }}</td>
            <td>{{ member.national_id }}</td>
            <td>{{ formatAddress(member) }}</td>
            <td class="deposit-balance">{{ formatCurrency(member.deposit_balance || 0) }}</td>
            <td class="loan-balance">{{ formatCurrency(member.loan_balance || 0) }}</td>
            <td class="actions">
              <button class="btn-view" @click="viewMember(member)">ดู</button>
              <button class="btn-edit" @click="editMember(member)">แก้ไข</button>
              <button class="btn-delete" @click="confirmDelete(member)">ลบ</button>
            </td>
          </tr>
          <tr v-if="members.length === 0">
            <td colspan="9" class="no-data">ไม่พบข้อมูลสมาชิก</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal แสดงรายละเอียดสมาชิก -->
    <div class="modal" v-if="showViewModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>รายละเอียดสมาชิก</h2>
          <span class="close" @click="showViewModal = false">&times;</span>
        </div>
        <div class="modal-body member-details">
          <div class="detail-row">
            <div class="detail-label">รหัสสมาชิก:</div>
            <div class="detail-value">{{ selectedMember.member_id }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">ชื่อ-นามสกุล:</div>
            <div class="detail-value">{{ selectedMember.first_name }} {{ selectedMember.last_name }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">เบอร์โทรศัพท์:</div>
            <div class="detail-value">{{ selectedMember.phone }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">อายุ:</div>
            <div class="detail-value">{{ selectedMember.birth_date }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">ธนาคาร:</div>
            <div class="detail-value">{{ selectedMember.bank_name }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">เลขบัญชี:</div>
            <div class="detail-value">{{ selectedMember.bank_account }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">เลขบัตรประชาชน:</div>
            <div class="detail-value">{{ selectedMember.national_id }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">ที่อยู่:</div>
            <div class="detail-value">{{ formatAddress(selectedMember) }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">ยอดเงินฝาก:</div>
            <div class="detail-value deposit-balance">{{ formatCurrency(selectedMember.deposit_balance || 0) }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">ยอดเงินกู้คงเหลือ:</div>
            <div class="detail-value loan-balance">{{ formatCurrency(selectedMember.loan_balance || 0) }}</div>
          </div>

          <!-- ประวัติธุรกรรมล่าสุด -->
          <div class="detail-section" v-if="selectedMember.transactions && selectedMember.transactions.length > 0">
            <h3>ประวัติธุรกรรมล่าสุด</h3>
            <table class="transaction-table">
              <thead>
                <tr>
                  <th>วันที่</th>
                  <th>ประเภท</th>
                  <th>จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="transaction in selectedMember.transactions.slice(0, 5)" :key="transaction.transaction_id">
                  <td>{{ formatDate(transaction.transaction_date) }}</td>
                  <td>{{ formatTransactionType(transaction.transaction_status) }}</td>
                  <td :class="getAmountClass(transaction.transaction_status)">
                    {{ formatCurrency(transaction.amount) }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="view-all-link">
              <router-link :to="'/transactions?member_id=' + selectedMember.member_id">ดูประวัติธุรกรรมทั้งหมด</router-link>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-label">สำเนาบัตรประชาชน:</div>
            <div class="detail-value">
              <img :src="selectedMember.id_card_copy" alt="สำเนาบัตรประชาชน" class="document-preview">
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-label">สำเนาทะเบียนบ้าน:</div>
            <div class="detail-value">
              <img :src="selectedMember.house_registration_copy" alt="สำเนาทะเบียนบ้าน" class="document-preview">
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-label">ผู้สร้างข้อมูล:</div>
            <div class="detail-value">{{ selectedMember.created_by }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">วันที่สร้างข้อมูล:</div>
            <div class="detail-value">{{ formatDate(selectedMember.created_at) }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">ผู้แก้ไขล่าสุด:</div>
            <div class="detail-value">{{ selectedMember.updated_by }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">วันที่แก้ไขล่าสุด:</div>
            <div class="detail-value">{{ formatDate(selectedMember.updated_at) }}</div>
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
          <p>คุณต้องการลบข้อมูลสมาชิก {{ selectedMember.first_name }} {{ selectedMember.last_name }} ใช่หรือไม่?</p>
          <div class="form-actions">
            <button class="btn-cancel" @click="showDeleteModal = false">ยกเลิก</button>
            <button class="btn-delete" @click="deleteMember">ยืนยันการลบ</button>
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
      showAddForm: false,
      isEditing: false,
      formData: {
        first_name: '',
        last_name: '',
        phone: '',
        birth_date: '',
        national_id: '',
        bank_name: '',
        bank_account: '',
        address_line1: '',
        subdistrict: '',
        district: '',
        province: '',
        postal_code: '',
        id_card_copy: '',
        house_registration_copy: '',
        balance: 0,
      },
      members: [],  // กำหนดสมาชิก
      searchQuery: '',
      selectedMember: null,
      showViewModal: false,
      showDeleteModal: false
    };
  },
  computed: {
    filteredMembers() {
      return this.members.filter(member => {
        return (
          member.first_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          member.last_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          member.phone.includes(this.searchQuery)
        );
      });
    }
  },
  mounted() {
    // โหลดข้อมูลสมาชิกเมื่อคอมโพเนนต์ถูกโหลด
    this.loadMembers();
  },
  methods: {
    // โหลดข้อมูลสมาชิกทั้งหมด
    async loadMembers() {
      try {
        // ดึงข้อมูลสมาชิกทั้งหมด
        const response = await api.getMembers();
        this.members = response.data;

        // ดึงข้อมูลยอดเงินของสมาชิกแต่ละคน
        for (const member of this.members) {
          try {
            const balanceResponse = await api.getMemberBalance(member.member_id);
            member.deposit_balance = balanceResponse.data.deposit_balance || 0;
            member.loan_balance = balanceResponse.data.loan_balance || 0;
          } catch (balanceError) {
            console.error(`Error fetching balance for member ${member.member_id}:`, balanceError);
            member.deposit_balance = 0;
            member.loan_balance = 0;
          }
        }
      } catch (error) {
        console.error('Error loading members:', error);
        alert('ไม่สามารถโหลดข้อมูลสมาชิกได้');
      }
    },

    // จัดการการอัพโหลดรูปภาพ
    handleIdCardUpload(event) {
      const file = event.target.files[0];
      if (file) {
        // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
          return;
        }

        // ตรวจสอบประเภทไฟล์
        if (!file.type.match('image.*')) {
          alert('กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น');
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          // บันทึกข้อมูลรูปภาพในรูปแบบ base64
          this.formData.id_card_copy = reader.result;
          console.log('ID card image loaded successfully');

          // บันทึกลงใน localStorage เพื่อให้ข้อมูลไม่หายไป
          if (this.formData.member_id) {
            localStorage.setItem(`id_card_${this.formData.member_id}`, reader.result);
          }
        };
        reader.onerror = () => {
          console.error('Error reading file');
          alert('เกิดข้อผิดพลาดในการอ่านไฟล์');
        };
        reader.readAsDataURL(file);
      }
    },
    handleHouseRegUpload(event) {
      const file = event.target.files[0];
      if (file) {
        // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
          return;
        }

        // ตรวจสอบประเภทไฟล์
        if (!file.type.match('image.*')) {
          alert('กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น');
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          // บันทึกข้อมูลรูปภาพในรูปแบบ base64
          this.formData.house_registration_copy = reader.result;
          console.log('House registration image loaded successfully');

          // บันทึกลงใน localStorage เพื่อให้ข้อมูลไม่หายไป
          if (this.formData.member_id) {
            localStorage.setItem(`house_reg_${this.formData.member_id}`, reader.result);
          }
        };
        reader.onerror = () => {
          console.error('Error reading file');
          alert('เกิดข้อผิดพลาดในการอ่านไฟล์');
        };
        reader.readAsDataURL(file);
      }
    },

    // อัพโหลดไฟล์
    async uploadFile(file, fieldName) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await api.uploadFile(formData);
        this.formData[fieldName] = response.data.fileUrl;
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('ไม่สามารถอัพโหลดไฟล์ได้');
      }
    },

    // ส่งฟอร์ม
    async submitForm() {
      try {
        // บันทึกรูปภาพลงใน localStorage ก่อนส่งข้อมูลไปยังเซิร์ฟเวอร์
        if (this.formData.id_card_copy && this.formData.id_card_copy.startsWith('data:image')) {
          console.log('Saving ID card to localStorage');
          if (this.formData.member_id) {
            localStorage.setItem(`id_card_${this.formData.member_id}`, this.formData.id_card_copy);
          }
        }

        if (this.formData.house_registration_copy && this.formData.house_registration_copy.startsWith('data:image')) {
          console.log('Saving house registration to localStorage');
          if (this.formData.member_id) {
            localStorage.setItem(`house_reg_${this.formData.member_id}`, this.formData.house_registration_copy);
          }
        }

        let response;

        if (this.isEditing) {
          // แก้ไขข้อมูลสมาชิก
          response = await api.updateMember(this.formData.member_id, this.formData);
          alert('แก้ไขข้อมูลสมาชิกเรียบร้อยแล้ว');
        } else {
          // เพิ่มสมาชิกใหม่
          response = await api.createMember(this.formData);
          alert('เพิ่มสมาชิกใหม่เรียบร้อยแล้ว');

          // ถ้าเป็นการเพิ่มสมาชิกใหม่ ให้บันทึกรูปภาพลงใน localStorage ด้วย member_id ที่ได้จากเซิร์ฟเวอร์
          if (response && response.data && response.data.member_id) {
            const newMemberId = response.data.member_id;

            if (this.formData.id_card_copy && this.formData.id_card_copy.startsWith('data:image')) {
              localStorage.setItem(`id_card_${newMemberId}`, this.formData.id_card_copy);
            }

            if (this.formData.house_registration_copy && this.formData.house_registration_copy.startsWith('data:image')) {
              localStorage.setItem(`house_reg_${newMemberId}`, this.formData.house_registration_copy);
            }
          }
        }

        this.closeForm();
        this.loadMembers();
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('ไม่สามารถบันทึกข้อมูลได้');
      }
    },

    // ดูรายละเอียดสมาชิก
    async viewMember(member) {
      // สร้างสำเนาข้อมูลสมาชิก
      this.selectedMember = { ...member };

      // ตรวจสอบว่ามีรูปภาพใน localStorage หรือไม่
      if (member.member_id) {
        const idCardFromStorage = localStorage.getItem(`id_card_${member.member_id}`);
        const houseRegFromStorage = localStorage.getItem(`house_reg_${member.member_id}`);

        // ถ้ามีรูปภาพใน localStorage ให้ใช้รูปภาพนั้นแทน
        if (idCardFromStorage) {
          this.selectedMember.id_card_copy = idCardFromStorage;
          console.log('Loaded ID card from localStorage');
        }

        if (houseRegFromStorage) {
          this.selectedMember.house_registration_copy = houseRegFromStorage;
          console.log('Loaded house registration from localStorage');
        }

        // ดึงข้อมูลยอดเงินล่าสุด
        try {
          const balanceResponse = await api.getMemberBalance(member.member_id);
          this.selectedMember.deposit_balance = balanceResponse.data.deposit_balance || 0;
          this.selectedMember.loan_balance = balanceResponse.data.loan_balance || 0;
        } catch (error) {
          console.error(`Error fetching balance for member ${member.member_id}:`, error);
          this.selectedMember.deposit_balance = member.deposit_balance || 0;
          this.selectedMember.loan_balance = member.loan_balance || 0;
        }

        // ดึงประวัติธุรกรรมล่าสุด
        try {
          const transactionsResponse = await api.getMemberTransactions(member.member_id);
          this.selectedMember.transactions = transactionsResponse.data || [];
        } catch (error) {
          console.error(`Error fetching transactions for member ${member.member_id}:`, error);
          this.selectedMember.transactions = [];
        }
      }

      this.showViewModal = true;
    },

    // แก้ไขข้อมูลสมาชิก
    async editMember(member) {
      this.isEditing = true;

      // สร้างสำเนาข้อมูลสมาชิก
      this.formData = { ...member };

      // ตรวจสอบว่ามีรูปภาพใน localStorage หรือไม่
      if (member.member_id) {
        const idCardFromStorage = localStorage.getItem(`id_card_${member.member_id}`);
        const houseRegFromStorage = localStorage.getItem(`house_reg_${member.member_id}`);

        // ถ้ามีรูปภาพใน localStorage ให้ใช้รูปภาพนั้นแทน
        if (idCardFromStorage) {
          this.formData.id_card_copy = idCardFromStorage;
          console.log('Loaded ID card from localStorage for editing');
        }

        if (houseRegFromStorage) {
          this.formData.house_registration_copy = houseRegFromStorage;
          console.log('Loaded house registration from localStorage for editing');
        }

        // ดึงข้อมูลยอดเงินล่าสุด
        try {
          const balanceResponse = await api.getMemberBalance(member.member_id);
          this.formData.deposit_balance = balanceResponse.data.deposit_balance || 0;
          this.formData.loan_balance = balanceResponse.data.loan_balance || 0;
        } catch (error) {
          console.error(`Error fetching balance for member ${member.member_id}:`, error);
          this.formData.deposit_balance = member.deposit_balance || 0;
          this.formData.loan_balance = member.loan_balance || 0;
        }
      }

      this.showAddForm = true;
    },

    // พิมพ์ PDF
    printPDF() {
      if (!this.selectedMember) return;

      // เตรียมข้อมูลสำหรับการพิมพ์
      const printWindow = window.open('', '_blank');

      if (!printWindow) {
        alert('กรุณาอนุญาตให้เปิดหน้าต่างป๊อปอัพเพื่อพิมพ์เอกสาร');
        return;
      }

      // สร้างสำเนาข้อมูลสมาชิก
      const member = { ...this.selectedMember };

      // ตรวจสอบว่ามีรูปภาพใน localStorage หรือไม่
      if (member.member_id) {
        const idCardFromStorage = localStorage.getItem(`id_card_${member.member_id}`);
        const houseRegFromStorage = localStorage.getItem(`house_reg_${member.member_id}`);

        // ถ้ามีรูปภาพใน localStorage ให้ใช้รูปภาพนั้นแทน
        if (idCardFromStorage) {
          member.id_card_copy = idCardFromStorage;
          console.log('Using ID card from localStorage for printing');
        }

        if (houseRegFromStorage) {
          member.house_registration_copy = houseRegFromStorage;
          console.log('Using house registration from localStorage for printing');
        }
      }

      // ตรวจสอบว่ามีรูปภาพหรือไม่
      const hasIdCard = member.id_card_copy && member.id_card_copy.length > 0;
      const hasHouseReg = member.house_registration_copy && member.house_registration_copy.length > 0;

      // จัดรูปแบบที่อยู่และยอดเงินก่อนสร้าง HTML
      const formattedAddress = this.formatAddress(member);
      // const formattedBalance = this.formatCurrency(member.balance);

      // สร้าง HTML สำหรับการพิมพ์โดยใช้ DOM API แทนการใช้ string
      printWindow.document.open();

      // สร้าง DOCTYPE
      const doctype = document.implementation.createDocumentType('html', '', '');
      printWindow.document.appendChild(doctype);

      // สร้าง HTML element
      const html = printWindow.document.createElement('html');
      printWindow.document.appendChild(html);

      // สร้าง HEAD element
      const head = printWindow.document.createElement('head');
      html.appendChild(head);

      // สร้าง TITLE element
      const title = printWindow.document.createElement('title');
      title.textContent = `ข้อมูลสมาชิก - ${member.member_id || ''}`;
      head.appendChild(title);

      // สร้าง META element
      const meta = printWindow.document.createElement('meta');
      meta.setAttribute('charset', 'utf-8');
      head.appendChild(meta);

      // สร้าง STYLE element
      const style = printWindow.document.createElement('style');
      style.textContent = `
        body { font-family: "Sarabun", sans-serif; padding: 20px; line-height: 1.5; }
        .header { text-align: center; margin-bottom: 30px; }
        .member-info { margin-bottom: 30px; }
        .info-row { display: flex; margin-bottom: 10px; border-bottom: 1px dotted #ccc; padding-bottom: 5px; }
        .label { font-weight: bold; width: 200px; }
        .value { flex: 1; }
        .documents { margin-top: 30px; }
        .document-section { margin-bottom: 30px; }
        .document-image { max-width: 100%; height: auto; margin-top: 10px; border: 1px solid #ddd; page-break-inside: avoid; }
        @media print { .no-print { display: none; } img { display: block; page-break-inside: avoid; max-width: 100% !important; } }
      `;
      head.appendChild(style);

      // สร้าง BODY element
      const body = printWindow.document.createElement('body');
      html.appendChild(body);

      // สร้าง HEADER
      const header = printWindow.document.createElement('div');
      header.className = 'header';
      const h1 = printWindow.document.createElement('h1');
      h1.textContent = 'ข้อมูลสมาชิก';
      header.appendChild(h1);
      body.appendChild(header);

      // สร้าง MEMBER INFO
      const memberInfo = printWindow.document.createElement('div');
      memberInfo.className = 'member-info';
      body.appendChild(memberInfo);

      // สร้างฟังก์ชันสำหรับสร้าง info row
      const createInfoRow = (label, value) => {
        const row = printWindow.document.createElement('div');
        row.className = 'info-row';

        const labelDiv = printWindow.document.createElement('div');
        labelDiv.className = 'label';
        labelDiv.textContent = label;
        row.appendChild(labelDiv);

        const valueDiv = printWindow.document.createElement('div');
        valueDiv.className = 'value';
        valueDiv.textContent = value;
        row.appendChild(valueDiv);

        return row;
      };

      // เพิ่ม info rows
      memberInfo.appendChild(createInfoRow('รหัสสมาชิก:', member.member_id || '-'));
      memberInfo.appendChild(createInfoRow('ชื่อ-นามสกุล:', `${member.first_name || ''} ${member.last_name || ''}`));
      memberInfo.appendChild(createInfoRow('เบอร์โทรศัพท์:', member.phone || '-'));
      memberInfo.appendChild(createInfoRow('วันเกิด:', member.birth_date || '-'));
      memberInfo.appendChild(createInfoRow('ธนาคาร:', member.bank_name || '-'));
      memberInfo.appendChild(createInfoRow('เลขบัญชี:', member.bank_account || '-'));
      memberInfo.appendChild(createInfoRow('เลขบัตรประชาชน:', member.national_id || '-'));
      memberInfo.appendChild(createInfoRow('ที่อยู่:', formattedAddress || '-'));
      // memberInfo.appendChild(createInfoRow('ยอดคงเหลือ:', formattedBalance || '0.00 บาท'));

      // สร้าง DOCUMENTS
      const documents = printWindow.document.createElement('div');
      documents.className = 'documents';
      const h2 = printWindow.document.createElement('h2');
      h2.textContent = 'เอกสารแนบ';
      documents.appendChild(h2);
      body.appendChild(documents);

      // สร้างฟังก์ชันสำหรับสร้าง document section
      const createDocumentSection = (title, imageSrc, alt) => {
        const section = printWindow.document.createElement('div');
        section.className = 'document-section';

        const h3 = printWindow.document.createElement('h3');
        h3.textContent = title;
        section.appendChild(h3);

        if (imageSrc) {
          const img = printWindow.document.createElement('img');
          img.src = imageSrc;
          img.alt = alt;
          img.className = 'document-image';
          section.appendChild(img);
        } else {
          const p = printWindow.document.createElement('p');
          p.textContent = `ไม่มีไฟล์${alt}`;
          section.appendChild(p);
        }

        return section;
      };

      // เพิ่ม document sections
      documents.appendChild(createDocumentSection('สำเนาบัตรประชาชน', hasIdCard ? member.id_card_copy : null, 'สำเนาบัตรประชาชน'));
      documents.appendChild(createDocumentSection('สำเนาทะเบียนบ้าน', hasHouseReg ? member.house_registration_copy : null, 'สำเนาทะเบียนบ้าน'));

      // สร้างปุ่มพิมพ์
      const printButtonDiv = printWindow.document.createElement('div');
      printButtonDiv.className = 'no-print';
      printButtonDiv.style.marginTop = '30px';
      printButtonDiv.style.textAlign = 'center';

      const printButton = printWindow.document.createElement('button');
      printButton.textContent = 'พิมพ์เอกสาร';
      printButton.onclick = () => printWindow.print();

      printButtonDiv.appendChild(printButton);
      body.appendChild(printButtonDiv);

      // สร้าง script สำหรับตรวจสอบการโหลดรูปภาพ
      const script = printWindow.document.createElement('script');
      script.textContent = `
        window.addEventListener('load', function() {
          console.log('All content loaded');

          document.querySelectorAll('img').forEach(img => {
            if (img.complete) {
              console.log('Image already loaded:', img.alt);
            } else {
              img.onload = function() {
                console.log('Image loaded:', img.alt);
              };
              img.onerror = function() {
                console.error('Error loading image:', img.alt);
                img.style.display = 'none';
                const errorText = document.createElement('p');
                errorText.textContent = 'ไม่สามารถโหลดรูปภาพได้';
                errorText.style.color = 'red';
                img.parentNode.appendChild(errorText);
              };
            }
          });
        });
      `;
      body.appendChild(script);

      printWindow.document.close();
    },

    // ยืนยันการลบ
    confirmDelete(member) {
      this.selectedMember = member;
      this.showDeleteModal = true;
    },

    // ลบสมาชิก
    async deleteMember() {
      try {
        await api.deleteMember(this.selectedMember.member_id);
        alert('ลบข้อมูลสมาชิกเรียบร้อยแล้ว');
        this.showDeleteModal = false;
        this.loadMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('ไม่สามารถลบข้อมูลสมาชิกได้');
      }
    },

    // ปิดฟอร์ม
    closeForm() {
      this.showAddForm = false;
      this.isEditing = false;
      this.formData = {
        first_name: '',
        last_name: '',
        phone: '',
        birth_date: '',
        national_id: '',
        bank_name: '',
        bank_account: '',
        address_line1: '',
        subdistrict: '',
        district: '',
        province: '',
        postal_code: '',
        id_card_copy: '',
        house_registration_copy: '',
        balance: 0,
      };
    },
    formatAddress(member) {
      return `${member.address_line1} ${member.subdistrict} ${member.district} ${member.province} ${member.postal_code}`;
    },
    formatCurrency(value) {
      return value.toLocaleString('th-TH', { style: 'currency', currency: 'THB' });
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
    }
  }
};

</script>

<style scoped>

/* สไตล์ทั่วไป */
.member-container {
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
button {
  cursor: pointer;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  transition: all 0.3s;
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

.btn-submit {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
}

.btn-submit:hover {
  background-color: #45a049;
}

.btn-transaction {
  display: inline-block;
  background-color: #2196F3;
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  margin-top: 10px;
}

.btn-transaction:hover {
  background-color: #0b7dda;
  text-decoration: none;
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

.member-table {
  width: 100%;
  border-collapse: collapse;
}

.member-table th {
  background-color: #3f51b5;
  color: white;
  text-align: left;
  padding: 12px 15px;
  font-weight: 500;
}

.member-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
}

.member-table tr:hover {
  background-color: #f5f5f5;
}

.member-table .actions {
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

/* สไตล์ฟอร์ม */
.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-group.half {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.required {
  color: #F44336;
}

input[type="text"],
input[type="number"],
select,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input[type="text"]:focus,
input[type="number"]:focus,
select:focus,
textarea:focus {
  border-color: #3f51b5;
  outline: none;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.form-hint {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
  font-style: italic;
}

.preview {
  margin-top: 10px;
}

.preview img {
  max-width: 200px;
  max-height: 150px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* สไตล์รายละเอียดสมาชิก */
.member-details {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.detail-row {
  display: flex;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.detail-label {
  font-weight: 500;
  width: 180px;
  color: #555;
}

.detail-value {
  flex: 1;
}

.document-preview {
  max-width: 300px;
  max-height: 200px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 5px;
}

/* สไตล์สำหรับประวัติธุรกรรม */
.detail-section {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.detail-section h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 18px;
}

.transaction-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.transaction-table th, .transaction-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.transaction-table th {
  background-color: #f5f5f5;
  font-weight: 500;
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

.deposit-balance {
  color: #4CAF50;
  font-weight: bold;
}

.loan-balance {
  color: #f44336;
  font-weight: bold;
}

.view-all-link {
  text-align: right;
  margin-top: 10px;
}

.view-all-link a {
  color: #2196F3;
  text-decoration: none;
  font-size: 14px;
}

.view-all-link a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .modal-content {
    width: 95%;
  }
  
  .member-table {
    display: block;
    overflow-x: auto;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .btn-add {
    margin-top: 10px;
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