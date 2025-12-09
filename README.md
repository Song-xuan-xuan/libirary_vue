# 图书借阅系统

# 图书借阅系统前端（Vue 3）

一个基于 Vue 3 + Element Plus 的图书借阅管理前端，支持登录/注册、图书检索与借阅、预约与收藏、个人资料与密码管理，以及
首页统计面板和书籍详情抽屉。

## 功能特性

- 账户：登录 / 注册，记住 Token，未登录自动跳转登录页
- 首页：今日问候、当前借阅/预约/收藏统计，最新活动流，热门图书 Top10，阅读之星 Top5
- 图书：多条件搜索（书名/作者/ISBN/标签），书籍列表、借阅/预约/收藏操作，书籍详情抽屉（封面、简介、标签、评论、借阅/预
  约操作），管理员可新增/编辑/删除书籍
- 借阅：个人借阅记录，支持归还并自动刷新列表
- 预约：个人预约记录，支持取消预约，查看书籍详情
- 收藏：个人收藏列表，支持取消收藏，查看书籍详情
- 个人中心：查看账号信息（角色、手机、Token 摘要），修改密码（强度提示），安全提醒
- 统一体验：Apple 风格主题美化、过渡动画、图标自动注册、滚动与卡片样式统一

## 技术栈

- 核心：Vue 3 (Composition API) + TypeScript
- 状态：Pinia
- 路由：Vue Router 4（路由守卫+角色控制）
- UI：Element Plus + @element-plus/icons-vue
- 网络：Axios（二次封装，拦截器写入 Bearer Token）
- 构建：Vite 7，Sass
- 质量：ESLint、vue-tsc

## 环境要求

- Node.js：^20.19.0 或 >=22.12.0
- 包管理：npm（自带 package-lock）

## 快速开始

npm install              # 安装依赖
npm run dev              # 本地开发，默认 http://localhost:5173
npm run lint             # 代码规范检查
npm run type-check       # TypeScript 类型检查
npm run build            # 生产构建
npm run preview          # 预览构建产物

### 环境变量

- .env.development：VITE_API_BASE_URL=/api（Vite dev server 会将 /api 代理到后端）
- .env：VITE_API_BASE_URL=http://localhost:8080/api（可改成实际后端地址）
- 代理配置：vite.config.ts 中 dev server 端口 5173，/api 默认指向 http://localhost:8080

## 目录速览

src/
api/           # 各业务 API 封装与类型定义（books/borrow/reservation/favorite/analytics/auth）
layout/        # MainLayout：侧边导航 + 顶栏 + 过渡
router/        # 路由表与全局守卫（登录/Token/角色检查）
stores/        # Pinia store（user：登录、注册、密码修改、Token 持久化）
styles/        # 全局样式与 Element Plus 主题定制（Apple 风格）
utils/         # Axios request 封装（拦截器、错误处理、Token 注入）
views/         # 页面：Home / Book / Borrow / Appointment / Favorite / Personal / Login / Forbidden
App.vue, main.ts

## 路由与权限

- 主要路由：/login、/library/home、/library/book、/library/borrow、/library/appointment、/library/favorite、/library/
  personal，以及 403/404 处理
- 路由守卫：
  - 检查 requiresAuth：无 Token 时跳转登录并带 redirect
  - Token 存在但 store 未初始化时，会拉取用户信息
  - meta.roles 用于角色控制；不匹配跳转 403
  - 已登录访问 /login 时重定向首页

## 状态与数据流

- stores/user.ts：登录/注册/登出、获取用户信息、修改密码、角色判断；Token、用户信息、角色持久化到 localStorage
- utils/request.ts：Axios 拦截器统一写入 Bearer Token，isSuccess 兼容多种返回码 (code === '0' || '200' || 'ok' ||
  success === true)，401 自动清理并跳转登录

## UI/交互亮点

- Apple 风格主题变量，圆角卡片、胶囊按钮、滚动条与表格定制
- 首页动效：背景流光、过渡动画、数据卡片 hover
- 登录页：全屏背景轮播 + 玻璃拟态卡片，登录/注册切换
- 书籍详情抽屉：封面、库存标签、简介、标签列表、评论提交与展示，借阅/预约/收藏入口

## 开发提示

- 图标已在 main.ts 全量注册，可直接 <el-icon><XxxIcon /></el-icon>
- 后端响应需遵循统一结构，否则拦截器会弹错误提示
- 若需跨域，优先通过 Vite 代理 /api；生产请配置正确的 VITE_API_BASE_URL
- 管理员专属能力：书籍新增、编辑、删除（在书籍列表的操作列中显示）

## 脚本速查

- npm run dev：启动开发
- npm run build：生产构建
- npm run preview：本地预览构建产物
- npm run lint：ESLint 检查
- npm run type-check：类型检查
