#!/bin/bash
# Start Amis Mission CMS dev server on 0.0.0.0
set -e

cd "$(dirname "$0")"
PORT=5173

echo "=== 检查服务存活 ==="
if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/ 2>/dev/null | grep -q "200"; then
    echo "✅ 服务已存活在端口 $PORT"
    echo "   访问地址: http://localhost:$PORT/"
    echo "   外部访问: http://0.0.0.0:$PORT/"
    exit 0
fi

# Kill any existing process on the port
lsof -ti:$PORT | xargs -r kill -9 2>/dev/null || true
sleep 1

echo "=== 检查依赖 ==="
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install
else
    echo "依赖已存在"
fi

echo "=== 启动开发服务器 (0.0.0.0:$PORT) ==="
npm run dev
