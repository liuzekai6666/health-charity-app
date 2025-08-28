<template>
  <div class="charts-container">
    <h1>Data Analytics Charts</h1>
    
    <div class="navigation">
      <button @click="$router.push('/dashboard')" class="back-btn">← Back to Dashboard</button>
    </div>

    <div v-if="loading" class="loading">Loading charts...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!loading && !error && hasAgeData" class="chart-wrapper">
      <!-- 年龄分布图表 -->
      <div class="chart-card">
        <h2>User Age Distribution</h2>
        <div class="chart-container">
          <canvas ref="ageChart"></canvas>
        </div>
        <div class="chart-stats">
          <p>Total Users with Age Data: {{ usersWithAgeCount }}</p>
          <p>Average Age: {{ averageAge.toFixed(1) }}</p>
          <p>Age Range: {{ minAge }} - {{ maxAge }}</p>
        </div>
      </div>
    </div>

    <div v-if="!loading && !error && !hasAgeData" class="no-data">
      <p>No age data available to display chart.</p>
    </div>
  </div>
</template>

<script>
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Chart } from 'chart.js/auto';

export default {
  name: "Charts",
  data() {
    return {
      users: [],
      loading: true,
      error: "",
      ageChart: null
    };
  },
  computed: {
    // 有年龄数据的用户
    usersWithAge() {
      return this.users.filter(user => typeof user.age === 'number' && user.age > 0);
    },

    // 用户数量
    usersWithAgeCount() {
      return this.usersWithAge.length;
    },

    // 检查是否有年龄数据
    hasAgeData() {
      return this.usersWithAgeCount > 0;
    },

    // 计算年龄分布
    ageDistribution() {
      const distribution = {
        '0-18': 0,
        '19-25': 0,
        '26-35': 0,
        '36-45': 0,
        '46-60': 0,
        '61+': 0
      };

      this.usersWithAge.forEach(user => {
        const age = user.age;
        if (age <= 18) distribution['0-18']++;
        else if (age <= 25) distribution['19-25']++;
        else if (age <= 35) distribution['26-35']++;
        else if (age <= 45) distribution['36-45']++;
        else if (age <= 60) distribution['46-60']++;
        else distribution['61+']++;
      });

      return distribution;
    },

    averageAge() {
      const ages = this.usersWithAge.map(user => user.age);
      return ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;
    },

    minAge() {
      const ages = this.usersWithAge.map(user => user.age);
      return ages.length > 0 ? Math.min(...ages) : 0;
    },

    maxAge() {
      const ages = this.usersWithAge.map(user => user.age);
      return ages.length > 0 ? Math.max(...ages) : 0;
    }
  },
  methods: {
    // 安全地销毁图表
    safeDestroyChart() {
      if (this.ageChart) {
        try {
          this.ageChart.destroy();
        } catch (e) {
          console.warn('Error destroying chart:', e);
        }
        this.ageChart = null;
      }
    },

    // 简化版的图表初始化
    initSimpleChart() {
      this.safeDestroyChart();

      const ctx = this.$refs.ageChart;
      if (!ctx) {
        console.error('Canvas element not found');
        return;
      }

      const distribution = this.ageDistribution;
      const ageGroups = Object.keys(distribution);
      const counts = Object.values(distribution);

      console.log('Creating chart with data:', { ageGroups, counts });

      // 使用更简单的方法创建图表
      try {
        // 确保canvas是可见的并且有尺寸
        const container = ctx.parentElement;
        if (container) {
          container.style.height = '400px';
          container.style.width = '100%';
        }

        this.ageChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ageGroups,
            datasets: [{
              label: 'Number of Users',
              data: counts,
              backgroundColor: 'rgba(54, 162, 235, 0.8)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 0 // 禁用动画以避免绘制错误
            },
            plugins: {
              legend: {
                display: true
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }
        });

        console.log('Simple chart created successfully');
      } catch (error) {
        console.error('Error creating simple chart:', error);
      }
    },

    // 加载用户数据
    async loadUserData() {
      try {
        this.loading = true;
        this.error = "";
        
        const userSnap = await getDocs(collection(db, "users"));
        this.users = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        console.log('Loaded users count:', this.users.length);
        console.log('Users with age data count:', this.usersWithAgeCount);
        
        if (!this.hasAgeData) {
          this.error = 'No users with age data found';
          return;
        }
        
        // 等待DOM完全渲染
        await this.$nextTick();
        
        // 使用setTimeout确保DOM完全准备好
        setTimeout(() => {
          this.initSimpleChart();
        }, 500);
        
      } catch (e) {
        console.error("Error fetching data:", e);
        this.error = e?.message || "Failed to load user data";
      } finally {
        this.loading = false;
      }
    }
  },
  async mounted() {
    // 确保页面完全加载后再初始化
    setTimeout(() => {
      this.loadUserData();
    }, 100);
  },
  beforeUnmount() {
    this.safeDestroyChart();
  }
};
</script>

<style scoped>
.charts-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  min-height: 80vh;
}

.navigation {
  margin-bottom: 30px;
}

.back-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.back-btn:hover {
  background-color: #545b62;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.chart-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 700px;
}

.chart-card h2 {
  margin-bottom: 25px;
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 600;
}

.chart-container {
  height: 400px;
  width: 100%;
  margin: 20px 0;
  min-height: 400px;
}

.chart-stats {
  margin-top: 25px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  text-align: center;
}

.chart-stats p {
  margin: 10px 0;
  color: #495057;
  font-size: 1.1rem;
  font-weight: 500;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin: 30px 0;
  font-size: 1.1rem;
  border: 1px solid #ffcdd2;
}

.no-data {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 20px 0;
}

/* 确保canvas元素正确显示 */
canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>