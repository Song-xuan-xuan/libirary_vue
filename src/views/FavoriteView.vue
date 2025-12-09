<template>
  <div class="favorite-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的收藏夹</span>
          <div class="header-actions">
          </div>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column prop="bookTitle" label="书名" min-width="180" show-overflow-tooltip />
        <el-table-column prop="bookAuthor" label="作者" width="120" align="center" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="收藏时间" width="180" align="center" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleDetail(scope.row.bookId)">查看详情</el-button>
            <el-button link type="danger" size="small" @click="handleRemove(scope.row)">取消收藏</el-button>
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
import { getFavoriteList, removeFavorite } from '@/api/favorite'
import type { FavoriteRecord } from '@/api/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import BookDetailDrawer from '@/views/BookDetailDrawer.vue'

const loading = ref(false)
const tableData = ref<FavoriteRecord[]>([])
const detailDrawerRef = ref()

const fetchData = async () => {
  loading.value = true
  try {
    // GET /favorites/list - 返回当前用户的所有收藏记录
    const res = await getFavoriteList() as any
    
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
    ElMessage.error('获取收藏列表失败')
  } finally {
    loading.value = false
  }
}

const handleDetail = (bookId: number) => {
  if (detailDrawerRef.value) {
    detailDrawerRef.value.open(bookId)
  }
}

const handleRemove = (row: FavoriteRecord) => {
  ElMessageBox.confirm(
    `确定要取消收藏 "${row.bookTitle}" 吗?`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        // 接口文档：POST /favorites/remove 参数为 bookId
        const res = await removeFavorite({ bookId: row.bookId })
        if (res.code === '0' && res.success) {
          ElMessage.success('取消收藏成功')
          fetchData()
        } else {
          ElMessage.error(res.message || '操作失败')
        }
      } catch (error) {
        console.error(error)
        ElMessage.error('操作失败')
      }
    })
    .catch(() => {})
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.favorite-container {
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
