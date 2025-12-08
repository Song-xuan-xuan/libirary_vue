<template>
  <div class="book-container">
    <!-- 搜索区 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="书名">
          <el-input v-model="searchForm.title" placeholder="请输入书名" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="searchForm.author" placeholder="请输入作者" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <div class="operation-bar" v-if="isAdmin">
      <el-button type="primary" @click="handleAdd">新增图书</el-button>
    </div>

    <!-- 数据展示区 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="title" label="书名" min-width="200" show-overflow-tooltip />
        <el-table-column prop="author" label="作者" min-width="120" show-overflow-tooltip />
        <el-table-column prop="description" label="简介" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="300" fixed="right" align="center">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleDetail(scope.row)">详情</el-button>
            
            <!-- 收藏按钮 -->
            <el-button link type="warning" size="small" @click="handleFavorite(scope.row)">
              <el-icon><Star /></el-icon>
            </el-button>

            <!-- 借阅按钮：有库存时显示 -->
            <el-button 
              v-if="!scope.row.stock || scope.row.stock > 0"
              link 
              type="primary" 
              size="small" 
              @click="handleBorrow(scope.row)"
            >
              借阅
            </el-button>

            <!-- 预约按钮：库存为0时显示 -->
            <el-button 
              v-if="scope.row.stock === 0"
              link 
              type="warning" 
              size="small" 
              @click="handleReserve(scope.row)"
            >
              预约
            </el-button>

            <template v-if="isAdmin">
              <el-button link type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 详情抽屉 -->
    <BookDetailDrawer ref="detailDrawerRef" />

    <!-- 新增/编辑弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogType === 'add' ? '新增图书' : '编辑图书'" 
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form 
        ref="bookFormRef" 
        :model="bookForm" 
        :rules="bookRules" 
        label-width="80px"
      >
        <el-form-item label="书名" prop="title">
          <el-input v-model="bookForm.title" placeholder="请输入书名" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="bookForm.author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="ISBN" prop="isbn">
          <el-input v-model="bookForm.isbn" placeholder="请输入ISBN" />
        </el-form-item>
        <el-form-item label="简介" prop="description">
          <el-input 
            v-model="bookForm.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入图书简介" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { ApiResponse, PaginatedData } from '@/api/types'
import { useUserStore } from '@/stores/user'
import { getBooks, deleteBook, createBook, updateBook } from '@/api/book'
import { borrowBook } from '@/api/borrow'
import { addFavorite } from '@/api/favorite'
import { reserveBook } from '@/api/reservation'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Star } from '@element-plus/icons-vue'
import BookDetailDrawer from '@/views/BookDetailDrawer.vue'

// Book 类型定义
interface Book {
  id: number
  title: string
  author: string
  isbn?: string
  description?: string
}

const userStore = useUserStore()
const detailDrawerRef = ref()

// 权限判断：仅管理员
const isAdmin = computed(() => {
  return userStore.role === 'admin'
})

// 搜索表单
const searchForm = reactive({
  title: '',
  author: ''
})

// 表格数据
const loading = ref(false)
const tableData = ref<Book[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 弹窗相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)
const bookFormRef = ref<FormInstance>()
const editingBookId = ref<number | null>(null)

const bookForm = reactive({
  title: '',
  author: '',
  isbn: '',
  description: ''
})

const bookRules: FormRules = {
  title: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  isbn: [{ required: true, message: '请输入ISBN', trigger: 'blur' }]
}

// 重置表单
const resetBookForm = () => {
  bookForm.title = ''
  bookForm.author = ''
  bookForm.isbn = ''
  bookForm.description = ''
  editingBookId.value = null
}

// 获取数据
// 根据《接口文档(1).md》：使用 pageNum/pageSize，响应数据使用 list
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm
    }
    const res = await getBooks(params) as ApiResponse<PaginatedData<Book>>
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error(error)
    ElMessage.error('获取图书列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.title = ''
  searchForm.author = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchData()
}

// 新增图书
const handleAdd = () => {
  resetBookForm()
  dialogType.value = 'add'
  dialogVisible.value = true
}

// 编辑图书
const handleEdit = (row: Book) => {
  resetBookForm()
  dialogType.value = 'edit'
  editingBookId.value = row.id
  // 填充表单数据
  bookForm.title = row.title
  bookForm.author = row.author
  bookForm.isbn = row.isbn || ''
  bookForm.description = row.description || ''
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!bookFormRef.value) return
  
  await bookFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      // 构建 API 参数
      const apiParams = {
        title: bookForm.title,
        author: bookForm.author,
        isbn: bookForm.isbn,
        description: bookForm.description
      }
      
      if (dialogType.value === 'add') {
        await createBook(apiParams)
        ElMessage.success('新增成功')
        dialogVisible.value = false
        fetchData()
      } else {
        await updateBook({ id: editingBookId.value!, ...apiParams })
        ElMessage.success('更新成功')
        dialogVisible.value = false
        fetchData()
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

const handleDetail = (row: Book) => {
  if (detailDrawerRef.value) {
    detailDrawerRef.value.open(row.id)
  }
}

const handleBorrow = (row: Book) => {
  ElMessageBox.confirm(
    `确定要借阅图书 "${row.title}" 吗?`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }
  )
    .then(async () => {
      try {
        await borrowBook({ bookId: row.id })
        ElMessage.success('借阅成功')
        fetchData()
      } catch (error) {
        console.error(error)
        ElMessage.error('借阅失败')
      }
    })
    .catch(() => {})
}

const handleFavorite = async (row: Book) => {
  try {
    await addFavorite({ bookId: row.id })
    ElMessage.success('添加收藏成功')
  } catch (error) {
    console.error(error)
    ElMessage.error('收藏失败')
  }
}

const handleReserve = (row: Book) => {
  ElMessageBox.confirm(
    `图书 "${row.title}" 当前库存为0，确定要预约吗？`,
    '预约图书',
    {
      confirmButtonText: '确定预约',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        await reserveBook({ bookId: row.id })
        ElMessage.success('预约成功，请前往“预约管理”页面查看')
      } catch (error) {
        console.error(error)
        ElMessage.error('预约失败')
      }
    })
    .catch(() => {})
}

const handleDelete = (row: Book) => {
  ElMessageBox.confirm(
    `确定要删除图书 "${row.title}" 吗?`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        await deleteBook(row.id)
        ElMessage.success('删除成功')
        fetchData()
      } catch (error) {
        console.error(error)
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {})
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.book-container {
  padding: 20px;
}
.search-card {
  margin-bottom: 20px;
}
.operation-bar {
  margin-bottom: 20px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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

/* 表格容器允许横向滚动 */
.table-card :deep(.el-card__body) {
  overflow-x: auto;
}
</style>
