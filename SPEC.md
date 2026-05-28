# Daily Six — 技術規格書

> 基於 Ivy Lee Method 的 Chrome Side Panel 擴充功能

| 項目 | 內容 |
|---|---|
| 版本 | 0.1.0 (draft) |
| 日期 | 2026-05-25 |
| 作者 | Shawn Yeh |
| 狀態 | 規格草案，待原型驗證後進入實作 |
| 目標瀏覽器 | Chrome / Chromium 114+（Side Panel API 最低需求） |
| Manifest 版本 | V3 |
| 技術堆疊 | React 18 + Vite 5 + TypeScript（建議） |

---

## 0. 名詞定義

| 術語 | 說明 |
|---|---|
| **Ivy Lee Method** | 1918 年由顧問 Ivy Lee 提出的生產力法則：每晚寫下隔日 6 項最重要任務、按優先級排序、隔天從第 1 項開始依序完成、不允許跳號。 |
| **規劃階段 (Planning Phase)** | 使用者輸入當日 6 項任務、可拖曳排序，但尚未開始執行任何任務的狀態。 |
| **焦點階段 (Focus Phase)** | 至少有 1 項任務的鎖定狀態被解除（或被勾選完成），此時禁止重新排序，且只有「下一項待辦」可操作。 |
| **Active Task** | 焦點階段中，當前唯一可操作（可勾選完成）的任務 — 即清單中**順序最前且未完成**的任務。 |
| **Locked Task** | Active Task 之後尚未輪到的任務，UI 上以淡化、上鎖圖示呈現，無法點擊勾選。 |
| **Rollover（隔日轉移）** | 跨日後，前一日未完成任務搬移到當日清單的流程。 |

---

## 1. 產品概述

### 1.1 為什麼是 Ivy Lee Method？
- **單點焦點**：每次只做一件事，避免多工切換成本
- **強制取捨**：上限 6 項，逼使用者面對「什麼才是真正重要」
- **每晚收尾**：當日結束時規劃隔日，把決策成本前移
- **無情接力**：未完成的就是未完成，明天再決定要不要繼續

### 1.2 為什麼是 Side Panel？
- **不打擾**：和 Popup 不同，不會在點擊外部時自動關閉，適合長時間參考
- **不霸佔新分頁**：和 New Tab 覆寫不同，不會干擾既有工作流
- **可隨開隨關**：Chrome 114+ 提供原生 `chrome.sidePanel` API，使用者可主動釘住
- **天然狹長版面**：適合「任務清單」這種垂直排列的內容

### 1.3 不在範圍內（v1）
- 跨裝置同步（v1 用 `chrome.storage.local`，未來可遷移至 `chrome.storage.sync`）
- 任務拆解、子任務、Tag、Project
- 行事曆整合、第三方 API
- 統計圖表 / 完成率分析
- 帳號系統 / 雲端備份

---

## 2. 功能需求（FR）

### FR-1 每日 6 項任務輸入
- 預設提供 6 個固定編號的輸入框（1–6）
- 使用者**至少輸入 1 項**即可進入焦點階段；未填滿 6 項也可使用（不強制）
- 輸入框 placeholder 顯示提示文字（i18n）
- 單項上限 120 字元（避免變成備忘錄）

### FR-2 優先級拖曳排序
- **僅在規劃階段允許**拖曳：一旦有任一任務被勾選完成，排序即鎖定
- 拖曳採 HTML5 Drag and Drop API 或 `@dnd-kit/sortable`（建議後者，無障礙性較好）
- 拖曳時顯示「插入位置」提示線
- 編號（1–6）隨拖曳結果即時重排，使用者看到的永遠是「目前的優先順序」

### FR-3 單一任務焦點模式（強制依序完成）
- Active Task：清單中順序最前且未完成的任務
- Active Task 視覺上**放大、置頂強調**，附「✓ 標記完成」CTA
- Locked Tasks：以 50% 透明度 + 🔒 圖示呈現，**點擊勾選框無反應**
- 完成 Active Task 後：下一順位任務自動成為 Active Task（無需重整）
- 完成第 6 項（或全部已輸入項目）後：顯示「✨ 今日完成」狀態，UI 切到回顧視圖

### FR-4 自動將未完成任務移轉至隔日清單
- **觸發時機**：使用者在新一天首次打開 Side Panel 時（不在背景靜默執行 — 避免使用者失去掌控感）
- **流程**：
  1. 偵測到 `currentDay` 與系統日期不同
  2. 列出昨日所有未完成任務，預設**全部勾選**（即全部要轉移）
  3. 使用者可取消勾選不想轉移的項目，或一鍵「全部捨棄」
  4. 確認後：未完成項目以 `carriedFrom: <yesterday>` 標記加入今日清單前段
  5. 昨日資料封存（標記 `locked: true`），保留 30 天用於回顧
- **邊界**：若已過多日未打開，逐日提示或合併提示（v1 採合併，並標註原始日期）

### FR-5 主動提醒（Active Reminders）
> Side Panel 受 Chrome 限制，無法自動彈出，故以下列機制做「主動感」提醒：

| 機制 | 觸發 | 內容 | 使用者可關閉 |
|---|---|---|---|
| **Badge 計數** | 任務變動即時更新 | 顯示未完成數，例：`3`；全部完成顯示 `✓` | 否（核心功能） |
| **晨間規劃通知** | 預設 08:00 (`chrome.alarms`) | 「今天還沒規劃 6 項任務」 | 是 |
| **晚間回顧通知** | 預設 21:00 | 「今天完成了 X/Y 項，要規劃明天嗎？」 | 是 |
| **停滯提醒** | Active Task 超過 90 分鐘未完成且在工作時段 | 「在『X』上卡住了嗎？」 | 是 |
| **跨日提醒** | 隔日首次打開 | 「昨天有 X 項未完成，要轉移嗎？」 | 否（核心流程） |

提醒時間、開關集中在「設定」頁面，存於 `settings.reminders`。

### FR-6 中英文語系切換
- 支援 `zh-TW`（繁中）、`en`（英文）
- **動態切換**：使用者可在設定頁直接切換，不需重啟瀏覽器
- 切換後**所有 UI 字串即時更新**（含 Badge tooltip、通知標題）
- 預設語系：跟隨 Chrome `chrome.i18n.getUILanguage()`；查無對應則 fallback `en`
- 詳見 §10「國際化策略」

---

## 3. 非功能需求（NFR）

| 編號 | 項目 | 指標 |
|---|---|---|
| NFR-1 | 啟動速度 | Side Panel 從點擊到可互動 ≤ 300ms（typical hardware） |
| NFR-2 | 資料完整性 | 任何崩潰／關閉不丟失資料；每次狀態變更即落地 |
| NFR-3 | 離線可用 | 完全離線運作，不依賴任何網路請求 |
| NFR-4 | 隱私 | 不收集分析資料、不外送任務內容 |
| NFR-5 | 無障礙 | 鍵盤可完整操作；ARIA 標籤；色盲友善（不只用顏色傳達狀態） |
| NFR-6 | 套件大小 | 打包後 < 200 KB（gzipped），不引入大型 UI 庫 |
| NFR-7 | 國際化 | UI 字串 100% 透過 i18n key 提供 |

---

## 4. 技術架構

### 4.1 元件總覽

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Browser                           │
│  ┌──────────────────────┐    ┌────────────────────────────┐ │
│  │   Service Worker     │    │   Side Panel (React App)   │ │
│  │   (background.ts)    │◄──►│   - PlanningView           │ │
│  │   - chrome.alarms    │    │   - FocusView              │ │
│  │   - chrome.notif.    │    │   - RolloverDialog         │ │
│  │   - badge updates    │    │   - SettingsView           │ │
│  │   - rollover check   │    │                            │ │
│  └──────────┬───────────┘    └────────────┬───────────────┘ │
│             │                              │                 │
│             └──────────┬───────────────────┘                 │
│                        ▼                                     │
│            ┌─────────────────────────┐                       │
│            │   chrome.storage.local  │                       │
│            │   (Single Source of     │                       │
│            │    Truth, JSON blob)    │                       │
│            └─────────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 模組職責

| 模組 | 職責 |
|---|---|
| `background.ts` (Service Worker) | 排程 alarms、發送通知、更新 Badge、跨日偵測 |
| `sidepanel/App.tsx` | React 根元件、路由四個 View |
| `sidepanel/views/Planning.tsx` | 6 項任務輸入、拖曳排序、「鎖定並開始」 |
| `sidepanel/views/Focus.tsx` | Active Task 強調、Locked Tasks 列表、完成互動 |
| `sidepanel/views/Rollover.tsx` | 跨日確認對話框 |
| `sidepanel/views/Settings.tsx` | 語系切換、提醒時間設定、資料匯出／清除 |
| `shared/store.ts` | Zustand 全域狀態管理（持久化中介層） |
| `shared/storage.ts` | `chrome.storage.local` 讀寫封裝、schema migration |
| `shared/i18n.ts` | react-i18next 設定 |
| `shared/types.ts` | 共用 TypeScript 型別 |

### 4.3 為什麼是 React + Vite？
- **Vite + `@crxjs/vite-plugin`**：原生支援 MV3 manifest、HMR 在 Side Panel 內可用
- **React 18**：團隊熟悉度高、生態完整
- **Zustand**：比 Redux 輕量，比 useContext 易於跨 view 共用狀態，且支援中介層持久化
- **@dnd-kit**：拖曳無障礙性 > react-beautiful-dnd（已停止維護）
- **react-i18next**：動態切換語系不需重新載入
- **TypeScript**：任務狀態機複雜度足以受益於型別檢查

### 4.4 專案結構（建議）

```
daily-six/
├── manifest.json
├── vite.config.ts
├── package.json
├── tsconfig.json
├── src/
│   ├── background.ts
│   ├── sidepanel/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   └── views/
│   │       ├── Planning.tsx
│   │       ├── Focus.tsx
│   │       ├── Rollover.tsx
│   │       └── Settings.tsx
│   ├── shared/
│   │   ├── store.ts
│   │   ├── storage.ts
│   │   ├── i18n.ts
│   │   └── types.ts
│   └── locales/
│       ├── zh-TW.json
│       └── en.json
├── public/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── _locales/
    ├── en/messages.json
    └── zh_TW/messages.json
```

---

## 5. 資料模型與持久化

### 5.1 為什麼選 `chrome.storage.local` 而非 LocalStorage？

> **這是一個與題目要求不同的設計決策，請審核：**

| 項目 | `localStorage` (Web API) | `chrome.storage.local` |
|---|---|---|
| Service Worker 可存取 | ❌ 不行（無 window） | ✅ 可以 |
| 容量上限 | ~5 MB | ~10 MB（v1）／不限（with `unlimitedStorage` permission） |
| 跨 view 同步 | 需手動廣播 | 內建 `onChanged` 事件 |
| 非同步 API | ❌ 同步、阻塞 | ✅ Promise-based |
| 適合擴充功能 | 不建議（官方文件警告） | ✅ 官方推薦 |

**建議：採用 `chrome.storage.local`**，因為背景的 alarms / 跨日 / badge 更新都在 Service Worker 跑，必須能讀寫狀態。若強制使用 LocalStorage，需透過訊息傳遞（`chrome.runtime.sendMessage`）由 Side Panel 代為操作，多一層脆弱性。

> 若仍希望使用 LocalStorage，需在 §11 邊界情境中加入「Service Worker 改為純排程器，所有資料讀寫都委派給 Side Panel」的限制，但會導致「Side Panel 未打開時無法更新 Badge」。

### 5.2 Schema (v1)

```ts
// shared/types.ts
type ISO8601Date = string;  // "2026-05-25"
type Locale = "zh-TW" | "en";

interface Task {
  id: string;              // "t_" + nanoid(10)
  text: string;            // 任務內容，≤ 120 chars
  order: number;           // 0..5
  completed: boolean;
  completedAt: number | null;  // epoch ms
  createdAt: number;
  carriedFrom: ISO8601Date | null;  // 若為 rollover 來源
}

interface DayRecord {
  date: ISO8601Date;
  tasks: Task[];
  locked: boolean;         // true = 已進入焦點階段（禁止排序）
  startedAt: number | null;
  completedAt: number | null;  // 全部完成時的 epoch ms
}

interface Settings {
  locale: Locale;
  reminders: {
    morningPlan: { enabled: boolean; time: string };  // "08:00"
    eveningReview: { enabled: boolean; time: string };
    staleFocus: { enabled: boolean; thresholdMinutes: number };
  };
  rolloverPolicy: "prompt" | "auto-accept" | "auto-discard";  // v1 只開放 prompt
  historyRetentionDays: number;  // 預設 30
}

interface AppState {
  schemaVersion: 1;
  currentDay: ISO8601Date;
  days: Record<ISO8601Date, DayRecord>;  // key 為日期字串
  settings: Settings;
  lastActiveAt: number;
}
```

### 5.3 儲存鍵

```
chrome.storage.local key: "dailySix:state:v1"
value: AppState (JSON-serialised by chrome.storage 自動處理)
```

單一根鍵設計，避免多鍵讀寫的原子性問題。

### 5.4 Migration 策略

- 每次啟動 Service Worker / Side Panel 都呼叫 `migrate(state)`
- 比對 `schemaVersion` 與當前程式碼預期版本，若舊則逐版升級
- v1 不需 migration（首版），但保留 hook 以利未來

### 5.5 歷史保留

- 每次寫入時清掉 `days[date]` 中 `date < today - 30 days` 的紀錄
- 保留期可由設定調整（10 / 30 / 90 / 永久）

---

## 6. Manifest V3 設定

### 6.1 `manifest.json`

```json
{
  "manifest_version": 3,
  "name": "__MSG_extName__",
  "description": "__MSG_extDescription__",
  "default_locale": "en",
  "version": "0.1.0",
  "icons": {
    "16": "icon-16.png",
    "48": "icon-48.png",
    "128": "icon-128.png"
  },
  "action": {
    "default_title": "__MSG_actionTitle__"
  },
  "side_panel": {
    "default_path": "sidepanel/index.html"
  },
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "permissions": [
    "sidePanel",
    "storage",
    "alarms",
    "notifications"
  ]
}
```

### 6.2 權限逐項說明（最小權限原則）

| Permission | 必要性 | 理由 |
|---|---|---|
| `sidePanel` | **必要** | 使用 `chrome.sidePanel.setPanelBehavior()` 讓使用者點擊 toolbar icon 即開啟 |
| `storage` | **必要** | `chrome.storage.local` 為資料層；同時用於 `onChanged` 事件 |
| `alarms` | **必要** | 排程晨間／晚間／停滯提醒 |
| `notifications` | **必要** | `chrome.notifications.create()` 顯示桌面通知 |

### 6.3 不需要的權限（明列以強調最小授權）

| 未要求 | 理由 |
|---|---|
| `host_permissions` | 不訪問任何網頁內容 |
| `tabs` | 不讀取 Tab 標題／URL |
| `scripting` | 無 content script |
| `activeTab` | 不需與當前頁面互動 |
| `identity` | 無帳號系統 |
| `clipboardRead/Write` | v1 不支援剪貼簿匯入 |

> 上架 Chrome Web Store 時，最少權限有利通過審查、降低使用者「為什麼要這權限？」的疑慮。

### 6.4 預設行為設定

```ts
// background.ts (片段)
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  await initStateIfMissing();
  await scheduleDailyAlarms();
});
```

`openPanelOnActionClick: true` 讓「點擊工具列按鈕 → 開啟 Side Panel」這一最常見路徑無需額外程式碼。

---

## 7. UI / UX 設計

### 7.1 視覺語言

- **基調**：克制、留白、低飽和 — 工具本身不該分散注意力
- **配色**（CSS Custom Properties）：

  ```css
  --bg:        #FAFAF7;  /* 暖白底 */
  --surface:   #FFFFFF;
  --border:    #E5E3DC;
  --text:      #1A1A1A;
  --text-dim:  #6B6B65;
  --locked:    #A0A09A;
  --accent:    #2A4D6E;  /* 深藍 — Active Task */
  --success:   #5A7A6A;  /* 完成綠 */
  --warning:   #C77B3D;  /* 提醒橘 */
  --shadow:    rgba(0, 0, 0, 0.06);
  ```

- **字體**：system-ui stack，數字編號用 tabular-nums 對齊
- **尺度**：Side Panel 預設寬 400px；內容區左右留白 24px

### 7.2 四個主要畫面

1. **規劃階段 (Planning View)**
   - Header：Logo + 日期 + 語系切換按鈕（小）
   - 6 個垂直排列輸入框，每列左側為編號 + 拖曳手柄（≡）
   - 底部 CTA：「鎖定今日清單並開始」（至少填 1 項才啟用）
   - 提示文字：「列出你今天最重要的 6 件事，依優先級排序」

2. **焦點階段 (Focus View)**
   - Header：日期 + 進度「2 / 6」
   - **Active Task 卡片**：大字、置頂、邊框強調、計時器（可選顯示啟動後經過時間）、「✓ 標記完成」按鈕
   - 下方 **Locked Tasks 列表**：每列顯示編號 + 任務（淡化）+ 🔒 圖示
   - **已完成任務**：摺疊區塊「✓ 已完成 (n)」，展開後顯示劃線文字 + 完成時間

3. **跨日對話框 (Rollover Dialog)**
   - 標題：「昨天有 N 項任務未完成」
   - 列表：每項任務前有勾選框（預設全選）
   - 兩個 CTA：「全部捨棄」（次要）/「轉移選取項目到今天」（主要）
   - 注意：對話框內無「關閉」/「之後再說」 — 強制做決定，避免拖延

4. **設定 (Settings View)**
   - 區塊 1：語系（單選：繁體中文 / English）
   - 區塊 2：提醒（三個 toggle + 時間 picker）
   - 區塊 3：資料（匯出 JSON / 清除所有資料）
   - 區塊 4：關於（版本、回饋連結）

### 7.3 邊界視覺狀態

| 狀態 | 視覺處理 |
|---|---|
| 空清單（首日） | 大字提示「從第 1 項開始，寫下今天最重要的事」+ 浮現游標於第一個輸入框 |
| 全部完成 | 替換 Focus View 內容為「✨ 今日完成」+ 完成時間 + 「為明天規劃」CTA |
| 跳號嘗試 | 點擊 Locked Task 勾選框時，輕微震動 + Toast 提示「請先完成第 N 項」 |
| 拖曳超出範圍 | 自動取消拖曳，元素回原位 |

### 7.4 互動細節
- **無破壞性操作**：刪除任務需二次確認；清除所有資料需輸入「DELETE」確認
- **鍵盤導航**：Tab 在輸入框間移動、Enter 完成 Active Task、Space 切換勾選
- **觸覺回饋**：完成任務時短暫 confetti 動畫（300ms，prefers-reduced-motion 時關閉）

### 7.5 對應原型檔案

| 畫面 | 對應 HTML | 備註 |
|---|---|---|
| 規劃階段 | `prototype/01-planning.html` | 5 項已填、1 項空、可拖曳 |
| 焦點階段 | `prototype/02-focus.html` | Active = #2，#3–#6 鎖定 |
| 跨日對話框 | `prototype/03-rollover.html` | 顯示昨日 3 項未完成 |
| 主動提醒展示 | `prototype/04-reminder.html` | Badge + 桌面通知 |
| 設定（英文） | `prototype/en/05-settings.html` | 展示 i18n 結果 |

---

## 8. 主動提醒設計

### 8.1 機制總表

| 機制 | API | 觸發點 | 可關 |
|---|---|---|---|
| Badge 計數 | `chrome.action.setBadgeText` | 每次任務變動（store 訂閱） | 否 |
| 排程通知 | `chrome.alarms` + `chrome.notifications` | `onAlarm` 觸發 | 是 |
| 停滯偵測 | `chrome.alarms` (每 15 分鐘) | Active Task 啟動時間 > 閾值 | 是 |
| 跨日提示 | Side Panel 啟動時 + 服務工作 8:00 alarm | 偵測 `currentDay !== today` | 否 |

### 8.2 Badge 邏輯

```ts
function updateBadge(state: AppState) {
  const today = getCurrentDayRecord(state);
  if (!today || today.tasks.length === 0) {
    chrome.action.setBadgeText({ text: '' });
    return;
  }
  const remaining = today.tasks.filter(t => !t.completed).length;
  chrome.action.setBadgeText({
    text: remaining === 0 ? '✓' : String(remaining),
  });
  chrome.action.setBadgeBackgroundColor({
    color: remaining === 0 ? '#5A7A6A' : '#2A4D6E',
  });
}
```

### 8.3 通知範本（i18n keys）

| 場景 | i18n key | zh-TW | en |
|---|---|---|---|
| 晨間規劃 | `notif.morning.title` | 「今天還沒寫今日 6 項」 | "Plan today's six" |
| 晚間回顧 | `notif.evening.title` | 「今天完成了 {{done}}/{{total}}」 | "Done {{done}}/{{total}} today" |
| 停滯提醒 | `notif.stale.title` | 「在『{{task}}』上卡住了嗎？」 | "Stuck on '{{task}}'?" |
| 跨日提示 | `notif.rollover.title` | 「昨天有 {{n}} 項未完成」 | "{{n}} unfinished from yesterday" |

### 8.4 通知互動
- 點擊通知 → 開啟 Side Panel（`chrome.sidePanel.open()` 在 `chrome.notifications.onClicked` callback 中合法）
- 通知預設 4 秒後自動消失，重要事件（跨日）保留至使用者互動

---

## 9. 國際化策略

### 9.1 雙層 i18n（必要）

| 層 | 工具 | 用途 |
|---|---|---|
| **靜態層** | `chrome.i18n` + `_locales/<lang>/messages.json` | manifest 內的 `__MSG_*__`：name / description / action title |
| **動態層** | `react-i18next` + `src/locales/<lang>.json` | App 內所有 UI 字串、可動態切換 |

> 為何雙層？`chrome.i18n` 鎖定瀏覽器語系，**無法在執行時切換**；而 manifest 的字串又只能透過 `__MSG_*__` 抓 `_locales/`。所以靜態 manifest 用 `chrome.i18n`，App UI 用 `react-i18next`。

### 9.2 語系偵測流程

```
1. 讀取 settings.locale（使用者上次選擇）
2. 若無：呼叫 chrome.i18n.getUILanguage()
   - 'zh-TW' / 'zh' / 'zh-HK' → 用 zh-TW
   - 其他 → 用 en
3. 應用到 i18n.changeLanguage()
4. 使用者在設定頁切換 → 更新 settings.locale → 觸發 changeLanguage()
```

### 9.3 字串檔範例

`src/locales/zh-TW.json`：
```json
{
  "app": { "title": "Daily Six" },
  "planning": {
    "prompt": "列出你今天最重要的 6 件事",
    "placeholder": "第 {{n}} 項任務…",
    "lockCta": "鎖定今日清單並開始"
  },
  "focus": {
    "active": "進行中",
    "complete": "標記完成",
    "lockedHint": "請先完成第 {{n}} 項",
    "allDone": "✨ 今日完成"
  },
  "rollover": {
    "title": "昨天有 {{n}} 項未完成",
    "moveAll": "全部轉移到今天",
    "discardAll": "全部捨棄",
    "confirm": "確認"
  },
  "settings": {
    "language": "語言",
    "reminders": "提醒",
    "data": "資料"
  }
}
```

### 9.4 i18n key 命名規範
- 階層式：`view.subgroup.element`
- 避免大小寫混用：全小寫，多字以 camelCase
- 變數插值用 `{{name}}`：例 `"{{n}} 項未完成"`
- 不在程式碼內 fallback 字串：強制走 i18n（用 ESLint rule 守住）

---

## 10. 邊界情境與例外處理

| 情境 | 處理 |
|---|---|
| 跨日後使用者連續多日未開 | 合併昨日以前所有未完成項，顯示原始日期 tag |
| 同日多次跨日（時區變更） | 以系統 local date 為準，不處理時區漂移 |
| 任務文字含特殊字元 / emoji | 純文字儲存，UI 用 `textContent` 渲染（無 XSS 風險） |
| `chrome.storage` 寫入失敗 | 重試 3 次，仍失敗則顯示錯誤 Toast 並保留記憶體狀態 |
| Service Worker 被回收 | 重新啟動時從 storage 恢復，alarms 由 Chrome 管理不受影響 |
| 使用者手動清除瀏覽器資料 | 偵測 `state === null`，回到首日歡迎流程 |
| Schema 版本不符（舊版降級） | 顯示「版本不相容」訊息，不執行寫入（避免破壞） |
| 通知被作業系統封鎖 | App 內保留視覺提示（Badge / 設定頁 banner） |

---

## 11. 開發與測試

### 11.1 開發流程
```bash
npm install
npm run dev          # vite dev server + crxjs HMR
# 載入未封裝擴充功能到 chrome://extensions
npm run build        # 產出 dist/，可上架
npm run typecheck
npm run lint
npm test             # vitest，覆蓋率目標 70%（核心 store/storage 100%）
```

### 11.2 關鍵測試案例
- store：完成任務後 Active Task 是否正確切換到下一順位
- storage：schemaVersion migration
- rollover：跨日偵測邊界（23:59 → 00:00）
- i18n：所有 key 在兩語系都有對應（CI 跑 lint 檢查）
- Manifest V3：service worker 在被回收後重啟是否能恢復 alarms（手動驗證）

---

## 12. 後續迭代

| 版本 | 候選功能 |
|---|---|
| v1.1 | 任務拖曳完成（左滑完成、右滑刪除） |
| v1.2 | `chrome.storage.sync` 跨裝置同步（容量 100KB，可能需壓縮） |
| v2.0 | 每週／每月回顧視圖、簡易統計 |
| v2.x | Pomodoro 計時整合 |
| v3.0 | 可選擇性整合行事曆（Google Calendar） |

---

## 附錄 A：原型檔案總覽

| 檔案 | 對應 §7.2 畫面 | 語系 |
|---|---|---|
| `prototype/index.html` | 導覽頁，含全部畫面縮圖 | zh-TW |
| `prototype/01-planning.html` | 規劃階段 | zh-TW |
| `prototype/02-focus.html` | 焦點階段 | zh-TW |
| `prototype/03-rollover.html` | 跨日對話框 | zh-TW |
| `prototype/04-reminder.html` | Badge + 桌面通知預覽 | zh-TW |
| `prototype/en/05-settings.html` | 設定頁（i18n 示範） | en |
| `prototype/styles.css` | 共用樣式（design tokens） | — |

---

## 附錄 B：待確認設計決策

開發前請審核以下決策，標記為 **(?)** 的是和題目要求或一般直覺有所偏離之處：

1. **(?)** §5.1：採用 `chrome.storage.local` 而非 `localStorage` — 影響「主動提醒」可在 Side Panel 關閉時運作
2. §2 FR-2：拖曳排序僅限規劃階段（任一任務開始後鎖定排序）
3. §2 FR-4：跨日採「打開時提示確認」而非靜默搬移
4. §2 FR-5：晨間 08:00 / 晚間 21:00 / 停滯 90 分鐘 — 皆可在設定頁調整
5. §5.5：歷史保留預設 30 天
6. §6.2：不申請 `host_permissions` / `tabs` — 維持最小權限
7. §7.1：Side Panel 預設寬 400px（Chrome 容許 280–600px）
8. §9.1：採雙層 i18n（`chrome.i18n` + `react-i18next`）— 增加初始複雜度，但是支援動態語系切換的標準做法

> 完成審核後，請在每項旁標註「✓ 同意 / ✗ 需調整：__」。
