import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import AppointmentCalendar from '../views/AppointmentCalendar.vue'
import Form from '../views/Form.vue';              // 注册/登录表单
import HealthForm from '../components/HealthForm.vue'; // 健康问卷表单
import MapView from '../components/MapView.vue';       // 新增地图页面
import AddUser from '../views/AddUser.vue' 
import Charts from '../views/Charts.vue'
import AdminDashboard from '../views/AdminDashboard.vue';
import OfflineSettings from '../views/OfflineSettings.vue';
import OfflineForm from '../components/OfflineForm.vue';

const routes = [
  { path: '/', component: Home },                  // 首页显示 Home.vue
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/dashboard', component: Dashboard },
  { path: '/form', component: Form },              // 普通表单
  { path: '/healthform', component: HealthForm },  // 健康问卷
  { path: '/map', component: MapView },            // 地图页面
  { path: '/calendar', component: AppointmentCalendar }, // 预约日历
  { path: '/add-user', component: AddUser },       // 添加用户
  { path: '/charts', component: Charts },          // 图表
  { path: '/offline-settings', component: OfflineSettings }, // 离线设置
  { path: '/offline-form', component: OfflineForm },        // 离线表单
  { path: '/admin', component: AdminDashboard, meta: { requiresAdmin: true } } // 管理后台
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
