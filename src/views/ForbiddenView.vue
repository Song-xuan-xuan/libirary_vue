<template>
  <div class="forbidden-container">
    <div class="forbidden-content">
      <div class="error-code">403</div>
      <div class="error-icon">🔒</div>
      <h1 class="error-title">访问受限</h1>
      <p class="error-message">抱歉，您没有权限访问此页面</p>
      <div class="error-actions">
        <el-button type="primary" @click="goHome">返回首页</el-button>
        <el-button @click="goBack">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/library/home')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.forbidden-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
}

.forbidden-content {
  text-align: center;
  padding: 60px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 10px;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.error-title {
  font-size: 28px;
  color: #1d1d1f;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.error-message {
  font-size: 16px;
  color: #86868b;
  margin: 0 0 32px 0;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}
</style>
