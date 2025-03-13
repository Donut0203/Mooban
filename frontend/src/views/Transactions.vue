<template>
    <div class="container">
      <h1>หน้าธุรกรรมการเงิน</h1>
      
      <!-- ตารางแสดงข้อมูลธุรกรรม -->
      <table>
        <thead>
          <tr>
            <th>สมาชิก ID</th>
            <th>ชื่อ</th> <!-- เพิ่มคอลัมน์ชื่อ -->
            <th>สถานะ</th>
            <th>จำนวนเงิน</th>
            <th>วันที่</th>
            <th>ผู้บันทึก</th>
            <th>ยอดเงินคงเหลือ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in transactions" :key="transaction.transaction_id" @click="showDetails(transaction)">
            <td>{{ transaction.member_id }}</td>
            <td>{{ transaction.name }}</td> <!-- แสดงชื่อ -->
            <td>{{ getTransactionStatus(transaction.transaction_status) }}</td>
            <td>{{ transaction.amount.toFixed(2) }}</td>
            <td>{{ transaction.transaction_date }}</td>
            <td>{{ transaction.created_by }}</td>
            <td>{{ transaction.balance.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
  
      <!-- แสดงข้อมูลรายละเอียดเมื่อคลิก -->
      <div v-if="selectedTransaction" class="transaction-details">
        <h3>รายละเอียดธุรกรรม</h3>
        <p><strong>สมาชิก ID:</strong> {{ selectedTransaction.member_id }}</p>
        <p><strong>ชื่อ:</strong> {{ selectedTransaction.name }}</p>
        <p><strong>สถานะ:</strong> {{ getTransactionStatus(selectedTransaction.transaction_status) }}</p>
        <p><strong>จำนวนเงิน:</strong> {{ selectedTransaction.amount.toFixed(2) }}</p>
        <p><strong>วันที่:</strong> {{ selectedTransaction.transaction_date }}</p>
        <p><strong>ผู้บันทึก:</strong> {{ selectedTransaction.created_by }}</p>
        <p><strong>ยอดเงินคงเหลือ:</strong> {{ selectedTransaction.balance.toFixed(2) }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'App',
    data() {
      return {
        // ตัวแปรสำหรับเก็บข้อมูลธุรกรรม
        transactions: [],
        selectedTransaction: null, // เก็บธุรกรรมที่เลือก
      };
    },
    mounted() {
      // เรียก API เพื่อดึงข้อมูลธุรกรรมจาก backend ที่ localhost:4000
      axios.get('http://localhost:4000/transactions')
        .then((response) => {
          this.transactions = response.data;
        })
        .catch((error) => {
          console.error('There was an error fetching the transactions:', error);
        });
    },
    methods: {
      // ฟังก์ชันเพื่อแปลงตัวเลขเป็นข้อความ
      getTransactionStatus(status) {
        switch (status) {
          case 1:
            return 'ฝาก';
          case 2:
            return 'ถอน';
          case 3:
            return 'ชำระเงินกู้ยืม';
          default:
            return 'ไม่ทราบ';
        }
      },
      // ฟังก์ชันสำหรับแสดงรายละเอียดธุรกรรมที่เลือก
      showDetails(transaction) {
        this.selectedTransaction = transaction;
      },
    },
  };
  </script>
  
  <style>
  body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f9;
    margin: 0;
    padding: 20px;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  h1 {
    text-align: center;
    margin-bottom: 20px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  th, td {
    padding: 10px;
    text-align: center;
    border: 1px solid #ddd;
  }
  
  th {
    background-color: #4CAF50;
    color: white;
  }
  
  tr:nth-child(even) {
    background-color: #f2f2f2;
  }
  
  .transaction-details {
    margin-top: 20px;
    background-color: #e9f7df;
    padding: 20px;
    border: 1px solid #d1e7b7;
  }
  
  .transaction-details h3 {
    text-align: center;
    color: #4CAF50;
  }
  </style>
  