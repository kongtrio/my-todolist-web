#!/bin/bash

# 待办事项系统前端重启脚本
# 作者：Cascade AI
# 日期：2025-09-08

echo "🔄 重启待办事项系统前端..."

# 停止现有服务
echo "🛑 停止现有前端服务..."
pkill -f "react-scripts start"
sleep 3

# 检查是否还有残留进程
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  强制停止端口 3000 上的服务..."
    lsof -ti:3000 | xargs kill -9
    sleep 2
fi

# 进入前端目录
cd "$(dirname "$0")/frontend" || exit 1

# 检查 Node.js 环境
if ! command -v npm &> /dev/null; then
    echo "❌ 错误：找不到 npm，请先安装 Node.js"
    exit 1
fi

# 重新启动服务
echo "🌟 重新启动前端服务..."
npm start &

# 等待服务启动
echo "⏳ 等待服务重新启动..."
sleep 8

# 检查服务是否启动成功
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 前端服务重启成功！"
    echo "🌐 访问地址：http://localhost:3000"
else
    echo "❌ 前端服务重启失败，请检查日志"
    exit 1
fi

echo "🎉 前端重启完成！"
