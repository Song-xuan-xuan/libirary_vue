<template>
  <el-drawer
    v-model="visible"
    title="图书详情"
    size="50%"
    destroy-on-close
  >
    <div v-loading="loading" class="detail-container">
      <template v-if="bookData">
        <!-- 基本信息 -->
        <div class="section">
          <div class="book-header">
            <el-image
              class="book-cover"
              :src="bookData.coverUrl || 'https://via.placeholder.com/100x140?text=Book'"
              fit="cover"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="book-info">
              <h3 class="title">{{ bookData.title }}</h3>
              <p class="author">作者：{{ bookData.author || '未知' }}</p>
              <p class="meta">ISBN：{{ bookData.isbn || '无' }}</p>
              <p class="meta" v-if="bookData.publishYear">出版年份：{{ bookData.publishYear }}</p>
              <div class="stock-info" v-if="bookData.total !== undefined">
                <el-tag type="info">总数: {{ bookData.total }}</el-tag>
                <el-tag :type="(bookData.stock || 0) > 0 ? 'success' : 'danger'" style="margin-left: 10px;">
                  库存: {{ bookData.stock || 0 }}
                </el-tag>
              </div>
            </div>
          </div>
          
          <div class="description">
            <h4>简介</h4>
            <p>{{ bookData.description || '暂无简介' }}</p>
          </div>
        </div>

        <el-divider />

        <!-- 标签 -->
        <div class="section" v-if="bookData.tags">
          <h4>分类标签</h4>
          <div class="tags-wrapper">
            <el-tag
              v-for="tag in bookData.tags"
              :key="tag.id"
              class="tag-item"
              effect="plain"
            >
              {{ tag.name }}
            </el-tag>
            <span v-if="bookData.tags.length === 0" class="empty-text">暂无标签</span>
          </div>
        </div>

        <el-divider />

        <!-- 评论区 -->
        <div class="section">
          <h4>评论列表 ({{ comments.length }})</h4>
          
          <!-- 发表评论 -->
          <div class="comment-form">
            <el-input
              v-model="commentContent"
              type="textarea"
              :rows="3"
              placeholder="写下你的评论..."
              maxlength="500"
              show-word-limit
              resize="none"
            />
            <div class="comment-actions">
              <el-button
                type="primary"
                :loading="submitting"
                :disabled="!commentContent.trim()"
                @click="submitComment"
              >
                发表评论
              </el-button>
            </div>
          </div>

          <!-- 评论列表 -->
          <div class="comments-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <span class="username">{{ comment.username }}</span>
                <span class="time">{{ comment.createTime }}</span>
              </div>
              <div class="comment-content">
                {{ comment.content }}
              </div>
            </div>
            <div v-if="comments.length === 0" class="empty-text">暂无评论，快来发表第一条评论吧！</div>
          </div>
        </div>
      </template>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getBookDetail, getBookComments, createComment } from '@/api/book'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import type { Book, Comment } from '@/api/types'

const visible = ref(false)
const loading = ref(false)
const bookData = ref<Book | null>(null)
const comments = ref<Comment[]>([])
const currentBookId = ref<number>(0)

// 评论相关
const commentContent = ref('')
const submitting = ref(false)

/**
 * 打开详情抽屉
 * 根据《接口文档(1).md》：
 * - GET /books/{id} 获取图书详情
 * - GET /comments/book/{bookId} 获取评论列表
 */
const open = async (id: number) => {
  visible.value = true
  loading.value = true
  bookData.value = null
  comments.value = []
  currentBookId.value = id
  commentContent.value = ''
  
  try {
    // 获取图书详情（RESTful 风格）
    const bookRes = await getBookDetail(id) as any
    // 兜底逻辑
    bookData.value = bookRes?.data || bookRes?.data || null
    
    // 获取评论列表
    const commentsRes = await getBookComments(id) as any

    
    // 兜底逻辑：优先取 data（标准格式），其次 result.data
    if (commentsRes?.data) {
      comments.value = Array.isArray(commentsRes.data) ? commentsRes.data : []
    } else if (commentsRes?.result?.data) {
      comments.value = Array.isArray(commentsRes.result.data) ? commentsRes.result.data : []
    } else {
      comments.value = []
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取详情失败')
  } finally {
    loading.value = false
  }
}

/**
 * 提交评论
 * 根据《接口文档(1).md》：
 * - POST /comments 发表评论
 * - 参数：bookId, content
 */
const submitComment = async () => {
  const content = commentContent.value.trim()
  if (!content) {
    ElMessage.warning('请输入评论内容')
    return
  }

  submitting.value = true
  try {
    await createComment({
      bookId: currentBookId.value,
      content
    })
    

    commentContent.value = ''
    
    // 刷新评论列表
    const commentsRes = await getBookComments(currentBookId.value) as any
    
    // 兜底逻辑：优先取 data（标准格式），其次 result.data
    if (commentsRes?.data) {
      comments.value = Array.isArray(commentsRes.data) ? commentsRes.data : []
    } else if (commentsRes?.result?.data) {
      comments.value = Array.isArray(commentsRes.result.data) ? commentsRes.result.data : []
    } else {
      comments.value = []
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('评论发表失败')
  } finally {
    submitting.value = false
  }
}

defineExpose({
  open
})
</script>

<style scoped>
.detail-container {
  padding: 0 20px;
}
.section {
  margin-bottom: 20px;
}
.book-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.book-cover {
  width: 100px;
  height: 140px;
  border-radius: 4px;
  flex-shrink: 0;
}
.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
}
.book-info {
  flex: 1;
}
.title {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #303133;
}
.author {
  color: #606266;
  margin: 5px 0;
}
.meta {
  color: #909399;
  font-size: 13px;
  margin: 5px 0;
}
.stock-info {
  margin-top: 15px;
}
.description h4, .section h4 {
  margin: 0 0 10px 0;
  color: #303133;
}
.description p {
  color: #606266;
  line-height: 1.6;
  font-size: 14px;
}
.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 评论表单样式 */
.comment-form {
  margin-bottom: 20px;
  padding: 15px;
  background: #f9fafb;
  border-radius: 8px;
}
.comment-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

/* 评论列表样式 */
.comments-list {
  margin-top: 15px;
}
.comment-item {
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}
.comment-item:last-child {
  border-bottom: none;
}
.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}
.username {
  font-weight: bold;
  color: #303133;
}
.time {
  color: #909399;
}
.comment-content {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}
.empty-text {
  color: #909399;
  font-size: 13px;
  text-align: center;
  padding: 20px 0;
}
</style>
