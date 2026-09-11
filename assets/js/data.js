/* =====================================================================
   data.js — 全站內容都在這裡改，不用碰其他檔案
   改完存檔、重新整理瀏覽器就會生效

   雙語寫法：T('中文', 'English')
   只想寫一種語言？直接寫字串就好，兩邊會顯示同一份內容。
   ===================================================================== */

/* 雙語小工具 */
function T(zh, en) { return { zh, en }; }

/* 產生像素風佔位圖（還沒放真實照片時用）。換成真圖就寫 "./assets/img/xxx.jpg" */
function placeholder(label, colorA = '#1c2f42', colorB = '#0b1622') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 64 48">
    <rect width="64" height="48" fill="${colorB}"/>
    <g fill="${colorA}">
      ${Array.from({ length: 40 }, (_, i) => {
        const x = (i * 7) % 60, y = (i * 11) % 44;
        return `<rect x="${x}" y="${y}" width="4" height="4"/>`;
      }).join('')}
    </g>
    <rect x="2" y="2" width="60" height="44" fill="none" stroke="#2a4459" stroke-width="2"/>
    <text x="32" y="26" font-family="monospace" font-size="5" fill="#b8d4e6"
          text-anchor="middle">${label}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const SITE = {

  /* ---------------- 網站設定 ---------------- */
  /* ★ 部署後把 siteUrl 換成你真正的網址，SEO 與分享預覽才會正確 */
  siteUrl: 'https://fattyyo.github.io/portfolio',
  defaultLang: 'zh',          // 預設語言：'zh' 或 'en'

  /* ---------------- 基本資料（首頁佈告欄） ---------------- */
  profile: {
    name: 'Eric Wang',
    nameZh: '王誠佑',
    jobTitle: T('軟體工程師', 'Software Engineer'),
    tagline: T(
      '軟體工程師 | 網路系統 | 機器學習',
      'Software Engineer | Network Systems | Machine Learning'),
    description: T(
      '元智大學資訊工程學士，曾赴法國 ESME Sudria 交換。目前於 Zyxel Networks 擔任 Network Engineer Intern，' +
      '專注在 network-oriented system engineering：topology 設計、GRE / RvR 測試自動化、多執行緒與效能調校。' +
      '2026 Fall 將前往 UIUC 攻讀 MCS，長期投入軟體工程、人工智慧與機器學習。',
      'B.S. in Computer Science from Yuan Ze University, with an exchange semester at ESME Sudria in France. ' +
      'Currently a Network Engineer Intern at Zyxel Networks, focused on network-oriented system engineering: ' +
      'topology design, GRE / RvR test automation, multi-threading and performance tuning. ' +
      'Starting the MCS program at UIUC in Fall 2026, with a long-term focus on software engineering, AI and machine learning.'),

    /* 換成自己的照片：'./assets/img/avatar.jpg' */
    avatar: placeholder('AVATAR', '#24405a'),
    /* 橫幅圖；留空字串 '' 就只用 CSS 漸層背景 */
    banner: '',

    /* 首頁狀態列小卡 */
    status: [
      { label: 'NOW',      value: T('Zyxel Networks — 網路工程實習生', 'Zyxel Networks — Network Engineer Intern') },
      { label: 'NEXT',     value: T('UIUC · MCS · 2026 秋季入學', 'UIUC · MCS · Fall 2026') },
      { label: 'LOCATION', value: T('台灣 → 美國伊利諾', 'Taiwan → Illinois, USA') },
    ],
  },

  /* ---------------- 社群連結 ---------------- */
  /* icon 可用：github / linkedin / instagram / mail / globe / youtube */
  socials: [
    { label: 'GitHub',    icon: 'github',    url: 'https://github.com/fattyyo' },
    { label: 'LinkedIn',  icon: 'linkedin',  url: 'https://www.linkedin.com/in/your-id' },
    { label: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/your-id' },
    { label: 'Email',     icon: 'mail',      url: 'mailto:fattyyo0987@gmail.com' },
  ],

  /* 履歷 PDF（放進 assets/ 後填路徑，留空就不顯示下載鈕） */
  resumeUrl: '',

  /* ---------------- 導覽頁籤（順序＝左右翻頁順序） ---------------- */
  /* 不想要某頁？把整行刪掉即可 */
  nav: [
    { id: 'home',    label: T('首頁', 'Home'),     icon: 'home' },
    { id: 'me',      label: T('關於我', 'Me'),     icon: 'user' },
    { id: 'coding',  label: T('專案', 'Coding'),   icon: 'code' },
    { id: 'blog',    label: T('文章', 'Blog'),     icon: 'post' },
    { id: 'photos',  label: T('照片', 'Photos'),   icon: 'camera' },
    { id: 'videos',  label: T('影片', 'Videos'),   icon: 'video' },
    { id: 'contact', label: T('聯絡', 'Contact'),  icon: 'mail' },
  ],

  /* ---------------- 首頁拓撲圖 ----------------
     x / y 是網格座標（左上角為 0,0，範圍見下面的 cols / rows）。
     label 請用大寫英文或數字 —— 像素字體沒有中文字模，長中文會糊掉。
     state：past（已完成）/ active（現在進行）/ next（下一步）
     kind ：edu（學歷）/ work（工作）/ project（專案）
     links 是節點之間的連線，用 id 成對指定。                          */
  topology: {
    cols: 15,
    rows: 10,
    nodes: [
      {
        id: 'yzu', label: 'YZU', x: 1, y: 5, kind: 'edu', state: 'past',
        period: '2021 – 2025',
        title: T('元智大學 資訊工程', 'Yuan Ze University, CSE'),
        detail: T('資訊工程學士，GPA 3.73 / 4.0。作業系統、計算機網路、演算法、機器學習。',
                  'B.S. in Computer Science and Engineering, GPA 3.73 / 4.0. Operating systems, computer networks, algorithms, machine learning.'),
      },
      {
        id: 'esme', label: 'ESME', x: 4, y: 2, kind: 'edu', state: 'past',
        period: '2023',
        title: T('ESME Sudria 交換', 'ESME Sudria Exchange'),
        detail: T('法國巴黎一學期交換，修習工程與跨文化課程。',
                  'A semester in Paris taking engineering and cross-cultural courses.'),
      },
      {
        id: 'ticket', label: 'TICKET', x: 4, y: 8, kind: 'project', state: 'past',
        period: '2024',
        title: T('訂票系統', 'Ticketing System'),
        detail: T('C2C / C2B2C 庫存同步，以樂觀鎖與交易隔離避免 race condition。',
                  'C2C / C2B2C inventory sync, using optimistic locking and transaction isolation to avoid race conditions.'),
        href: '#/coding',
      },
      {
        id: 'zyxel', label: 'ZYXEL', x: 8, y: 5, kind: 'work', state: 'active',
        period: '2025 – 2026',
        title: T('Zyxel Networks 網路工程實習', 'Zyxel Networks, Network Engineer Intern'),
        detail: T('網路 topology 規劃、GRE 與 RvR 測試自動化，多執行緒縮短測試時間。',
                  'Network topology design, GRE and RvR test automation, multi-threading to cut test time.'),
      },
      {
        id: 'rvr', label: 'RVR', x: 11, y: 2, kind: 'project', state: 'past',
        period: '2025',
        title: T('測試自動化框架', 'Test Automation Framework'),
        detail: T('以 thread pool 並行執行測項，總耗時大幅下降。',
                  'Runs test cases in parallel with a thread pool, cutting total runtime significantly.'),
        href: '#/blog/gre-rvr-test-automation',
      },
      {
        id: 'uiuc', label: 'UIUC', x: 14, y: 5, kind: 'edu', state: 'next',
        period: '2026 –',
        title: T('UIUC 資訊科學碩士', 'UIUC, M.S. Computer Science'),
        detail: T('主修方向聚焦系統與機器學習，目標 Software / ML Engineer。',
                  'Focusing on systems and machine learning, aiming for a Software / ML Engineer role.'),
      },
    ],
    links: [
      ['yzu', 'esme'],
      ['yzu', 'ticket'],
      ['yzu', 'zyxel'],
      ['ticket', 'zyxel'],
      ['zyxel', 'rvr'],
      ['zyxel', 'uiuc'],
      ['rvr', 'uiuc'],
    ],
  },

  /* ---------------- Me：概覽三欄 ---------------- */
  overview: [
    {
      title: T('學歷', 'Education'),
      items: [
        T('UIUC — 資訊科學碩士（2026 秋 –）', 'UIUC — M.S. Computer Science (Fall 2026 –)'),
        T('元智大學 — 資訊工程學士，GPA 3.73 / 4.0', 'Yuan Ze University — B.S. CSE, GPA 3.73 / 4.0'),
        T('法國 ESME Sudria — 交換學生', 'ESME Sudria, France — Exchange Student'),
      ],
    },
    {
      title: T('經歷', 'Experience'),
      items: [
        T('Zyxel Networks — 網路工程實習生（2025–2026）', 'Zyxel Networks — Network Engineer Intern (2025–2026)'),
        T('GRE / RvR 測試自動化與多執行緒效能優化', 'GRE / RvR test automation & multi-threaded performance tuning'),
        T('訂票系統 — 高併發架構設計', 'Ticketing system — high-concurrency architecture'),
      ],
    },
    {
      title: T('技術', 'Tech Stack'),
      items: [
        'Python · C/C++ · Java · JavaScript',
        T('Linux · 網路 · 多執行緒', 'Linux · Networking · Multi-threading'),
        T('機器學習 · 系統設計', 'Machine Learning · System Design'),
      ],
    },
  ],

  /* ---------------- Coding：專案 ---------------- */
  /* tech 陣列會自動變成專案頁上方的篩選按鈕 */
  projects: [
    {
      title: T('網路測試自動化框架', 'Network Test Automation'),
      description: T(
        'Zyxel 實習期間開發的網路測試自動化框架：涵蓋 topology 佈署、GRE tunnel 與 RvR 測試流程，以多執行緒並行執行測項，顯著降低整體測試耗時。',
        'A network test automation framework built during my Zyxel internship: topology deployment, GRE tunnel and RvR test flows, running test items in parallel with multi-threading to cut total runtime significantly.'),
      tech: ['Python', 'Networking', 'Multi-threading', 'Linux'],
      links: [{ label: 'GitHub', url: 'https://github.com/fattyyo' }],
    },
    {
      title: T('訂票系統', 'Ticketing System'),
      description: T(
        '可擴展訂票系統架構，支援 C2C 與 C2B2C 庫存同步；以樂觀鎖與交易隔離避免 race condition，維持資料一致性。',
        'A scalable ticketing architecture supporting C2C and C2B2C inventory sync, using optimistic locking and transaction isolation to avoid race conditions and keep data consistent.'),
      tech: ['System Design', 'Concurrency', 'SQL', 'Backend'],
      links: [{ label: 'GitHub', url: 'https://github.com/fattyyo' }],
    },
    {
      title: T('旅遊部落格', 'Travel Blog'),
      description: T(
        '個人旅遊部落格網站，記錄各地行程、照片與心得。',
        'A personal travel blog recording trips, photos and notes from different places.'),
      tech: ['JavaScript', 'HTML/CSS', 'Static Site'],
      links: [{ label: 'Live', url: '#' }],
    },
    {
      title: T('Discord 每日簡報機器人', 'Discord Daily Brief Bot'),
      description: T(
        '每日自動彙整新聞、行程與待辦，推播到 Discord 頻道的機器人。',
        'A bot that aggregates news, schedule and to-dos every day and pushes a brief to a Discord channel.'),
      tech: ['Python', 'Discord API', 'Automation', 'Cron'],
      links: [{ label: 'GitHub', url: 'https://github.com/fattyyo' }],
    },
  ],

  /* ---------------- Blog：文章 ---------------- */
  /* slug 是網址（#/blog/my-post），只能用英數與連字號，不要重複
     body 支援簡易 Markdown：## 標題、- 清單、`程式碼`、```區塊```、[文字](網址)、**粗體**
     想連到外部文章？填 externalUrl，點了就直接開新分頁 */
  posts: [
    {
      slug: 'gre-rvr-test-automation',
      date: '2026-07-15',
      tags: ['Networking', 'Python'],
      title: T('用多執行緒把網路測試時間砍掉一半', 'Cutting Network Test Time in Half with Multi-threading'),
      excerpt: T(
        '實習期間把序列執行的 RvR 測試改成並行架構的過程，以及踩到的坑。',
        'How I turned a sequential RvR test suite into a parallel one during my internship, and what broke along the way.'),
      body: T(
`原本的測試流程是完全序列的：一個測項跑完才換下一個，跑完整套要好幾個小時。

## 問題在哪

瓶頸不是 CPU，而是**等待**。大部分時間都花在等待裝置回應、等待連線建立、等待訊號穩定。

- 單一測項的 CPU 使用率不到 5%
- 但每個測項平均要等 40 秒以上
- 測項之間其實沒有相依性

## 怎麼改

把每個測項包成獨立的 worker，用 thread pool 管理並行度：

\`\`\`python
with ThreadPoolExecutor(max_workers=8) as pool:
    futures = [pool.submit(run_case, c) for c in cases]
    results = [f.result() for f in futures]
\`\`\`

## 踩到的坑

最大的問題是**共用資源**。多個 thread 同時操作同一台測試裝置時會互相干擾，後來替每台裝置加上獨立的鎖才解決。

另外 log 輸出也要處理，不然多個 thread 的訊息會交錯在一起完全看不懂。`,
`The original test flow was fully sequential: one case had to finish before the next started, and a full run took hours.

## Where the bottleneck was

The bottleneck was not CPU, it was **waiting**. Most of the time went to waiting for device responses, waiting for links to come up, waiting for signals to settle.

- CPU usage per test case was under 5%
- But each case waited 40+ seconds on average
- Cases had no dependencies between them

## The change

Wrap each case as an independent worker and manage concurrency with a thread pool:

\`\`\`python
with ThreadPoolExecutor(max_workers=8) as pool:
    futures = [pool.submit(run_case, c) for c in cases]
    results = [f.result() for f in futures]
\`\`\`

## What broke

The biggest problem was **shared resources**. Multiple threads driving the same device interfered with each other; adding a per-device lock fixed it.

Log output needed work too, otherwise messages from different threads interleaved into something unreadable.`),
    },
    {
      slug: 'preventing-overselling',
      date: '2026-05-02',
      tags: ['System Design', 'Concurrency'],
      title: T('訂票系統怎麼避免超賣', 'How a Ticketing System Avoids Overselling'),
      excerpt: T(
        '同一秒有一千個人搶最後一張票，資料庫要怎麼確保只有一個人買到。',
        'A thousand people grab the last ticket in the same second. How does the database make sure exactly one of them gets it?'),
      body: T(
`超賣是訂票系統最經典的 race condition。

## 錯誤的做法

\`\`\`sql
SELECT stock FROM tickets WHERE id = 1;   -- 讀到 1
-- 這中間別人也讀到了 1
UPDATE tickets SET stock = 0 WHERE id = 1;
\`\`\`

兩個請求都讀到 stock = 1，兩個都覺得自己搶到了。

## 樂觀鎖

把「檢查」和「扣減」放進同一個 atomic 操作：

\`\`\`sql
UPDATE tickets SET stock = stock - 1
WHERE id = 1 AND stock > 0;
\`\`\`

看 affected rows 就知道有沒有搶到。這一行就解決了絕大部分情境，而且不需要額外的鎖。

## 什麼時候需要更重的方案

當一筆訂單牽涉多個座位、多個場次，或需要跨服務保證一致性時，才需要考慮分散式鎖或 saga。不要一開始就過度設計。`,
`Overselling is the classic race condition in ticketing systems.

## The wrong way

\`\`\`sql
SELECT stock FROM tickets WHERE id = 1;   -- reads 1
-- meanwhile another request also reads 1
UPDATE tickets SET stock = 0 WHERE id = 1;
\`\`\`

Both requests read stock = 1, and both think they won.

## Optimistic locking

Put the check and the decrement into one atomic operation:

\`\`\`sql
UPDATE tickets SET stock = stock - 1
WHERE id = 1 AND stock > 0;
\`\`\`

The affected row count tells you whether you got it. This single statement handles the vast majority of cases without any extra locking.

## When you need something heavier

Only when one order spans multiple seats or sessions, or you need consistency across services, should you reach for distributed locks or sagas. Don't over-engineer it up front.`),
    },
  ],

  /* ---------------- Photos ---------------- */
  /* src 換成 './assets/img/xxx.jpg'；category 會自動變成篩選按鈕 */
  photos: [
    { title: T('法國巴黎', 'Paris, France'), location: 'Paris',    date: '2023-04', category: 'Travel', src: placeholder('PHOTO 01') },
    { title: T('台北夜景', 'Taipei Night'),  location: 'Taipei',   date: '2024-08', category: 'City',   src: placeholder('PHOTO 02') },
    { title: T('實驗室', 'Lab Setup'),       location: 'Hsinchu',  date: '2025-06', category: 'Work',   src: placeholder('PHOTO 03') },
    { title: T('阿爾卑斯', 'Alps Trip'),     location: 'Chamonix', date: '2023-06', category: 'Travel', src: placeholder('PHOTO 04') },
    { title: T('校園', 'Campus'),            location: 'Taoyuan',  date: '2024-03', category: 'Campus', src: placeholder('PHOTO 05') },
    { title: T('夕陽', 'Sunset'),            location: 'Tainan',   date: '2025-01', category: 'Travel', src: placeholder('PHOTO 06') },
  ],

  /* ---------------- Videos ---------------- */
  /* youtubeId 填影片 ID（網址 v= 後面那段）；或用 url 外連 */
  videos: [
    { title: T('專案 Demo — 測試自動化', 'Project Demo — Test Automation'), description: T('測試自動化流程 demo', 'A walkthrough of the test automation flow'), youtubeId: '', thumb: placeholder('VIDEO 01'), url: '#' },
    { title: T('旅遊 Vlog — 法國', 'Travel Vlog — France'),                 description: T('交換生活紀錄', 'Notes from the exchange semester'),          youtubeId: '', thumb: placeholder('VIDEO 02'), url: '#' },
    { title: T('技術分享', 'Tech Talk'),                                     description: T('技術分享片段', 'A clip from a tech talk'),                   youtubeId: '', thumb: placeholder('VIDEO 03'), url: '#' },
  ],

  /* ---------------- Contact ---------------- */
  contact: {
    body: T(
      '對合作、實習或任何技術討論有興趣，歡迎直接來信或從下面的連結找到我。',
      'Interested in collaborating, hiring, or just talking shop? Email me or find me through the links below.'),
  },

  /* ---------------- 開機動畫文字 ---------------- */
  bootLines: [
    'PIXEL OS v1.0 — booting...',
    'loading profile ............ OK',
    'mounting /projects ......... OK',
    'init crt display ........... OK',
    'ready.',
  ],
};

/* =====================================================================
   介面文字（頁面標題、按鈕等）。想改措辭就改這裡
   ===================================================================== */
const UI = {
  subtitle: {
    me:      T('生涯拓撲與完整記錄', 'Career Topology & Full Record'),
    coding:  T('精選專案', 'Selected Projects'),
    blog:    T('文章與筆記', 'Writing & Notes'),
    photos:  T('攝影作品', 'Photography Collection'),
    videos:  T('影片收藏', 'Video Collection'),
    contact: T('打聲招呼', 'Say Hello'),
  },
  all:            T('全部', 'All'),
  noData:         T('沒有資料', 'No data'),
  emptyHint:      T('去 data.js 補一筆就會出現在這裡。', 'Add an entry in data.js and it will show up here.'),
  backToList:     T('← 回文章列表', '← Back to posts'),
  readMore:       T('閱讀全文', 'Read post'),
  openLink:       T('開啟連結', 'Open link'),
  downloadResume: T('下載履歷', 'Download résumé'),
  startPromptDesktop: T('用 ← → 方向鍵翻頁，按 ? 看快捷鍵', 'Use ← → to turn pages, press ? for shortcuts'),
  startPromptMobile:  T('往下滑，或點下方選單', 'Scroll down, or use the menu below'),
  shortcuts:      T('鍵盤快捷鍵', 'Keyboard Shortcuts'),
  mapTitle:       T('生涯拓撲圖', 'Career Topology'),
  mapHint:        T('點節點看細節', 'Select a node for details'),
  traceTitle:     T('路徑追蹤', 'Traceroute'),
  nodeKind:       { edu: T('學歷', 'Education'), work: T('工作', 'Work'), project: T('專案', 'Project') },
  nodeState:      { past: T('已完成', 'Completed'), active: T('進行中', 'Active'), next: T('下一跳', 'Next hop') },
  linkStatus:     T('連線狀態', 'Link status'),
  goTo:           T('前往', 'Open'),
  langLabel:      T('EN', '中'),
  langAria:       T('Switch to English', '切換為中文'),
  postNotFound:   T('找不到這篇文章', 'Post not found'),
};
