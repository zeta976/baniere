# 🚀 Quick Deploy Guide (5 Steps, 30 Minutes)

## TL;DR - Get Your App Online

**Free hosting:** Backend on Render.com + Frontend on Vercel = $0/month

---

## Step 1: Push to GitHub (5 min)

### Option A: Use PowerShell Script (Recommended)
```powershell
.\deploy-to-github.ps1
```

The script will:
- Initialize git
- Ask for your GitHub username
- Set up remote
- Commit files
- Guide you through next steps

### Option B: Manual Commands
```bash
git init
git add .
git commit -m "Initial commit: Baniere schedule generator"
git remote add origin https://github.com/YOUR_USERNAME/baniere.git
git branch -M main
git push -u origin main
```

**Before pushing:**
1. Go to https://github.com/new
2. Repository name: `baniere`
3. **Make it PUBLIC** (required for free tier)
4. Don't initialize with README
5. Click "Create repository"

---

## Step 2: Deploy Backend to Render (10 min)

### 2.1 Sign Up
- Go to https://render.com/register
- Sign up with your GitHub account

### 2.2 Create Web Service
1. Click "New +" → "Web Service"
2. Click "Configure account" → Connect your GitHub
3. Select `baniere` repository
4. Fill in:
   - **Name:** `baniere-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** `Free`

### 2.3 Add Environment Variables
Click "Advanced" → Add environment variables:

```
NODE_ENV=production
PORT=3001
COURSES_JSON_PATH=../courses.json
```

### 2.4 Create Service
- Click "Create Web Service"
- Wait 5-10 minutes for build
- Your backend URL: `https://baniere-backend-XXXX.onrender.com`

**Copy this URL - you'll need it for Step 3!**

---

## Step 3: Update CORS (2 min)

We need to allow your frontend to connect to the backend.

### Edit backend/src/index.ts

Find the `corsOptions` section and update it:

```typescript
const corsOptions: CorsOptions = {
  origin: [
    'http://localhost:5173',
    'https://baniere-backend-XXXX.onrender.com', // Your Render URL
    /\.vercel\.app$/  // Allow all Vercel preview URLs
  ],
  credentials: true
};
```

### Commit and Push
```bash
git add backend/src/index.ts
git commit -m "Update CORS for production"
git push
```

Render will automatically redeploy (2-3 minutes).

---

## Step 4: Deploy Frontend to Vercel (5 min)

### 4.1 Update Production API URL

Edit `frontend/.env.production`:

```bash
VITE_API_BASE_URL=https://baniere-backend-XXXX.onrender.com/api
```

Replace `XXXX` with your actual Render URL from Step 2.

### 4.2 Commit and Push
```bash
git add frontend/.env.production
git commit -m "Add production API URL"
git push
```

### 4.3 Deploy to Vercel
1. Go to https://vercel.com/signup
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Import `baniere` repository
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   
6. Click "Deploy"
7. Wait 2-3 minutes
8. **Copy your URL:** `https://baniere-XXXX.vercel.app`

---

## Step 5: Test Your App (5 min)

### 5.1 Check Backend Health
Visit: `https://baniere-backend-XXXX.onrender.com/health`

Should see:
```json
{
  "status": "ok",
  "timestamp": "2024-11-01...",
  "environment": "production"
}
```

**First visit may take 30 seconds** (cold start on free tier).

### 5.2 Test Frontend
1. Visit your Vercel URL: `https://baniere-XXXX.vercel.app`
2. Search for courses (e.g., "ADMI")
3. Add 2-3 courses
4. Click "Generar Horarios"
5. Should see schedules appear!

### 5.3 Open Browser Console
Press F12, check for:
- ✅ No errors
- ✅ API calls to your Render backend
- ✅ Successful responses

---

## 🎉 Done! Share Your App

**Your public URLs:**
- Frontend: `https://baniere-XXXX.vercel.app`
- Backend: `https://baniere-backend-XXXX.onrender.com`

### Update README
Edit `README.md` line 5:

```markdown
> **🚀 [Live Demo](https://baniere-XXXX.vercel.app)**
```

Commit and push:
```bash
git add README.md
git commit -m "Add live demo link"
git push
```

---

## Common Issues & Fixes

### ❌ "API Request Failed" in Frontend

**Check:**
1. Is backend URL correct in `frontend/.env.production`?
2. Did you push the changes?
3. Did Vercel redeploy? (Check dashboard)

**Fix:**
```bash
# Verify env file
cat frontend/.env.production

# Should show: VITE_API_BASE_URL=https://your-backend-url.onrender.com/api

# Trigger redeploy in Vercel dashboard
```

### ❌ CORS Error

**Symptom:** Browser console shows "CORS policy" error

**Fix:**
1. Make sure you updated CORS in `backend/src/index.ts`
2. Make sure your Vercel URL is in the CORS origin list
3. Redeploy backend (Render auto-redeploys on push)

### ❌ Backend 502 Bad Gateway

**Cause:** Backend is sleeping (free tier)

**Fix:** Just wait 30 seconds. Refresh page. It will wake up.

### ❌ "courses.json not found"

**Fix:** Make sure `courses.json` is in the root directory and committed to git.

---

## Free Tier Limitations

**Render Backend:**
- ✅ 750 hours/month (plenty for testing/demos)
- ⚠️ Sleeps after 15 min of inactivity
- ⚠️ 30-second cold start on wake
- ✅ Automatically wakes on request

**Vercel Frontend:**
- ✅ Unlimited bandwidth
- ✅ No sleep time
- ✅ Global CDN (fast everywhere)
- ✅ Automatic SSL

**Cost: $0/month for both!**

---

## Optional: Keep Backend Awake

Add this to `backend/src/index.ts` (after app.listen):

```typescript
// Keep service awake (uses free tier hours faster)
if (process.env.NODE_ENV === 'production') {
  const BACKEND_URL = process.env.RENDER_EXTERNAL_URL || 'https://baniere-backend-XXXX.onrender.com';
  
  setInterval(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      console.log(`Keep-alive ping: ${response.status}`);
    } catch (error) {
      console.error('Keep-alive ping failed:', error);
    }
  }, 14 * 60 * 1000); // Ping every 14 minutes
}
```

This prevents sleep but uses your 750 free hours faster.

---

## Next Steps

1. **Share URL** with friends/classmates
2. **Collect feedback** via Google Forms
3. **Monitor usage** in Render/Vercel dashboards
4. **Update data** by replacing `courses.json` and pushing
5. **Add features** and redeploy automatically on push

---

## Get Help

- **Full guide:** See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Render issues:** https://community.render.com
- **Vercel issues:** https://vercel.com/docs
- **Project issues:** Open GitHub issue on your repo

---

## Estimated Time Breakdown

- GitHub setup: 5 minutes
- Render deploy: 10 minutes
- CORS update: 2 minutes
- Vercel deploy: 5 minutes
- Testing: 5 minutes

**Total: ~30 minutes**

Good luck! 🚀
