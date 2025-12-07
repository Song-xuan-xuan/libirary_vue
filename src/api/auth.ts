/**
 * 用户认证模块 API
 * 根据《接口文档(1).md》用户模块定义
 * 
 * @updated 2025-12-07 对齐接口文档：
 * - login 返回完整用户信息（token + id + username + name + role）
 * - getUserInfo 改为 GET /auth/me
 * - changePassword 改为 PUT /auth/password，参数使用驼峰命名
 * - 新增 updateUserInfo: PUT /auth/me
 */
import request from '@/utils/request'
import type {
  ApiResponse,
  LoginParams,
  LoginData,
  RegisterParams,
  User,
  ChangePasswordParams,
  UpdateUserInfoParams
} from './types'

/**
 * 用户登录
 * POST /api/auth/login
 * 
 * 根据接口文档，登录接口返回：
 * - token: JWT Token
 * - id: 用户 ID
 * - username: 用户名
 * - name: 姓名
 * - role: 角色
 */
export const login = (params: LoginParams): Promise<ApiResponse<LoginData>> => {
  return request({
    url: '/auth/login',
    method: 'post',
    data: params
  })
}

/**
 * 用户注册
 * POST /api/auth/register
 * 
 * 参数：username, password, name, phone, role（可选，默认 student）
 */
export const register = (params: RegisterParams): Promise<ApiResponse<null>> => {
  return request({
    url: '/auth/register',
    method: 'post',
    data: params
  })
}

/**
 * 获取当前用户信息
 * GET /api/auth/me
 * 
 * 根据接口文档，此接口用于：
 * - 登录后获取最新用户信息
 * - 页面刷新时恢复用户状态
 * - 服务端根据 Authorization header 中的 Token 识别用户
 */
export const getUserInfo = (): Promise<ApiResponse<User>> => {
  return request({
    url: '/auth/me',
    method: 'get'
    // token 已由 request 拦截器自动添加到 headers
  })
}

/**
 * 修改用户基础信息
 * PUT /api/auth/me
 * 
 * 根据接口文档新增接口
 * 参数：name（姓名）, phone（手机号）
 */
export const updateUserInfo = (params: UpdateUserInfoParams): Promise<ApiResponse<null>> => {
  return request({
    url: '/auth/me',
    method: 'put',
    data: params
  })
}

/**
 * 修改密码
 * PUT /api/auth/password
 * 
 * 根据接口文档：
 * - 方法改为 PUT（不是 POST）
 * - 参数使用驼峰命名：oldPassword, newPassword
 */
export const changePassword = (params: ChangePasswordParams): Promise<ApiResponse<null>> => {
  return request({
    url: '/auth/password',
    method: 'put',
    data: params
  })
}

/**
 * 退出登录
 * 注意：接口文档未提及此接口，保留原有实现
 */
export const logout = (): Promise<ApiResponse<null>> => {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}
