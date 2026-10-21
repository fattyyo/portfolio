#!/bin/zsh
# 推上作品集並觸發整站部署（作品集是由 fattyyo.github.io 的 workflow 一起發佈的）
set -e
cd "$(dirname "$0")"
git push
gh workflow run deploy.yml -R fattyyo/fattyyo.github.io
echo "已觸發部署，約 1–2 分鐘後 https://fattyyo.com 會更新"
