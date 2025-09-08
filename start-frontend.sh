#!/bin/bash

# 待办事项系统前端启动脚本
# 作者：Cascade AI
# 日期：2025-09-08

echo "🚀 启动待办事项系统前端..."

# 进入前端目录
cd "$(dirname "$0")/frontend" || exit 1

# 检查 Node.js 环境
if ! command -v npm &> /dev/null; then
    echo "❌ 错误：找不到 npm，请先安装 Node.js"
    exit 1
fi

echo "✅ Node.js 环境检查通过"

# 检查端口 3000 是否被占用
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 3000 已被占用，正在停止现有服务..."
    pkill -f "react-scripts start"
    sleep 2
fi

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
fi

# 启动前端服务
echo "🌟 启动前端服务（端口：3000）..."
npm start &

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 8

# 检查服务是否启动成功
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 前端服务启动成功！"
    echo "🌐 访问地址：http://localhost:3000"
    echo "💡 提示：浏览器应该会自动打开"
else
    echo "❌ 前端服务启动失败，请检查日志"
    exit 1
fi

echo "🎉 前端启动完成！"
