# 🚀 Permanent 24/7 Live Deployment Guide (GitHub Mechanism)

Deploy your AlphaTerminal website permanently to the internet for **100% free** so you can access it **anytime, anywhere, from any device** (phone, tablet, laptop, or shared via WhatsApp) — even when your computer is completely turned off!

---

## ⚡ Method 1: 1-Click Script (`deploy_to_github.bat`)

We have created an automated deployment tool in your project folder.

### Step 1: Create a GitHub Repository (30 seconds)
1. Open your browser and go to: [**github.com/new**](https://github.com/new)
2. **Repository name**: `alpha-terminal` (or any name you prefer).
3. Set visibility to **Public**.
4. **DO NOT** check "Add a README" or ".gitignore" (these already exist in your project).
5. Click **Create repository**.
6. Copy your repository HTTPS URL (e.g. `https://github.com/YOUR_USERNAME/alpha-terminal.git`).

### Step 2: Run the 1-Click Deploy Script
In your project folder (`d:\Analysis`), double-click:
```cmd
deploy_to_github.bat
```
* Paste your GitHub repository URL when prompted.
* The script will automatically push all files and deploy your live site!

### Step 3: Enable GitHub Pages in your Repository
1. On your GitHub repository page, go to **Settings** -> **Pages** (in the left sidebar).
2. Under **Build and deployment**:
   * **Source**: Select **GitHub Actions** (recommended) or **Deploy from a branch** -> select `gh-pages` branch.
3. Within 1 minute, your website will be live at:
   👉 **`https://<YOUR_GITHUB_USERNAME>.github.io/alpha-terminal/`**

---

## ⚡ Method 2: Manual Git Commands (Terminal)

If you prefer using PowerShell / Git directly:
```bash
# 1. Add your GitHub remote repository (replace with your actual URL)
git remote add origin https://github.com/YOUR_USERNAME/alpha-terminal.git

# 2. Push to main branch
git push -u origin main

# 3. Publish to GitHub Pages
npm run deploy
```

---

## ⚡ Method 3: 1-Click Vercel Deployment (Alternative)

If you have a free [Vercel](https://vercel.com) account:
1. Go to [vercel.com/new](https://vercel.com/new).
2. Select your `alpha-terminal` repository from GitHub.
3. Click **Deploy**.
4. Your site will be live instantly with a custom URL like:
   👉 **`https://alpha-terminal.vercel.app`**

---

## 💾 Storage & Compression Summary
* **Deleted heavy binaries:** Removed `cloudflared.exe` (saved 53 MB).
* **Purged temporary build caches:** Cleaned npm cache (freed 1 GB on C: drive).
* **Compressed bundle:** Entire production bundle is optimized and gzipped to only **~147 KB**, enabling instant loading on mobile 4G/5G networks.
* **Storage status:** Your D: drive has **231.9 GB of free space** and the Git repository footprint is only **0.19 MB**.
