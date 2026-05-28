# Daily Six — Chrome Web Store Listing Copy

Submission text for the Chrome Web Store. Use exactly as written; both
languages should be uploaded so the store auto-localizes for the viewer.

---

## English (default)

### Name (max 45 chars)

```
Daily Six — Six things. One at a time.
```
*(39 chars)*

### Summary (max 132 chars)

```
Pick six tasks. Do them in order. End the day. A Side Panel companion built on the Ivy Lee Method — local-first, bilingual.
```
*(125 chars)*

### Detailed description

```
Daily Six is a quiet productivity companion that lives in your Chrome Side
Panel. Each evening you choose the six things that matter most for
tomorrow. The next day you do them — one at a time, in order.

That's the whole app. No projects, no tags, no backlog, no streaks.

—— How it works ——

1. Plan. Add up to six tasks. Drag to reorder by priority.
2. Focus. Only the next task is unlocked. Finish it to reveal the next.
3. Done. When six are checked, the day ends. Tomorrow you start fresh.
4. Carry over. Unfinished tasks ask you each morning whether to bring
   them forward or let them go — you decide, nothing piles up silently.

—— Why six ——

The Ivy Lee Method (1918) is one of the oldest and simplest productivity
practices on record. Six is the ceiling that forces real prioritization
without becoming arbitrary. Daily Six is the Chrome-native version of
that practice, designed to stay out of your way while you work.

—— What's included ——

• Side Panel UI — opens beside any tab, never steals your active window
• Sequential focus — locked tasks make the next step unmistakable
• Smart rollover — explicit carry-over, never silent accumulation
• Bilingual — Traditional Chinese & English, fully synced (UI + notifications)
• Reminders — evening planning, morning review, stuck-task pings (all optional)
• 100% local — data lives in your browser via chrome.storage.local
• No account, no tracking, no servers, no telemetry
• Export JSON anytime for your own backup

—— Permissions, briefly ——

• Side Panel — to open the app beside your tabs
• Storage — to save your tasks locally in your browser
• Alarms — to schedule optional daily reminders
• Notifications — to show those reminders

No host permissions. No access to web pages. No network calls.

—— Open source & private by design ——

Source code, privacy policy, and roadmap are public. If a feature can't
be built without sending your data somewhere, we don't build it.

Built for people who already have enough tabs.
```

### Category

```
Productivity
```

### Single-purpose statement (required by Chrome Web Store)

```
Daily Six helps users practice the Ivy Lee Method inside the Chrome Side
Panel by limiting them to six prioritized tasks per day, locking task
order to enforce sequential focus, and offering explicit carry-over for
unfinished items. All data is stored locally in the browser; the
extension does not connect to any external service.
```

### Permission justifications (required by Chrome Web Store)

| Permission | Justification |
|---|---|
| `sidePanel` | The extension's entire interface is rendered in the Chrome Side Panel; this permission is required to register and open it. |
| `storage` | Tasks, settings, and history are saved to `chrome.storage.local` so the user's six-task list persists across browser sessions on the same device. |
| `alarms` | Optional daily reminders (evening planning, morning review, stuck-task ping) are scheduled with `chrome.alarms`. All reminder alarms can be turned off in Settings. |
| `notifications` | Reminder alarms surface as Chrome notifications via `chrome.notifications`. Notifications appear only for the user's own scheduled reminders. |

No host permissions are requested. The extension never reads or modifies
the contents of web pages and makes no network requests.

---

## 繁體中文（Traditional Chinese）

### 名稱（最多 45 字）

```
Daily Six — 每天六件事，一次只一件
```
*(20 字)*

### 簡介（最多 132 字）

```
每天只挑六件最重要的事，按順序一件一件完成。住在 Chrome 側邊欄裡的 Ivy Lee Method 助手，全本機、雙語、不上雲、不註冊。
```
*(60 字)*

### 詳細說明

```
Daily Six 是一個安靜的生產力夥伴，住在 Chrome 側邊欄裡。每天傍晚，
你挑出明天最重要的六件事。隔天，你照順序一件一件完成它們。

整個 app 就這樣。沒有專案、沒有標籤、沒有未完成清單、沒有連續達標。

—— 怎麼用 ——

1. 規劃：寫下最多六件事。拖曳排序，把重要的放前面。
2. 專注：只有下一件是可點的。完成後才會解鎖下一件。
3. 結束：六件全部完成，今天就結束。明天從零開始。
4. 順延：未完成的，隔天會問你要不要帶到今天——你決定，
   不會默默累積成壓力。

—— 為什麼是六件 ——

Ivy Lee Method（1918 年）是有記錄以來最古老、也最簡單的時間管理法
之一。六是一個剛好夠強制取捨、又不會太死板的上限。Daily Six 把這個
方法做成 Chrome 原生版本，盡量不打擾你工作。

—— 功能 ——

• 側邊欄介面——開在分頁旁邊，不搶你的工作視窗
• 順序鎖定——下一步永遠明確
• 智能順延——未完成由你決定要不要帶過來，不靜默累積
• 雙語切換——繁體中文／英文同步（介面 + 通知）
• 提醒功能——晚間規劃、早晨檢視、卡關提醒（皆可關）
• 100% 本機——資料只存在你瀏覽器的 chrome.storage.local
• 不需註冊、無追蹤、無伺服器、無遙測
• 可隨時匯出 JSON 自己備份

—— 權限說明 ——

• Side Panel（側邊欄）——讓 app 開在分頁旁邊
• Storage（儲存）——把你的清單存在自己的瀏覽器
• Alarms（鬧鐘）——排程選用的每日提醒
• Notifications（通知）——顯示這些提醒

沒有要存取任何網頁的權限。沒有網路請求。

—— 開源、設計上就重視隱私 ——

原始碼、隱私權政策、開發路線都公開。任何需要把你的資料上傳才能做的
功能，我們不做。

給已經有太多分頁的人。
```

### 類別

```
生產力
```

### 單一目的聲明（Chrome Web Store 必填）

```
Daily Six 幫助使用者在 Chrome 側邊欄中實踐 Ivy Lee Method：每天限制
六件優先任務、鎖定順序以強化專注、提供明確的未完成任務順延機制。
所有資料儲存於瀏覽器本機，本擴充功能不連線至任何外部服務。
```

### 權限用途說明（Chrome Web Store 必填）

| 權限 | 用途 |
|---|---|
| `sidePanel` | 本擴充功能的所有介面都在 Chrome 側邊欄中呈現，必須註冊與開啟側邊欄。 |
| `storage` | 任務、設定與歷史紀錄都存到 `chrome.storage.local`，讓你的六件清單在同一台裝置上跨瀏覽工作階段保留。 |
| `alarms` | 用於排程選用的每日提醒（晚間規劃、早晨檢視、卡關提醒）。所有提醒皆可在「設定」中關閉。 |
| `notifications` | 將排程的提醒以 Chrome 通知顯示。通知只在使用者自己設定的提醒時間出現。 |

不要求任何 host permissions。本擴充功能不會讀取或修改任何網頁內容，
也不會發出任何網路請求。

---

## Submission Checklist

Before clicking **Submit for review** on the Developer Dashboard:

- [ ] `daily-six-v0.1.0.zip` uploaded (located in `release/`)
- [ ] Name, summary, detailed description filled for both **English** and **繁體中文**
- [ ] Category set to **Productivity** in both locales
- [ ] Single-purpose statement filled
- [ ] All four permission justifications filled (sidePanel, storage, alarms, notifications)
- [ ] At least 1 screenshot uploaded (1280×800) — recommended: all 5 from `marketing/screenshots/`
- [ ] Optional: promo tile uploaded (440×280 from `marketing/screenshots/promo-440x280.png`)
- [ ] Icon 128×128 will be picked up from `public/icon-128.png` inside the zip — no separate upload needed
- [ ] **Privacy practices** tab completed (see `PRIVACY.md` for the answers)
- [ ] **Privacy policy URL** → paste `https://ccbearyeh.github.io/daily-six/privacy.html` (live, HTTP 200)
- [ ] **Region distribution** set (default: all regions)
- [ ] Maturity rating: Everyone
- [ ] Visibility: Public (or Unlisted for soft launch)

### Recommended screenshot order in listing

1. `01-planning.png` — sets the core promise ("six things, daily")
2. `02-focus.png` — shows the differentiator (sequential locking)
3. `03-all-done.png` — emotional payoff
4. `04-rollover.png` — shows the smart-rollover answer to "what about unfinished?"
5. `05-settings.png` — shows bilingual support and privacy posture
