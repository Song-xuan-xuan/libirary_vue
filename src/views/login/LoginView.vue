<template>
  <div class="login-container">
    <!-- 背景轮播 -->
    <div class="bg-carousel">
      <img 
        v-for="(img, index) in backgroundImages" 
        :key="index"
        class="bg-image"
        :class="{ active: index === currentIndex }"
        :src="img"
        alt="background"
      />
    </div>
    <!-- 遮罩层 -->
    <div class="background-overlay"></div>

    <el-card class="login-card animate-fade-in-up">
      <template #header>
        <div class="card-header">
          <div class="logo-icon">📚</div>
          <h2>{{ isRegister ? '创建账户' : '欢迎回来' }}</h2>
          <p class="subtitle">{{ isRegister ? '填写以下信息完成注册' : '请输入您的账号密码登录' }}</p>
        </div>
      </template>
      
      <!-- 登录表单 -->
      <el-form
        v-if="!isRegister"
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-position="top"
        size="large"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" :prefix-icon="User" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password :prefix-icon="Lock" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" class="submit-btn">登录</el-button>
        </el-form-item>
        <div class="form-footer">
          <span class="footer-text">还没有账号？</span>
          <el-button link type="primary" @click="toggleMode">立即注册</el-button>
        </div>
      </el-form>

      <!-- 注册表单 -->
      <el-form
        v-else
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-position="top"
        size="large"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" :prefix-icon="User" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" show-password :prefix-icon="Lock" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" show-password :prefix-icon="Lock" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="registerForm.name" placeholder="请输入真实姓名" :prefix-icon="Postcard" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号" :prefix-icon="Iphone" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleRegister" :loading="loading" class="submit-btn">注册</el-button>
        </el-form-item>
        <div class="form-footer">
          <span class="footer-text">已有账号？</span>
          <el-button link type="primary" @click="toggleMode">直接登录</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, Postcard, Iphone } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 背景轮播逻辑
const backgroundImages = [
    '/images/800aec51-537a-412a-b7db-df6d15e813aa.png',
    '/images/2c8145c0-a916-4bb4-af45-73ce8a455265.png',
    '/images/349e8fa9-431f-4b48-86af-9087be61daf8.png'
  
]
const currentIndex = ref(0)
let timer: number | null = null

const startCarousel = () => {
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % backgroundImages.length
  }, 6000)
}

onMounted(() => {
  startCarousel()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const isRegister = ref(false)
const loading = ref(false)
const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()

// 登录数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 注册数据
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  phone: '',
  role: 'student' as 'student' | 'admin'
})


// 校验规则
const loginRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

const validatePass2 = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [{ validator: validatePass2, trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
})

// 切换模式
const toggleMode = () => {
  isRegister.value = !isRegister.value
  // 重置表单
  if (loginFormRef.value) loginFormRef.value.resetFields()
  if (registerFormRef.value) registerFormRef.value.resetFields()
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      const result = await userStore.login(loginForm)
      loading.value = false
      if (result.success) {
        ElMessage.success('登录成功')
        // 检查是否有重定向地址
        const redirect = router.currentRoute.value.query.redirect as string
        router.push(redirect || '/library/home')
      } else {
        ElMessage.error(result.message || '登录失败，请检查用户名或密码')
      }
    }
  })
}

// 注册处理
const handleRegister = async () => {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      const result = await userStore.register(registerForm)
      loading.value = false
      if (result.success) {
        ElMessage.success('注册成功，请登录')
        toggleMode()
      } else {
        ElMessage.error(result.message || '注册失败')
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: relative;
  overflow: hidden;
  /* background-color: #f5f5f7; Removed to show fixed background */
}

.bg-carousel {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: scale(1);
  transition: opacity 1.5s ease-in-out, transform 6s linear;
}

.bg-image.active {
  opacity: 1;
  transform: scale(1.1);
}

.background-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  z-index: 1;
}
    
.login-card {
  width: 420px;
  z-index: 2;
  background-color: rgba(255, 255, 255, 0.5) !important;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 24px !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
}

.card-header {
  text-align: center;
  padding: 10px 0;
}

.logo-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.card-header h2 {
  margin: 0;
  font-size: 24px;
  color: #1d1d1f;
  font-weight: 600;
}

.subtitle {
  margin: 8px 0 0;
  color: #86868b;
  font-size: 14px;
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  margin-top: 10px;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

.footer-text {
  color: #86868b;
}

/* Animations */
.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
