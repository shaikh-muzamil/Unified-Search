# ☁️ Deployment Guide: Vercel + Postgres

This app is set up to run on **Vercel** (free tier) with a **PostgreSQL** database (Cloud).

## 1. Prerequisites Setup (Database)

You need a PostgreSQL database URL. You can get a free one from [Neon.tech](https://neon.tech) or Vercel Storage.

1.  Create a project on [Neon.tech](https://neon.tech).
2.  Copy your **Connection String**. It looks like:
    `postgres://user:password@ep-xyz.us-east-1.aws.neon.tech/neondb?sslmode=require`
    `postgres://user:password@ep-xyz.us-east-1.aws.neon.tech/neondb?sslmode=require`

## 2. Prerequisites Setup (Slack App)

To get your **Client ID**, **Client Secret**, and set your **Redirect URL**:

1.  Go to [Your Apps](https://api.slack.com/apps) on Slack API.
2.  Create a new app (from scratch) or select an existing one.
3.  **Client ID & Secret**:
    - Navigate to **"Basic Information"** in the left sidebar.
    - Scroll down to **"App Credentials"**.
    - Copy the `Client ID` and `Client Secret`.
4.  **Redirect URL**:
    - Navigate to **"OAuth & Permissions"** in the left sidebar.
    - Scroll down to **"Redirect URLs"**.
    - Add your redirect URL:
        - **Local**: `http://localhost:3000/auth/slack/callback`
        - **Production**: `https://<your-vercel-project>.vercel.app/auth/slack/callback`
    - Click **"Save URLs"**.
5.  **Scopes**:
    - Still in "OAuth & Permissions", scroll to **"Scopes"**.
    - Add **User Token Scopes**:
        - `search:read`
        - `users:read` (optional, for better user info) 


### 1. Push to GitHub
1.  **Initialize Git** (if you haven't already):
    Open your terminal in the project folder and run:
    ```bash
    git init
    git branch -M main
    ```

2.  **Add Files**:
    ```bash
    git add .
    ```

3.  **Commit**:
    ```bash
    git commit -m "Initial commit"
    ```

4.  **Connect to GitHub**:
    Replace `<YOUR_REPO_URL>` with the URL of the repository you created on GitHub (e.g., `https://github.com/username/repo.git`).
    ```bash
    git remote add origin <YOUR_REPO_URL>
    ```

5.  **Push**:
    ```bash
    git push -u origin main
    ```

### 2. Import into Vercel
1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New Project"**.
3.  Import your GitHub repository.

### 3. Configure Project
1.  **Framework Preset**: Select "Other" (Vercel should detect it).
2.  **Build Command**: Leave it as default (Vercel will run `npm run build`).
3.  **Output Directory**: Leave it as default (managed by `vercel.json` rewrites).

### 4. Environment Variables
Add these variables in the **Environment Variables** section:

| Variable | Value |
| :--- | :--- |
| `DATABASE_URL` | Your Neon Connection String (`postgres://...`) |
| `SLACK_USER_TOKEN` | Your Slack User Token (`xoxp-...`) |
| `NOTION_API_KEY` | Your Notion Integration Key (`ntn_...`) |
| `NODE_ENV` | `production` |

### 5. Deploy
Click **Deploy**. Vercel will install dependencies, build the project (compile TypeScript), and start the server.

## 3. That's it!

Vercel will build your app, and on the first run, the app will automatically create the `users` and `session` tables in your database.
