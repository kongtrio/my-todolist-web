#!/bin/bash

# 待办事项系统后端重启脚本
# 作者：Cascade AI
# 日期：2025-09-08

echo "🔄 重启待办事项系统后端..."

# 设置 JAVA_HOME 环境变量
export JAVA_HOME=/Users/yangjb/jdk-17.0.15.jdk/Contents/Home

# 停止现有服务
echo "🛑 停止现有后端服务..."
pkill -f "spring-boot:run"
sleep 3

# 检查是否还有残留进程
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  强制停止端口 8080 上的服务..."
    lsof -ti:8080 | xargs kill -9
    sleep 2
fi

# 进入后端目录
cd "$(dirname "$0")/backend" || exit 1

# 清理并重新编译
echo "🔧 清理并重新编译..."
mvn clean compile

if [ $? -ne 0 ]; then
    echo "❌ 编译失败，请检查代码"
    exit 1
fi

# 重新启动服务
echo "🌟 重新启动后端服务..."
mvn spring-boot:run &

# 等待服务启动
echo "⏳ 等待服务重新启动..."
sleep 5

# 检查服务是否启动成功
if curl -s http://localhost:8080/api/todos > /dev/null; then
    echo "✅ 后端服务重启成功！"
    echo "🌐 API 地址：http://localhost:8080"
else
    echo "❌ 后端服务重启失败，请检查日志"
    exit 1
fi

echo "🎉 后端重启完成！"
