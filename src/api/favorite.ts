/**
 * 图书收藏模块 API
 * 根据《接口文档.md》收藏模块定义
 */
import request from '@/utils/request'
import type {
  ApiResponse,
  FavoriteRecord,
  AddFavoriteParams,
  RemoveFavoriteParams
} from './types'

/**
 * 我的收藏列表
 * GET /favorites/list
 * 
 * 返回当前登录用户的所有收藏记录（需登录）
 * 返回数组结构：FavoriteRecord[]
 */
export const getFavoriteList = (): Promise<ApiResponse<FavoriteRecord[]>> => {
  return request({
    url: '/favorites/list',
    method: 'get'
  })
}

/**
 * 添加收藏
 * POST /favorites
 * 
 * 参数：bookId（图书ID）
 * 
 * 业务逻辑由后端处理：
 * 1. 检查是否已收藏（避免重复）
 * 2. 创建收藏记录
 */
export const addFavorite = (params: AddFavoriteParams): Promise<ApiResponse<null>> => {
  return request({
    url: '/favorites',
    method: 'post',
    data: params
  })
}

/**
 * 取消收藏
 * POST /favorites/remove
 * 
 * 参数：bookId（图书ID）
 * 
 * 业务逻辑由后端处理：
 * 1. 根据图书ID和当前用户查找收藏记录
 * 2. 删除收藏记录
 */
export const removeFavorite = (params: RemoveFavoriteParams): Promise<ApiResponse<null>> => {
  return request({
    url: '/favorites/remove',
    method: 'post',
    data: params
  })
}

/**
 * 兼容旧版本的别名
 * @deprecated 请使用 getFavoriteList
 */
export const getFavorites = getFavoriteList
export const getFavoriteBooks = getFavoriteList
