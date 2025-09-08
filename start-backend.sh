#!/bin/bash

# 待办事项系统后端启动脚本
# 作者：Cascade AI
# 日期：2025-09-08

echo "🚀 启动待办事项系统后端..."

# 设置 JAVA_HOME 环境变量
export JAVA_HOME=/Users/yangjb/jdk-17.0.15.jdk/Contents/Home

# 检查 Java 环境
if [ ! -d "$JAVA_HOME" ]; then
    echo "❌ 错误：找不到 Java 17 环境，请检查 JAVA_HOME 路径"
    exit 1
fi

echo "✅ Java 环境：$JAVA_HOME"

# 进入后端目录
cd "$(dirname "$0")/backend" || exit 1

# 检查端口 8080 是否被占用
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 8080 已被占用，正在停止现有服务..."
    pkill -f "spring-boot:run"
    sleep 2
fi

# 清理并编译
echo "🔧 清理并编译项目..."
mvn clean compile

if [ $? -ne 0 ]; then
    echo "❌ 编译失败，请检查代码"
    exit 1
fi

# 启动后端服务
echo "🌟 启动后端服务（端口：8080）..."
mvn spring-boot:run &

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务是否启动成功
if curl -s http://localhost:8080/api/todos > /dev/null; then
    echo "✅ 后端服务启动成功！"
    echo "🌐 API 地址：http://localhost:8080"
    echo "📚 API 文档：http://localhost:8080/api/todos"
else
    echo "❌ 后端服务启动失败，请检查日志"
    exit 1
fi

echo "🎉 后端启动完成！"
