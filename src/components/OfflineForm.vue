<template>
  <div class="offline-form">
    <h3>Add User (Works Offline)</h3>
    
    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label for="name">Name:</label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          required
          placeholder="Enter user name"
          :disabled="submitting"
        />
      </div>

      <div class="form-group">
        <label for="email">Email:</label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          required
          placeholder="Enter user email"
          :disabled="submitting"
        />
      </div>

      <div class="form-group">
        <label for="age">Age:</label>
        <input
          id="age"
          v-model="formData.age"
          type="number"
          min="1"
          max="120"
          required
          placeholder="Enter age"
          :disabled="submitting"
        />
      </div>

      <button 
        type="submit" 
        :disabled="submitting"
        :class="['submit-btn', { offline: !isOnline }]"
      >
        {{ submitting ? 'Saving...' : isOnline ? 'Add User' : 'Save Offline' }}
      </button>

      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>
    </form>

    <div v-if="draftUsers.length > 0" class="draft-section">
      <h4>Draft Users (Offline)</h4>
      <div v-for="user in draftUsers" :key="user.id" class="draft-item">
        <span>{{ user.name }} ({{ user.email }}) - Age: {{ user.age }}</span>
        <button @click="removeDraft(user.id)" class="remove-btn">×</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { offlineManager, storageManager, syncQueue } from '../utils/offline';

export default {
  name: 'OfflineForm',
  setup() {
    const formData = reactive({
      name: '',
      email: '',
      age: ''
    });

    const submitting = ref(false);
    const message = ref('');
    const messageType = ref('');

    const isOnline = computed(() => offlineManager.getOnlineStatus());
    const draftUsers = ref(storageManager.get('draft_users', []));

    const showMessage = (text, type = 'info') => {
      message.value = text;
      messageType.value = type;
      setTimeout(() => {
        message.value = '';
      }, 3000);
    };

    const saveDraft = (userData) => {
      const draft = {
        id: Date.now().toString(),
        ...userData,
        createdAt: new Date().toISOString()
      };
      
      draftUsers.value.push(draft);
      storageManager.set('draft_users', draftUsers.value);
      return draft.id;
    };

    const removeDraft = (id) => {
      draftUsers.value = draftUsers.value.filter(user => user.id !== id);
      storageManager.set('draft_users', draftUsers.value);
    };

    const handleOnlineSubmit = async (userData) => {
      // 这里应该是实际的API调用
      console.log('Submitting to API:', userData);
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, id: Math.random().toString() };
    };

    const handleOfflineSubmit = (userData) => {
      const draftId = saveDraft(userData);
      syncQueue.add('create_user', userData);
      return draftId;
    };

    const handleSubmit = async () => {
      if (submitting.value) return;

      submitting.value = true;
      message.value = '';
      
      try {
        let result;
        
        if (isOnline.value) {
          result = await handleOnlineSubmit(formData);
          if (result.success) {
            showMessage('User added successfully!', 'success');
          }
        } else {
          const draftId = handleOfflineSubmit(formData);
          showMessage(`User saved offline (ID: ${draftId}). Will sync when online.`, 'warning');
        }

        // 清空表单
        Object.assign(formData, {
          name: '',
          email: '',
          age: ''
        });

      } catch (error) {
        console.error('Error submitting form:', error);
        showMessage('Error saving user. Please try again.', 'error');
      } finally {
        submitting.value = false;
      }
    };

    onMounted(() => {
      // 加载草稿数据
      draftUsers.value = storageManager.get('draft_users', []);
    });

    return {
      formData,
      submitting,
      message,
      messageType,
      isOnline,
      draftUsers,
      handleSubmit,
      removeDraft
    };
  }
};
</script>

<style scoped>
.offline-form {
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form {
  margin-bottom: 30px;
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
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #0056b3;
}

.submit-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.submit-btn.offline {
  background: #ffc107;
  color: #000;
}

.submit-btn.offline:hover:not(:disabled) {
  background: #e0a800;
}

.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 6px;
  text-align: center;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.message.warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.draft-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.draft-section h4 {
  margin-bottom: 15px;
  color: #666;
}

.draft-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #ffc107;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #c82333;
}
</style>