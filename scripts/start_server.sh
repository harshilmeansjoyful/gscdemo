#!/bin/bash
set -euo pipefail

echo "===== Deployment started: $(date) ====="
cd /home/ec2-user/gsc || { echo "Directory not found"; exit 1; }

# 1) Cleanup any previous build & modules
echo "[1/5] Cleaning old artifacts"
rm -rf node_modules package-lock.json build
npm cache clean --force

# 2) Install dependencies
echo "[2/5] Installing dependencies (--legacy-peer-deps)"
npm install --legacy-peer-deps

# 3) Build the application
echo "[3/5] Building for production"
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# 4) (Optional) Install PM2 globally if you’ll use it
# echo "[4/5] Installing PM2"
# npm install -g pm2

# 5) Start your server in the background and exit
echo "[4/5] Launching Express API in background on port 5000"
nohup npm start \
    > /var/log/gsc-api-$(date +%Y%m%d_%H%M%S).log 2>&1 &

echo "[5/5] Deployment finished: $(date)"
exit 0
