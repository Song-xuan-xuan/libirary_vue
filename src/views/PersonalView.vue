<template>
  <div class="personal-container">
    <el-row :gutter="20">
      <!-- 左侧：个人信息卡片 -->
      <el-col :span="8">
        <el-card class="info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>👤 个人信息</span>
            </div>
          </template>
          <div class="user-info">
            <div class="avatar-wrapper">
              <el-avatar :size="100" :icon="UserFilled" class="user-avatar" />
              <div class="role-badge" :class="'role-' + userStore.role">
                {{ userStore.roleName }}
              </div>
            </div>
            
            <el-descriptions :column="1" border class="info-descriptions">
              <el-descriptions-item label="用户名">
                <el-icon><User /></el-icon>
                {{ userStore.userInfo?.username || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="姓名">
                <el-icon><Postcard /></el-icon>
                {{ userStore.userInfo?.name || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="角色">
                <el-tag 
                  size="small" 
                  :type="getRoleTagType(userStore.role)"
                  effect="dark"
                >
                  {{ userStore.roleName }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="手机号">
                <el-icon><Phone /></el-icon>
                {{ userStore.userInfo?.phone || '未填写' }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>

        <!-- 账号状态卡片 -->
        <el-card class="status-card" shadow="hover" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>📊 账号状态</span>
            </div>
          </template>
          <div class="status-list">
            <div class="status-item">
              <span class="status-label">账号状态</span>
              <el-tag type="success" effect="plain">正常</el-tag>
            </div>
            <div class="status-item">
              <span class="status-label">登录状态</span>
              <el-tag type="success" effect="plain">已登录</el-tag>
            </div>
            <div class="status-item">
              <span class="status-label">Token</span>
              <el-tag type="info" effect="plain" class="token-tag">
                {{ maskToken(userStore.token) }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧：修改密码 -->
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>🔐 修改密码</span>
            </div>
          </template>
          
          <el-alert 
            type="info" 
            :closable="false" 
            style="margin-bottom: 20px;"
          >
            <template #title>
              <span>密码要求：长度至少6位，建议包含字母和数字</span>
            </template>
          </el-alert>

          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="120px"
            style="max-width: 500px"
            status-icon
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input 
                v-model="passwordForm.oldPassword" 
                type="password" 
                show-password 
                placeholder="请输入原密码"
                :prefix-icon="Lock"
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input 
                v-model="passwordForm.newPassword" 
                type="password" 
                show-password 
                placeholder="请输入新密码（至少6位）"
                :prefix-icon="Key"
              />
              <div class="password-strength" v-if="passwordForm.newPassword">
                <span class="strength-label">密码强度：</span>
                <el-progress 
                  :percentage="passwordStrength.percentage" 
                  :color="passwordStrength.color"
                  :stroke-width="8"
                  style="width: 150px;"
                />
                <span :style="{ color: passwordStrength.color }">{{ passwordStrength.text }}</span>
              </div>
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input 
                v-model="passwordForm.confirmPassword" 
                type="password" 
                show-password 
                placeholder="请再次输入新密码"
                :prefix-icon="Key"
              />
            </el-form-item>
            <el-form-item>
              <el-button 
                type="primary" 
                :loading="submitLoading"
                @click="handleChangePassword"
              >
                <el-icon><Check /></el-icon>
                确认修改
              </el-button>
              <el-button @click="resetForm">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 安全提示卡片 -->
        <el-card shadow="hover" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>⚠️ 安全提示</span>
            </div>
          </template>
          <el-space direction="vertical" fill style="width: 100%;">
            <el-alert type="warning" :closable="false">
              <template #title>请勿将密码透露给他人</template>
            </el-alert>
            <el-alert type="warning" :closable="false">
              <template #title>建议定期更换密码，提高账号安全性</template>
            </el-alert>
            <el-alert type="warning" :closable="false">
              <template #title>如忘记密码，请联系管理员重置</template>
            </el-alert>
          </el-space>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { 
  UserFilled, User, Postcard, Phone, Calendar,
  Lock, Key, Check, Refresh 
} from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

const userStore = useUserStore()
const passwordFormRef = ref<FormInstance>()
const submitLoading = ref(false)

// 获取角色标签类型
const getRoleTagType = (role: string) => {
  const typeMap: Record<string, 'danger' | 'warning' | 'info' | 'success'> = {
    admin: 'danger',
    student: 'info'
  }
  return typeMap[role] || 'info'
}

// 格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return dateStr.split(' ')[0] // 只显示日期部分
}

// 遮蔽 Token
const maskToken = (token: string) => {
  if (!token) return '-'
  if (token.length <= 20) return token
  return token.slice(0, 10) + '...' + token.slice(-6)
}

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码强度计算
const passwordStrength = computed(() => {
  const pwd = passwordForm.newPassword
  if (!pwd) return { percentage: 0, color: '#909399', text: '' }
  
  let score = 0
  if (pwd.length >= 6) score += 20
  if (pwd.length >= 8) score += 20
  if (/[a-z]/.test(pwd)) score += 15
  if (/[A-Z]/.test(pwd)) score += 15
  if (/[0-9]/.test(pwd)) score += 15
  if (/[^a-zA-Z0-9]/.test(pwd)) score += 15
  
  if (score < 40) return { percentage: score, color: '#F56C6C', text: '弱' }
  if (score < 70) return { percentage: score, color: '#E6A23C', text: '中' }
  return { percentage: score, color: '#67C23A', text: '强' }
})

// 确认密码校验
const validatePass2 = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 新密码不能与旧密码相同
const validateNewPassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value === '') {
    callback(new Error('请输入新密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能小于6位'))
  } else if (value === passwordForm.oldPassword) {
    callback(new Error('新密码不能与原密码相同'))
  } else {
    callback()
  }
}

const passwordRules = reactive<FormRules>({
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, validator: validateNewPassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ]
})

// 修改密码
// 根据《接口文档(1).md》，参数使用驼峰命名：oldPassword, newPassword
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      const result = await userStore.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      })
      
      if (result.success) {
        ElMessage.success(result.message || '密码修改成功')
        resetForm()
      } else {
        ElMessage.error(result.message || '密码修改失败')
      }
    } catch (error) {
      console.error('修改密码失败:', error)
      ElMessage.error('修改密码失败，请稍后重试')
    } finally {
      submitLoading.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
}
</script>

<style scoped>
.personal-container {
  padding: 20px;
}

.card-header {
  font-weight: 600;
  font-size: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.role-badge {
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.role-admin {
  background: linear-gradient(135deg, #f5365c 0%, #f56036 100%);
}

.role-student {
  background: linear-gradient(135deg, #5e72e4 0%, #825ee4 100%);
}

.info-descriptions :deep(.el-descriptions__label) {
  width: 80px;
  font-weight: 500;
}

.info-descriptions :deep(.el-descriptions__content) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  color: #606266;
  font-size: 14px;
}

.token-tag {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  font-size: 12px;
}

.strength-label {
  color: #909399;
}
</style>
