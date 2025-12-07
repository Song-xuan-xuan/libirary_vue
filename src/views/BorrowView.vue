<template>
  <div class="borrow-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的借阅记录</span>
          <div class="header-actions">
            <el-button type="primary" text @click="fetchData" :loading="loading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="tableData" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column prop="bookTitle" label="书名" min-width="200" show-overflow-tooltip />
        <el-table-column prop="borrowTime" label="借出时间" width="180" align="center" />
        <el-table-column prop="returnTime" label="归还时间" width="180" align="center">
          <template #default="scope">
            <span v-if="scope.row.returnTime">{{ scope.row.returnTime }}</span>
            <el-tag v-else type="warning">未归还</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="!scope.row.returnTime" 
              type="primary" 
              size="small" 
              :loading="returningId === scope.row.id"
              @click="handleReturn(scope.row)"
            >
              归还
            </el-button>
            <span v-else class="returned-text">已归还</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getBorrowList, returnBook } from '@/api/borrow'
import type { BorrowRecord, ApiResponse } from '@/api/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

const loading = ref(false)
const tableData = ref<BorrowRecord[]>([])
const returningId = ref<number | null>(null)

const fetchData = async () => {
  loading.value = true
  try {
    // GET /borrow/list - 返回当前用户的所有借阅记录
    const res = await getBorrowList()
    if (res.code === '0' && res.success) {
      tableData.value = res.data
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取借阅记录失败')
  } finally {
    loading.value = false
  }
}

/**
 * 处理还书操作
 * 业务逻辑：
 * 1. 调用还书 API（传入图书 ID）
 * 2. 后端自动处理预约队列逻辑
 * 3. 还书成功后刷新列表
 */
const handleReturn = (row: BorrowRecord) => {
  ElMessageBox.confirm(
    `确定要归还图书 "${row.bookTitle}" 吗?`,
    '确认归还',
    {
      confirmButtonText: '确定归还',
      cancelButtonText: '取消',
      type: 'info',
    }
  )
    .then(async () => {
      returningId.value = row.id
      
      try {
        // 接口文档：POST /borrow/return 参数为 bookId
        const res: ApiResponse<null> = await returnBook({ bookId: row.bookId })
        
        if (res.code === '0' && res.success) {
          ElMessage.success('还书成功')
          // 刷新借阅列表
          await fetchData()
        } else {
          ElMessage.error(res.message || '归还失败')
        }
      } catch (error) {
        console.error(error)
        ElMessage.error('归还操作失败，请稍后重试')
      } finally {
        returningId.value = null
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.borrow-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.returned-text {
  color: #909399;
  font-size: 13px;
}
</style>
