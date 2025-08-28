<template>
  <div class="add-user-container">
    <h1>Add New User</h1>
    
    <form @submit.prevent="submitUser" class="user-form">
      <div class="form-group">
        <label for="name">Name:</label>
        <input
          id="name"
          v-model="user.name"
          type="text"
          required
          placeholder="Enter user name"
        />
      </div>

      <div class="form-group">
        <label for="email">Email:</label>
        <input
          id="email"
          v-model="user.email"
          type="email"
          required
          placeholder="Enter user email"
        />
      </div>

      <div class="form-group">
        <label for="age">Age:</label>
        <input
          id="age"
          v-model="user.age"
          type="number"
          min="1"
          max="120"
          required
          placeholder="Enter age"
        />
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="loading">
          {{ loading ? 'Adding...' : 'Add User' }}
        </button>
        <button type="button" @click="$router.back()" class="cancel-btn">
          Cancel
        </button>
      </div>

      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="success" class="success-message">{{ success }}</p>
    </form>
  </div>
</template>

<script>
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

export default {
  name: "AddUser",
  data() {
    return {
      user: {
        name: "",
        email: "",
        age: null
      },
      loading: false,
      error: "",
      success: ""
    };
  },
  methods: {
    async submitUser() {
      this.loading = true;
      this.error = "";
      this.success = "";

      try {
        // 验证年龄
        const age = parseInt(this.user.age);
        if (age < 1 || age > 120) {
          throw new Error("Age must be between 1 and 120");
        }

        // 添加到Firestore
        await addDoc(collection(db, "users"), {
          name: this.user.name.trim(),
          email: this.user.email.trim(),
          age: age,
          createdAt: new Date()
        });

        this.success = "User added successfully!";
        
        // 清空表单
        this.user = { name: "", email: "", age: null };
        
        // 3秒后返回dashboard
        setTimeout(() => {
          this.$router.push('/dashboard');
        }, 2000);

      } catch (error) {
        console.error("Error adding user:", error);
        this.error = error.message || "Failed to add user";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.add-user-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.user-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

button {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  flex: 1;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button:not(:disabled) {
  background: #007bff;
  color: white;
}

button:not(:disabled):hover {
  background: #0056b3;
}

.cancel-btn {
  background: #6c757d !important;
  color: white;
}

.cancel-btn:hover {
  background: #545b62 !important;
}

.error-message {
  color: #dc3545;
  padding: 10px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-top: 20px;
}

.success-message {
  color: #155724;
  padding: 10px;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  margin-top: 20px;
}
</style>