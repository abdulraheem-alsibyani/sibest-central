# Sibest Central

A Sibest-powered **Basecamp dashboard** for busy managers with many team members. It gives you one screen to see everyone's workload, spot overloaded people, and track open, overdue, and completed tasks across all your projects.

It runs **locally on your own computer** — a small Node.js server talks to Basecamp on your behalf and shows everything in your web browser.

---

## What you can see in the dashboard

- **Team Members** – everyone on your account and how much they're carrying
- **Workload & Overloaded People** – who has too many open tasks
- **Projects** – active and inactive projects at a glance
- **Tasks** – open, overdue, and completed tasks, with assignees and due dates

---

## Before you start (what you'll need)

1. A **Basecamp 4** account where you're an admin (so you can create an app).
2. **Node.js** installed on your computer. To check, open a terminal and type:
   ```
   node -v
   ```
   If you see a version number (e.g. `v20.x` or higher), you're good. If not, download it from [nodejs.org](https://nodejs.org) and install it.
3. **Git** installed (to download the project). Check with `git -v`.

> 💡 **What's a terminal?** It's the app where you type commands.
> - **Mac:** open **Terminal** (Cmd+Space, type "Terminal").
> - **Windows:** open **Command Prompt** or **PowerShell**.

---

## Step 1 — Create a Basecamp app (one time only)

This gives you the keys the dashboard needs to talk to Basecamp.

1. Go to https://launchpad.37signals.com/integrations/ and create a new app.
2. Fill in the fields:
   - **Application name:** anything (e.g. `Sibest`)
   - **Company name:** anything
   - **Website URL** and **Redirect URI:** `https://example.com`
   - **Product:** select **Basecamp 4 ONLY**
3. Click the app you just created. You'll now see your **Client ID** and **Client Secret**. Keep this page open.

---

## Step 2 — Get your Access Token & Refresh Token

1. Paste this URL into your browser, replacing `YOUR_CLIENT_ID` with the Client ID from Step 1:
   ```
   https://launchpad.37signals.com/authorization/new?type=web_server&client_id=YOUR_CLIENT_ID&redirect_uri=https://example.com
   ```
2. Approve the request. You'll land on a blank `example.com` page — **that's expected**. Look at the address bar; the URL contains a code:
   ```
   https://example.com/?code=XXXXXX
   ```
   Copy that `XXXXXX` code. ⏱️ **It expires in ~10 minutes, so do the next step quickly.**
3. In your terminal, run the command below. Replace `YOUR_CLIENT_ID`, `YOUR_CLIENT_SECRET`, and `YOUR_CODE` with your own values.

   > ⚠️ **Important:** keep the quotes around the URL — without them the `&` symbols break the command.
   ```
   curl -X POST "https://launchpad.37signals.com/authorization/token?type=web_server&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&redirect_uri=https://example.com&code=YOUR_CODE"
   ```
4. The result includes an **`access_token`** and a **`refresh_token`**.
   **Copy both somewhere safe and never share them with anyone.**

---

## Step 3 — Download and run the project

1. Make a folder where you want the project to live, then go into it in your terminal:
   ```
   cd path/to/your/folder
   ```
2. Download the project (replace `<repo url>` with the actual repository URL):
   ```
   git clone <repo url>
   cd sibest-central
   ```
   > Cloning copies the project to your computer and lets you grab future updates easily (with `git pull`).
3. Install the project's dependencies:
   ```
   npm install
   ```
4. **(Optional but recommended) Enable automatic token refresh.** Access tokens expire after a while. If you create a `config.json` file in the project folder, the app can renew your token for you using the refresh token. Create `config.json` like this, filling in your own values from Step 1:
   ```json
   {
     "clientId": "YOUR_CLIENT_ID",
     "clientSecret": "YOUR_CLIENT_SECRET",
     "redirectUri": "https://example.com"
   }
   ```
   > 🔒 `config.json` is ignored by Git on purpose, so your secrets are never uploaded. If you skip this file the app still works — you'll just need to refresh tokens manually when they expire.
5. Start the server and **leave this terminal window open** for as long as you want the dashboard running:
   ```
   node server.js
   ```
   You should see:
   ```
   Sibest Central is online
   Porting at: 3000
   ```

---

## Step 4 — Open and log in

1. Open your web browser and go to:
   ```
   http://localhost:3000
   ```
2. The login screen asks for two things:
   - **Account ID** – find it in the address bar when you're logged into Basecamp. Open Basecamp normally and look at the URL; it looks like `https://3.basecamp.com/YOUR_ACCOUNT_ID/projects`. The number in the middle is your Account ID.
   - **Access Token** – the `access_token` you saved in Step 2. (If you set up `config.json`, you can also paste your refresh token so the app can renew automatically.)
3. Save your **Account ID** somewhere — you'll reuse it for future logins.
4. You're in. 🎉

---

## Stopping and restarting

- **To stop the dashboard:** go to the terminal running it and press `Ctrl + C`, or just close that terminal window.
- **To start it again later:** open a terminal, `cd` into the project folder, and run `node server.js` again. (You don't need to repeat Steps 1–3.)

---

## Troubleshooting

| Problem | Likely fix |
|---|---|
| `node: command not found` | Node.js isn't installed — see "Before you start". |
| The curl command errors or hangs | Make sure the whole URL is wrapped in `"quotes"`. |
| "Missing token or account ID" in the browser | Re-enter your Access Token and Account ID on the login screen. |
| Login worked before but stopped | Your access token expired. Get a new one (Step 2) or set up `config.json` for auto-refresh. |
| `http://localhost:3000` won't load | Make sure the `node server.js` terminal is still open and running. |
| `config.json not found` warning in the terminal | Harmless — it just means auto token-refresh is off. Add `config.json` (Step 3.4) to enable it. |

---

## How it works (for the curious)

- `server.js` is a small Node.js web server that runs on **port 3000**. It serves the dashboard pages from the `public/` folder and forwards (`/api/...`) requests to the Basecamp API, attaching your token securely.
- Your token and account ID stay between your browser, your local server, and Basecamp — nothing is sent anywhere else.
