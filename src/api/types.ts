/**
 * API 通用类型定义
 * 根据《接口文档(1).md》接口规范定义
 * 
 * 【重要】此文件为类型定义的单一事实来源（Single Source of Truth）
 * 所有 API 模块应从此文件导入类型，不要在其他文件中重复定义
 * 
 * @updated 2025-12-07 根据接口文档重构：
 * - ApiResponse 改为 { code, message, data, success }
 * - PaginatedData 改为 { list, total, pageNum, pageSize, pages }
 * - 所有实体字段统一使用驼峰命名
 */

// ============ 通用响应结构 ============
/**
 * API 统一响应格式
 * 根据接口文档通用返回格式定义
 */
export interface ApiResponse<T = unknown> {
  code: string              // 状态码，"0" 表示成功
  message: string | null    // 消息提示，可为 null
  data: T                   // 响应数据
  success: boolean          // 是否成功
}

// 分页数据结构
export interface PaginatedData<T> {
  list: T[]                 // 数据列表（接口文档使用 list，不是 result）
  total: number             // 总条数
  pageNum: number           // 当前页码
  pageSize: number          // 每页条数
  pages: number             // 总页数
}

// 分页请求参数
export interface PaginationParams {
  pageNum?: number          // 页码，默认 1
  pageSize?: number         // 每页条数，默认 10
}

// ============ 用户模块 ============
export type UserRole = 'student' | 'admin'

/**
 * 用户信息
 * 根据接口文档 GET /auth/me 返回结构定义
 */
export interface User {
  id: number
  username: string
  name: string
  role: UserRole
  phone?: string
  createAt?: string         // 注册时间，接口文档实际返回 createAt（注意不是 createdAt）
}

// 简化的用户信息（用于关联记录）
export interface SimpleUser {
  id: number
  name: string
}

// 登录请求参数 POST /api/auth/login
export interface LoginParams {
  username: string
  password: string
}

/**
 * 登录响应数据
 * 根据接口文档 POST /auth/login 返回结构定义
 * 包含 token、id、username、name、role
 */
export interface LoginData {
  token: string
  id: number
  username: string
  name: string
  role: UserRole
}

// 注册请求参数 POST /api/auth/register
export interface RegisterParams {
  username: string
  password: string
  name: string
  phone: string
  role?: UserRole           // 可选，不传默认为 student（后端处理）
}

/**
 * 修改密码请求参数
 * PUT /api/auth/password
 * 接口文档使用驼峰命名：oldPassword、newPassword
 */
export interface ChangePasswordParams {
  oldPassword: string       // 旧密码
  newPassword: string       // 新密码
}

/**
 * 修改用户基础信息请求参数
 * PUT /api/auth/me
 * 接口文档新增接口
 */
export interface UpdateUserInfoParams {
  name: string              // 姓名不为空
  phone: string             // 手机号不为空
}

// ============ 图书模块 ============
/**
 * 标签信息
 * 根据接口文档 GET /tags 返回结构定义
 */
export interface Tag {
  id: number
  name: string
}

/**
 * 图书信息
 * 根据接口文档图书详情返回结构定义
 * 注意：接口文档中未提及 coverUrl、publishYear、total、stock 等字段
 * 这些字段保留为可选，等待后端实际返回数据确认
 */
export interface Book {
  id: number
  title: string
  author?: string
  description?: string
  isbn?: string
  publishYear?: number      // 可选字段，文档未明确
  coverUrl?: string         // 可选字段，文档未明确
  total?: number            // 可选字段，文档未明确
  stock?: number            // 可选字段，文档未明确
  tags?: Tag[]              // 图书标签
}

/**
 * 评论信息
 * 根据接口文档 GET /comments/book/{bookId} 返回结构定义
 */
export interface Comment {
  id: number
  bookId: number            // 图书 ID
  userId: number            // 评论用户 ID
  username: string          // 评论用户名
  content: string           // 评论内容
  createTime: string        // 评论时间（接口文档使用 createTime）
}

/**
 * 创建图书请求参数
 * POST /api/books
 * 根据接口文档定义
 */
export interface CreateBookParams {
  title: string             // 必填：书名
  author?: string           // 可选：作者
  description?: string      // 可选：简介
  isbn?: string             // 可选：ISBN 编号
}

/**
 * 获取图书列表请求参数
 * GET /api/books（Query 参数）
 * 根据接口文档定义
 */
export interface GetBooksParams extends PaginationParams {
  title?: string            // 图书标题模糊查询
  author?: string           // 作者模糊查询
}

/**
 * 更新图书请求参数
 * PUT /api/books/{id}
 * 根据接口文档定义
 */
export interface UpdateBookParams {
  id: number                // 路径参数：图书 ID
  title: string             // 必填：书名
  author?: string           // 可选：作者
  description?: string      // 可选：简介
  isbn?: string             // 可选：ISBN 编号
}

/**
 * 标签管理相关参数
 */
export interface CreateTagParams {
  name: string              // 标签名称
}

/**
 * 评论相关参数
 * POST /api/comments
 */
export interface CreateCommentParams {
  bookId: number            // 图书 ID
  content: string           // 评论内容
}

// ============ 借阅模块 ============
/**
 * 借阅记录
 * 根据接口文档 GET /borrow/list 返回结构定义
 */
export interface BorrowRecord {
  id: number                // 借阅记录 ID
  bookId: number            // 图书 ID
  bookTitle: string         // 图书标题
  borrowTime: string        // 借阅时间
  returnTime: string | null // 归还时间（未归还为 null）
}

/**
 * 借书请求参数
 * POST /api/borrow
 */
export interface BorrowBookParams {
  bookId: number            // 图书 ID
}

/**
 * 还书请求参数
 * POST /api/borrow/return
 */
export interface ReturnBookParams {
  bookId: number            // 图书 ID
}

// ============ 预约模块 ============
/**
 * 预约记录
 * 根据接口文档 GET /reservation/list 返回结构定义
 */
export interface ReservationRecord {
  id: number                // 预约记录 ID
  bookId: number            // 图书 ID
  bookTitle: string         // 图书标题
  reservationTime: string   // 预约时间
  status: string            // 预约状态（VALID 等）
}

/**
 * 预约图书请求参数
 * POST /api/reservation
 */
export interface ReserveBookParams {
  bookId: number            // 图书 ID
}

/**
 * 取消预约请求参数
 * POST /api/reservation/cancel
 */
export interface CancelReservationParams {
  reservationId: number     // 预约记录 ID
}

// ============ 收藏模块 ============
/**
 * 收藏记录
 * 根据接口文档 GET /favorites/list 返回结构定义
 */
export interface FavoriteRecord {
  id: number                // 收藏记录 ID
  bookId: number            // 图书 ID
  bookTitle: string         // 图书标题
  createTime: string        // 收藏时间
}

/**
 * 添加收藏请求参数
 * POST /favorites
 */
export interface AddFavoriteParams {
  bookId: number            // 图书 ID
}

/**
 * 取消收藏请求参数
 * POST /favorites/remove
 */
export interface RemoveFavoriteParams {
  bookId: number            // 图书 ID
}

// ============ 统计分析模块 ============
/**
 * 借阅最多的图书
 * 根据接口文档 GET /statistics/top-books 返回结构定义
 */
export interface TopBorrowedBook {
  bookId: number            // 图书 ID
  title: string             // 图书名称
  author: string            // 图书作者
  borrowCount: number       // 被借阅总次数
}

/**
 * 借阅最多的用户
 * 根据接口文档 GET /statistics/top-users 返回结构定义
 */
export interface TopBorrower {
  userId: number            // 用户 ID
  username: string          // 用户名
  borrowCount: number       // 借阅总数量
}

/**
 * 借阅动态
 * 根据接口文档 GET /statistics/activities 返回结构定义
 */
export interface ActivityRecord {
  id: number                // 借阅记录 ID
  userId: number            // 借阅用户 ID
  username: string          // 借阅用户名
  bookId: number            // 图书 ID
  bookTitle: string         // 图书名称
  borrowTime: string        // 借阅时间
}

// Analytics 响应结构
export type TopBorrowedBooksResponse = ApiResponse<TopBorrowedBook[]>
export type TopBorrowersResponse = ApiResponse<TopBorrower[]>
export type RecentActivitiesResponse = ApiResponse<ActivityRecord[]>
