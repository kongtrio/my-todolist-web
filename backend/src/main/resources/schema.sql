-- 创建待办事项表
CREATE TABLE IF NOT EXISTS todo_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 1, -- 1: 低, 2: 中, 3: 高
    status INTEGER DEFAULT 0, -- 0: 待办, 1: 进行中, 2: 已完成
    tags VARCHAR(500), -- JSON格式存储标签数组
    image_paths TEXT, -- JSON格式存储图片路径数组
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建标签表
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#1890ff', -- 十六进制颜色值
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 默认标签已移除，用户可自行创建
