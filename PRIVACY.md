# Daily Six — Privacy Policy

_Last updated: 2026-05-26_

**Short version:** Daily Six does not collect, transmit, or share any of
your data. Everything lives in your own browser. We don't have a server
to send it to.

---

## What Daily Six is

Daily Six is a Chrome extension that helps you practice the Ivy Lee
Method (six prioritized tasks per day, completed in order) from the
Chrome Side Panel. It is a single-purpose productivity tool.

## What data Daily Six stores

The extension stores the following inside your own browser, using the
`chrome.storage.local` API:

- The tasks you create (text content you type)
- The current day's list, plus historical days you have completed
- Your settings (language preference, reminder times, retention window)
- The completion timestamps of tasks you mark done

**Where this is stored:** locally on your device, inside the Chrome
profile you are using. It is bound to your browser; if you sign into
Chrome Sync with `chrome.storage.local` syncing enabled at the browser
level, Chrome itself may sync that data across your own devices. Daily
Six does not initiate or control that sync.

## What Daily Six does NOT do

- It does **not** transmit any of your data to us, to any server, or to
  any third party.
- It does **not** include any analytics, telemetry, error reporting,
  ads, or tracking SDKs.
- It does **not** request access to any web page contents. The
  extension declares no host permissions. It cannot read or modify the
  pages you visit.
- It does **not** require an account, sign-in, or any identifier.
- It does **not** share data with any service.

## Permissions used

| Permission | Why we need it |
|---|---|
| `sidePanel` | To register and open the side panel that hosts the entire app. |
| `storage` | To save your tasks and settings to `chrome.storage.local` on your device. |
| `alarms` | To schedule the daily reminders you opt into (all reminders are off by default until you enable them in Settings). |
| `notifications` | To display those reminders as Chrome notifications. |

No other permissions are requested. No host permissions are requested.

## Cookies and tracking technologies

Daily Six uses none.

## Children

Daily Six is suitable for all ages. We do not collect any data from any
user, including children under 13.

## Data export and deletion

- **Export:** Settings → "Export JSON" downloads a snapshot of all
  stored data to a file you control.
- **Delete:** Settings → "Reset all" wipes the extension's local
  storage on this device after a confirmation prompt. Uninstalling the
  extension also removes the data Chrome holds for it.

## Changes to this policy

If the policy ever changes (for example, if a new permission becomes
necessary), the updated version will be committed to this repository
with a new `Last updated` date. The extension itself will continue to
operate offline; we do not have a mechanism to push policy changes to
you remotely.

## Contact

Open an issue on the project's GitHub repository, or email
`shawn@orientalwow.com`.

---

# Hosting this policy (GitHub Pages)

> ✅ **DEPLOYED.** This policy is live at
> **https://ccbearyeh.github.io/daily-six/privacy.html**
> (served via GitHub Pages from the `/docs` folder on the `main` branch of
> `github.com/ccbearyeh/daily-six`). Paste that URL into the Chrome Web
> Store **Privacy practices → Privacy policy** field. The instructions
> below are kept for reference.

Chrome Web Store requires a public privacy policy URL. The recommended
free option is GitHub Pages.

## Option A — Serve directly from `main` branch (simplest)

1. Push this repository to GitHub (e.g. `github.com/ccbearyeh/daily-six`).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**:
   - **Source:** _Deploy from a branch_
   - **Branch:** `main` / `/` (root)
4. Save. Wait ~30 seconds for the first build.
5. Pages will publish at `https://ccbearyeh.github.io/daily-six/`.
6. The privacy policy will be available at:
   - `https://ccbearyeh.github.io/daily-six/PRIVACY.md` (raw markdown — works but ugly)
   - Or, better, add a tiny `index.html` that links to it (see Option B).

## Option B — Pretty landing page with a privacy link (recommended)

If you want the URL to render as HTML, add a minimal `docs/index.html`
and switch Pages source to `/docs`:

```
docs/
  index.html       ← landing page with Privacy link
  privacy.html     ← privacy policy as HTML
```

Steps:

1. Create `docs/index.html` and `docs/privacy.html` (convert the markdown above to HTML — any static-site tool, or hand-write a simple page using the brand colors from `src/styles/global.css`).
2. **Settings → Pages → Source:** `Deploy from a branch`, branch `main`, folder `/docs`.
3. Pages publishes at `https://ccbearyeh.github.io/daily-six/`.
4. Set the Chrome Web Store **Privacy policy URL** to:
   `https://ccbearyeh.github.io/daily-six/privacy.html`

## Option C — Custom domain (optional polish)

If you own a domain (e.g. `dailysix.app`):

1. In your DNS provider, add a `CNAME` record pointing your subdomain
   (e.g. `www.dailysix.app`) to `ccbearyeh.github.io`.
2. In **Settings → Pages → Custom domain**, enter `www.dailysix.app`.
3. Enable **Enforce HTTPS** once the cert provisions.
4. Privacy URL becomes `https://www.dailysix.app/privacy.html`.

---

## What URL to submit to the Chrome Web Store

Once Pages is live, paste the privacy URL into:

> Developer Dashboard → your item → **Privacy practices** tab → **Privacy policy** field

Save. The URL is verified by Google during review. It must be
accessible without login.

## Required Chrome Web Store privacy disclosures

The store also requires you to tick several "what data does your
extension handle" disclosures. For Daily Six the correct answers are:

| Disclosure | Answer |
|---|---|
| Personally identifiable information | **No** |
| Health information | **No** |
| Financial and payment information | **No** |
| Authentication information | **No** |
| Personal communications | **No** |
| Location | **No** |
| Web history | **No** |
| User activity (clicks, mouse, etc.) | **No** |
| Website content | **No** |
| Do you use or transfer user data for purposes unrelated to the single purpose? | **No** |
| Do you use or transfer user data to determine creditworthiness or for lending purposes? | **No** |
| Do you sell user data to third parties? | **No** |

Then certify:
- [x] I do not collect or transmit user data.
- [x] I comply with the [Chrome Web Store Developer Program Policies](https://developer.chrome.com/docs/webstore/program-policies/).
