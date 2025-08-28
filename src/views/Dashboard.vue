<template>
  <div>
    <h1>Dashboard</h1>

    <!-- 顶部按钮区域 - 添加了角色检查和离线设置按钮 -->
    <div class="top-buttons">
      <div class="action-buttons">
        <button type="button" @click="$router.push('/form')">Add New Item</button>
        <button type="button" @click="$router.push('/add-user')">Add New User</button>
        <button type="button" @click="$router.push('/charts')">View Charts</button>
        
        <!-- 离线设置按钮 -->
        <button type="button" @click="navigateToOfflineSettings">Offline Settings</button>
        
        <!-- 管理员按钮 (仅对管理员显示) -->
        <button 
          v-if="userRole === 'admin'" 
          @click="$router.push('/admin')" 
          class="admin-btn"
        >
          Admin Dashboard
        </button>
      </div>
      
      <!-- 用户角色显示 -->
      <div class="user-info" v-if="currentUser">
        Logged in as: {{ currentUser.email }} ({{ userRole }})
      </div>
    </div>

    <!-- 导出控制区域 -->
    <div class="export-controls">
      <span>Export Data:</span>
      <select v-model="exportFormat">
        <option value="csv">CSV</option>
        <option value="pdf">PDF</option>
      </select>
      <button @click="exportData('users')">Export Users</button>
      <button @click="exportData('items')">Export Items</button>
      <span v-if="exportMessage" class="success-message">{{ exportMessage }}</span>
    </div>

    <!-- 加载/错误反馈 -->
    <p v-if="loading">Loading...</p>
    <p v-if="error" aria-live="polite" style="color:red;">{{ error }}</p>

    <!-- 用户搜索 -->
    <label for="searchUsers">Search Users</label>
    <input id="searchUsers" v-model="searchUsers" placeholder="Search Users" style="margin-bottom:8px; padding:4px;" />

    <h2>Users</h2>
    <table>
      <thead>
        <tr>
          <th @click="sortUsers('name')">
            Name
            <span v-if="userSortKey === 'name'">{{ userSortOrder === 'asc' ? '▲' : '▼' }}</span>
          </th>
          <th @click="sortUsers('email')">
            Email
            <span v-if="userSortKey === 'email'">{{ userSortOrder === 'asc' ? '▲' : '▼' }}</span>
          </th>
          <th @click="sortUsers('age')">
            Age
            <span v-if="userSortKey === 'age'">{{ userSortOrder === 'asc' ? '▲' : '▼' }}</span>
          </th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in paginatedUsers" :key="user.id">
          <td>{{ user.name ?? 'Unknown' }}</td>
          <td>{{ user.email ?? '-' }}</td>
          <td>{{ user.age ?? '-' }}</td>
          <td>{{ user.role ?? 'user' }}</td>
          <td>
            <button @click="deleteUser(user.id)" class="action-btn">Delete</button>
            <button 
              v-if="userRole === 'admin' && user.role !== 'admin'" 
              @click="promoteToAdmin(user.id)" 
              class="action-btn promote-btn"
            >
              Make Admin
            </button>
          </td>
        </tr>
        <tr v-if="!loading && filteredSortedUsers.length === 0">
          <td colspan="5">No users found</td>
        </tr>
      </tbody>
    </table>

    <!-- 用户分页 -->
    <div v-if="totalUserPages > 1" style="margin-bottom:16px;">
      <button :disabled="userPage === 1" @click="userPage--">Prev</button>
      <span>Page {{ userPage }} / {{ totalUserPages }}</span>
      <button :disabled="userPage === totalUserPages" @click="userPage++">Next</button>
    </div>

    <!-- Items搜索 -->
    <label for="searchItems">Search Items</label>
    <input id="searchItems" v-model="searchItems" placeholder="Search Items" style="margin:16px 0 8px; padding:4px;" />

    <h2>Items</h2>
    <table>
      <thead>
        <tr>
          <th @click="sortItems('name')">
            Name
            <span v-if="itemSortKey === 'name'">{{ itemSortOrder === 'asc' ? '▲' : '▼' }}</span>
          </th>
          <th @click="sortItems('email')">
            Email
            <span v-if="itemSortKey === 'email'">{{ itemSortOrder === 'asc' ? '▲' : '▼' }}</span>
          </th>
          <th @click="sortItems('notes')">
            Notes
            <span v-if="itemSortKey === 'notes'">{{ itemSortOrder === 'asc' ? '▲' : '▼' }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in paginatedItems" :key="item.id">
          <td>{{ item.name ?? 'Unknown' }}</td>
          <td>{{ item.email ?? '-' }}</td>
          <td>{{ item.notes ?? '-' }}</td>
        </tr>
        <tr v-if="!loading && filteredSortedItems.length === 0">
          <td colspan="3">No items found</td>
        </tr>
      </tbody>
    </table>

    <!-- Items分页 -->
    <div v-if="totalItemPages > 1" style="margin-bottom:16px;">
      <button :disabled="itemPage === 1" @click="itemPage--">Prev</button>
      <span>Page {{ itemPage }} / {{ totalItemPages }}</span>
      <button :disabled="itemPage === totalUserPages" @click="itemPage++">Next</button>
    </div>
  </div>
</template>

<script>
import { collection, getDocs, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default {
  name: "Dashboard",
  data() {
    return {
      users: [],
      items: [],
      loading: true,
      error: "",
      searchUsers: "",
      searchItems: "",
      userSortKey: "",
      userSortOrder: "asc",
      itemSortKey: "",
      itemSortOrder: "asc",
      userPage: 1,
      itemPage: 1,
      pageSize: 10,
      exportFormat: "csv",
      exportMessage: "",
      userRole: "user", // 默认角色
      currentUser: null // 当前登录用户
    };
  },
  computed: {
    filteredSortedUsers() {
      let result = this.users.filter(u =>
        (u.name ?? "").toLowerCase().includes(this.searchUsers.toLowerCase()) ||
        (u.email ?? "").toLowerCase().includes(this.searchUsers.toLowerCase()) ||
        (u.age?.toString() ?? "").includes(this.searchUsers) ||
        (u.role ?? "").toLowerCase().includes(this.searchUsers.toLowerCase())
      );
      if (this.userSortKey) {
        result.sort((a, b) => {
          let valA, valB;
          
          if (this.userSortKey === 'age') {
            valA = a[this.userSortKey] ?? 0;
            valB = b[this.userSortKey] ?? 0;
          } else {
            valA = (a[this.userSortKey] ?? "").toLowerCase();
            valB = (b[this.userSortKey] ?? "").toLowerCase();
          }
          
          if (valA < valB) return this.userSortOrder === "asc" ? -1 : 1;
          if (valA > valB) return this.userSortOrder === "asc" ? 1 : -1;
          return 0;
        });
      }
      return result;
    },
    totalUserPages() {
      return Math.ceil(this.filteredSortedUsers.length / this.pageSize);
    },
    paginatedUsers() {
      const start = (this.userPage - 1) * this.pageSize;
      return this.filteredSortedUsers.slice(start, start + this.pageSize);
    },

    filteredSortedItems() {
      let result = this.items.filter(i =>
        (i.name ?? "").toLowerCase().includes(this.searchItems.toLowerCase()) ||
        (i.email ?? "").toLowerCase().includes(this.searchItems.toLowerCase()) ||
        (i.notes ?? "").toLowerCase().includes(this.searchItems.toLowerCase())
      );
      if (this.itemSortKey) {
        result.sort((a, b) => {
          const valA = (a[this.itemSortKey] ?? "").toLowerCase();
          const valB = (b[this.itemSortKey] ?? "").toLowerCase();
          if (valA < valB) return this.itemSortOrder === "asc" ? -1 : 1;
          if (valA > valB) return this.itemSortOrder === "asc" ? 1 : -1;
          return 0;
        });
      }
      return result;
    },
    totalItemPages() {
      return Math.ceil(this.filteredSortedItems.length / this.pageSize);
    },
    paginatedItems() {
      const start = (this.itemPage - 1) * this.pageSize;
      return this.filteredSortedItems.slice(start, start + this.pageSize);
    }
  },
  methods: {
    sortUsers(key) {
      if (this.userSortKey === key) {
        this.userSortOrder = this.userSortOrder === "asc" ? "desc" : "asc";
      } else {
        this.userSortKey = key;
        this.userSortOrder = "asc";
      }
    },
    sortItems(key) {
      if (this.itemSortKey === key) {
        this.itemSortOrder = this.itemSortOrder === "asc" ? "desc" : "asc";
      } else {
        this.itemSortKey = key;
        this.itemSortOrder = "asc";
      }
    },

    // 删除用户
    async deleteUser(userId) {
      if (confirm('Are you sure you want to delete this user?')) {
        try {
          await deleteDoc(doc(db, "users", userId));
          this.users = this.users.filter(user => user.id !== userId);
        } catch (error) {
          console.error('Error deleting user:', error);
          alert('Failed to delete user');
        }
      }
    },
    
    // 提升用户为管理员
    async promoteToAdmin(userId) {
      if (confirm('Are you sure you want to make this user an admin?')) {
        try {
          await updateDoc(doc(db, "users", userId), {
            role: "admin"
          });
          
          // 更新本地数据
          const userIndex = this.users.findIndex(user => user.id === userId);
          if (userIndex !== -1) {
            this.users[userIndex].role = "admin";
          }
        } catch (error) {
          console.error('Error promoting user:', error);
          alert('Failed to promote user to admin');
        }
      }
    },
    
    // 导航到离线设置
    navigateToOfflineSettings() {
      window.open('http://localhost:5173/offline-settings', '_blank');
    },
    
    // 导出为CSV函数
    exportToCSV(data, headers, filename) {
      const escapeValue = (value) => {
        if (value === null || value === undefined) return '""';
        const stringValue = String(value);
        return `"${stringValue.replace(/"/g, '""')}"`;
      };
      
      const headerRow = headers.map(h => escapeValue(h.label)).join(',');
      const dataRows = data.map(item => 
        headers.map(header => escapeValue(item[header.key])).join(',')
      );
      
      const csvContent = [headerRow, ...dataRows].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.exportMessage = `CSV exported successfully: ${filename}.csv`;
      setTimeout(() => {
        this.exportMessage = "";
      }, 3000);
    },
    
    // 导出为PDF函数
    exportToPDF(data, headers, filename, title) {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text(title, 14, 15);
      
      doc.autoTable({
        startY: 20,
        head: [headers.map(h => h.label)],
        body: data.map(item => headers.map(header => item[header.key] || '')),
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [52, 152, 219] }
      });
      
      doc.save(`${filename}.pdf`);
      
      this.exportMessage = `PDF exported successfully: ${filename}.pdf`;
      setTimeout(() => {
        this.exportMessage = "";
      }, 3000);
    },
    
    // 导出处理函数
    exportData(dataType) {
      const isUsers = dataType === 'users';
      
      const data = isUsers ? this.filteredSortedUsers : this.filteredSortedItems;
      const headers = isUsers ? [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'age', label: 'Age' },
        { key: 'role', label: 'Role' }
      ] : [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'notes', label: 'Notes' }
      ];
      
      const filename = isUsers ? 'users_export' : 'items_export';
      const title = isUsers ? 'Users Export' : 'Items Export';
      
      if (this.exportFormat === 'csv') {
        this.exportToCSV(data, headers, filename);
      } else if (this.exportFormat === 'pdf') {
        this.exportToPDF(data, headers, filename, title);
      }
    },
    
    // 获取当前用户角色
    async getCurrentUserRole() {
      try {
        const user = auth.currentUser;
        if (user) {
          this.currentUser = user;
          
          // 从Firestore获取用户角色
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            this.userRole = userDoc.data().role || "user";
          }
        }
      } catch (error) {
        console.error("Error getting user role:", error);
      }
    }
  },
  async mounted() {
    try {
      // 获取当前用户角色
      await this.getCurrentUserRole();
      
      // 获取用户和数据列表
      const [userSnap, itemSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "items")),
      ]);
      
      this.users = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      this.items = itemSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error("Error fetching data:", e);
      this.error = e?.message || String(e);
    } finally {
      this.loading = false;
    }
  }
};
</script>

<style scoped>
.top-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.user-info {
  padding: 8px 12px;
  background-color: #f0f8ff;
  border-radius: 4px;
  font-size: 14px;
}

.admin-btn {
  background-color: #dc3545;
  color: white;
  border: none;
}

.admin-btn:hover {
  background-color: #bd2130;
}

.export-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 0;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.success-message {
  color: #27ae60;
  padding: 10px;
  background-color: #d5f5e3;
  border-radius: 4px;
  margin-left: 10px;
}

table {
  border-collapse: collapse;
  margin: 12px 0;
  width: 100%;
  max-width: 800px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  cursor: pointer;
}

th span {
  margin-left: 4px;
  font-size: 0.8em;
}

.action-btn {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 5px;
}

.action-btn:hover {
  background-color: #e9ecef;
  border-color: #ccc;
}

.promote-btn {
  background-color: #28a745;
  color: white;
  border-color: #28a745;
}

.promote-btn:hover {
  background-color: #218838;
  border-color: #1e7e34;
}

h1 {
  margin-bottom: 8px;
}

button {
  margin: 8px 4px 16px 0;
  padding: 6px 12px;
}

input {
  width: 200px;
  padding: 4px;
}
</style>