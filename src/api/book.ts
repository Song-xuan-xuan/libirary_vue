/**
 * 图书管理模块 API
 * 根据《接口文档(1).md》图书模块定义
 * 
 * @updated 2025-12-07 对齐接口文档：
 * - 采用 RESTful 风格路径
 * - GET /books, GET /books/{id}, POST /books, PUT /books/{id}, DELETE /books/{id}
 * - 分页参数改为 pageNum/pageSize
 * - 评论接口独立：POST /comments, GET /comments/book/{bookId}, DELETE /comments/{id}
 * - 标签接口独立：GET /tags, POST /tags, DELETE /tags/{id}
 */
import request from '@/utils/request'
import type {
  ApiResponse,
  PaginatedData,
  Book,
  Tag,
  Comment,
  CreateBookParams,
  GetBooksParams,
  UpdateBookParams,
  CreateTagParams,
  CreateCommentParams
} from './types'

// ============ 图书 CRUD ============

/**
 * 获取图书列表
 * GET /api/books
 * 
 * Query 参数：
 * - offset: 页码（默认 1）
 * - limit: 每页条数（默认 10）
 * - title: 图书标题模糊查询
 * - author: 作者模糊查询
 */
export const getBooks = (params: GetBooksParams): Promise<ApiResponse<PaginatedData<Book>>> => {
  return request({
    url: '/books',
    method: 'get',
    params: params  // Query 参数，不是 data
  })
}

/**
 * 获取图书详情
 * GET /api/books/{id}
 * 
 * RESTful 风格，图书 ID 在路径中
 */
export const getBookDetail = (id: number): Promise<ApiResponse<Book>> => {
  return request({
    url: `/books/${id}`,
    method: 'get'
  })
}

/**
 * 创建图书
 * POST /api/books
 * 
 * 仅管理员可操作
 * 参数：title（必填）, author, description, isbn
 */
export const createBook = (params: CreateBookParams): Promise<ApiResponse<null>> => {
  return request({
    url: '/books',
    method: 'post',
    data: params
  })
}

/**
 * 更新图书
 * PUT /api/books/{id}
 * 
 * RESTful 风格，图书 ID 在路径中
 * 仅管理员可操作
 */
export const updateBook = (params: UpdateBookParams): Promise<ApiResponse<null>> => {
  const { id, ...data } = params
  return request({
    url: `/books/${id}`,
    method: 'put',
    data: data
  })
}

/**
 * 删除图书
 * DELETE /api/books/{id}
 * 
 * RESTful 风格，图书 ID 在路径中
 * 仅管理员可操作
 */
export const deleteBook = (id: number): Promise<ApiResponse<null>> => {
  return request({
    url: `/books/${id}`,
    method: 'delete'
  })
}

// ============ 标签管理 ============

/**
 * 获取所有标签
 * GET /api/tags
 * 
 * 公开接口，用于图书筛选和标签选择
 */
export const getTags = (): Promise<ApiResponse<Tag[]>> => {
  return request({
    url: '/tags',
    method: 'get'
  })
}

/**
 * 添加标签
 * POST /api/tags
 * 
 * 仅管理员可操作
 * 参数：name（标签名称）
 */
export const createTag = (params: CreateTagParams): Promise<ApiResponse<null>> => {
  return request({
    url: '/tags',
    method: 'post',
    data: params
  })
}

/**
 * 删除标签
 * DELETE /api/tags/{id}
 * 
 * RESTful 风格，标签 ID 在路径中
 * 仅管理员可操作
 */
export const deleteTag = (id: number): Promise<ApiResponse<null>> => {
  return request({
    url: `/tags/${id}`,
    method: 'delete'
  })
}

// ============ 评论管理 ============

/**
 * 发表评论
 * POST /api/comments
 * 
 * 需登录
 * 参数：bookId（图书 ID）, content（评论内容）
 */
export const createComment = (params: CreateCommentParams): Promise<ApiResponse<null>> => {
  return request({
    url: '/comments',
    method: 'post',
    data: params
  })
}

/**
 * 获取图书评论列表
 * GET /api/comments/book/{bookId}
 * 
 * RESTful 风格，图书 ID 在路径中
 * 公开接口
 */
export const getBookComments = (bookId: number): Promise<ApiResponse<Comment[]>> => {
  return request({
    url: `/comments/book/${bookId}`,
    method: 'get'
  })
}

/**
 * 删除评论
 * DELETE /api/comments/{id}
 * 
 * RESTful 风格，评论 ID 在路径中
 * 用户只能删除自己的评论
 */
export const deleteComment = (id: number): Promise<ApiResponse<null>> => {
  return request({
    url: `/comments/${id}`,
    method: 'delete'
  })
}
