# 🚀 Vercel Deployment Guide — Land & Beyond Platform

This project is fully configured and ready for **1-click deployment on Vercel**.

---

## 🛠️ Architecture on Vercel

* **Frontend Web Pages**: Served globally at the edge with fast static CDN delivery (`index.html`, `dashboard.html`, `admin-login.html`, `admin.html`, etc.).
* **API Endpoints**: Deployed automatically as Vercel Serverless Functions in `/api`:
  * `GET /api/status` — Live system health and Supabase connection indicator.
  * `GET /api/db` — Authoritative database read with automatic cloud sync.
  * `POST /api/data` — Real-time persistence and bidirectional Supabase sync.
* **Database**: Direct integration with **Supabase Cloud PostgreSQL** (`properties`, `new_projects`, `farmland`, `site_tours`, `interiors`, `poojas`).

---

## ⚡ Deployment Options

### Option 1: Via Vercel Dashboard (Recommended)
1. Push your project to **GitHub / GitLab / Bitbucket**.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..." ➔ "Project"**.
3. Import your repository.
4. Under **Environment Variables**, add:
   * `SUPABASE_URL` = *(Your Supabase project URL)*
   * `SUPABASE_KEY` = *(Your Supabase service_role or anon key)*
5. Click **Deploy**! 🚀

---

### Option 2: Via Vercel CLI
Run the following commands in your project directory:
```bash
# 1. Install or run Vercel CLI
npx vercel

# 2. Deploy to Production
npx vercel --prod
```
During the prompt, link to your Vercel account and set your environment variables when prompted.

---

## 🔑 Environment Variables Required on Vercel

Configure these in **Vercel Project Settings ➔ Environment Variables**:

| Variable Name | Description | Example / Current Value |
| :--- | :--- | :--- |
| `SUPABASE_URL` | Supabase Cloud API URL | `https://sihonlqghknttwyryzup.supabase.co` |
| `SUPABASE_KEY` | Supabase anon or service API key | *(Your Supabase API Key from .env)* |

---

## ✅ Pre-Deployment Verification Checklist

- [x] Serverless Functions created under `api/` (`api/status.js`, `api/db.js`, `api/data.js`).
- [x] `vercel.json` configured with clean URLs, CORS headers, and route rewrites.
- [x] Wildcard rewrite conflicts removed so `/api/*` and static pages are never blocked.
- [x] Dual sync active (local fallback + Supabase Cloud PostgreSQL).
- [x] Automated Vitest test suite (`npm test`) passing with 100% success rate (14/14 tests).
