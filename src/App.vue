<template>
  <div id="app">
    <OfflineIndicator />
    <router-view />
  </div>
</template>

<script>
import OfflineIndicator from './components/OfflineIndicator.vue';
import { offlineManager } from './utils/offline';

export default {
  name: 'App',
  components: {
    OfflineIndicator
  },
  mounted() {
    // 初始化离线功能
    console.log('Initial offline status:', offlineManager.getOnlineStatus() ? 'Online' : 'Offline');
    
    // 监听网络状态变化
    offlineManager.addListener((online) => {
      if (online) {
        this.$notify({
          title: 'Back Online',
          message: 'Connection restored. Syncing data...',
          type: 'success'
        });
      } else {
        this.$notify({
          title: 'Offline Mode',
          message: 'Working offline. Changes will be saved locally.',
          type: 'warning'
        });
      }
    });
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  background-color: #f8f9fa;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: #f8f9fa;
}
</style>