<template>
  <div class="admin-container">
    <h1>หน้าผู้ดูแลระบบ</h1>
    
    <div class="admin-card">
      <h2>การจัดการผู้ใช้</h2>
      <p>ในฐานะผู้ใหญ่บ้าน คุณสามารถจัดการผู้ใช้ในระบบได้ทั้งหมด</p>
      
      <div class="admin-actions">
        <router-link to="/pending-users" class="admin-btn pending-btn">
          <div class="btn-icon">🔔</div>
          <div class="btn-text">
            <h3>ผู้ใช้รอการอนุมัติ</h3>
            <p>ตรวจสอบและอนุมัติผู้ใช้ใหม่</p>
          </div>
        </router-link>
        
        <router-link to="/all-users" class="admin-btn users-btn">
          <div class="btn-icon">👥</div>
          <div class="btn-text">
            <h3>ผู้ใช้ทั้งหมด</h3>
            <p>จัดการข้อมูลผู้ใช้ทั้งหมดในระบบ</p>
          </div>
        </router-link>
      </div>
    </div>
    
    <div class="admin-card">
      <h2>สถิติระบบ</h2>
      <div class="stats-container">
        <div class="stat-item">
          <div class="stat-value">{{ userStats.total }}</div>
          <div class="stat-label">ผู้ใช้ทั้งหมด</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-value">{{ userStats.pending }}</div>
          <div class="stat-label">รอการอนุมัติ</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-value">{{ userStats.headman }}</div>
          <div class="stat-label">ผู้ใหญ่บ้าน</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-value">{{ userStats.assistant }}</div>
          <div class="stat-label">ผู้ช่วยผู้ใหญ่บ้าน</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-value">{{ userStats.villager }}</div>
          <div class="stat-label">ลูกบ้าน</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'AdminView',
  data() {
    return {
      userStats: {
        total: 0,
        pending: 0,
        headman: 0,
        assistant: 0,
        villager: 0
      },
      isLoading: false
    };
  },
  methods: {
    async fetchUserStats() {
      this.isLoading = true;
      try {
        // In a real app, you would fetch this data from the API
        // For now, we'll use mock data or calculate from getAllUsers
        const response = await api.getAllUsers();
        const users = response.data.users || [];
        
        // Calculate stats
        this.userStats.total = users.length;
        this.userStats.pending = users.filter(user => user.status === 'pending' || !user.is_approved).length;
        this.userStats.headman = users.filter(user => user.status === 'headman').length;
        this.userStats.assistant = users.filter(user => user.status === 'assistant').length;
        this.userStats.villager = users.filter(user => user.status === 'villager').length;
      } catch (error) {
        console.error('Error fetching user stats:', error);
        // Use mock data as fallback
        this.userStats = {
          total: 5,
          pending: 2,
          headman: 1,
          assistant: 1,
          villager: 1
        };
      } finally {
        this.isLoading = false;
      }
    }
  },
  mounted() {
    this.fetchUserStats();
  }
};
</script>

<style scoped>
.admin-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}

.admin-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.admin-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}

.admin-btn {
  flex: 1;
  min-width: 250px;
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  text-decoration: none;
  color: white;
  transition: transform 0.2s, box-shadow 0.2s;
}

.admin-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.pending-btn {
  background-color: #ff9800;
}

.users-btn {
  background-color: #2196F3;
}

.btn-icon {
  font-size: 36px;
  margin-right: 15px;
}

.btn-text h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.btn-text p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.stats-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
}

.stat-item {
  flex: 1;
  min-width: 120px;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .admin-actions {
    flex-direction: column;
  }
  
  .admin-btn {
    width: 100%;
  }
  
  .stats-container {
    flex-direction: column;
  }
  
  .stat-item {
    width: 100%;
  }
}
</style>