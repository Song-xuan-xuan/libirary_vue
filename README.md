# 图书借阅系统

**更新日期：2025-12-08**

## 项目状态

✅ **前端重构完成** - 所有接口已对齐最新 RESTful API 文档  
✅ **代码质量检查通过** - ESLint 静态检查无错误  
✅ **构建验证通过** - TypeScript 编译成功，生产构建正常  
🚀 **准备联调** - 可与后端进行集成测试

## 技术栈

- **框架**: Vue 3 (Composition API) + TypeScript
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **UI 组件**: Element Plus
- **HTTP 客户端**: Axios
- **构建工具**: Vite
- **代码规范**: ESLint + TypeScript

## 项目说明

本项目前端已完全对齐 `接口文档.md` 中定义的 RESTful API 规范：

1. **统一响应格式**: `{code: "0", message: string|null, data: T, success: boolean}`
2. **RESTful 风格**: 使用标准 HTTP 方法和路径参数 (GET /books/{id})
3. **驼峰命名**: 所有字段统一使用 camelCase (bookId, borrowTime, createAt)
4. **分页规范**: 请求使用 {pageNum, pageSize}，响应返回 {list, total, pageNum, pageSize, pages}
5. **严格类型**: TypeScript 类型定义完整，无 any 类型

## 重要更新 (2025-12-08)

### API 接口全面升级为 RESTful 风格

前端代码已完全重构，对齐最新《接口文档.md》RESTful v1.0 规范：

**主要变更**:

1. **统一响应格式**
   - 旧格式: `{status, message, data}`
   - 新格式: `{code, message, data, success}`
   - 成功判断: `code === "0" && success === true`

2. **图书模块 RESTful 化**
   - 旧: `POST /book/detail` → 新: `GET /books/{id}`
   - 旧: `POST /book/books` → 新: `GET /books?pageNum=1&pageSize=10`
   - 旧: `POST /book/create` → 新: `POST /books`
   - 旧: `PUT /book/update` → 新: `PUT /books/{id}`
   - 旧: `DELETE /book/delete` → 新: `DELETE /books/{id}`

3. **借阅/预约/收藏模块**
   - 旧: 返回分页数据 → 新: 直接返回数组
   - 路径统一: `/borrow`, `/reservation`, `/favorites`

4. **统计分析模块**
   - 旧: `POST /analytics/*` → 新: `GET /statistics/*`
   - 支持 `limit` 参数自定义返回数量
   - 移除推荐功能(接口文档未定义)

5. **字段命名规范**
   - 全部采用 camelCase: `bookId`, `borrowTime`, `createAt`
   - 注意: 注册时间字段为 `createAt` (不是 `createdAt`)

6. **分页参数变更**
   - 旧: `{limit, offset}` → 新: `{pageNum, pageSize}`
   - 响应结构: `{list, total, pageNum, pageSize, pages}`

**移除的功能** (接口文档不支持):
- ❌ 图书搜索的 ISBN 和 tag 筛选
- ❌ 图书表单的 publish_year, total, stock, cover_url, tag_ids
- ❌ 图书推荐功能

## 1.项目设计

**本项目旨在构建一个面向用户的图书借阅管理系统，实现如下功能：**

1. **图书信息管理** - 图书 CRUD，搜索按书名/作者
2. **用户借阅与归还** - 借书、还书、借阅记录查询
3. **图书预约排队** - 预约、取消预约、预约列表
4. **评论互动** - 图书评论发表、查看、删除
5. **用户图书收藏夹** - 添加收藏、移除收藏、收藏列表
6. **统计分析** - 热门图书、阅读之星、最新动态

## 2.数据库设计

### 2.1 用户表（user）

**用于存储系统中所有用户的基本信息，包括登录账号、密码、姓名和联系方式。借阅、预约、评论、收藏等业务都通过 **`user_id` 与该表关联。

```
 CREATE TABLE user (
     id           BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
     username     VARCHAR(50)  NOT NULL UNIQUE COMMENT '登录名',
     password     VARCHAR(255) NOT NULL COMMENT '密码(加密后)',
     role         ENUM('student', 'teacher', 'admin') NOT NULL COMMENT '用户角色',
     name         VARCHAR(50)  NOT NULL COMMENT '姓名',
     phone        VARCHAR(20)           COMMENT '手机号',
     created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
     updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

---

### 2.2 图书表（book）

**用于存储系统中所有图书的基础信息，例如书名、作者、简介、ISBN、出版年份等，同时包含图书的总数量与库存数量。**

```
 CREATE TABLE book (
     id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '图书ID',
     title         VARCHAR(200) NOT NULL COMMENT '书名',
     author        VARCHAR(100)          COMMENT '作者',
     description   TEXT                  COMMENT '简介',
     isbn          VARCHAR(30)           COMMENT 'ISBN编号',
     publish_year  INT                   COMMENT '出版年份',
     cover_url     VARCHAR(255)          COMMENT '封面图片URL',
     total         INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '图书总数量',
     stock         INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '库存数量',
     created_at    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
     updated_at    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图书表';
```

---

### 2.3 分类标签表（tag）

**用于存储系统中所有可用的分类 / 标签信息，例如"科幻""教育"等。图书可以通过中间表 **`book_tag` 绑定多个标签，方便实现按标签筛选、分类浏览等功能。

```
 CREATE TABLE tag (
     id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '标签ID',
     name        VARCHAR(50)  NOT NULL COMMENT '标签名称，如科幻、教育',
     created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分类标签表';
```

---

### 2.4 图书–分类标签映射表（book\_tag）

**用于建立图书与标签之间的****多对多关系**。一条记录代表本图书拥有某个标签。

```
 CREATE TABLE book_tag (
     id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
     book_id     BIGINT UNSIGNED NOT NULL COMMENT '图书ID',
     tag_id      BIGINT UNSIGNED NOT NULL COMMENT '标签ID',
     created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
     FOREIGN KEY (book_id) REFERENCES book(id) ON DELETE CASCADE ON UPDATE CASCADE,
     FOREIGN KEY (tag_id) REFERENCES tag(id)  ON DELETE CASCADE ON UPDATE CASCADE
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图书-分类标签映射表';
```

---

### 2.5 评论表（comment）

**用于存储用户对图书的评论信息。一条记录表示某个用户对某本书发表的一条评论。**

```
 CREATE TABLE comment (
     id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '评论ID',
     user_id     BIGINT UNSIGNED NOT NULL COMMENT '评论用户ID',
     book_id     BIGINT UNSIGNED NOT NULL COMMENT '评论图书ID',
     content     TEXT            NOT NULL COMMENT '评论内容',
     created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
     FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
     FOREIGN KEY (book_id) REFERENCES book(id) ON DELETE CASCADE ON UPDATE CASCADE
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';
```

---

### 2.6 收藏图书表（favorite）

**用于记录用户收藏的图书信息。一条记录表示某个用户收藏了某本书，相当于个人书架功能。**

```
 CREATE TABLE favorite (
     id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '收藏ID',
     user_id     BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
     book_id     BIGINT UNSIGNED NOT NULL COMMENT '图书ID',
     created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
     FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
     FOREIGN KEY (book_id) REFERENCES book(id) ON DELETE CASCADE ON UPDATE CASCADE
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏图书表';
```

---

### 2.7 借阅表（borrow）

**用于记录用户的图书借阅信息，是一张非常核心的业务表。一条记录表示某个用户借阅了某本图书的一笔借阅记录，包含借出时间、应还时间、归还时间以及当前借阅状态等信息。**

```
 CREATE TABLE borrow (
     id           BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '借阅ID',
     user_id      BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
     book_id      BIGINT UNSIGNED NOT NULL COMMENT '图书ID',
     borrow_time  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '借书时间',
     due_time     DATETIME        NOT NULL COMMENT '应还时间',
     return_time  DATETIME                 COMMENT '实际归还时间（未归还则为NULL）',
     status       TINYINT         NOT NULL DEFAULT 0 COMMENT '状态：0=借出中，1=已归还，2=逾期',
     created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
     updated_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
     FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
     FOREIGN KEY (book_id) REFERENCES book(id) ON DELETE CASCADE ON UPDATE CASCADE
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='借阅表';
```

---

### 2.8 预约表（reservation）

**用于记录用户对图书的预约信息。当某本书已被借完时，用户可以进行预约；图书归还后，可以根据预约记录通知排队的用户。** `status` 字段用于表示预约的当前状态（如排队中、已取消、已完成等）。

```
 CREATE TABLE reservation (
     id           BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '预约ID',
     user_id      BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
     book_id      BIGINT UNSIGNED NOT NULL COMMENT '图书ID',
     status       TINYINT         NOT NULL DEFAULT 0 COMMENT '状态：0=排队中，1=已取消，2=已完成',
     created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '预约时间',
     FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
     FOREIGN KEY (book_id) REFERENCES book(id) ON DELETE CASCADE ON UPDATE CASCADE
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预约表';
```

## 3.接口设计

**注意：图书表中有一个字段为cover\_url，用于存储该图书的url地址，这个字段可以先置为空，前端可以用本地图片填充，后端可以先不实现。**

### 3.1 用户模块

**说明**: 所有接口已更新为最新 RESTful 风格，统一响应格式为 `{code, message, data, success}`

#### 3.1.1 用户注册

```
POST /auth/register
```

##### 请求参数

| 参数     | 类型   | 必填 | 说明                                 |
| -------- | ------ | ---- | ------------------------------------ |
| username | string | 是   | 用户名，长度 4-50 字符              |
| password | string | 是   | 密码，长度 6-20 字符                |
| name     | string | 是   | 姓名                                 |
| phone    | string | 是   | 手机号                               |
| role     | string | 否   | 角色 (student/admin)，不传默认 student |

##### 返回示例

```json
{
    "code": "0",
    "message": null,
    "data": null,
    "success": true
}
```

#### 3.1.2 用户登录

```
POST /auth/login
```

##### 请求参数

| 参数     | 类型   | 必填 | 说明   |
| -------- | ------ | ---- | ------ |
| username | string | 是   | 用户名 |
| password | string | 是   | 密码   |

##### 返回示例

```json
{
    "code": "0",
    "message": null,
    "data": {
        "token": "eyJhbGciOiJIUzM4NCJ9...",
        "id": 1,
        "username": "chaos",
        "name": "吕建超",
        "role": "admin"
    },
    "success": true
}
```

#### 3.1.3 获取当前用户信息

```
GET /auth/me
```

需要 Authorization 请求头

##### 返回示例

```json
{
    "code": "0",
    "message": null,
    "data": {
        "id": 1,
        "username": "chaos",
        "role": "admin",
        "name": "吕建超",
        "phone": "15827110898",
        "createAt": "2025-12-04 15:33:12"
    },
    "success": true
}
```

#### 3.1.4 修改用户信息

```
PUT /auth/me
```

##### 请求参数

| 参数  | 类型   | 必填 | 说明   |
| ----- | ------ | ---- | ------ |
| name  | string | 是   | 姓名   |
| phone | string | 是   | 手机号 |

#### 3.1.5 修改密码

```
PUT /auth/password
```

##### 请求参数

| 参数        | 类型   | 必填 | 说明       |
| ----------- | ------ | ---- | ---------- |
| oldPassword | string | 是   | 旧密码     |
| newPassword | string | 是   | 新密码 6-20字符 |

### 3.2 图书管理

**重要**: 图书模块已全面重构为 RESTful 风格

#### 3.2.1 获取图书列表

```
GET /books
```

##### 请求参数


| **参数**          | **类型**   | **必填** | **说明**                                    |
| ----------------- | ---------- | -------- | ------------------------------------------- |
| **title**         | **string** | **是**   | **书名**                                    |
| **author**        | **string** | **否**   | **作者**                                    |
| **description**   | **string** | **否**   | **简介**                                    |
| **isbn**          | **string** | **否**   | **ISBN**                                    |
| **publish\_year** | **int**    | **否**   | **出版年份**                                |
| **total**         | **int**    | **是**   | **总数量**                                  |
| **stock**         | **int**    | **是**   | **库存数量（创建的时候一般与 total 相同）** |

##### 返回数据

```
{
    "status": "ok",
    "message": "created",
    "data": null
}
```

#### 3.2.2 获取所有图书

**获取所有图书相当于查询，需要添加几个查询字段，即：书名、作者、ISBN编号和图书标签，图书标签为一个字符串，比如“科技”，指明标签表的name字段，由于图书众多，这里考虑做分页，也就是分页查询。前端传过来 ****查询数量limit** 和 **查询偏移offset** 两个参数，后端根据这两个参数进行查询，如果前端没有传入任何参数，默认返回所有数据。

**查询数量（limit）对应SQL中的LIMIT，用于限制查询的记录数量。查询偏移（offset）对应SQL中的OFFSET，用于为查询施加一定的偏移量。例如**`LIMIT 2 OFFSET 1` 表示偏移1条数据，限制返回2条数据，获取的就是所有记录中的第2和3个记录。

**借助limit和offset可以实现分页。分页时的两个主要参数：页面记录数量（pagesize）和页数（pagenum）与limit和offset之间有直接的映射关系。**

** \\text{limit}=\\text{pagesize} **

** \\text{offset}=\\text{limit}\\times (\\text{pagenum} - 1)**

**因此当每页展示10条数据，要获取第三页的内容，可指定 **`limit=10 & offset=20`。由于设置的为必填，所以前端设置一个默认值。

**注意！！！**：在每次查询过后，在返回的数据最后加上total字段（查询的数据的总数，eg：如果我查询作者为小明的书籍，total就为小明名下的书籍数量）

```
POST /api/book/books
```

##### 请求参数


| **参数**   | **类型**   | **必填** | **说明**                       |
| ---------- | ---------- | -------- | ------------------------------ |
| **title**  | **string** | **否**   | **按书名模糊查询**             |
| **author** | **string** | **否**   | **按作者名查询**               |
| **isbn**   | **string** | **否**   | **按 ISBN 查询**               |
| **tag**    | **string** | **否**   | **按标签名称查询，如“科技”** |
| **limit**  | **int**    | **是**   | **分页大小**                   |
| **offset** | **int**    | **是**   | **偏移量**                     |

##### 返回数据

```
{
    "status": "ok",
    "message": "success",
    "data": {
        "result": [
            {
                "id": 1,
                "title": "计算机科学导论",
                "author": "张三",
                "description": "一本关于计算机科学基础的书籍。",
                "isbn": "978-7-123-45678-9",
                "publish_year": 2020,
                "cover_url": "...",
                "total": 100,
                "stock": 50,
                "created_at": "2023-01-01 10:00:00",
                "updated_at": "2023-01-10 15:00:00"
            },
            {
                "id": 2,
                "title": "人工智能简史",
                "author": "李四",
                "description": "介绍人工智能发展历史的书籍。",
                "isbn": "978-7-123-98765-4",
                "publish_year": 2021,
                "cover_url": "...",
                "total": 200,
                "stock": 120,
                "created_at": "2023-02-01 11:00:00",
                "updated_at": "2023-02-05 16:00:00"
            }
        ],
        "total": 2
    }
}
```

#### 3.2.3 获取单个图书

**这里获取单个图书需要进行连接查询，返回该图书基本信息，然后加上该图书所属分类标签以及该图书的评论，评论里面又包含发表该评论的用户信息。**

```
POST /api/book/detail
```

##### 请求参数


| **参数** | **类型** | **必填** | **说明**    |
| -------- | -------- | -------- | ----------- |
| **id**   | **int**  | **是**   | **图书 ID** |

##### 返回数据

```
{
    "status": "ok",
    "message": "",
    "data": {
        "book": {
            "id": 1,
            "title": "计算机科学导论",
            "author": "张三",
            "description": "一本关于计算机科学基础的书籍。",
            "isbn": "978-7-123-45678-9",
            "publish_year": 2020,
            "cover_url": "...",
            "total": 100,
            "stock": 50,
            "created_at": "2023-01-01 10:00:00",
            "updated_at": "2023-01-10 15:00:00"
        },
        "tags": [
            {
                "id": 3,
                "name": "计算机",
                "created_at": "2022-11-01 12:00:00"
            },
            {
                "id": 7,
                "name": "科学",
                "created_at": "2022-11-05 11:10:00"
            }
        ],
        "comments": [
            {
                "id": 12,
                "content": "内容通俗易懂，非常适合入门。",
                "created_at": "2023-03-01 09:30:00",
                "user": {
                    "id": 5,
                    "name": "李四"
                }
            },
            {
                "id": 13,
                "content": "讲解很清晰，但部分章节略显简单。",
                "created_at": "2023-03-03 14:20:00",
                "user": {
                    "id": 8,
                    "name": "王五"
                }
            }
        ]
    }
}
```

#### 3.2.4 更新图书（teacher/admin）

```
PUT /api/book/update
```

##### 请求参数


| **参数**          | **类型**   | **必填** | **说明**     |
| ----------------- | ---------- | -------- | ------------ |
| **id**            | **int**    | **是**   | **图书 ID**  |
| **title**         | **string** | **否**   | **书名**     |
| **author**        | **string** | **否**   | **作者**     |
| **description**   | **string** | **否**   | **简介**     |
| **isbn**          | **string** | **否**   | **ISBN**     |
| **publish\_year** | **int**    | **否**   | **出版年份** |
| **total**         | **int**    | **否**   | **总数量**   |
| **stock**         | **int**    | **否**   | **库存数量** |

##### 返回数据

```
{
    "status": "ok",
    "message": "updated",
    "data": null
}
```

#### 3.2.5 删除图书（teacher/admin）

```
DELETE /api/book/delete
```

##### 请求参数


| **参数** | **类型** | **必填** | **说明**    |
| -------- | -------- | -------- | ----------- |
| **id**   | **int**  | **是**   | **图书 ID** |

##### 返回数据

```
{
    "status": "ok",
    "message": "deleted"，
    "data": null
}
```

#### 3.2.6 图书评论

```
POST /api/book/comment
```

##### 请求参数


| **参数**    | **类型**   | **必填** | **说明**     |
| ----------- | ---------- | -------- | ------------ |
| **id**      | **int**    | **是**   | **图书ID**   |
| **content** | **string** | **是**   | **评论内容** |

##### 返回数据

```
{
    "status": "ok",
    "message": "comment added",
    "data": null
}
```

### 3.3 图书借阅

#### 3.3.1 获取所有借阅书籍

**需要根据用户基本信息来返回数据，多了一个连接查询（根据借阅书籍表的book\_id来做查询）。**

```
POST /api/borrow/books
```

##### 请求参数


| **参数**   | **类型** | **必填** | **说明**     |
| ---------- | -------- | -------- | ------------ |
| **limit**  | **int**  | **是**   | **分页大小** |
| **offset** | **int**  | **是**   | **偏移量**   |

##### 返回数据（与 3.2.2 类似）

```
{
    "status": "ok",
    "message": "success",
    "data": {
        "result": [...],
        "total": 10
    }
}
```

#### 3.3.2 借书

```
POST /api/borrow
```

##### 请求参数


| **参数** | **类型** | **必填** | **说明**   |
| -------- | -------- | -------- | ---------- |
| **id**   | **int**  | **是**   | **图书ID** |

##### 返回数据

```
{
    "status": "ok",
    "message": "borrow success",
    "data": null
}
```

#### 3.3.3 还书

**由于添加了预约的功能，所以还书之后需要进行判断：**

1. **如果归还之后数量>1，说明预约表中没有该书籍，不需要进行处理。**
2. **如果归还之后数量=1，说明预约表当中可能会存在该书籍的预约信息，所以需要在预约表当中搜索该书籍，若发现，则选择时间最早的一个（且status为0）创建一条借书记录，并把该预约记录的status设为2（已完成）。**

```
POST /api/borrow/return
```

##### 请求参数


| **参数** | **类型** | **必填** | **说明**   |
| -------- | -------- | -------- | ---------- |
| **id**   | **int**  | **是**   | **图书ID** |

##### 返回数据

```
{
    "status": "ok",
    "message": "returned",
    "data": null
}
```

### 3.4 图书收藏

#### 3.4.1 获取所有收藏图书

```
POST /api/favorite/books
```

##### 请求参数


| **参数**   | **类型** | **必填** | **说明f**    |
| ---------- | -------- | -------- | ------------ |
| **limit**  | **int**  | **是**   | **分页大小** |
| **offset** | **int**  | **是**   | **偏移量**   |

##### 返回数据

```
{
    "status": "ok",
    "message": "success",
    "data": {
        "result": [...],
        "total": 5
    }
}
```

#### 3.4.2 添加收藏图书

```
POST /api/favorite
```

##### 请求参数


| **参数** | **类型** | **必填** | **说明**    |
| -------- | -------- | -------- | ----------- |
| **id**   | **int**  | **是**   | **图书 ID** |

##### 返回数据

```
{
    "status": "ok",
    "message": "favorite added",
    "data": null
}
```

#### 3.4.3 删除收藏图书

```
DELETE /api/favorite/delete
```

##### 请求参数


| **参数** | **类型** | **必填** | **说明**    |
| -------- | -------- | -------- | ----------- |
| **id**   | **int**  | **是**   | **图书 ID** |

##### 返回数据

```
{
    "status": "ok",
    "message": "favorite removed",
    "data": null
}
```

### 3.5 图书预约

**图书预约功能用于在图书库存为 0 时，让用户进入预约队列。当有读者归还图书后，系统可以根据预约时间先后顺序依次通知排队用户，也就是为预约表中该书籍最早预约的用户分配书籍。**

**预约表已在 2.8 中定义：**`reservation`，状态 `status`：

* `0 = 排队中`
* `1 = 已取消`
* `2 = 已完成`

#### 3.5.1 获取所有预约书籍

```
POST /api/reservation/books
```

##### 请求参数


| **参数**   | **类型** | **必填** | **说明**     |
| ---------- | -------- | -------- | ------------ |
| **limit**  | **int**  | **是**   | **分页大小** |
| **offset** | **int**  | **是**   | **偏移量**   |

##### 返回数据

```
{
    "status": "ok",
    "message": "success",
    "data": {
        "result": [...],
        "total": 3
    }
}
```

#### 3.5.2 预约图书

```
POST /api/reservation
```

##### 请求参数


| **参数** | **类型** | **必填** | **说明**    |
| -------- | -------- | -------- | ----------- |
| **id**   | **int**  | **是**   | **图书 ID** |

##### 返回数据

```
{
    "status": "ok",
    "message": "reservation created",
    "data": null
}
```

#### 3.5.3 取消预约

```
POST /api/reservation/cancel
```

##### 请求参数


| **参数** | **类型** | **必填** | **说明**        |
| -------- | -------- | -------- | --------------- |
| **id**   | **int**  | **是**   | **预约记录 ID** |

##### 返回数据

```
{
    "status": "ok",
    "message": "reservation canceled",
    "data": null
}
```

#### 3.6 标签管理

##### 3.6.1获得所有标签

```
get /api/tags
```

新增标签

```
post /api/tags
```

## 4. 拓展功能

### 4.1 热门图书排行

**接口已更新**: 使用 GET 方式，支持 limit 参数

```
GET /statistics/top-borrowed-books?limit=10
```

#### Query 参数

| 参数  | 类型 | 必填 | 默认值 | 说明             |
| ----- | ---- | ---- | ------ | ---------------- |
| limit | int  | 否   | 5      | 返回的图书数量   |

#### 返回示例 (最新格式)

```json
{
    "code": "0",
    "message": null,
    "data": [
        {
            "bookId": 1,
            "title": "Java编程思想",
            "author": "Bruce Eckel",
            "borrowCount": 50
        }
    ],
    "success": true
}
```

**前端实现**: HomeView 中的"热门图书"面板

### 4.2 阅读之星排行

```
GET /statistics/top-borrowers?limit=10
```

#### Query 参数

| 参数  | 类型 | 必填 | 默认值 | 说明             |
| ----- | ---- | ---- | ------ | ---------------- |
| limit | int  | 否   | 5      | 返回的用户数量   |

#### 返回示例

```json
{
    "code": "0",
    "message": null,
    "data": [
        {
            "userId": 1,
            "username": "chaos",
            "borrowCount": 20
        }
    ],
    "success": true
}
```

**前端实现**: HomeView 中的"阅读之星"面板

### 4.3 最新动态

```
GET /statistics/recent-activities?limit=20
```

#### Query 参数

| 参数  | 类型 | 必填 | 默认值 | 说明             |
| ----- | ---- | ---- | ------ | ---------------- |
| limit | int  | 否   | 10     | 返回的动态数量   |

#### 返回示例

```json
{
    "code": "0",
    "message": null,
    "data": [
        {
            "id": 1,
            "userId": 1,
            "username": "chaos",
            "bookId": 1,
            "bookTitle": "Java编程思想",
            "borrowTime": "2025-12-01 10:30:00"
        }
    ],
    "success": true
}
```

**前端实现**: HomeView 中的"最新动态"面板，显示格式为 "用户XXX 借阅了 《图书名》"

**注意**: 
1. 统计模块已移除推荐功能(接口文档未定义)
2. 所有统计接口已改为 GET 请求
3. 接口路径从 `/analytics/*` 更新为 `/statistics/*`

## 5. 前端概述

**路由结构如下：**

```
/                     <- 一级路由：重定向至 /login 或 /library
/login                <- 一级路由：登录 / 注册页面

/library              <- 一级路由：主布局（MainLayout）
├── /library/home             <- 二级路由：系统首页
├── /library/book             <- 二级路由：图书管理
├── /library/borrow           <- 二级路由：借阅管理
├── /library/appointment      <- 二级路由：预约管理
├── /library/favorite         <- 二级路由：图书收藏
└── /library/personal         <- 二级路由：个人信息
```

**登录注册页面可以加一个 **`isRegister` 变量来判断是登录还是注册，通过按钮进行表单切换。系统首页涉及拓展功能。

## 前端实现说明

### API 对齐完成度

所有接口已完全对齐 `接口文档.md` (RESTful v1.0):

✅ **用户模块** - 登录、注册、获取信息、修改密码  
✅ **图书模块** - CRUD 操作，使用 RESTful 路径参数  
✅ **借阅模块** - 借书、还书、借阅列表  
✅ **预约模块** - 预约、取消、预约列表  
✅ **收藏模块** - 添加、移除、收藏列表  
✅ **评论模块** - 发表、删除、查询评论  
✅ **统计模块** - 热门图书、阅读之星、最新动态

### 字段对齐说明

**已移除字段** (接口文档不支持):
- 图书搜索: `isbn`, `tag` 字段
- 图书表单: `publish_year`, `total`, `stock`, `cover_url`, `tag_ids`

**时间字段**: 统一使用 `createAt` (注意不是 `createdAt`)

**分页规范**: 
- 请求: `{pageNum, pageSize}`
- 响应: `{list, total, pageNum, pageSize, pages}`

### 响应验证标准

所有 API 调用统一使用:
```typescript
if (res.code === '0' && res.success) {
  // 成功处理
} else {
  // 错误处理，使用 res.message
}
```

### 路由结构

```
/                     <- 重定向至 /login 或 /library
/login                <- 登录/注册页面

/library              <- 主布局 (MainLayout)
├── /library/home             <- 系统首页 (统计面板)
├── /library/book             <- 图书管理
├── /library/borrow           <- 借阅记录
├── /library/appointment      <- 预约记录
├── /library/favorite         <- 我的收藏
└── /library/personal         <- 个人信息
```

## 开发指南

### 启动项目

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 代码检查
npm run lint

# 生产构建
npm run build
```

### 环境配置

修改 `src/utils/request.ts` 中的 `baseURL`:

```typescript
const service = axios.create({
  baseURL: 'http://localhost:8080/api',  // 修改为实际后端地址
  timeout: 10000
})
```

### 联调注意事项

1. **认证**: 所有需要登录的接口自动在请求头添加 `Authorization: Bearer {token}`
2. **错误处理**: 401 自动跳转登录，403 显示无权限提示
3. **响应格式**: 后端必须严格遵循 `{code, message, data, success}` 格式
4. **时间格式**: 建议使用 `YYYY-MM-DD HH:mm:ss` 格式
5. **CORS**: 后端需要配置跨域支持
