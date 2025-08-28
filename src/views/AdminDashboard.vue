<template>
  <div class="admin-dashboard">
    <h1>Admin Dashboard</h1>
    
    <div class="back-nav">
      <button @click="$router.push('/dashboard')" class="back-btn">← Back to User View</button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats">
      <div class="stat-card">
        <h3>Total Users</h3>
        <p class="number">{{ users.length }}</p>
      </div>
      <div class="stat-card">
        <h3>Admins</h3>
        <p class="number">{{ adminCount }}</p>
      </div>
      <div class="stat-card">
        <h3>Regular Users</h3>
        <p class="number">{{ regularCount }}</p>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="user-list">
      <h2>All Users</h2>
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          placeholder="Search users..." 
          class="search-input"
        />
      </div>

      <table class="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.name || 'No name' }}</td>
            <td>{{ user.email || 'No email' }}</td>
            <td>
              <span :class="['role-badge', user.role]">
                {{ user.role || 'user' }}
              </span>
            </td>
            <td>
              <button 
                @click="editUserRole(user)" 
                class="edit-btn"
              >
                Edit Role
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-if="filteredUsers.length === 0" class="no-users">No users found</p>
    </div>

    <!-- 编辑角色模态框 -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <h3>Edit User Role</h3>
        <p><strong>Name:</strong> {{ editingUser.name }}</p>
        <p><strong>Email:</strong> {{ editingUser.email }}</p>
        
        <div class="role-select">
          <label>Role:</label>
          <select v-model="editingUser.role">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div class="modal-buttons">
          <button @click="saveRole" class="save-btn">Save</button>
          <button @click="showEditModal = false" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
  </div>
</template>

<script>
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default {
  name: "AdminDashboard",
  data() {
    return {
      users: [],
      loading: false,
      searchQuery: "",
      showEditModal: false,
      editingUser: null
    };
  },
  computed: {
    adminCount() {
      return this.users.filter(user => user.role === 'admin').length;
    },
    regularCount() {
      return this.users.filter(user => !user.role || user.role === 'user').length;
    },
    filteredUsers() {
      if (!this.searchQuery) return this.users;
      
      return this.users.filter(user => 
        (user.name && user.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(this.searchQuery.toLowerCase()))
      );
    }
  },
  methods: {
    async loadUsers() {
      this.loading = true;
      try {
        const userSnap = await getDocs(collection(db, "users"));
        this.users = userSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error("Error loading users:", error);
        alert("Failed to load users");
      } finally {
        this.loading = false;
      }
    },

    editUserRole(user) {
      this.editingUser = { ...user };
      this.showEditModal = true;
    },

    async saveRole() {
      try {
        await updateDoc(doc(db, "users", this.editingUser.id), {
          role: this.editingUser.role
        });

        // 更新本地数据
        const index = this.users.findIndex(u => u.id === this.editingUser.id);
        if (index !== -1) {
          this.users[index].role = this.editingUser.role;
        }

        this.showEditModal = false;
        alert("User role updated successfully!");
      } catch (error) {
        console.error("Error updating role:", error);
        alert("Failed to update user role");
      }
    }
  },
  async mounted() {
    await this.loadUsers();
  }
};
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.back-nav {
  margin-bottom: 20px;
}

.back-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.back-btn:hover {
  background: #5a6268;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 10px;
  color: #666;
  font-size: 14px;
}

.number {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
  color: #007bff;
}

.user-list {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-box {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  max-width: 300px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.users-table th {
  background: #f8f9fa;
  font-weight: 600;
}

.role-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.user {
  background: #e3f2fd;
  color: #1976d2;
}

.role-badge.admin {
  background: #fce4ec;
  color: #c2185b;
}

.edit-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.edit-btn:hover {
  background: #0056b3;
}

.no-users {
  text-align: center;
  color: #666;
  padding: 20px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
}

.role-select {
  margin: 20px 0;
}

.role-select label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.role-select select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.save-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>