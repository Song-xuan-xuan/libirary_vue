import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/stores/user'

/**
 * 判断 API 响应是否成功
 * 兼容多种成功标识：success=true 或 code=0/'0'/200
 */
const isSuccess = (res: any): boolean => {
  return res.success === true || res.code === '0' || res.code === 0 || res.code === 200
}

/**
 * Axios 实例配置
 * - baseURL 从环境变量读取
 * - 开发环境使用 /api（通过 Vite proxy 代理）
 * - 生产环境使用完整后端地址
 */
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 请求拦截器
 * - 从 Pinia Store 读取 token（优先）或 localStorage
 * - 将 token 添加到 Authorization header
 */
service.interceptors.request.use(
  (config) => {
    // 尝试从 Store 获取 token（如果 Store 已初始化）
    let token = ''
    try {
      const userStore = useUserStore()
      token = userStore.token
    } catch {
      // Store 未初始化时从 localStorage 读取
      token = localStorage.getItem('token') || ''
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * 兼容多种成功标识：
 * - success === true
 * - code === 0 (数字)
 * - code === '0' (字符串)
 * - code === 200
 * - 401 自动清除用户状态并跳转登录
 */
service.interceptors.response.use(
  (response) => {
    const res = response.data
    
    // 使用宽泛的判断逻辑，兼容多种成功标识
    if (isSuccess(res)) {
      // 成功：返回完整的 ApiResponse 结构
      return res
    } else {
      // 业务失败：显示后端返回的错误信息
      const errorMsg = res.message || '请求失败'
      ElMessage.error(errorMsg)
      return Promise.reject(new Error(errorMsg))
    }
  },
  (error) => {
    // 处理 HTTP 错误（网络错误、服务器错误等）
    if (error.response) {
      const status = error.response.status
      const res = error.response.data
      
      // 优先使用后端返回的 message
      const message = res?.message || '请求失败'
      
      switch (status) {
        case 401:
          // 未授权：清除用户状态并跳转登录
          ElMessage.error('登录已过期，请重新登录')
          try {
            const userStore = useUserStore()
            userStore.clearUserData()
          } catch {
            // Store 未初始化时直接清除 localStorage
            localStorage.removeItem('token')
            localStorage.removeItem('userInfo')
          }
          router.push('/login')
          break
        case 403:
          ElMessage.error(message || '无权限访问')
          break
        case 404:
          ElMessage.error(message || '请求的资源不存在')
          break
        case 500:
          ElMessage.error(message || '服务器错误，请稍后重试')
          break
        default:
          ElMessage.error(message)
      }
    } else if (error.request) {
      // 请求已发出但未收到响应
      ElMessage.error('网络连接失败，请检查网络')
    } else {
      // 其他错误
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

export default service
