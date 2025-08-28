// 离线状态检测和管理工具
class OfflineManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = new Set();
    this.init();
  }

  init() {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  handleOnline() {
    this.isOnline = true;
    this.notifyListeners(true);
    console.log('App is now online');
  }

  handleOffline() {
    this.isOnline = false;
    this.notifyListeners(false);
    console.log('App is now offline');
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(online) {
    this.listeners.forEach(callback => callback(online));
  }

  getOnlineStatus() {
    return this.isOnline;
  }
}

// LocalStorage 管理工具
class StorageManager {
  constructor() {
    this.prefix = 'app_';
  }

  set(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(this.prefix + key, serializedValue);
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  // 获取所有带前缀的键
  getAllKeys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.slice(this.prefix.length));
      }
    }
    return keys;
  }

  // 检查存储空间
  getRemainingSpace() {
    try {
      const testKey = this.prefix + 'test';
      const testData = 'a'.repeat(1024); // 1KB test data
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
      return 'Available';
    } catch (error) {
      return 'Limited or unavailable';
    }
  }
}

// 离线数据同步队列
class SyncQueue {
  constructor() {
    this.queue = this.getStoredQueue();
  }

  getStoredQueue() {
    const storage = new StorageManager();
    return storage.get('sync_queue', []);
  }

  saveQueue() {
    const storage = new StorageManager();
    storage.set('sync_queue', this.queue);
  }

  add(action, data) {
    const item = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      action,
      data,
      timestamp: new Date().toISOString(),
      attempts: 0
    };
    
    this.queue.push(item);
    this.saveQueue();
    return item.id;
  }

  getAll() {
    return this.queue;
  }

  remove(id) {
    this.queue = this.queue.filter(item => item.id !== id);
    this.saveQueue();
  }

  clear() {
    this.queue = [];
    this.saveQueue();
  }

  retry(id) {
    const item = this.queue.find(item => item.id === id);
    if (item) {
      item.attempts++;
      item.lastRetry = new Date().toISOString();
      this.saveQueue();
    }
  }
}

export const offlineManager = new OfflineManager();
export const storageManager = new StorageManager();
export const syncQueue = new SyncQueue();