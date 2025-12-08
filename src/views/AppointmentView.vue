<template>
  <div class="appointment-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的预约记录</span>
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
        <el-table-column prop="reservationTime" label="预约时间" width="180" align="center" />
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'VALID'"
              type="danger"
              link
              size="small"
              @click="handleCancel(scope.row)"
            >
              取消预约
            </el-button>
            <span v-else style="color: #909399; font-size: 13px;">-</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getReservationList, cancelReservation } from '@/api/reservation'
import type { ReservationRecord } from '@/api/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

const loading = ref(false)
const tableData = ref<ReservationRecord[]>([])

/**
 * 状态类型映射（基于接口文档）
 * VALID - 有效的预约
 * EXPIRED - 已过期
 * CANCELLED - 已取消（可能）
 */
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    'VALID': 'success',     // 有效
    'EXPIRED': 'info',      // 已过期
    'CANCELLED': 'info'     // 已取消
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    'VALID': '有效',
    'EXPIRED': '已过期',
    'CANCELLED': '已取消'
  }
  return map[status] || status
}

const fetchData = async () => {
  loading.value = true
  try {
    // GET /reservation/list - 返回当前用户的所有预约记录
    const res = await getReservationList()
    tableData.value = res.data
  } catch (error) {
    console.error(error)
    ElMessage.error('获取预约记录失败')
  } finally {
    loading.value = false
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
