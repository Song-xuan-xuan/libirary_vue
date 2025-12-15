import request from '@/utils/request'
import type { ApiResponse } from './types'

export const chat = (message: string): Promise<ApiResponse<string>> => {
  return request({
    url: '/chat',
    method: 'post',
    data: { message }
  })
}
