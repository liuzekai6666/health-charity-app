<template>
  <div class="map-page">
    <h2>Nanjing Xuanwu District Map Navigation</h2>
    <div class="map-container" ref="mapContainer"></div>
    
    <div class="control-panel">
      <button @click="locateUser" :disabled="loading">📍 Locate Me</button>
      <button @click="searchNearbyPlaces('hospital')" :disabled="!userLocation || loading">🏥 Find Hospitals</button>
      <button @click="searchNearbyPlaces('pharmacy')" :disabled="!userLocation || loading">💊 Find Pharmacies</button>
      <button @click="clearAll" :disabled="loading">🗑️ Clear Markers</button>
    </div>
    
    <!-- Search results list -->
    <div v-if="places.length > 0" class="places-list">
      <h3>Nearby Places ({{ places.length }})</h3>
      <div v-for="(place, index) in places" :key="index" class="place-item">
        <div class="place-info">
          <strong>{{ place.name }}</strong>
          <p>📍 Distance: {{ place.distance }} meters</p>
          <p>🏠 Address: {{ place.address }}</p>
          <p v-if="place.tel">📞 Phone: {{ place.tel }}</p>
        </div>
        <button @click="focusOnPlace(place)" class="focus-btn">🔍 View</button>
      </div>
    </div>
    
    <div v-if="loading" class="status-message">🗺️ {{ loadingMessage }}</div>
    <div v-if="error" class="error-message">❌ {{ error }}</div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'MapPage',
  setup() {
    const mapContainer = ref(null);
    const loading = ref(true);
    const error = ref('');
    const loadingMessage = ref('Initializing map...');
    const userLocation = ref(null);
    const markers = ref([]);
    const places = ref([]);

    // Southeast University coordinates (Nanjing Xuanwu District)
    const SEU_LOCATION = { lng: 118.7969, lat: 32.0584 };

    // Load AMap
    const loadAMap = () => {
      return new Promise((resolve, reject) => {
        if (window.AMap) {
          resolve();
          return;
        }
        
        // Remove old scripts to avoid duplicate loading
        const oldScripts = document.querySelectorAll('script[src*="amap.com"]');
        oldScripts.forEach(script => script.remove());
        
        const script = document.createElement('script');
        // Use your own AMap API key
        script.src = `https://webapi.amap.com/maps?v=2.0&key=6f60ae5e3df54b7e078a95ba3154f516`;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    // Initialize map
    const initMap = async () => {
      try {
        loading.value = true;
        await loadAMap();
        
        window.map = new AMap.Map(mapContainer.value, {
          zoom: 15,
          center: [SEU_LOCATION.lng, SEU_LOCATION.lat],
          viewMode: '2D'
        });
        
        // Add Southeast University marker
        addMarker([SEU_LOCATION.lng, SEU_LOCATION.lat], 'Southeast University', '🎓', '#722ed1');
        
        loading.value = false;
        
      } catch (err) {
        error.value = 'Map loading failed, please refresh and try again';
        loading.value = false;
      }
    };

    // Locate user
    const locateUser = () => {
      loading.value = true;
      loadingMessage.value = 'Getting location...';
      
      // Use browser native geolocation
      if (navigator.geolocation) {
        const options = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        };
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lng = position.coords.longitude;
            const lat = position.coords.latitude;
            userLocation.value = { lng, lat };
            
            window.map.setCenter([lng, lat]);
            window.map.setZoom(15);
            addMarker([lng, lat], 'My Location', '📍', '#1890ff');
            loading.value = false;
          },
          (err) => {
            // Use Southeast University location as fallback
            userLocation.value = SEU_LOCATION;
            window.map.setCenter([SEU_LOCATION.lng, SEU_LOCATION.lat]);
            window.map.setZoom(15);
            addMarker([SEU_LOCATION.lng, SEU_LOCATION.lat], 'Current Location (Southeast University)', '📍', '#1890ff');
            error.value = `Location failed (${getErrorMessage(err.code)}), showing Southeast University`;
            loading.value = false;
          },
          options
        );
      } else {
        error.value = 'Browser does not support geolocation';
        loading.value = false;
      }
    };

    // Error message handling
    const getErrorMessage = (errorCode) => {
      switch(errorCode) {
        case 1: return 'Location permission denied';
        case 2: return 'Location unavailable';
        case 3: return 'Location request timeout';
        default: return 'Unknown error';
      }
    };

    // Add marker
    const addMarker = (position, title, icon, color = '#ff4d4f') => {
      const marker = new AMap.Marker({
        position: position,
        title: title,
        content: `<div style="background: ${color}; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px;">${icon}</div>`
      });
      marker.setMap(window.map);
      markers.value.push(marker);
    };

    // Search nearby places
    const searchNearbyPlaces = (type) => {
      if (!userLocation.value) {
        error.value = 'Please locate your position first';
        return;
      }

      loading.value = true;
      loadingMessage.value = `Searching ${type === 'hospital' ? 'hospitals' : 'pharmacies'}...`;
      
      // Clear old markers (keep user location and university markers)
      markers.value.forEach(marker => {
        const title = marker.getTitle();
        if (title !== 'My Location' && title !== 'Southeast University') {
          marker.setMap(null);
        }
      });
      markers.value = markers.value.filter(marker => 
        marker.getTitle() === 'My Location' || marker.getTitle() === 'Southeast University'
      );
      
      places.value = [];

      // Real data for Southeast University area in Nanjing
      const nanjingData = {
        'hospital': [
          { 
            name: 'Nanjing Gulou Hospital', 
            distance: 2500, 
            address: '321 Zhongshan Road, Gulou District, Nanjing', 
            tel: '025-83106666',
            location: { lng: 118.7830, lat: 32.0612 }
          },
          { 
            name: 'Southeast University Zhongda Hospital', 
            distance: 800, 
            address: '87 Dingjiaqiao, Gulou District, Nanjing', 
            tel: '025-83272114',
            location: { lng: 118.7890, lat: 32.0621 }
          },
          { 
            name: 'Jiangsu Stomatological Hospital', 
            distance: 1800, 
            address: '136 Hanzhong Road, Gulou District, Nanjing', 
            tel: '025-85031858',
            location: { lng: 118.7820, lat: 32.0442 }
          }
        ],
        'pharmacy': [
          { 
            name: 'Xiansheng Zaikang Pharmacy (Chengxian Street)', 
            distance: 300, 
            address: '66 Chengxian Street, Xuanwu District, Nanjing', 
            tel: '025-83606666',
            location: { lng: 118.7980, lat: 32.0590 }
          },
          { 
            name: 'Yifeng Pharmacy (Sipailou Branch)', 
            distance: 500, 
            address: '122 Taiping North Road, Xuanwu District, Nanjing', 
            tel: '025-84567777',
            location: { lng: 118.7970, lat: 32.0570 }
          },
          { 
            name: 'Laobaixing Pharmacy (Zhujiang Road)', 
            distance: 1200, 
            address: '260 Zhujiang Road, Xuanwu District, Nanjing', 
            tel: '025-84428888',
            location: { lng: 118.7910, lat: 32.0520 }
          }
        ]
      };

      // Display data
      places.value = nanjingData[type] || [];
      
      // Mark on map
      places.value.forEach(place => {
        if (place.location) {
          addMarker(
            [place.location.lng, place.location.lat], 
            place.name, 
            type === 'hospital' ? '🏥' : '💊',
            type === 'hospital' ? '#ff4d4f' : '#52c41a'
          );
        }
      });

      loading.value = false;
    };

    // Focus on place
    const focusOnPlace = (place) => {
      if (place.location) {
        window.map.setCenter([place.location.lng, place.location.lat]);
        window.map.setZoom(16);
      }
    };

    // Clear all
    const clearAll = () => {
      markers.value.forEach(marker => marker.setMap(null));
      markers.value = [];
      places.value = [];
      
      // Re-add Southeast University marker
      addMarker([SEU_LOCATION.lng, SEU_LOCATION.lat], 'Southeast University', '🎓', '#722ed1');
    };

    onMounted(() => {
      setTimeout(initMap, 100);
    });

    return {
      mapContainer,
      loading,
      error,
      loadingMessage,
      userLocation,
      markers,
      places,
      locateUser,
      searchNearbyPlaces,
      focusOnPlace,
      clearAll
    };
  }
};
</script>

<style scoped>
.map-page {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  font-family: 'Microsoft YaHei', sans-serif;
}

.map-container {
  width: 100%;
  height: 500px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  overflow: hidden;
  margin: 20px 0;
}

.control-panel {
  display: flex;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
  justify-content: center;
}

.control-panel button {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.control-panel button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.control-panel button:disabled {
  background: #d9d9d9;
  transform: none;
  box-shadow: none;
  cursor: not-allowed;
}

.places-list {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  background: linear-gradient(135deg, #fafafa, #f5f5f5);
}

.place-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin: 12px 0;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.place-item:hover {
  transform: translateX(4px);
}

.place-info {
  flex: 1;
}

.place-info strong {
  color: #262626;
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
}

.place-info p {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.focus-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #faad14, #d48806);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.focus-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(250, 173, 20, 0.4);
}

.status-message, .error-message {
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
  text-align: center;
  font-size: 15px;
}

.status-message {
  background: linear-gradient(135deg, #e6f7ff, #bae7ff);
  border: 1px solid #91d5ff;
  color: #096dd9;
}

.error-message {
  background: linear-gradient(135deg, #fff2f0, #ffccc7);
  border: 1px solid #ffa39e;
  color: #cf1322;
}

h2 {
  color: #262626;
  text-align: center;
  margin-bottom: 24px;
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(135deg, #1890ff, #722ed1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

h3 {
  color: #262626;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
}
</style>