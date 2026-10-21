/* =====================================================================
   data.js — 全站內容都在這裡改，不用碰其他檔案
   改完存檔、重新整理瀏覽器就會生效

   雙語寫法：T('中文', 'English')
   只想寫一種語言？直接寫字串就好，兩邊會顯示同一份內容。

   ★ 內容一律以履歷（~/Documents/26'UIUC/Resume_US/resume_data.js）為準，
     不要寫沒做過的事 —— 面試會被追問。
   ===================================================================== */

/* 雙語小工具 */
function T(zh, en) { return { zh, en }; }

const SITE = {

  /* ---------------- 網站設定 ---------------- */
  siteUrl: 'https://fattyyo.github.io/portfolio',
  /* 'auto' = 依瀏覽器語言（中文介面顯示中文，其他顯示英文） */
  defaultLang: 'auto',

  /* ---------------- 基本資料 ---------------- */
  profile: {
    name: 'Eric Wang',
    nameZh: '王誠佑',
    legalName: 'Cheng-Yu Wang',
    jobTitle: T('軟體工程師', 'Software Engineer'),
    /* 首頁大標下方那句 */
    role: T(
      '軟體工程師。先量測，再讓它變快。',
      'Software engineer who measures first, then makes it faster.'),
    /* 首頁右下的狀態列；timezone 決定即時時鐘 */
    city: 'Champaign, IL',
    timezone: 'America/Chicago',
    now:  T('UIUC 資訊科學碩士（MCS）', 'M.C.S. at UIUC'),
    open: T('尋找 2027 暑期實習', 'Open to Summer 2027 internships'),
  },

  /* 首頁下方那段大字。用 *星號* 包起來的字會用強調色 */
  statement: T(
    '我在 Zyxel 對企業級 Wi-Fi AP 跑過 *150 多次*效能測試，抓出韌體之間最高 *35%* 的 throughput 退化。從那之後，我寫程式的習慣都一樣：*先量測*，找到真正的瓶頸，再動手。',
    'At Zyxel I ran *150+ performance tests* on enterprise Wi-Fi access points and caught throughput regressions of up to *35%* between firmware builds. I still work the same way: *measure first*, find the real bottleneck, then build.'),

  /* ---------------- 社群連結 ---------------- */
  email: 'wangchengyu2002@gmail.com',
  socials: [
    { label: 'GitHub',   url: 'https://github.com/fattyyo' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/cheng-yu-eric-wang' },
    { label: T('旅遊部落格', 'Travel blog'), url: 'https://fattyyo.github.io' },
  ],

  /* 履歷 PDF（放進 assets/ 後填路徑，留空就不顯示下載鈕）
     ⚠ 履歷上有電話，公開前先確認 */
  resumeUrl: '',

  /* ---------------- Rate vs. Range：生涯路徑 ----------------
     lat / lng 用來算離家（第一個點）的實際距離，圖上的 x 軸就是這個距離。
     依時間順序排。                                                    */
  path: {
    title: T('Rate vs. Range', 'Rate vs. Range'),
    lede: T(
      '在 Zyxel，我量的是訊號隨距離衰減的曲線（RvR）。這張圖是同一個測試，跑在我自己身上。',
      'At Zyxel I plotted how a signal holds up as range grows (RvR). This is the same test, run on me.'),
    stops: [
      {
        id: 'yzu', place: 'Taoyuan', lat: 24.970, lng: 121.267, year: '2020',
        period: T('2020.09 – 2024.06', 'Sep 2020 – Jun 2024'),
        title: T('元智大學 資訊工程學士', 'B.S. Computer Science, Yuan Ze University'),
        detail: T('GPA 3.73 / 4.0。資料結構、演算法、作業系統、計算機網路、計算機組織。校網球隊四年。',
                  'GPA 3.73 / 4.0. Data structures, algorithms, operating systems, networks, computer organization. Four years on the varsity tennis team.'),
      },
      {
        id: 'zyxel', place: 'Hsinchu', lat: 24.781, lng: 121.007, year: '2023',
        period: T('2023.02 – 2024.01', 'Feb 2023 – Jan 2024'),
        title: T('Zyxel Networks 實習生（Wireless Business Center）', 'Zyxel Networks — Intern, Wireless Business Center'),
        detail: T('企業級 Wi-Fi AP 的 RvR、throughput、latency 與 GRE tunnel 測試；把測試重現性提高 90% 以上。',
                  'RvR, throughput, latency and GRE-tunnel testing on enterprise Wi-Fi APs; raised test repeatability by 90%+.'),
      },
      {
        id: 'esme', place: 'Paris', lat: 48.814, lng: 2.391, year: '2024',
        period: T('2024.01 – 2024.06', 'Jan – Jun 2024'),
        title: T('法國 ESME Sudria 交換', 'Exchange semester, ESME Sudria'),
        detail: T('在巴黎待了一學期，順路走了歐洲十幾個國家。',
                  'A semester in Paris, and a dozen-plus European countries on the side.'),
      },
      {
        id: 'prep', place: 'Taoyuan', lat: 24.993, lng: 121.301, year: '2025',
        period: T('2024.07 – 2026.08', 'Jul 2024 – Aug 2026'),
        title: T('研究所準備與自主專案', 'Grad-school prep & self-directed builds'),
        detail: T('全職準備研究所申請，同時做了 Daily Brief Bot 和旅遊部落格。',
                  'Full-time grad-school preparation, while building the Daily Brief Bot and a travel blog.'),
      },
      {
        id: 'uiuc', place: 'Champaign', lat: 40.110, lng: -88.228, year: '2026',
        period: T('2026.08 – 2028.05（預計）', 'Aug 2026 – May 2028 (expected)'),
        title: T('UIUC 資訊科學碩士（MCS）', 'Master of Computer Science, UIUC'),
        detail: T('系統與機器學習方向，目標 Software / ML Engineer。',
                  'Focused on systems and machine learning, aiming for software and ML engineering roles.'),
        current: true,
      },
    ],
  },

  /* ---------------- 作品 ----------------
     art 決定滑過時浮出的那張生成圖：rvr / bot / tomasulo / vision / covid
     links 留空陣列就不顯示連結                                        */
  work: [
    {
      id: 'rvr', art: 'rvr', year: '2023',
      title: T('Wi-Fi 效能測試', 'Wi-Fi Performance Testing'),
      kind: T('Zyxel Networks · 實習', 'Zyxel Networks · Internship'),
      tags: ['RvR', 'GRE', 'Python', T('網路拓撲', 'Topology')],
      summary: T(
        '在企業級 AP 上跑 RvR、throughput、latency、多版本韌體比較與 GRE tunnel 穩定度測試，並沿著拓撲追封包路徑找根因。',
        'Rate-vs-Range, throughput, latency, multi-firmware and GRE-tunnel stability testing on enterprise access points, tracing packet paths across topologies to isolate root causes.'),
      points: [
        T('150+ 次效能測試，抓出韌體間最高 35% 的 throughput 退化，協助 R&D 追到設定錯誤與驅動問題', '150+ performance tests; caught throughput regressions of up to 35% between firmware builds, helping R&D trace config and driver bugs'),
        T('統一 RF 干擾環境、固定網路拓撲、改良自動化腳本，測試重現性提高 90% 以上', 'Standardized the RF environment, fixed the topology and refined automation scripts — 90%+ better repeatability'),
        T('自製資料處理與視覺化工具，產出 40+ 份比較報告，判讀時間減少 50% 以上', 'Built data processing and visualization tooling behind 40+ comparison reports, cutting interpretation time by 50%+'),
      ],
      links: [],
    },
    {
      id: 'bot', art: 'bot', year: '2026',
      title: T('Daily Brief Bot', 'Daily Brief Bot'),
      kind: T('個人專案 · 24/7 運行中', 'Personal project · running 24/7'),
      tags: ['Python', 'LLM', 'Google APIs', 'Playwright'],
      summary: T(
        '用 LLM 解析自然語言的 Discord 助理：直接用一句話新增、查詢、刪除 Google 行事曆與待辦，每天定時送出整合行事曆、待辦與 Gmail 的簡報。',
        'A Discord assistant that turns plain sentences into Google Calendar and Tasks actions via an LLM, and sends a scheduled daily brief combining Calendar, Tasks and Gmail.'),
      points: [
        T('背景服務常駐、自動重啟、授權過期處理、刪除前確認、失敗告警與退避', 'Supervised service with auto-restart, auth-expiry handling, confirm-before-delete, and alerting with backoff'),
        T('Headless Chromium 監控網頁，重用瀏覽器實例讓抓取延遲從 1.8s 降到 0.9s', 'Headless-Chromium monitor; reusing one browser instance cut fetch latency from 1.8s to 0.9s'),
      ],
      links: [{ label: 'GitHub', url: 'https://github.com/fattyyo/daily-brief-bot' }],
    },
    {
      id: 'tomasulo', art: 'tomasulo', year: '2022',
      title: T('Tomasulo 亂序執行模擬器', 'Tomasulo Out-of-Order Simulator'),
      kind: T('計算機組織 · C++', 'Computer architecture · C++'),
      tags: ['C++', T('計算機架構', 'Architecture')],
      summary: T(
        '逐週期模擬 Tomasulo 演算法：reservation station、register alias table、結果廣播，處理 RAW / WAR / WAW 危障與動態排程。',
        'A cycle-by-cycle simulator of Tomasulo’s algorithm — reservation stations, a register alias table and result broadcast, resolving RAW / WAR / WAW hazards with dynamic scheduling.'),
      points: [
        T('另一個姊妹專案：8 狀態飽和計數器的 history-based branch predictor', 'Sibling project: a history-based branch predictor with 8-state saturating counters'),
      ],
      links: [
        { label: 'Tomasulo', url: 'https://github.com/fattyyo/tomasulo-simulator' },
        { label: 'Branch predictor', url: 'https://github.com/fattyyo/branch-predictor-simulator' },
      ],
    },
    {
      id: 'vision', art: 'vision', year: '2022',
      title: T('語音控制視覺追蹤車', 'Voice-Controlled Vision Robot'),
      kind: T('Raspberry Pi · OpenCV · TensorFlow', 'Raspberry Pi · OpenCV · TensorFlow'),
      tags: ['Python', 'OpenCV', 'TensorFlow', 'Raspberry Pi'],
      summary: T(
        '結合 Google 語音辨識與 OpenCV / TensorFlow 物件偵測、顏色追蹤的自走車。',
        'An autonomous car combining Google Speech Recognition with OpenCV / TensorFlow object detection and color tracking.'),
      points: [
        T('語音與視覺推論用多執行緒加非同步佇列解耦，互不拖慢', 'Decoupled speech and vision inference with threads and an async queue so neither stalls the other'),
        T('Watchdog 自動重啟掛掉的模組，長時間運行也穩定', 'A watchdog restarts failed modules for long-running stability'),
      ],
      links: [],
    },
    {
      id: 'covid', art: 'covid', year: '2023',
      title: T('COVID-19 資料管線', 'COVID-19 Data Pipeline'),
      kind: T('爬蟲 · 資料視覺化', 'Scraping · Visualization'),
      tags: ['Selenium', 'BeautifulSoup', 'Pandas'],
      summary: T(
        '雙引擎爬蟲收集 23 個地區、三年份的每日病例資料，用顯式等待與頁面同步消除空值與錯誤紀錄，再用 Pandas 與 Matplotlib 畫出趨勢。',
        'A dual-engine crawler collecting three years of daily case data across 23 regions, using explicit waits and page-load sync to eliminate null and bad records, then charting trends with Pandas and Matplotlib.'),
      points: [],
      links: [],
    },
  ],

  /* ---------------- 數字 ---------------- */
  stats: [
    { value: 150, suffix: '+', label: T('次 Wi-Fi AP 效能測試', 'Wi-Fi AP performance tests') },
    { value: 35,  suffix: '%', label: T('抓到的最大 throughput 退化', 'largest throughput regression caught') },
    { value: 90,  suffix: '%+', label: T('測試重現性提升', 'gain in test repeatability') },
    { value: 40,  suffix: '+', label: T('份效能比較報告', 'performance comparison reports') },
  ],

  /* ---------------- 關於 ---------------- */
  about: {
    body: T(
      '我是王誠佑，台灣人，現在在 UIUC 念 MCS。大學在元智讀資工，中間去巴黎交換一學期。我喜歡那種「數字會說話」的工作：測試、效能、系統，以及越來越多的機器學習。',
      'I’m Cheng-Yu — Eric — from Taiwan, now doing an M.C.S. at UIUC. I studied CS at Yuan Ze University with a semester in Paris. I like work where the numbers do the talking: testing, performance, systems, and increasingly, machine learning.'),
    stack: [
      { label: T('語言', 'Languages'),      items: 'Python, C++, Java, JavaScript, HTML/CSS' },
      { label: T('ML 與資料', 'ML & data'), items: 'TensorFlow, OpenCV, Pandas, Matplotlib' },
      { label: T('系統與工具', 'Systems'),   items: 'Linux, Git, multithreading, REST, OAuth 2.0, Playwright' },
      { label: T('網路', 'Networking'),     items: 'RvR, throughput & latency testing, GRE, topology' },
    ],
    off: [
      { k: T('網球', 'Tennis'),
        v: T('全國大專網球雙打冠軍（UTR 7.0 組）、單打季軍（UTR 4.0 組）', 'National collegiate doubles champion (UTR 7.0) and singles bronze (UTR 4.0)') },
      { k: T('旅行', 'Travel'),
        v: T('交換那半年走了歐洲十幾國，攻略都寫在部落格', 'A dozen-plus European countries during the exchange — notes on the blog'),
        url: 'https://fattyyo.github.io' },
    ],
  },

  contact: {
    kicker: T('打聲招呼', 'Say hello'),
    body: T(
      '實習、合作，或只是想聊聊測試與系統，都歡迎來信。',
      'Internships, collaborations, or just talking shop about testing and systems — my inbox is open.'),
  },
};

/* =====================================================================
   介面文字。想改措辭就改這裡
   ===================================================================== */
const UI = {
  nav:        { work: T('作品', 'Work'), path: T('路徑', 'Path'), about: T('關於', 'About'), contact: T('聯絡', 'Contact') },
  skip:       T('跳至主要內容', 'Skip to content'),
  langLabel:  T('EN', '中'),
  langAria:   T('Switch to English', '切換為中文'),
  scroll:     T('往下捲', 'Scroll'),
  localTime:  T('當地時間', 'Local time'),
  workTitle:  T('作品', 'Selected work'),
  workCount:  T('件', 'projects'),
  pathAxisX:  T('距離家鄉（km，對數）', 'Distance from home (km, log)'),
  pathAxisY:  T('年份', 'Year'),
  pathNow:    T('目前位置', 'You are here'),
  pathRead:   T('離家距離', 'Distance from home'),
  aboutTitle: T('關於', 'About'),
  stackTitle: T('技術', 'Toolkit'),
  offTitle:   T('工作以外', 'Off the clock'),
  copy:       T('複製信箱', 'Copy email'),
  copied:     T('已複製', 'Copied'),
  open:       T('展開', 'Expand'),
  close:      T('收合', 'Collapse'),
  resume:     T('下載履歷', 'Résumé'),
  backTop:    T('回到頂端', 'Back to top'),
  colophon:   T('以 Instrument Serif、Geist 排版。手寫 HTML / CSS / JS，沒有框架。',
                'Set in Instrument Serif & Geist. Hand-written HTML, CSS and JS — no framework.'),
  boot:       T('量測訊號中', 'Measuring signal'),
};
