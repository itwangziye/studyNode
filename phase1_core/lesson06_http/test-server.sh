#!/bin/bash
# server 测试脚本 —— 启动服务器,测完所有接口,自动关闭
# 用法:bash test-server.sh
cd "$(dirname "$0")"

echo "启动服务器..."
pnpm lesson server.ts > /tmp/srv.log 2>&1 &
PID=$!
sleep 1.5

echo "=== 1. GET / (欢迎) ==="
curl -s http://localhost:3000/; echo ""

echo "=== 2. GET /tasks (初始空) ==="
curl -s http://localhost:3000/tasks; echo ""

echo "=== 3. POST /tasks (创建任务1) ==="
curl -s -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"学Node"}'; echo ""

echo "=== 4. POST /tasks (创建任务2) ==="
curl -s -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"写简历"}'; echo ""

echo "=== 5. GET /tasks (应该有2条) ==="
curl -s http://localhost:3000/tasks; echo ""

echo "=== 6. POST 坏 JSON (应该返回400,不能崩) ==="
curl -s -o /dev/null -w "状态码: %{http_code}" -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '坏数据'; echo ""

echo "=== 7. GET /tasks (坏请求后,服务器还活着,还是2条) ==="
curl -s http://localhost:3000/tasks; echo ""

echo "=== 8. 乱打路径 (应该404) ==="
curl -s -o /dev/null -w "状态码: %{http_code}" http://localhost:3000/不存在; echo ""

kill $PID 2>/dev/null; wait $PID 2>/dev/null
echo ""
echo "=== 服务器日志(如果崩溃了这里会有报错) ==="
tail -5 /tmp/srv.log
