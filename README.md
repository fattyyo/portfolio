# Pixel Profile — 個人形象網站模板

**工程藍圖 / 儀器面板**風格的個人網站模板。深製圖藍底、製圖定位十字，
首頁與「關於我」是一張可互動的生涯拓撲圖。

字體用 **B612**（Airbus 為飛機駕駛艙儀表開發的字體，設計目標是眩光與震動下的判讀正確率）
配 **B612 Mono**，中文明確指定 **昭源黑體 Chiron Hei HK** —— 不靠使用者的系統字體，
所以在 Mac / Windows / Android 上長得一樣。
**零建置**：純 HTML + CSS + 原生 JS，沒有 npm、沒有打包，雙擊 `index.html` 就能看。

---

## 快速開始

```bash
# 方式 A：直接開檔
open index.html

# 方式 B：起一個本機伺服器（建議，避免瀏覽器擋本機檔案）
python3 -m http.server 8080
# 然後開 http://localhost:8080
```

---

## 怎麼改內容

**只要改一個檔案：`assets/js/data.js`**。其他檔案都不用碰。

> **還沒填的東西**：`data.js` 的 `socials` 裡，LinkedIn 與 Instagram 還是
> `your-id` 佔位字串，上線後那兩個連結是壞的，記得填掉。
> 專案的 GitHub 連結目前都指向個人頁，之後可以改成各自的 repo。

| 想改什麼 | 改 `data.js` 裡的哪一段 |
|---|---|
| 網址、預設語言 | `siteUrl`、`defaultLang` |
| 名字、標語、自我介紹、大頭照 | `profile` |
| 首頁三個狀態小卡（NOW / NEXT / LOCATION） | `profile.status` |
| GitHub / LinkedIn / IG / Email 連結 | `socials` |
| 有哪些頁籤、順序 | `nav`（刪掉整行就少一頁） |
| 學歷 / 經歷 / 技能三欄 | `overview` |
| 生涯拓撲圖（節點與連線） | `topology` |
| 專案卡片 | `projects` |
| 文章 | `posts` |
| 履歷 PDF 連結 | `resumeUrl` |
| 照片牆 | `photos` |
| 影片牆 | `videos` |
| 開機動畫文字 | `bootLines` |
| 頁面標題、按鈕等介面文字 | 檔案最下面的 `UI` |

### 寫成中英雙語

任何文字都可以寫成 `T('中文', 'English')`，網站右上角的按鈕（或按 `L`）就能切換，
選擇會記在瀏覽器裡。只想寫一種語言的話，直接寫字串就好，兩邊會顯示同一份內容。

```js
tagline: T('軟體工程師 | 網路系統', 'Software Engineer | Network Systems'),
location: 'Taipei',   // 不需要翻譯的就直接寫
```

### 寫文章

在 `posts` 加一筆，`slug` 就是網址（`#/blog/你的-slug`），可以單獨分享：

```js
{
  slug: 'my-first-post',
  date: '2026-09-01',
  tags: ['Python'],
  title: T('標題', 'Title'),
  excerpt: T('列表上顯示的摘要', 'Summary shown in the list'),
  body: T(`內文...`, `Body...`),
}
```

`body` 支援簡易 Markdown：`## 標題`、`### 小標`、`- 清單`、`` `程式碼` ``、
` ```程式碼區塊``` `、`[文字](網址)`、`**粗體**`。

想連到站外文章（例如 Medium、iThome）就改填 `externalUrl`，點了直接開新分頁。

### 放履歷

把 PDF 丟進 `assets/`，然後填 `resumeUrl: './assets/resume.pdf'`，
首頁和聯絡頁就會多一顆下載鈕。留空字串則不顯示。

瀏覽器直接列印（Cmd+P）也有專用樣式，會自動隱藏掃描線、導覽列等裝飾。

### 換照片

1. 把圖片丟進 `assets/img/`
2. 在 `data.js` 把 `placeholder('PHOTO 01')` 換成 `'./assets/img/你的檔名.jpg'`

大頭照同理：`avatar: './assets/img/avatar.jpg'`。
橫幅圖 `banner` 留空字串 `''` 就會用 CSS 漸層背景。

### 放 YouTube 影片

在 `videos` 那筆填 `youtubeId`（網址 `?v=` 後面那串），縮圖會自動抓，點下去直接在燈箱內播放。

---

## 改生涯拓撲圖

首頁和「關於我」共用 `data.js` 的 `topology`。加一個節點：

```js
{
  id: 'newco', label: 'NEWCO',      // label 必須是大寫英數 —— 像素字沒有中文字模
  x: 17, y: 5,                      // 網格座標，視野會自動貼合
  kind: 'work',                     // edu / work / project → 決定形狀
  state: 'active',                  // past / active / next → 決定顏色
  period: '2027 –',
  title: T('新公司', 'New Company'),
  detail: T('在做什麼', 'What you do there'),
  href: '#/coding',                 // 選填，點了會跳過去
}
```

再到 `links` 加一組連線：`['uiuc', 'newco']`。走線是自動算出來的直角路徑，
不用自己排。

---

## 換配色

改 `assets/css/style.css` 最上面的 `:root`，整站會一起變：

```css
--bg-dark:   #0b1622;   /* 製圖檯面 */
--bg-medium: #12212f;   /* 面板 */
--accent:    #b8d4e6;   /* 結構色：藍圖墨 */
--signal:    #7ee0a8;   /* 唯一的飽和色，只給「活著」的節點與連線 */
```

**`--signal` 請節制使用。** 它之所以有意義，是因為整站只有「進行中」和
「下一跳」是綠的。到處都綠就等於沒有重點。

幾組可以直接貼的替代配色：

| 主題 | `--bg-dark` | `--bg-medium` | `--accent` | `--signal` |
|---|---|---|---|---|
| 曬圖紙（淺色） | `#e8e4d9` | `#f5f2ea` | `#2c3c52` | `#b3261e` |
| 石墨 | `#141414` | `#1e1e1e` | `#c8c8c8` | `#e8b33d` |
| 深海 | `#0a1a1c` | `#11282b` | `#9dc9cc` | `#ff8a5b` |

> 換成淺色底時記得一併檢查 `--white` / `--gray` 這些文字色，
> 不然對比度會不夠。

---

## 部署

網站已經上線在 **https://fattyyo.github.io/portfolio/**

之後要更新內容，改完檔案後：

```bash
cd ~/Documents/pixel-profile-site
git add -A
git commit -m "更新內容"
git push
```

推上去後約一分鐘，GitHub Pages 會自動重新部署。

### 換網域

想綁自己的網域（例如 `ericwang.com`）：

1. 在專案根目錄新增一個名為 `CNAME` 的檔案，裡面只寫網域名稱
2. DNS 設一筆 CNAME 指到 `fattyyo.github.io`
3. **記得同步改這四個地方的網址**，否則 SEO 與分享預覽會指到舊位置：
   - `assets/js/data.js` 的 `siteUrl`
   - `index.html` 的 `canonical`、`og:url`、`og:image`
   - `robots.txt` 的 `Sitemap:`
   - `sitemap.xml` 的 `<loc>`

## 功能一覽

- 生涯拓撲圖：直角走線、可鍵盤操作的節點、手機自動收合成 `traceroute`
- 中英雙語切換，選擇會記住（右上角按鈕，或按 `L`）
- Hash 路由多頁切換（`#/home`、`#/blog/slug`…），可直接分享單頁連結
- 文章系統，支援簡易 Markdown 與站外連結
- 專案可依技術標籤篩選（點卡片上的標籤也能篩）
- 每頁自動更新 title / description / og / canonical
- JSON-LD `Person` 結構化資料、`robots.txt`、`sitemap.xml`
- 開機動畫（每個瀏覽器分頁只播一次，點一下可跳過）
- CRT 掃描線 + 像素網格 + 暈影疊層
- 儀器面板首頁、完整生涯記錄、專案卡、照片牆、影片牆
- 照片／影片燈箱，Esc 關閉、Tab 焦點鎖在視窗內、關閉後焦點回到原按鈕
- 按 `?` 顯示鍵盤快捷鍵；Konami code 有彩蛋
- 分類篩選（時間軸、照片）
- 點擊像素粒子爆炸特效
- 鍵盤 ← → 翻頁、Tab 可完整操作、有 skip link
- RWD：桌機／平板／手機 375px 都測過，所有觸控區 ≥44px
- 尊重 `prefers-reduced-motion`（會關掉所有動畫）
- 無痕模式／封鎖網站資料時仍可正常瀏覽

---

## 檔案結構

```
pixel-profile-site/
├── index.html              ← 外殼，幾乎不用改（部署後要改 canonical / og:url）
├── robots.txt              ← 部署後要改網址
├── sitemap.xml             ← 部署後要改網址
├── README.md
└── assets/
    ├── css/style.css       ← 樣式與配色 token
    ├── js/data.js          ← ★ 你要改的就是這支
    ├── js/app.js           ← 路由與渲染邏輯
    └── img/
        └── og.png          ← 分享到 IG / LINE / Twitter 時的預覽圖
```

---

## 已知限制

網站用的是 hash 路由（`#/me`），所以 Google 實際上只會收錄首頁一頁，
子頁面不會各自出現在搜尋結果裡。這是為了讓整包檔案「雙擊就能開、丟哪都能跑」
所做的取捨。

如果你之後希望每一頁都被獨立收錄，要改成 History API 路由
（真實網址 `/me`、`/coding`）並加一個 `404.html` 轉址，
代價是不能再直接用 `file://` 開啟，而且換網域時要重設 base path。


---

## 設計說明

視覺語源是 **80–90 年代的網管主控台（NOC）**：那年代的網路拓撲圖本來就是
方塊節點、直角走線、磷光綠標示 link up。所以像素風不是懷舊裝飾，
是把這個語彙放回它原本的語境。

三條規則，改東西時請守住：

1. **走線只用直角。** 沒有貝茲曲線。這既是像素風的必然，也是真實網路圖的畫法。
2. **`--signal` 綠只給「活著」的東西。** 結構一律用 `--accent` 藍圖墨。
3. **顯示字體（B612）給大寫英數短標籤，中文一律靠字體堆疊落到 Noto Sans TC。**
   `:root[lang="zh-TW"]` 那一段負責把中文字級放大一階，新增元件記得比照辦理。


---

## 換字體

英文與中文分開指定，改 `assets/css/style.css` 的 `:root`：

```css
--font-display: "B612", "Chiron Hei HK", "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif;
--font-mono:    "B612 Mono", "Chiron Hei HK", "PingFang TC", "Microsoft JhengHei", ui-monospace, monospace;
```

中文字體放在堆疊的**第二順位**：英文字體沒有中文字模，漢字就會自動落到它。
後面的蘋方／微軟正黑是保險 —— webfont 載入失敗時還有正常的中文可看。
換中文字體只要改這兩行的 `"Chiron Hei HK"`，並同步更新 `index.html` 的 Google Fonts 連結。

搭配 B612 實測過的中文字體：

| 字體 | 類型 | 說明 |
|---|---|---|
| `Chiron Hei HK` | 黑體 | **目前使用。**昭源黑體，字面略寬、筆畫更挺，跟 B612 的骨架合 |
| `Noto Sans TC` | 黑體 | 最中性、覆蓋字數最多，最安全，但也最常見 |
| `Chiron Sung HK` | 宋體 | 昭源宋體。跟無襯線標籤形成對比，文章頁好看 |
| `Noto Serif TC` | 宋體 | 更接近印刷書籍。小字級橫畫偏細，深色底要留意 |

**不要用這兩個**：`Zen Kaku Gothic New` 是日文字體（「令」「骨」是日文寫法，
台灣用字可能缺字）；`LXGW WenKai TC` 字形正確但是楷體，跟儀器面板的語境會打架。

> 換英文字體時記得**重新檢查字級**。像素字體（例如 Silkscreen）要設得極小，
> 一般字體則不用 —— 直接沿用舊字級會導致整站標籤小到看不清楚。

> 註：Chrome 開發者工具會把昭源黑體回報成 `Chiron Hei HK ExtraLight`，
> 那是 Google 提供的字型檔內部命名，不是實際算繪的粗細 —— 400 / 500 / 700 都正常生效。
