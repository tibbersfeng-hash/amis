#!/bin/bash
set -e

PROJECT_DIR="/home/claude/code_space/frontend/amis-main"
PORT=8888

cd "$PROJECT_DIR"

echo "=== 检查服务存活 ==="
if lsof -i:$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    # 端口被占用，检查服务是否真正存活
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/ | grep -q "200"; then
        echo "✅ 服务已存活在端口 $PORT，无需重启"
        echo "   访问地址: http://localhost:$PORT/"
        exit 0
    else
        echo "⚠️  端口 $PORT 被占用但服务无响应，清理旧进程..."
        lsof -ti:$PORT | xargs -r kill -9 2>/dev/null || true
        sleep 1
    fi
else
    echo "端口 $PORT 空闲"
fi

echo "=== 检查依赖 ==="
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install
else
    echo "依赖已存在"
fi

echo "=== 启动开发服务器 ==="
npm run dev -- --host 0.0.0.0 --port $PORT
