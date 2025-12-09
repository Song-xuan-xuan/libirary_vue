<template>
  <div class="appointment-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的预约记录</span>
          <div class="header-actions">
          </div>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column prop="bookTitle" label="书名" min-width="180" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="预约时间" width="180" align="center" />
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.statusDesc || getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleDetail(scope.row.bookId)">查看详情</el-button>
            <el-button
              v-if="scope.row.status === 0"
              link
              type="danger"
              size="small"
              @click="handleCancel(scope.row)"
            >
              取消预约
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 详情抽屉 -->
    <BookDetailDrawer ref="detailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getReservationList, cancelReservation } from '@/api/reservation'
import type { ReservationRecord } from '@/api/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import BookDetailDrawer from '@/views/BookDetailDrawer.vue'

const loading = ref(false)
const tableData = ref<ReservationRecord[]>([])
const detailDrawerRef = ref()

/**
 * 预约状态映射 (status: 0=等待中, 1=已取消, 2=已满足)
 */
const getStatusType = (status: number) => {
  const map: Record<number, string> = {
    0: 'warning',   // 等待中
    1: 'info',      // 已取消
    2: 'success'    // 已满足(预约成功)
  }
  return map[status] || 'info'
}

const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: '等待中',
    1: '已取消',
    2: '预约成功'
  }
  return map[status] || '未知'
}

const fetchData = async () => {
  loading.value = true
  try {
    // GET /reservation/list - 返回当前用户的所有预约记录
    const res = await getReservationList() as any
    
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
    ElMessage.error('获取预约记录失败')
  } finally {
    loading.value = false
  }
}

const handleDetail = (bookId: number) => {
  if (detailDrawerRef.value) {
    detailDrawerRef.value.open(bookId)
  }
}

const handleCancel = (row: ReservationRecord) => {
  ElMessageBox.confirm(
    `确定要取消预约图书 "${row.bookTitle}" 吗?`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        // 接口文档：POST /reservation/cancel 参数为 reservationId
        const res = await cancelReservation({ reservationId: row.id })
        if (res.code === '0' && res.success) {
          ElMessage.success('取消成功')
          fetchData()
        } else {
          ElMessage.error(res.message || '取消失败')
        }
      } catch (error) {
        console.error(error)
        ElMessage.error('取消失败')
      }
    })
    .catch(() => {})
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.appointment-container {
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
</style>
