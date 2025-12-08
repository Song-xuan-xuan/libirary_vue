<template>
  <div class="home-container">
    <!-- 背景装饰 -->
    <div class="background-blob blob-1"></div>
    <div class="background-blob blob-2"></div>

    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-text">
        <h1 class="greeting">{{ timeState }}，{{ userStore.userInfo?.name || userStore.userInfo?.username || '读者' }}</h1>
        <p class="date">{{ currentDate }}</p>
      </div>
      <div class="welcome-decoration">
        <el-icon><Reading /></el-icon>
      </div>
    </div>

    <!-- 数据概览 -->
    <div class="stats-row">
      <div class="stat-item" @click="$router.push('/library/borrow')">
        <div class="stat-number">{{ stats.borrowCount }}</div>
        <div class="stat-label">当前借阅</div>
        <div class="stat-icon icon-blue">
          <el-icon><Collection /></el-icon>
        </div>
      </div>
      <div class="stat-item" @click="$router.push('/library/appointment')">
        <div class="stat-number">{{ stats.reserveCount }}</div>
        <div class="stat-label">预约中</div>
        <div class="stat-icon icon-purple">
          <el-icon><Clock /></el-icon>
        </div>
      </div>
      <div class="stat-item" @click="$router.push('/library/favorite')">
        <div class="stat-number">{{ stats.favoriteCount }}</div>
        <div class="stat-label">我的收藏</div>
        <div class="stat-icon icon-red">
          <el-icon><Star /></el-icon>
        </div>
      </div>
    </div>

    <!-- 最近动态 -->
    <div class="recent-section">
      <div class="section-header">
        <h2 class="section-title">📢 最近动态</h2>
        <el-button link type="primary" @click="refreshActivities" :loading="activitiesLoading">
          <el-icon><Refresh /></el-icon> 刷新
        </el-button>
      </div>
      <div class="activity-list" v-loading="activitiesLoading">
        <div v-for="(activity, index) in recentActivities" :key="activity.id || index" class="activity-item">
          <div class="activity-icon activity-icon-borrow">
            <el-icon><Reading /></el-icon>
          </div>
          <div class="activity-content">
            <span class="activity-user">{{ activity.userName }}</span>
            <span class="activity-action">{{ activity.action }}</span>
            <span class="activity-book">《{{ activity.bookTitle }}》</span>
          </div>
          <div class="activity-time">{{ formatTime(activity.time) }}</div>
        </div>
        <div v-if="recentActivities.length === 0 && !activitiesLoading" class="empty-activities">
          暂无动态
        </div>
      </div>
    </div>

    <!-- 统计面板 -->
    <div class="dashboard-row">
      <!-- 热门图书 -->
      <div class="dashboard-panel">
        <div class="panel-header">
          <span>🔥 热门图书 Top 10</span>
        </div>
        <el-table :data="topBooks" class="flat-table" size="small" v-loading="topBooksLoading">
          <el-table-column prop="rank" label="排名" width="60" align="center">
            <template #default="scope">
              <span :class="['rank-badge', 'rank-' + scope.row.rank]">{{ scope.row.rank }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="书名" show-overflow-tooltip />
          <el-table-column prop="count" label="借阅次" width="80" align="center" />
        </el-table>
      </div>

      <!-- 阅读之星 -->
      <div class="dashboard-panel">
        <div class="panel-header">
          <span>⭐ 阅读之星 Top 5</span>
        </div>
        <el-table :data="topUsers" class="flat-table" size="small" v-loading="topUsersLoading">
          <el-table-column prop="rank" label="排名" width="60" align="center">
            <template #default="scope">
              <span :class="['rank-badge', 'rank-' + scope.row.rank]">{{ scope.row.rank }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="姓名" show-overflow-tooltip>
            <template #default="scope">
              <span>{{ scope.row.name || '未知用户' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="count" label="借阅量" width="80" align="center" />
        </el-table>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { Reading, Collection, Timer, Star, Clock, Refresh } from '@element-plus/icons-vue'
import {
  getTopBorrowedBooks,
  getTopBorrowers,
  getRecentActivities,
  formatRelativeTime,
  type ActivityRecord,
  type TopBorrowedBook,
  type TopBorrower
} from '@/api/analytics'
import { getBorrowList } from '@/api/borrow'
import { getFavoriteList } from '@/api/favorite'
import { getReservationList } from '@/api/reservation'

const userStore = useUserStore()

// 时间问候语
const timeState = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

// 当前日期
const currentDate = computed(() => {
  const date = new Date()
  const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', weekday: 'long' }
  return date.toLocaleDateString('zh-CN', options)
})

// ============ 统计数据 ============
const stats = ref({
  borrowCount: 0,
  favoriteCount: 0,
  reserveCount: 0
})

// ============ 最近动态 ============
const recentActivities = ref<ActivityRecord[]>([])
const activitiesLoading = ref(false)

const formatTime = (dateStr: string) => formatRelativeTime(dateStr)

const refreshActivities = async () => {
  activitiesLoading.value = true
  try {
    const res = await getRecentActivities(8)
    const activities = extractArray(res, "刷新动态")
    recentActivities.value = activities.map((a: any) => ({
      id: a.id,
      userName: a.userName,
      bookTitle: a.bookTitle,
      action: a.action,
      time: a.time
    }))
  } catch (error) {
    console.error('刷新动态失败:', error)
    ElMessage.error('刷新动态失败,请稍后重试')
  } finally {
    activitiesLoading.value = false
  }
}

// ============ 热门图书 ============
const topBooks = ref<{ rank: number; bookId: number; title: string; author: string; count: number }[]>([])
const topBooksLoading = ref(false)

// ============ 阅读之星 ============
const topUsers = ref<{ rank: number; userId: number; name: string; count: number }[]>([])
const topUsersLoading = ref(false)

// ============ 通用数据提取器 ============
const extractArray = (res: any, apiName: string) => {
  if (!res) return [];

  console.log(`[${apiName}] 原始数据:`, res);

  // 1. 拦截器已处理, res.data 就是数组
  if (Array.isArray(res.data)) {
    return res.data;
  }

  // 2. 标准 Axios, res.data.data 是数组
  if (res.data && Array.isArray(res.data.data)) {
    return res.data.data;
  }

  // 3. result 结构
  if (res.result && Array.isArray(res.result.data)) {
    return res.result.data;
  }
  
  // 4. res 本身就是数组
  if (Array.isArray(res)) {
    return res;
  }

  console.warn(`❌ [${apiName}] 未找到数组!`);
  return [];
};

// ============ 加载个人统计数据(借阅、收藏、预约) ============
const loadPersonalStats = async () => {
  try {
    const results = await Promise.allSettled([
      getBorrowList(),
      getFavoriteList(),
      getReservationList()
    ]);

    // 借阅数 - 只统计 status=0(借阅中) 的记录
    if (results[0].status === "fulfilled") {
      const list = extractArray(results[0].value, "借阅列表");
      // 过滤出借阅中的记录 (status: 0=借阅中, 1=已归还, 2=逾期)
      stats.value.borrowCount = list.filter((item: any) => item.status === 0).length;
    }

    // 收藏数
    if (results[1].status === "fulfilled") {
      const list = extractArray(results[1].value, "收藏列表");
      stats.value.favoriteCount = list.length;
    }

    // 预约数 - 只统计 status=0(等待中) 或 status=2(已满足) 的有效预约
    if (results[2].status === "fulfilled") {
      const list = extractArray(results[2].value, "预约列表");
      // 过滤出有效预约 (status: 0=等待中, 1=已取消, 2=已满足)
      stats.value.reserveCount = list.filter((item: any) => item.status === 0 || item.status === 2).length;
    }
  } catch (error) {
    console.error("加载个人统计数据失败:", error);
    ElMessage.warning('加载个人统计数据失败');
  }
};

// ============ 加载统计分析数据(动态、热门图书、阅读之星) ============
const loadAnalytics = async () => {
  activitiesLoading.value = true;
  topBooksLoading.value = true;
  topUsersLoading.value = true;

  try {
    const results = await Promise.allSettled([
      getRecentActivities(8),
      getTopBorrowedBooks(10),
      getTopBorrowers(5)
    ]);

    // 最近动态
    if (results[0].status === "fulfilled") {
      const activities = extractArray(results[0].value, "最近动态");
      recentActivities.value = activities.map((a: any) => ({
        id: a.id,
        userName: a.userName,
        bookTitle: a.bookTitle,
        action: a.action,
        time: a.time
      }));
    }
    activitiesLoading.value = false;

    // 热门图书
    if (results[1].status === "fulfilled") {
      const books = extractArray(results[1].value, "热门图书");
      topBooks.value = books.map((b: any, index: number) => ({
        rank: index + 1,
        bookId: b.bookId,
        title: b.bookTitle,
        author: b.author || '未知作者',
        count: b.borrowCount || 0
      }));
    }
    topBooksLoading.value = false;

    // 阅读之星
    if (results[2].status === "fulfilled") {
      const users = extractArray(results[2].value, "阅读之星");
      topUsers.value = users.map((u: any, index: number) => {
        const user = {
          rank: index + 1,
          userId: u.userId || u.id,
          name: u.username || u.name || u.userName || '匿名用户',
          count: u.borrowCount || 0
        };
        return user;
      });
    }
    topUsersLoading.value = false;

  } catch (error) {
    console.error("加载统计分析数据失败:", error);
    ElMessage.warning('加载统计分析数据失败');
    activitiesLoading.value = false;
    topBooksLoading.value = false;
    topUsersLoading.value = false;
  }
};


onMounted(() => {
  // 并行加载两组数据
  loadPersonalStats();
  loadAnalytics();
})
</script>

<style scoped>
.home-container {
  padding: 20px;
  position: relative;
  overflow: hidden;
  min-height: 100%;
}

.background-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  opacity: 0.6;
  animation: breathe 10s infinite ease-in-out alternate;
  pointer-events: none;
}

.blob-1 {
  top: -10%;
  left: -10%;
  width: 600px;
  height: 600px;
  background-color: #E0F2FE;
  animation-delay: 0s;
}

.blob-2 {
  bottom: -10%;
  right: -10%;
  width: 500px;
  height: 500px;
  background-color: #F3E8FF;
  animation-delay: -5s;
}

@keyframes breathe {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}

.welcome-section, .stats-row, .recent-section, .dashboard-row {
  position: relative;
  z-index: 1;
}

.welcome-section {
  position: relative;
  padding: 40px 0;
  margin-bottom: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
}

.welcome-text {
  z-index: 2;
}

.greeting {
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(120deg, #1d1d1f 0%, #434344 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
  animation: slideInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  opacity: 0;
}

.date {
  font-size: 18px;
  color: #86868b;
  margin: 0;
  font-weight: 500;
  animation: slideInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s forwards;
  opacity: 0;
}

.welcome-decoration {
  position: absolute;
  right: -20px;
  top: -40px;
  font-size: 240px;
  color: rgba(0, 0, 0, 0.03);
  transform: rotate(-15deg);
  pointer-events: none;
  z-index: 1;
  animation: fadeIn 1.5s ease-out forwards;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: rotate(-15deg) scale(0.9); }
  to { opacity: 1; transform: rotate(-15deg) scale(1); }
}

/* Stats Row */
.stats-row {
  display: flex;
  gap: 24px;
  margin-bottom: 40px;
}

.stat-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
}

.stat-item:hover {
  border-bottom-color: #007aff;
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
}

.stat-item .stat-number {
  font-size: 42px;
  font-weight: 700;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  color: #1d1d1f;
  line-height: 1;
}

.stat-item .stat-label {
  font-size: 14px;
  color: #86868b;
  font-weight: 500;
  margin-top: 4px;
}

.stat-item .stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-left: auto;
}

.icon-blue {
  background: rgba(0, 122, 255, 0.1);
  color: #007aff;
}

.icon-orange {
  background: rgba(255, 149, 0, 0.1);
  color: #ff9500;
}

.icon-purple {
  background: rgba(175, 82, 222, 0.1);
  color: #af52de;
}

.icon-red {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

/* Recent Activities */
.recent-section {
  margin-bottom: 40px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  transition: all 0.2s;
}

.activity-item:hover {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.activity-icon-borrow {
  background: rgba(0, 122, 255, 0.1);
  color: #007aff;
}

/* 移除未使用的activity-icon样式（新接口无type字段） */

.activity-content {
  flex: 1;
  font-size: 14px;
  color: #1d1d1f;
}

.activity-user {
  font-weight: 600;
  color: #007aff;
}

.activity-action {
  color: #86868b;
  margin: 0 4px;
}

.activity-book {
  font-weight: 500;
}

.activity-time {
  font-size: 12px;
  color: #86868b;
  flex-shrink: 0;
}

.empty-activities {
  text-align: center;
  padding: 40px 0;
  color: #86868b;
}

/* Dashboard Panels */
.dashboard-row {
  display: flex;
  gap: 24px;
  margin-bottom: 40px;
}

.dashboard-panel {
  flex: 1;
  min-width: 0;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 20px;
}

.panel-header {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e5e5;
}

.flat-table {
  background: transparent !important;
  --el-table-border-color: transparent;
  --el-table-header-bg-color: transparent;
  --el-table-row-hover-bg-color: #f5f5f7;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
}

:deep(.flat-table .el-table__header) th {
  font-weight: 500;
  color: #86868b;
  font-size: 12px;
}

:deep(.flat-table .el-table__row) {
  transition: all 0.2s;
}

.rank-badge {
  display: inline-block;
  width: 22px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  border-radius: 50%;
  background-color: #f0f2f5;
  color: #909399;
  font-size: 12px;
  font-weight: 600;
}
.rank-1 { background: linear-gradient(135deg, #FFD700, #FFA500); color: white; }
.rank-2 { background: linear-gradient(135deg, #C0C0C0, #A0A0A0); color: white; }
.rank-3 { background: linear-gradient(135deg, #CD7F32, #B87333); color: white; }

/* 移除推荐图书相关样式（接口文档中无recommend接口） */
</style>
