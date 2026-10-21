# Eric Wang — Portfolio

個人網站，線上網址：**https://fattyyo.github.io/portfolio/**

**零建置**：純 HTML + CSS + 原生 JS，沒有框架、沒有 npm。雙擊 `index.html` 或起一個本機伺服器就能看：

```bash
python3 -m http.server 8080   # 然後開 http://localhost:8080
```

---

## 設計概念：Rate vs. Range

在 Zyxel 實習時做的是 Wi-Fi AP 的 **RvR（Rate vs. Range）測試** —— 量訊號隨距離衰減的曲線。
整個網站把這個測試「跑在自己身上」：

| 區塊 | 做了什麼 |
|---|---|
| Hero | 點陣訊號場：一個固定 AP 與游標兩個波源互相干涉；游標旁顯示估算的 dBm 與距離（自由空間路徑損耗公式） |
| Statement | 一段大字，隨捲動逐字點亮 |
| 01 Rate vs. Range | 捲動驅動的圖表：x 軸是離家實際距離（km，對數，用經緯度算），y 軸是時間；線畫到哪一站，右邊的大數字與卡片就跟著換 |
| 02 Selected work | 作品列表；桌機滑過會有跟著游標的生成圖預覽，點開看細節。每件作品的圖都是程式畫的 SVG（RvR 曲線、24h 錶盤、Tomasulo 甘特圖…），不需要照片 |
| 數字 | 進入畫面時往上數 |
| 03 About / Contact | 技術、工作以外；頁尾米白底大字信箱、跑馬燈 |

其他細節：開場 -90 → -30 dBm 載入動畫（每個分頁只播一次）、自訂游標與磁吸按鈕、Champaign 即時時鐘、中英切換（按 `L`）。

**配色規則**：`--signal`（螢光黃綠）只給「訊號」與目前狀態，不要到處用。

字體：Instrument Serif（標題）、Geist / Geist Mono（內文、數據標籤），中文落到 Noto Serif TC / Noto Sans TC。

---

## 改內容

**只要改 `assets/js/data.js`。**

> ★ 內容以履歷 `~/Documents/26'UIUC/Resume_US/resume_data.js` 為準。不要寫沒做過的事。

| 想改什麼 | `data.js` 裡的哪一段 |
|---|---|
| 名字、一句話介紹、狀態、時區 | `profile` |
| 首頁那段大字（`*星號*` = 強調色） | `statement` |
| 信箱、社群連結 | `email`、`socials` |
| 履歷下載鈕 | `resumeUrl`（⚠ 履歷有電話，公開前確認） |
| Rate vs. Range 的每一站 | `path.stops`（`lat` / `lng` 決定距離） |
| 作品 | `work`（`art` 選生成圖：`rvr` / `bot` / `tomasulo` / `vision` / `covid`） |
| 數字 | `stats` |
| 關於 | `about` |
| 介面文字 | 最下面的 `UI` |

雙語寫法：`T('中文', 'English')`；只寫字串就兩邊共用。
語言預設依瀏覽器（`defaultLang: 'auto'`），使用者切換後會記住。

---

## 部署

GitHub Pages 從 `main` 分支根目錄發佈：

```bash
git add -A && git commit -m "更新內容" && git push
```

換網域時要同步改：`data.js` 的 `siteUrl`、`index.html` 的 `canonical` / `og:url` / `og:image`、`robots.txt`、`sitemap.xml`。

分享預覽圖是 `assets/img/og.png`（1200×630）。

---

## 無障礙與效能

- 尊重 `prefers-reduced-motion`：關掉所有動畫，內容直接顯示
- 游標特效只在有滑鼠的裝置啟用；觸控裝置看到的是點開後的內嵌圖
- 作品列表是 `<button aria-expanded>`，鍵盤可完整操作；有 skip link
- 訊號場在畫面外或分頁隱藏時暫停；裝置像素比上限 2
- 實測：1440 / 820 / 390 寬沒有水平捲動；2x 螢幕上 hero 60fps
