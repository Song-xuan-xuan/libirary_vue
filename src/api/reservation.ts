/**
 * 图书预约模块 API
 * 根据《接口文档(1).md》预约模块定义
 */
import request from '@/utils/request'
import type {
  ApiResponse,
  ReservationRecord,
  ReserveBookParams,
  CancelReservationParams
} from './types'

/**
 * 我的预约列表
 * GET /reservation/list
 * 
 * 返回当前登录用户的所有预约记录（需登录）
 * 返回数组结构：ReservationRecord[]
 */
export const getReservationList = (): Promise<ApiResponse<ReservationRecord[]>> => {
  return request({
    url: '/reservation/list',
    method: 'get'
  })
}

/**
 * 预约图书
 * POST /reservation
 * 
 * 参数：bookId（图书ID）
 * 
 * 业务逻辑由后端处理：
 * - 检查用户是否已预约该书
 * - 创建预约记录并加入队列
 */
export const reserveBook = (params: ReserveBookParams): Promise<ApiResponse<null>> => {
  return request({
    url: '/reservation',
    method: 'post',
    data: params
  })
}

/**
 * 取消预约
 * POST /reservation/cancel
 * 
 * 参数：reservationId（预约记录ID）
 */
export const cancelReservation = (params: CancelReservationParams): Promise<ApiResponse<null>> => {
  return request({
    url: '/reservation/cancel',
    method: 'post',
    data: params
  })
}

/**
 * 兼容旧版本的别名
 * @deprecated 请使用 getReservationList
 */
export const getReservations = getReservationList
export const getReservationBooks = getReservationList
