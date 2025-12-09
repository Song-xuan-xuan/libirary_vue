这是一份整理好的 Markdown 格式 API 接口文档。

------

# 图书管理系统 API 接口文档

## 1. 通用说明

### 1.1 基础约定

- **基础路径**: `/api`
- **数据格式**: `Content-Type: application/json`
- **字符编码**: UTF-8

### 1.2 鉴权机制

- **方式**: HTTP Header `Authorization`
- **格式**: `Bearer <JWT_TOKEN>`
- **公开接口**:
  - `/api/auth/**` (注册/登录)
  - `GET /api/books/**` (图书列表/详情)
  - `GET /api/tags` (标签列表)
  - `GET /api/comments/book/{bookId}` (查看书评)

### 1.3 响应结构

所有接口统一返回以下 JSON 结构：

JSON

```
{
  "code": "0",          // 业务状态码，"0" 表示成功
  "message": null,      // 错误提示信息，成功时为 null
  "data": <payload>     // 业务数据
}
```

**分页数据结构**:

JSON

```
{
  "code": "0",
  "data": {
    "result": [...],    // 数据列表
    "total": 120        // 总记录数
  }
}
```

### 1.4 状态码定义

| **状态码** | **说明**   |
| ---------- | ---------- |
| `0`        | 操作成功   |
| `A000131`  | 用户未登录 |
| `A000132`  | 权限不足   |

------

## 2. 用户与认证模块

### 2.1 用户注册

- **接口地址**: `/api/auth/register`
- **请求方式**: `POST`
- **权限**: 公开

请求参数:

| 参数名 | 类型 | 必填 | 说明 |

| :--- | :--- | :--- | :--- |

| username | string | 是 | 用户名 (4-50字符) |

| password | string | 是 | 密码 (6-20字符) |

| name | string | 是 | 真实姓名 |

| phone | string | 是 | 手机号 |

| role | string | 否 | 角色 (admin|student)，默认 student |

**请求示例**:

JSON

```
{
  "username": "alice",
  "password": "Passw0rd",
  "name": "Alice",
  "phone": "13800000000",
  "role": "student"
}
```

### 2.2 用户登录

- **接口地址**: `/api/auth/login`
- **请求方式**: `POST`
- **权限**: 公开

**请求示例**:

JSON

```
{
  "username": "alice",
  "password": "Passw0rd"
}
```

**响应示例**:

JSON

```
{
  "code": "0",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "id": 1,
    "username": "alice",
    "name": "Alice",
    "role": "student"
  }
}
```

### 2.3 获取当前用户信息

- **接口地址**: `/api/auth/me`
- **请求方式**: `GET`
- **权限**: 需登录

**响应示例**:

JSON

```
{
  "code": "0",
  "data": {
    "id": 1,
    "username": "alice",
    "role": "student",
    "name": "Alice",
    "phone": "13800000000",
    "createdAt": "2024-01-01T10:00:00"
  }
}
```

### 2.4 修改个人资料

- **接口地址**: `/api/auth/me`
- **请求方式**: `PUT`
- **权限**: 需登录

请求参数:

| 参数名 | 类型 | 必填 | 说明 |

| :--- | :--- | :--- | :--- |

| name | string | 是 | 真实姓名 |

| phone | string | 否 | 手机号 |

**请求示例**:

JSON

```
{
  "name": "Alice Zhang",
  "phone": "13800000001"
}
```

### 2.5 修改密码

- **接口地址**: `/api/auth/password`
- **请求方式**: `PUT`
- **权限**: 需登录

请求参数:

| 参数名 | 类型 | 必填 | 说明 |

| :--- | :--- | :--- | :--- |

| oldPassword | string | 是 | 旧密码 |

| newPassword | string | 是 | 新密码 (6-20字符) |

------

## 3. 图书管理模块

### 3.1 获取图书列表

- **接口地址**: `/api/books`
- **请求方式**: `GET`
- **权限**: 公开

查询参数 (Query):

| 参数名 | 类型 | 说明 |

| :--- | :--- | :--- |

| limit | int | 每页数量 |

| offset | int | 偏移量 |

| title | string | 书名模糊查询 |

| author | string | 作者模糊查询 |

| isbn | string | ISBN精确查询 |

| tagName | string | 标签名称过滤 |

**响应示例**:

JSON

```
{
  "code": "0",
  "data": {
    "result": [
      {
        "id": 1,
        "title": "三体",
        "author": "刘慈欣",
        "description": "科幻",
        "isbn": "978123",
        "publishYear": 2008,
        "coverUrl": null,
        "total": 5,
        "stock": 2,
        "createdAt": "2024-01-01T10:00:00",
        "updatedAt": null
      }
    ],
    "total": 1
  }
}
```

### 3.2 获取图书详情

- **接口地址**: `/api/books/{id}`
- **请求方式**: `GET`
- **权限**: 公开

**响应示例**:

JSON

```
{
  "code": "0",
  "data": {
    "id": 1,
    "title": "三体",
    "author": "刘慈欣",
    "description": "科幻",
    "isbn": "978123",
    "publishYear": 2008,
    "coverUrl": null,
    "total": 5,
    "stock": 2,
    "tags": [
      { "id": 1, "name": "科幻", "createdAt": "..." }
    ]
  }
}
```

### 3.3 新建图书

- **接口地址**: `/api/books`
- **请求方式**: `POST`
- **权限**: 管理员

请求参数:

| 参数名 | 类型 | 必填 | 说明 |

| :--- | :--- | :--- | :--- |

| title | string | 是 | 书名 |

| author | string | 是 | 作者 |

| description | string | 否 | 描述 |

| isbn | string | 是 | ISBN |

| publishYear | int | 是 | 出版年份 |

| coverUrl | string | 否 | 封面链接 |

| total | int | 是 | 总库存 (>=1) |

| tagIds | List<Long> | 否 | 标签ID列表 |

**请求示例**:

JSON

```
{
  "title": "三体",
  "author": "刘慈欣",
  "description": "科幻巨作",
  "isbn": "978123",
  "publishYear": 2008,
  "coverUrl": null,
  "total": 5,
  "tagIds": [1, 2]
}
```

### 3.4 更新图书

- **接口地址**: `/api/books/{id}`
- **请求方式**: `PUT`
- **权限**: 管理员
- **请求体**: 同“新建图书”

### 3.5 删除图书

- **接口地址**: `/api/books/{id}`
- **请求方式**: `DELETE`
- **权限**: 管理员

------

## 4. 借阅管理模块

### 4.1 借书

- **接口地址**: `/api/borrow`
- **请求方式**: `POST`
- **权限**: 需登录

**请求示例**:

JSON

```
{ "bookId": 1 }
```

### 4.2 还书

- **接口地址**: `/api/borrow/return`
- **请求方式**: `POST`
- **权限**: 需登录

**请求示例**:

JSON

```
{ "bookId": 1 }
```

### 4.3 我的借阅记录

- **接口地址**: `/api/borrow/list`
- **请求方式**: `GET`
- **权限**: 需登录

**响应示例**:

JSON

```
{
  "code": "0",
  "data": [
    {
      "id": 10,
      "userId": 1,
      "bookId": 1,
      "borrowTime": "2024-02-01T12:00:00",
      "dueTime": "2024-03-02T12:00:00",
      "returnTime": null,
      "status": 0,
      "bookTitle": "三体",
      "bookIsbn": "978123",
      "userName": "alice"
    }
  ]
}
```

------

## 5. 预约管理模块

### 5.1 预约图书

- **接口地址**: `/api/reservation`
- **请求方式**: `POST`
- **权限**: 需登录

**请求示例**:

JSON

```
{ "bookId": 1 }
```

### 5.2 取消预约

- **接口地址**: `/api/reservation/cancel`
- **请求方式**: `POST`
- **权限**: 需登录

**请求示例**:

JSON

```
{ "reservationId": 5 }
```

### 5.3 我的预约记录

- **接口地址**: `/api/reservation/list`
- **请求方式**: `GET`
- **权限**: 需登录

------

## 6. 收藏管理模块

### 6.1 添加收藏

- **接口地址**: `/api/favorites`
- **请求方式**: `POST`
- **权限**: 需登录

**请求示例**:

JSON

```
{ "bookId": 1 }
```

### 6.2 取消收藏

- **接口地址**: `/api/favorites/remove`
- **请求方式**: `POST`
- **权限**: 需登录

**请求示例**:

JSON

```
{ "bookId": 1 }
```

### 6.3 我的收藏列表

- **接口地址**: `/api/favorites/list`
- **请求方式**: `GET`
- **权限**: 需登录

------

## 7. 评论管理模块

### 7.1 发表评论

- **接口地址**: `/api/comments`
- **请求方式**: `POST`
- **权限**: 需登录

**请求示例**:

JSON

```
{
  "bookId": 1,
  "content": "好书！"
}
```

### 7.2 删除评论

- **接口地址**: `/api/comments/{id}`
- **请求方式**: `DELETE`
- **权限**: 需登录（仅限作者本人）

### 7.3 获取书籍评论

- **接口地址**: `/api/comments/book/{bookId}`
- **请求方式**: `GET`
- **权限**: 公开

**响应示例**:

JSON

```
{
  "code": "0",
  "data": [
    {
      "id": 8,
      "userId": 1,
      "bookId": 1,
      "content": "好书！",
      "createdAt": "2024-02-01T12:00:00",
      "userName": "alice",
      "bookTitle": "三体"
    }
  ]
}
```

------

## 8. 标签管理模块

### 8.1 获取标签列表

- **接口地址**: `/api/tags`
- **请求方式**: `GET`
- **权限**: 公开

### 8.2 新增标签

- **接口地址**: `/api/tags`
- **请求方式**: `POST`
- **权限**: 管理员

**请求示例**:

JSON

```
{ "name": "科幻" }
```

### 8.3 删除标签

- **接口地址**: `/api/tags/{id}`
- **请求方式**: `DELETE`
- **权限**: 管理员

------

## 9. 统计模块

### 9.1 获取最新动态

- **接口地址**: `/api/statistics/activities`
- **请求方式**: `GET`
- **权限**: 需登录
- **参数**: `limit` (int, 默认10, 最大100)

**响应示例**:

JSON

```
{
  "code": "0",
  "data": [
    {
      "userName": "alice",
      "bookTitle": "三体",
      "action": "借阅",
      "time": "2024-02-01T12:00:00"
    }
  ]
}
```

### 9.2 借阅榜（用户）

- **接口地址**: `/api/statistics/top-users`
- **请求方式**: `GET`
- **权限**: 需登录
- **参数**: `limit` (int, 默认5)

### 9.3 热门图书榜

- **接口地址**: `/api/statistics/top-books`
- **请求方式**: `GET`
- **权限**: 需登录
- **参数**: `limit` (int, 默认5)