import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/login/LoginView.vue'
import MainLayout from '@/layout/MainLayout.vue'
import { useUserStore } from '@/stores/user'
import type { UserRole } from '@/api/types'

// 扩展路由 meta 类型
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    roles?: UserRole[]
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { title: '登录' }
    },
    {
      path: '/403',
      name: 'forbidden',
      component: () => import('../views/ForbiddenView.vue'),
      meta: { title: '无权限访问' }
    },
    {
      path: '/library',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/library/home'
        },
        {
          path: 'home',
          name: 'home',
          component: () => import('../views/HomeView.vue'),
          meta: { title: '系统首页', roles: ['admin', 'student'] }
        },
        {
          path: 'book',
          name: 'book',
          component: () => import('../views/BookView.vue'),
          meta: { title: '图书管理', roles: ['admin', 'student'] }
        },
        {
          path: 'borrow',
          name: 'borrow',
          component: () => import('../views/BorrowView.vue'),
          meta: { title: '借阅管理', roles: ['admin', 'student'] }
        },
        {
          path: 'appointment',
          name: 'appointment',
          component: () => import('../views/AppointmentView.vue'),
          meta: { title: '预约管理', roles: ['admin', 'student'] }
        },
        {
          path: 'favorite',
          name: 'favorite',
          component: () => import('../views/FavoriteView.vue'),
          meta: { title: '图书收藏', roles: ['admin', 'student'] }
        },
        {
          path: 'personal',
          name: 'personal',
          component: () => import('../views/PersonalView.vue'),
          meta: { title: '个人信息', roles: ['admin', 'student'] }
        }
      ]
    },
    // 404 页面
    {
      path: '/:pathMatch(.*)*',
      redirect: '/library/home'
    }
  ]
})

/**
 * 全局路由守卫
 * 1. 检查是否需要登录
 * 2. 校验 Token 有效性
 * 3. 有 Token 但无 UserInfo 时，调用 getUserInfo 获取用户信息
 * 4. 校验用户角色权限
 */
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token || localStorage.getItem('token')
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 图书馆管理系统`
  }
  
  // 不需要登录的页面直接放行
  if (!to.matched.some(record => record.meta.requiresAuth)) {
    // 已登录用户访问登录页，重定向到首页
    if (to.path === '/login' && token) {
      next('/library/home')
      return
    }
    next()
    return
  }
  
  // ===== 需要登录的页面 =====
  
  // 1. 检查是否有 Token
  if (!token) {
    console.warn('未登录，重定向到登录页')
    next({ 
      path: '/login', 
      query: { redirect: to.fullPath } 
    })
    return
  }
  
  // 2. 有 Token 但 Store 未初始化，尝试获取用户信息
  if (!userStore.isInitialized) {
    const isValid = await userStore.initUserState()
    
    if (!isValid) {
      console.warn('Token 无效或已过期，需要重新登录')
      next({ 
        path: '/login', 
        query: { redirect: to.fullPath, expired: '1' } 
      })
      return
    }
  }
  
  // 3. 有 Token 但无 UserInfo（可能是刷新页面后 localStorage 被清理）
  if (!userStore.userInfo) {
    console.warn('用户信息不存在，尝试通过 Token 获取')
    
    // 强制重新初始化
    userStore.isInitialized = false
    const isValid = await userStore.initUserState()
    
    if (!isValid) {
      console.warn('获取用户信息失败，需要重新登录')
      userStore.clearUserData()
      next({ 
        path: '/login', 
        query: { redirect: to.fullPath } 
      })
      return
    }
  }
  
  // 4. 检查角色权限
  const allowedRoles = to.meta.roles
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = userStore.role
    
    if (!userRole) {
      console.warn('用户角色未定义')
      next({ path: '/403' })
      return
    }
    
    if (!allowedRoles.includes(userRole as UserRole)) {
      console.warn(`用户角色 [${userRole}] 无权访问该页面，需要角色: [${allowedRoles.join(', ')}]`)
      next({ path: '/403' })
      return
    }
  }
  
  // 所有检查通过，放行
  next()
})

export default router
