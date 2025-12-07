/**
 * 统计分析模块 API
 * 根据《接口文档.md》统计分析模块定义
 */
import request from '@/utils/request'
import type {
  TopBorrowedBook,
  TopBorrower,
  ActivityRecord,
  TopBorrowedBooksResponse,
  TopBorrowersResponse,
  RecentActivitiesResponse
} from './types'

// 从 types.ts 重新导出类型，保持向后兼容
export type { TopBorrowedBook, TopBorrower, ActivityRecord }

/**
 * 获取借阅图书次数最多的前N名用户
 * GET /statistics/top-users
 * 
 * @param limit 限制返回的用户数量，默认5
 */
export const getTopBorrowers = (limit: number = 5): Promise<TopBorrowersResponse> => {
  return request({
    url: '/statistics/top-users',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取被用户借阅次数最多的前N本图书
 * GET /statistics/top-books
 * 
 * @param limit 限制返回的图书数量，默认5
 */
export const getTopBorrowedBooks = (limit: number = 5): Promise<TopBorrowedBooksResponse> => {
  return request({
    url: '/statistics/top-books',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取动态（最新N条的借阅记录）
 * GET /statistics/activities
 * 
 * @param limit 限制返回的动态数量，默认10，最大值为100
 */
export const getRecentActivities = (limit: number = 10): Promise<RecentActivitiesResponse> => {
  return request({
    url: '/statistics/activities',
    method: 'get',
    params: { limit }
  })
}

/**
 * 格式化活动时间为相对时间
 * @param dateStr 日期字符串
 */
export const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr.replace(' ', 'T'))
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return dateStr.slice(0, 10)
}
