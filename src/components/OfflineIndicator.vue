<template>
  <div :class="['offline-indicator', { online: isOnline, offline: !isOnline }]">
    <div class="status-dot"></div>
    <span class="status-text">
      {{ isOnline ? 'Online' : 'Offline' }}
    </span>
    <span v-if="!isOnline" class="offline-message">
      • Working offline - changes will sync when online
    </span>
    
    <div v-if="pendingSyncCount > 0" class="sync-info">
      {{ pendingSyncCount }} pending {{ pendingSyncCount === 1 ? 'change' : 'changes' }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { offlineManager, syncQueue } from '../utils/offline';

export default {
  name: 'OfflineIndicator',
  setup() {
    const isOnline = ref(offlineManager.getOnlineStatus());
    const pendingSyncCount = ref(syncQueue.getAll().length);

    const updateOnlineStatus = (online) => {
      isOnline.value = online;
    };

    const updateSyncCount = () => {
      pendingSyncCount.value = syncQueue.getAll().length;
    };

    onMounted(() => {
      offlineManager.addListener(updateOnlineStatus);
      // 每30秒检查一次同步队列
      const interval = setInterval(updateSyncCount, 30000);
      
      return () => {
        offlineManager.listeners.delete(updateOnlineStatus);
        clearInterval(interval);
      };
    });

    // 监听storage变化来更新同步计数
    window.addEventListener('storage', updateSyncCount);

    onUnmounted(() => {
      window.removeEventListener('storage', updateSyncCount);
    });

    return {
      isOnline,
      pendingSyncCount
    };
  }
};
</script>

<style scoped>
.offline-indicator {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  margin: 10px 0;
}

.offline-indicator.online {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.offline-indicator.offline {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.online .status-dot {
  background-color: #28a745;
  animation: pulse 2s infinite;
}

.offline .status-dot {
  background-color: #ffc107;
}

.status-text {
  font-weight: 600;
  margin-right: 8px;
}

.offline-message {
  opacity: 0.8;
}

.sync-info {
  margin-left: auto;
  padding: 2px 8px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 12px;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>