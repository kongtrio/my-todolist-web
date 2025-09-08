# 个人待办事项管理系统

一个功能完整的个人待办事项管理系统，采用前后端分离架构开发。

## 技术栈

### 后端
- Java 17
- Spring Boot 3.2.0
- Spring JDBC
- SQLite3 数据库
- Maven

### 前端
- React 18 + TypeScript
- Ant Design 5.x
- Axios
- Day.js

## 功能特性

### 基础功能
- ✅ 新增待办事项
- ✅ 编辑待办事项
- ✅ 删除待办事项
- ✅ 查看待办事项列表
- ✅ 待办事项状态管理（待办、进行中、已完成）

### 高级功能
- ✅ 优先级设置（低、中、高）
- ✅ 标签管理和分类
- ✅ 图片上传和附件管理
- ✅ 截止时间设置
- ✅ 多维度筛选（状态、优先级、标签、时间范围）
- ✅ 数据统计面板
- ✅ 响应式设计

## 项目结构

```
my-todolist-web/
├── backend/                 # 后端项目
│   ├── src/main/java/
│   │   └── com/todolist/
│   │       ├── config/      # 配置类
│   │       ├── controller/  # 控制器
│   │       ├── dao/         # 数据访问层
│   │       ├── entity/      # 实体类
│   │       └── service/     # 服务层
│   ├── src/main/resources/
│   │   ├── application.yml  # 应用配置
│   │   └── schema.sql       # 数据库表结构
│   └── pom.xml             # Maven配置
├── frontend/               # 前端项目
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── services/       # API服务
│   │   ├── types/          # TypeScript类型定义
│   │   ├── App.tsx         # 主应用组件
│   │   └── index.tsx       # 入口文件
│   └── package.json        # npm配置
└── README.md              # 项目说明
```

## 快速开始

### 环境要求
- JDK 17 或更高版本
- Node.js 16 或更高版本
- npm 或 yarn

### 后端启动

1. 进入后端目录：
```bash
cd backend
```

2. 配置JDK（如果需要）：
```bash
# JDK 17
export JAVA_HOME=/Users/yangjb/jdk-17.0.15.jdk/Contents/Home

# JDK 23
export JAVA_HOME=/Users/yangjb/jdk-23.0.2.jdk/Contents/Home
```

3. 编译并启动：
```bash
mvn clean compile
mvn spring-boot:run
```

后端服务将在 http://localhost:8080 启动

### 前端启动

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm start
```

前端应用将在 http://localhost:3000 启动

## API 接口

### 待办事项接口
- `GET /api/todos` - 获取待办事项列表（支持筛选）
- `GET /api/todos/{id}` - 获取单个待办事项
- `POST /api/todos` - 创建待办事项
- `PUT /api/todos/{id}` - 更新待办事项
- `DELETE /api/todos/{id}` - 删除待办事项
- `PATCH /api/todos/{id}/status` - 更新状态

### 标签接口
- `GET /api/tags` - 获取标签列表
- `POST /api/tags` - 创建标签
- `PUT /api/tags/{id}` - 更新标签
- `DELETE /api/tags/{id}` - 删除标签

### 文件接口
- `POST /api/files/upload` - 上传单个文件
- `POST /api/files/upload/multiple` - 上传多个文件
- `GET /api/files/{fileName}` - 获取文件
- `DELETE /api/files/{fileName}` - 删除文件

## 数据库设计

### todo_items 表
- `id` - 主键
- `title` - 标题
- `description` - 描述
- `priority` - 优先级（1:低, 2:中, 3:高）
- `status` - 状态（0:待办, 1:进行中, 2:已完成）
- `tags` - 标签（JSON格式）
- `image_paths` - 图片路径（JSON格式）
- `due_date` - 截止时间
- `created_at` - 创建时间
- `updated_at` - 更新时间

### tags 表
- `id` - 主键
- `name` - 标签名称
- `color` - 标签颜色
- `created_at` - 创建时间

## 开发说明

### 后端开发
- 使用Spring JDBC进行数据库操作
- SQLite数据库文件位于 `./data/todolist.db`
- 上传文件存储在 `./uploads/` 目录
- 支持跨域访问前端应用

### 前端开发
- 使用Ant Design组件库
- 支持响应式设计
- 集成文件上传功能
- 实现了完整的CRUD操作界面

## 部署说明

### 生产环境部署
1. 后端打包：`mvn clean package`
2. 前端构建：`npm run build`
3. 部署jar文件和前端静态文件到服务器

### 配置说明
- 数据库路径可通过 `application.yml` 配置
- 文件上传路径可通过配置文件修改
- 跨域设置可根据部署环境调整

## 许可证

MIT License
