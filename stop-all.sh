#!/bin/bash

# 待办事项系统停止脚本
# 作者：Cascade AI
# 日期：2025-09-08

echo "🛑 停止待办事项系统..."

# 停止前端服务
echo "🎨 停止前端服务..."
pkill -f "react-scripts start"

# 停止后端服务
echo "📡 停止后端服务..."
pkill -f "spring-boot:run"

# 等待进程结束
sleep 3

# 强制停止端口占用
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  强制停止端口 3000..."
    lsof -ti:3000 | xargs kill -9
fi

if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  强制停止端口 8080..."
    lsof -ti:8080 | xargs kill -9
fi

echo "✅ 所有服务已停止"
