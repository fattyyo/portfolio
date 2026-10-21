#!/bin/zsh
# 推上作品集並觸發整站部署（作品集是由 fattyyo.github.io 的 workflow 一起發佈的）
set -e
cd "$(dirname "$0")"

# CSS / JS 網址帶版本號，瀏覽器才不會用到舊快取
V=$(date +%Y%m%d%H%M)
sed -i '' -E "s#(\./assets/(css/style\.css|js/data\.js|js/app\.js))(\?v=[0-9]+)?#\1?v=$V#g" index.html
if ! git diff --quiet index.html; then
  git commit -q -m "更新資源版本號 $V" index.html
fi

git push
gh workflow run deploy.yml -R fattyyo/fattyyo.github.io
echo "已觸發部署，約 1–2 分鐘後 https://fattyyo.com 會更新"
