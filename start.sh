#!/bin/bash

pkill -f node || true

echo "🚀 STARTING V8 SAAS CLUSTER"

node api/server.js > logs/api.log 2>&1 &

node worker/cluster.js > logs/cluster.log 2>&1 &

sleep 2

echo "=== HEALTH CHECK ==="
curl -s http://localhost:3008/health

echo "=== SYSTEM ONLINE ==="
