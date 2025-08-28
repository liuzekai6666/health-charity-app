<template>
  <div class="offline-settings">
    <h1>Offline Settings</h1>
    
    <div class="back-nav">
      <button @click="$router.push('/dashboard')" class="back-btn">← Back to Dashboard</button>
    </div>

    <div class="settings-grid">
      <!-- 网络状态 -->
      <div class="setting-card">
        <h3>Network Status</h3>
        <div :class="['status-indicator', isOnline ? 'online' : 'offline']">
          {{ isOnline ? 'Online' : 'Offline' }}
        </div>
        <p>Last online: {{ lastOnlineTime }}</p>
      </div>

      <!-- 存储信息 -->
      <div class="setting-card">
        <h3>Local Storage</h3>
        <div class="storage-info">
          <p>Items stored: {{ storageItems }}</p>
          <p>Space: {{ storageSpace }}</p>
        </div>
        <button @click="clearStorage" class="danger-btn">Clear All Data</button>
      </div>

      <!-- 同步队列 -->
      <div class="setting-card">
        <h3>Pending Sync</h3>
        <div class="sync-info">
          <p>Pending actions: {{ pendingSyncCount }}</p>
          <div v-if="pendingSyncCount > 0" class="sync-actions">
            <button @click="retrySync" class="action-btn">Retry Sync</button>
            <button @click="clearSyncQueue" class="danger-btn">Clear Queue</button>
          </div>
        </div>
      </div>

      <!-- 离线设置 -->
      <div class="setting-card">
        <h3>Offline Preferences</h3>
        <div class="preference">
          <label>
            <input type="checkbox" v-model="autoSaveDrafts" />
            Auto-save drafts offline
          </label>
        </div>
        <div class="preference">
          <label>
            <input type="checkbox" v-model="notifyOnReconnect" />
            Notify when back online
          </label>
        </div>
      </div>
    </div>

    <!-- 存储数据预览 -->
    <div class="data-preview">
      <h3>Stored Data</h3>
      <div class="data-list">
        <div v-for="key in storageKeys" :key="key" class="data-item">
          <span class="key">{{ key }}</span>
          <span class="size">{{ getItemSize(key) }}</span>
          <button @click="removeItem(key)" class="remove-btn">Remove</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { offlineManager, storageManager, syncQueue } from '../utils/offline';

export default {
  name: 'OfflineSettings',
  setup() {
    const isOnline = ref(offlineManager.getOnlineStatus());
    const lastOnlineTime = ref(storageManager.get('last_online', 'Never'));
    const autoSaveDrafts = ref(storageManager.get('auto_save_drafts', true));
    const notifyOnReconnect = ref(storageManager.get('notify_reconnect', true));
    const storageKeys = ref([]);

    const pendingSyncCount = computed(() => syncQueue.getAll().length);
    const storageItems = computed(() => storageKeys.value.length);
    const storageSpace = computed(() => storageManager.getRemainingSpace());

    const updateOnlineStatus = (online) => {
      isOnline.value = online;
      if (online) {
        lastOnlineTime.value = new Date().toLocaleString();
        storageManager.set('last_online', lastOnlineTime.value);
      }
    };

    const updateStorageKeys = () => {
      storageKeys.value = storageManager.getAllKeys();
    };

    const getItemSize = (key) => {
      const item = storageManager.get(key);
      const size = JSON.stringify(item).length;
      return `${size} bytes`;
    };

    const removeItem = (key) => {
      if (confirm(`Remove ${key}?`)) {
        storageManager.remove(key);
        updateStorageKeys();
      }
    };

    const clearStorage = () => {
      if (confirm('Clear all local storage data?')) {
        storageManager.clear();
        updateStorageKeys();
      }
    };

    const retrySync = () => {
      alert('Sync retry functionality would be implemented here');
    };

    const clearSyncQueue = () => {
      if (confirm('Clear all pending sync actions?')) {
        syncQueue.clear();
      }
    };

    // 监听设置变化
    const saveSettings = () => {
      storageManager.set('auto_save_drafts', autoSaveDrafts.value);
      storageManager.set('notify_reconnect', notifyOnReconnect.value);
    };

    onMounted(() => {
      offlineManager.addListener(updateOnlineStatus);
      updateStorageKeys();
      
      // 从存储加载设置
      autoSaveDrafts.value = storageManager.get('auto_save_drafts', true);
      notifyOnReconnect.value = storageManager.get('notify_reconnect', true);
      lastOnlineTime.value = storageManager.get('last_online', 'Never');
    });

    onUnmounted(() => {
      offlineManager.listeners.delete(updateOnlineStatus);
    });

    return {
      isOnline,
      lastOnlineTime,
      autoSaveDrafts,
      notifyOnReconnect,
      storageKeys,
      pendingSyncCount,
      storageItems,
      storageSpace,
      getItemSize,
      removeItem,
      clearStorage,
      retrySync,
      clearSyncQueue,
      saveSettings
    };
  }
};
</script>

<style scoped>
.offline-settings {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.back-nav {
  margin-bottom: 30px;
}

.back-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.setting-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.setting-card h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.status-indicator {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  margin-bottom: 10px;
}

.status-indicator.online {
  background: #d4edda;
  color: #155724;
}

.status-indicator.offline {
  background: #fff3cd;
  color: #856404;
}

.storage-info p {
  margin: 5px 0;
  color: #666;
}

.danger-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.danger-btn:hover {
  background: #c82333;
}

.action-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
}

.action-btn:hover {
  background: #0056b3;
}

.sync-actions {
  margin-top: 10px;
}

.preference {
  margin: 10px 0;
}

.preference label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.preference input {
  margin-right: 10px;
}

.data-preview {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.data-list {
  margin-top: 15px;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border-radius: 6px;
}

.key {
  font-weight: 500;
  color: #495057;
}

.size {
  color: #6c757d;
  font-size: 0.9em;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8em;
}

.remove-btn:hover {
  background: #c82333;
}
</style>