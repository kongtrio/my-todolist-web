#!/bin/bash

# 待办事项系统完整启动脚本
# 作者：Cascade AI
# 日期：2025-09-08

echo "🚀 启动完整的待办事项系统..."

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 启动后端
echo "📡 第一步：启动后端服务..."
bash "$SCRIPT_DIR/start-backend.sh"

if [ $? -ne 0 ]; then
    echo "❌ 后端启动失败，停止启动流程"
    exit 1
fi

echo "✅ 后端启动成功，等待 3 秒后启动前端..."
sleep 3

# 启动前端
echo "🎨 第二步：启动前端服务..."
bash "$SCRIPT_DIR/start-frontend.sh"

if [ $? -ne 0 ]; then
    echo "❌ 前端启动失败"
    exit 1
fi

echo ""
echo "🎉 系统启动完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 前端地址：http://localhost:3000"
echo "📡 后端地址：http://localhost:8080"
echo "📚 API 接口：http://localhost:8080/api/todos"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 使用 Ctrl+C 可以停止服务"
