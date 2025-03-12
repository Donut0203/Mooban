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
              <label for="balance">ยอดคงเหลือ</label>
              <input type="number" id="balance" v-model="formData.balance" step="0.01">
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
            <th>ธนาคาร</th>
            <th>เลขบัญชี</th>
            <th>เลขบัตรประชาชน</th>
            <th>ที่อยู่</th>
            <th>ยอดคงเหลือ</th>
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in filteredMembers" :key="member.member_id">
            <td>{{ member.member_id }}</td>
            <td>{{ member.first_name }} {{ member.last_name }}</td>
            <td>{{ member.phone }}</td>
            <td>{{ member.bank_name }}</td>
            <td>{{ member.bank_account }}</td>
            <td>{{ member.national_id }}</td>
            <td>{{ formatAddress(member) }}</td>
            <td>{{ formatCurrency(member.balance) }}</td>
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
            <div class="detail-label">ยอดคงเหลือ:</div>
            <div class="detail-value">{{ formatCurrency(selectedMember.balance) }}</div>
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default {
  name: 'MemberManagement',
  data() {
    return {
      members: [],
      formData: {
        first_name: '',
        last_name: '',
        phone: '',
        bank_name: '',
        bank_account: '',
        national_id: '',
        address_line1: '',
        subdistrict: '',
        district: '',
        province: '',
        postal_code: '',
        id_card_copy: '',
        house_registration_copy: '',
        balance: 0
      },
      showAddForm: false,
      showViewModal: false,
      showDeleteModal: false,
      isEditing: false,
      selectedMember: {},
      searchQuery: ''
    };
  },
  computed: {
    filteredMembers() {
      if (!this.searchQuery) {
        return this.members;
      }
      const query = this.searchQuery.toLowerCase();
      return this.members.filter(member => {
        return member.member_id.toString().includes(query) ||
          member.first_name.toLowerCase().includes(query) ||
          member.last_name.toLowerCase().includes(query) ||
          member.phone.includes(query) ||
          member.national_id.includes(query);
      });
    }
  },
  methods: {
    // โหลดข้อมูลสมาชิกทั้งหมด
    async loadMembers() {
      try {
        const response = await api.getMembers();
        this.members = response.data;
      } catch (error) {
        console.error('Error loading members:', error);
        alert('ไม่สามารถโหลดข้อมูลสมาชิกได้');
      }
    },

    // จัดการการอัพโหลดรูปภาพ
    handleIdCardUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.uploadFile(file, 'id_card_copy');
      }
    },
    handleHouseRegUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.uploadFile(file, 'house_registration_copy');
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
        if (this.isEditing) {
          // แก้ไขข้อมูลสมาชิก
          await api.updateMember(this.formData.member_id, this.formData);
          alert('แก้ไขข้อมูลสมาชิกเรียบร้อยแล้ว');
        } else {
          // เพิ่มสมาชิกใหม่
          await api.createMember(this.formData);
          alert('เพิ่มสมาชิกใหม่เรียบร้อยแล้ว');
        }
        this.closeForm();
        this.loadMembers();
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('ไม่สามารถบันทึกข้อมูลได้');
      }
    },

    // ดูรายละเอียดสมาชิก
    viewMember(member) {
      this.selectedMember = { ...member };
      this.showViewModal = true;
    },

    // แก้ไขข้อมูลสมาชิก
    editMember(member) {
      this.isEditing = true;
      this.formData = { ...member };
      this.showAddForm = true;
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
        bank_name: '',
        bank_account: '',
        national_id: '',
        address_line1: '',
        subdistrict: '',
        district: '',
        province: '',
        postal_code: '',
        id_card_copy: '',
        house_registration_copy: '',
        balance: 0
      };
    },

    // จัดรูปแบบที่อยู่
    formatAddress(member) {
      let address = member.address_line1 || '';
      if (member.subdistrict) {
        address += ` ต.${member.subdistrict}`;
      }
      if (member.district) {
        address += ` อ.${member.district}`;
      }
      if (member.province) {
        address += ` จ.${member.province}`;
      }
      if (member.postal_code) {
        address += ` ${member.postal_code}`;
      }
      return address;
    },

    // จัดรูปแบบวันที่
    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    },

    // จัดรูปแบบเงิน
    formatCurrency(amount) {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(amount || 0);
    },

    // พิมพ์ PDF
    async printPDF() {
      const doc = new jsPDF("p", "mm", "a4");

      // กำหนดเส้นทางไฟล์ฟอนต์ที่ถูกต้องจาก public
      const fontUrl = '/THSarabunNew.ttf'; // เส้นทางที่เข้าถึงไฟล์จาก public

      // ฟอนต์ที่คุณต้องการใช้ใน jsPDF
      const fontName = "THSarabun";

      // เพิ่มฟอนต์จาก public (ใช้ addFileToVFS เพื่อให้ jsPDF รับรู้ฟอนต์)
      await doc.addFileToVFS(fontName, fontUrl);
      doc.addFont(fontUrl, fontName, "normal");  // เพิ่มฟอนต์ให้กับ jsPDF
      doc.setFont(fontName);  // กำหนดฟอนต์ที่ต้องการใช้

      // เพิ่มเนื้อหาลงใน PDF
      doc.setFontSize(18);
      doc.text("รายละเอียดสมาชิก", 15, 20);

      // เริ่มข้อมูลสมาชิก
      doc.setFontSize(12);
      let y = 30;


    const addText = (label, value) => {
    //  doc.setFont("THSarabun", "bold");
      doc.text(`${label}: `, 15, y);
     // doc.setFont("THSarabun", "normal");
      doc.text(value ? value.toString() : "-", 55, y);
      y += 8;
    };

      addText("รหัสสมาชิก", this.selectedMember.member_id);
      addText("ชื่อ-นามสกุล", `${this.selectedMember.first_name} ${this.selectedMember.last_name}`);
      addText("เบอร์โทรศัพท์", this.selectedMember.phone);
      addText("ธนาคาร", this.selectedMember.bank_name);
      addText("เลขบัญชี", this.selectedMember.bank_account);
      addText("เลขบัตรประชาชน", this.selectedMember.national_id);
      addText("ที่อยู่", this.formatAddress(this.selectedMember));
      addText("ยอดคงเหลือ", this.formatCurrency(this.selectedMember.balance));
      addText("ผู้สร้างข้อมูล", this.selectedMember.created_by);
      addText("วันที่สร้างข้อมูล", this.formatDate(this.selectedMember.created_at));
      addText("ผู้แก้ไขล่าสุด", this.selectedMember.updated_by);
      addText("วันที่แก้ไขล่าสุด", this.formatDate(this.selectedMember.updated_at));

      // เพิ่มรูปภาพ (สำเนาบัตรประชาชน & ทะเบียนบ้าน)
const addImage = async (imgSrc, label) => {
  if (imgSrc) {
    try {
      const img = await this.loadImage(imgSrc);
      doc.setFont("THSarabun", "bold");
      doc.text(label, 15, y + 5);
      doc.addImage(img, "JPEG", 15, y + 10, 80, 50);  // ใช้ Base64 ที่ได้
      y += 65;
    } catch (error) {
      console.error(`โหลดรูป ${label} ไม่สำเร็จ`, error);
    }
  }
};

      await addImage(this.selectedMember.id_card_copy, "สำเนาบัตรประชาชน");
      await addImage(this.selectedMember.house_registration_copy, "สำเนาทะเบียนบ้าน");

      // บันทึกไฟล์ PDF
      doc.save(`Member_${this.selectedMember.member_id}.pdf`);
      
    },

    // โหลดรูปภาพ
loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";  // รองรับการดึงภาพจากโดเมนต่าง ๆ
    img.src = `http://localhost:8080/uploads/${src}`;  // ปรับ URL ตามที่เซิร์ฟเวอร์สามารถเข้าถึงได้
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      
      // ตรวจสอบชนิดของไฟล์ และแปลงเป็น Base64 ตามประเภทของไฟล์
      const fileExtension = src.split('.').pop().toLowerCase();
      let mimeType = "image/jpg";  // Default เป็น JPEG

      if (fileExtension === "png") {
        mimeType = "image/png";  // หากเป็น PNG ให้ใช้ image/png
      }

      const base64Image = canvas.toDataURL(mimeType);
      
      // พิมพ์ Base64 ในคอนโซลเพื่อการตรวจสอบ
      console.log(base64Image);

      resolve(base64Image);
    };
    img.onerror = reject;
  });
}

  },

  created() {
    this.loadMembers();
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