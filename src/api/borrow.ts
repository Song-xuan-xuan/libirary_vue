/**
 * 图书借阅模块 API
 * 根据《接口文档(1).md》借阅模块定义
 * 
 * 注意：统计分析接口（top-borrowed, top-borrowers, recommend）
 * 已移至 src/api/analytics.ts，请从该文件导入
 */
import request from '@/utils/request'
import type {
  ApiResponse,
  BorrowRecord,
  BorrowBookParams,
  ReturnBookParams
} from './types'

/**
 * 我的借阅列表
 * GET /borrow/list
 * 
 * 返回当前登录用户的所有借阅记录（需登录）
 * 返回数组结构：BorrowRecord[]
 */
export const getBorrowList = (): Promise<ApiResponse<BorrowRecord[]>> => {
  return request({
    url: '/borrow/list',
    method: 'get'
  })
}

/**
 * 借书
 * POST /borrow
 * 
 * 参数：bookId（图书ID）
 * 
 * 业务逻辑由后端处理：
 * 1. 检查库存是否充足
 * 2. 减库存并创建借阅记录
 * 3. 计算到期时间（通常为30天后）
 */
export const borrowBook = (params: BorrowBookParams): Promise<ApiResponse<null>> => {
  return request({
    url: '/borrow',
    method: 'post',
    data: params
  })
}

/**
 * 还书
 * POST /borrow/return
 * 
 * 参数：bookId（图书ID）
 * 
 * 业务逻辑由后端处理：
 * 1. 根据图书ID和当前用户查找未归还的借阅记录
 * 2. 更新借阅记录状态为已归还
 * 3. 增加图书库存
 * 4. 如果有预约：自动为最早预约者处理
 */
export const returnBook = (params: ReturnBookParams): Promise<ApiResponse<null>> => {
  return request({
    url: '/borrow/return',
    method: 'post',
    data: params
  })
}

/**
 * 兼容旧版本的别名
 * @deprecated 请使用 getBorrowList
 */
export const getBorrowBooks = getBorrowList
