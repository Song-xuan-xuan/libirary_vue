<template>
  <div class="borrow-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的借阅记录</span>
          <div class="header-actions">
          </div>
        </div>
      </template>
      
      <el-table :data="tableData" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column prop="bookTitle" label="书名" min-width="180" show-overflow-tooltip />
      
        <el-table-column prop="borrowTime" label="借出时间" width="180" align="center" />
        <el-table-column prop="dueTime" label="应还时间" width="180" align="center" />
        <el-table-column prop="returnTime" label="归还时间" width="180" align="center">
          <template #default="scope">
            <span v-if="scope.row.returnTime">{{ scope.row.returnTime }}</span>
            <el-tag v-else type="warning">未归还</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.statusDesc || getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 0" 
              type="primary" 
              size="small" 
              :loading="returningId === scope.row.id"
              @click="handleReturn(scope.row)"
            >
              归还
            </el-button>
            <span v-else-if="scope.row.status === 1" class="returned-text">已归还</span>
            <el-tag v-else-if="scope.row.status === 2" type="danger" size="small">逾期</el-tag>
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

/**
 * 借阅状态映射 (status: 0=借阅中, 1=已归还, 2=逾期)
 */
const getStatusType = (status: number) => {
  const map: Record<number, string> = {
    0: 'warning',   // 借阅中
    1: 'success',   // 已归还
    2: 'danger'     // 逾期
  }
  return map[status] || 'info'
}

const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: '借阅中',
    1: '已归还',
    2: '逾期'
  }
  return map[status] || '未知'
}

const fetchData = async () => {
  loading.value = true
  try {
    // GET /borrow/list - 返回当前用户的所有借阅记录
    const res = await getBorrowList() as any
    
    // 兜底逻辑：兼容多种数据格式
    if (res?.result?.data) {
      // 格式: { result: { data: [...] } }
      tableData.value = Array.isArray(res.result.data) ? res.result.data : []
    } else if (res?.data) {
      // 格式: { data: [...] }
      tableData.value = Array.isArray(res.data) ? res.data : []
    } else {
      tableData.value = []
    }
  } catch (error) {
    console.error(error)
    tableData.value = []
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
        await returnBook({ bookId: row.bookId })
        
        ElMessage.success('还书成功')
        // 刷新借阅列表
        await fetchData()
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
