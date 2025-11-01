# 🚀 Deployment Guide

## Overview

This guide will help you deploy Baniere to the web for free using:
- **GitHub** - Code hosting
- **Render.com** - Free backend hosting (or Railway/Fly.io alternatives)
- **Vercel/Netlify** - Free frontend hosting

---

## Part 1: Upload to GitHub

### Step 1: Initialize Git Repository

```bash
cd c:\Users\EQ01\OneDrive\Escritorio\Baniere
git init
git add .
git commit -m "Initial commit: Baniere schedule generator"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `baniere`
3. Description: "University schedule generator - Generates all possible schedules based on course selections and filters"
4. **Keep it PUBLIC** (so it's free to deploy)
5. **Don't** initialize with README (we already have one)
6. Click "Create repository"

### Step 3: Push to GitHub

Replace `YOUR_USERNAME` with your GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/baniere.git
git branch -M main
git push -u origin main
```

---

## Part 2: Deploy Backend (Render.com - FREE)

### Why Render?
- ✅ Free tier (750 hours/month)
- ✅ Supports Node.js
- ✅ Auto-deploys from GitHub
- ✅ Provides HTTPS automatically
- ✅ No credit card required

### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### Step 2: Create Web Service

1. Click "New +" → "Web Service"
2. Connect your `baniere` repository
3. Configure:
   - **Name:** `baniere-backend`
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

### Step 3: Add Environment Variables

In Render dashboard → Environment:

```
NODE_ENV=production
PORT=3001
COURSES_JSON_PATH=../courses.json
```

### Step 4: Deploy

1. Click "Create Web Service"
2. Wait 5-10 minutes for initial build
3. Note your backend URL: `https://baniere-backend.onrender.com`

**Important:** Free tier sleeps after 15 min of inactivity. First request will be slow (~30 seconds) as it wakes up.

---

## Part 3: Deploy Frontend (Vercel - FREE)

### Why Vercel?
- ✅ Completely free for personal projects
- ✅ Global CDN
- ✅ Auto-deploys from GitHub
- ✅ Custom domains supported
- ✅ Perfect for React/Vite apps

### Step 1: Prepare Frontend

Create `frontend/.env.production`:

```bash
VITE_API_BASE_URL=https://baniere-backend.onrender.com/api
```

Commit and push:

```bash
git add frontend/.env.production
git commit -m "Add production API URL"
git push
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com/signup
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Import your `baniere` repository
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

6. Click "Deploy"
7. Wait 2-3 minutes
8. Get your URL: `https://baniere-xxx.vercel.app`

---

## Alternative: Netlify (Frontend)

If you prefer Netlify over Vercel:

1. Go to https://netlify.com
2. Sign up with GitHub
3. "Add new site" → "Import existing project"
4. Connect to `baniere` repo
5. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
6. Add environment variable:
   - `VITE_API_BASE_URL` = `https://baniere-backend.onrender.com/api`

---

## Alternative Backend Hosts

### Railway.app (Alternative to Render)

**Pros:**
- More generous free tier ($5/month credit)
- Faster cold starts
- Better performance

**Cons:**
- Requires credit card (won't charge on free tier)

**Setup:**
1. https://railway.app → Sign up
2. New Project → Deploy from GitHub
3. Select `baniere` repo
4. Add service → Select `backend` folder
5. Add variables (same as Render)
6. Deploy

### Fly.io (Alternative to Render)

**Pros:**
- Excellent performance
- Global deployment
- Generous free tier

**Cons:**
- Requires credit card
- More complex setup

---

## Part 4: Configuration Updates

### Update CORS in Backend

Edit `backend/src/index.ts`:

```typescript
const corsOptions: CorsOptions = {
  origin: [
    'http://localhost:5173',
    'https://baniere-xxx.vercel.app',  // ← Add your Vercel URL
    'https://your-custom-domain.com'   // ← Add custom domain if you have one
  ],
  credentials: true
};
```

Commit and push:

```bash
git add backend/src/index.ts
git commit -m "Update CORS for production deployment"
git push
```

Render will auto-redeploy.

---

## Part 5: Testing Your Deployment

### Check Backend Health

Visit: `https://baniere-backend.onrender.com/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-10-29T...",
  "environment": "production"
}
```

### Check API Endpoints

Visit: `https://baniere-backend.onrender.com/api/courses/subjects/list`

Should return list of subjects.

### Test Frontend

1. Visit your Vercel URL
2. Open browser console (F12)
3. Search for courses
4. Generate schedules
5. Check console for API calls

---

## Troubleshooting

### Backend Issues

**Problem: 502 Bad Gateway**
- Solution: Wait 30 seconds (cold start on free tier)

**Problem: CORS errors**
- Solution: Check CORS configuration includes your Vercel URL
- Check browser console for exact error

**Problem: "courses.json not found"**
- Solution: Verify `COURSES_JSON_PATH=../courses.json` in env vars
- Check file is in root directory in GitHub

### Frontend Issues

**Problem: API calls failing**
- Solution: Check `VITE_API_BASE_URL` environment variable
- Check Network tab for actual URL being called
- Verify backend is running

**Problem: Blank page**
- Solution: Check browser console for errors
- Verify build succeeded in Vercel dashboard
- Check output directory is set to `dist`

**Problem: Environment variables not updating**
- Solution: Redeploy in Vercel after changing env vars
- Clear browser cache

---

## Cost Breakdown

### Completely Free Setup

✅ **GitHub** - Free (public repos)
✅ **Render Backend** - Free ($0/month, 750 hours)
✅ **Vercel Frontend** - Free ($0/month, unlimited bandwidth for personal)

**Total: $0/month**

**Limitations:**
- Backend sleeps after 15 min (30s wake up time)
- 750 hours/month backend uptime (good for demos/testing)
- No custom backend domain on free tier

### Upgraded Setup ($5-10/month)

If you need better performance:

**Option 1: Railway**
- $5/month credit
- No sleep time
- Faster backend

**Option 2: Render Paid**
- $7/month
- Always-on backend
- Better performance

Frontend stays free on Vercel!

---

## Performance Optimization for Free Tier

### Backend (Render)

**Keep it awake:**
```javascript
// Add to backend/src/index.ts
// Ping self every 14 minutes to prevent sleep
if (process.env.NODE_ENV === 'production') {
  setInterval(async () => {
    try {
      await fetch('https://baniere-backend.onrender.com/health');
      console.log('Keep-alive ping sent');
    } catch (error) {
      console.error('Keep-alive ping failed:', error);
    }
  }, 14 * 60 * 1000); // 14 minutes
}
```

**Note:** This uses your 750 free hours faster, but keeps response times low.

### Frontend (Vercel)

Already optimized! Vercel's CDN is fast globally.

---

## Custom Domain (Optional)

### For Frontend (Vercel)

1. Buy domain from Namecheap, Google Domains, etc. (~$10/year)
2. In Vercel dashboard → Settings → Domains
3. Add your domain
4. Update DNS records as instructed
5. Wait 5-10 minutes for propagation

### For Backend (Render - Paid only)

Free tier doesn't support custom domains.
Alternative: Use Cloudflare Workers as reverse proxy (free).

---

## Monitoring & Analytics

### Uptime Monitoring (Free)

Use UptimeRobot (https://uptimerobot.com):
- Monitor backend URL
- Get alerts when down
- 50 monitors free

### Analytics (Free)

**Frontend:**
- Vercel Analytics (built-in, free)
- Google Analytics
- Plausible Analytics

**Backend:**
- Render logs (built-in)
- LogRocket (free tier)

---

## Continuous Deployment

### Automatic Deploys

✅ Both Render and Vercel auto-deploy on git push to `main`

**Workflow:**
```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push

# Render redeploys backend automatically
# Vercel redeploys frontend automatically
# Wait 2-5 minutes
# Check live site
```

### Preview Deployments (Vercel)

Every PR gets a preview URL automatically!
Great for testing before merging.

---

## Security Checklist

Before going live:

- [ ] Environment variables are NOT in git
- [ ] `.env` files are in `.gitignore`
- [ ] CORS is configured (not `*`)
- [ ] Rate limiting enabled (add later if needed)
- [ ] HTTPS enabled (automatic on Render/Vercel)
- [ ] No API keys in frontend code
- [ ] Error messages don't expose sensitive info

---

## Next Steps After Deployment

1. **Share URL** - Give it to users to test
2. **Collect feedback** - Use Google Forms or TypeForm
3. **Monitor errors** - Check Render logs
4. **Update README** - Add live demo link
5. **Add badges** - "Live Demo" button in README

---

## Getting Help

**Render Support:**
- Community: https://community.render.com
- Docs: https://render.com/docs
- Status: https://status.render.com

**Vercel Support:**
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord

**Project Issues:**
- GitHub Issues on your repo
- Include logs from Render dashboard
- Include Network tab screenshots

---

## Estimated Timeline

- **GitHub setup:** 5 minutes
- **Render backend deploy:** 10-15 minutes
- **Vercel frontend deploy:** 5 minutes
- **Testing & debugging:** 15-30 minutes
- **Total:** 30-60 minutes

---

## Summary

**Free Public URL Setup:**

1. Push code to GitHub (public repo)
2. Deploy backend to Render (free tier)
3. Deploy frontend to Vercel (free tier)
4. Update CORS configuration
5. Test live site
6. Share URL!

**Your URLs will be:**
- Frontend: `https://baniere-[random].vercel.app`
- Backend: `https://baniere-backend.onrender.com`

Both can be customized with paid domains, but not required!

Good luck! 🚀
