<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <el-menu
        router
        :default-active="$route.path"
        class="el-menu-vertical-demo"
      >
        <el-menu-item index="/library/home">
          <el-icon><HomeFilled /></el-icon>
          <span>系统首页</span>
        </el-menu-item>
        <el-menu-item index="/library/book">
          <el-icon><Reading /></el-icon>
          <span>图书管理</span>
        </el-menu-item>
        <el-menu-item index="/library/borrow">
          <el-icon><List /></el-icon>
          <span>借阅管理</span>
        </el-menu-item>
        <el-menu-item index="/library/appointment">
          <el-icon><Timer /></el-icon>
          <span>预约管理</span>
        </el-menu-item>
        <el-menu-item index="/library/favorite">
          <el-icon><Star /></el-icon>
          <span>图书收藏</span>
        </el-menu-item>
        <el-menu-item index="/library/personal">
          <el-icon><User /></el-icon>
          <span>个人信息</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="layout-header">
        <div class="header-title">图书借阅系统</div>
        <div class="header-user">
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              {{ userStore.userInfo?.name || userStore.userInfo?.username || '用户' }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>
                  <el-icon><User /></el-icon>
                  {{ userStore.roleName }}
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-layout-body main-content-area">
        <div class="bg-beam-container">
          <div class="beam beam-1"></div>
          <div class="beam beam-2"></div>
        </div>
        <div class="main-content-card">
          <router-view v-slot="{ Component }">
            <transition name="fade-transform" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
        <div class="layout-footer">
          © 2025 图书借阅系统 | Designed by song xuan
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const route = useRoute()
const userStore = useUserStore()

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/login')
    } catch {
      // 用户取消退出
    }
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  background-color: #f5f5f7;
}

/* Sidebar Styling */
.el-aside {
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  transition: width 0.3s;
}

.el-menu-vertical-demo {
  height: 100%;
  border-right: none;
  background-color: transparent;
  padding-top: 20px;
}

:deep(.el-menu-item) {
  margin: 4px 12px;
  height: 40px;
  line-height: 40px;
  border-radius: 8px;
  color: #1d1d1f;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(0, 0, 0, 0.08); /* Finder-like selection */
  color: var(--el-color-primary);
  font-weight: 600;
}

:deep(.el-menu-item .el-icon) {
  font-size: 16px;
  margin-right: 10px;
}

/* Header Styling */
.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: none;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05); /* Very subtle separator */
  position: sticky;
  top: 0;
  z-index: 100;
  height: 60px;
  padding: 0 24px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.01em;
}

.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 20px; /* Capsule shape */
  font-size: 13px;
  font-weight: 500;
  color: #1d1d1f;
  transition: background-color 0.2s;
}

.el-dropdown-link:hover {
  background-color: rgba(0, 0, 0, 0.08);
}

/* Main Content Styling */
.main-content-area {
  padding: 20px 20px 60px 20px;
  background-color: #f5f5f7 !important;
  min-height: 100vh;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.bg-beam-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.beam {
  position: absolute;
  width: 600px;
  height: 1000px;
  background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
  transform: rotate(-45deg);
  filter: blur(20px);
}

.beam-1 {
  bottom: -200px;
  left: -100px;
  animation: drift 10s infinite ease-in-out alternate;
}

.beam-2 {
  top: -300px;
  right: -100px;
  animation: drift 12s infinite ease-in-out alternate-reverse;
}

@keyframes drift {
  0% { transform: rotate(-45deg) translateY(0); }
  100% { transform: rotate(-45deg) translateY(50px); }
}

.main-content-card {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  height: 100%;
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

/* Transition */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
