import { defineStore } from 'pinia'
import { login as loginApi, register as registerApi, getUserInfo, logout as logoutApi, changePassword as changePasswordApi } from '@/api/auth'
import type { User, UserRole, ChangePasswordParams } from '@/api/types'

interface UserState {
  token: string
  userInfo: User | null
  role: UserRole | ''
  isInitialized: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
    role: (localStorage.getItem('role') as UserRole) || '',
    isInitialized: false
  }),

  getters: {
    // 是否已登录
    isLoggedIn: (state) => !!state.token && !!state.userInfo,
    
    // 是否是管理员
    isAdmin: (state) => state.role === 'admin',
    
    // 是否是学生
    isStudent: (state) => state.role === 'student',
    
    // 角色显示名称
    roleName: (state) => {
      const roleMap: Record<string, string> = {
        admin: '管理员',
        student: '学生'
      }
      return roleMap[state.role] || '未知'
    }
  },

  actions: {
    /**
     * 用户登录
     * 根据《接口文档(1).md》：
     * - login 接口一次性返回 token + 用户信息（id, username, name, role）
     * - 不需要再调用 getUserInfo
     */
    async login(loginForm: { username: string; password: string }) {
      try {
        // 调用 login API，一次性获取 token 和用户信息
        const res = await loginApi(loginForm)
        
        // 根据新的响应结构判断
        if (res.code !== '0' || !res.success || !res.data?.token) {
          return { success: false, message: res.message || '登录失败' }
        }
        
        // 登录成功，提取数据
        const { token, id, username, name, role } = res.data
        
        // 构造用户信息对象
        const user: User = {
          id,
          username,
          name,
          role
        }
        
        // 存储 Token 和用户信息
        this.token = token
        this.userInfo = user
        this.role = role
        this.isInitialized = true
        
        // 持久化存储
        localStorage.setItem('token', token)
        localStorage.setItem('userInfo', JSON.stringify(user))
        localStorage.setItem('role', role)
        
        return { success: true, message: res.message || '登录成功' }
      } catch (error) {
        console.error('登录错误:', error)
        this.clearUserData()
        return { success: false, message: '网络错误，请稍后重试' }
      }
    },

    /**
     * 用户注册
     */
    async register(registerForm: { username: string; password: string; name: string; phone: string; role?: UserRole }) {
      try {
        const res = await registerApi(registerForm)
        return { success: res.code === '0' && res.success, message: res.message || '注册成功' }
      } catch (error) {
        console.error('注册错误:', error)
        return { success: false, message: '网络错误，请稍后重试' }
      }
    },

    /**
     * 初始化用户状态（页面刷新时调用）
     * 根据《接口文档(1).md》：
     * - 调用 GET /auth/me 获取最新用户信息
     */
    async initUserState() {
      if (this.isInitialized) return true
      
      if (!this.token) {
        this.isInitialized = true
        return false
      }

      try {
        // 调用 GET /auth/me 获取最新用户信息
        const res = await getUserInfo()
        
        if (res.code === '0' && res.success && res.data) {
          // Token 有效，更新用户信息
          this.userInfo = res.data
          this.role = res.data.role
          localStorage.setItem('userInfo', JSON.stringify(res.data))
          localStorage.setItem('role', res.data.role)
          this.isInitialized = true
          return true
        } else {
          // Token 无效，清除状态
          console.warn('Token 无效或已过期，需要重新登录')
          this.clearUserData()
          this.isInitialized = true
          return false
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        this.clearUserData()
        this.isInitialized = true
        return false
      }
    },

    /**
     * 修改密码
     * 根据《接口文档(1).md》：
     * - PUT /auth/password
     * - 参数：oldPassword, newPassword
     */
    async changePassword(params: ChangePasswordParams) {
      try {
        const res = await changePasswordApi(params)
        return { success: res.code === '0' && res.success, message: res.message || '修改成功' }
      } catch (error) {
        console.error('修改密码错误:', error)
        return { success: false, message: '网络错误，请稍后重试' }
      }
    },

    /**
     * 退出登录
     */
    async logout() {
      try {
        if (this.token) {
          await logoutApi()
        }
      } catch (error) {
        console.error('退出登录错误:', error)
      } finally {
        this.clearUserData()
      }
    },

    /**
     * 设置用户数据
     */
    setUserData(token: string, user: User) {
      this.token = token
      this.userInfo = user
      this.role = user.role
      this.isInitialized = true
      
      // 持久化存储
      localStorage.setItem('token', token)
      localStorage.setItem('userInfo', JSON.stringify(user))
      localStorage.setItem('role', user.role)
    },

    /**
     * 清除用户数据
     */
    clearUserData() {
      this.token = ''
      this.userInfo = null
      this.role = ''
      
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('role')
    },

    /**
     * 检查是否有指定角色权限
     */
    hasRole(roles: UserRole | UserRole[]): boolean {
      if (!this.role) return false
      const roleArray = Array.isArray(roles) ? roles : [roles]
      return roleArray.includes(this.role as UserRole)
    }
  }
})
