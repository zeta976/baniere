# 🚀 Deploy Baniere to the Web - START HERE

## What You'll Get

**Free public URLs for your schedule generator:**
- Frontend: `https://baniere-xxxx.vercel.app` (your users access this)
- Backend: `https://baniere-backend-xxxx.onrender.com` (API)

**Total cost: $0/month** ✅

**Total time: ~30 minutes** ⏱️

---

## Quick Overview

Your project will be hosted on:
1. **GitHub** - Code repository (free)
2. **Render.com** - Backend API (free tier)
3. **Vercel** - Frontend website (free tier)

---

## Step-by-Step Process

### Step 1: Push to GitHub (5 min)

**Follow:** [GITHUB-SETUP.md](./GITHUB-SETUP.md)

Summary:
```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/baniere.git
git push -u origin main
```

### Step 2: Deploy Backend + Frontend (25 min)

**Follow:** [QUICK-DEPLOY.md](./QUICK-DEPLOY.md)

This covers:
- Deploy backend to Render
- Update CORS settings
- Deploy frontend to Vercel
- Test everything works

### Need More Details?

**See:** [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive guide with:
- Troubleshooting
- Alternative hosting options
- Performance optimization
- Monitoring setup

---

## Files Created for You

✅ **GITHUB-SETUP.md** - Commands to push to GitHub
✅ **QUICK-DEPLOY.md** - Fast deployment guide (30 min)
✅ **DEPLOYMENT.md** - Complete deployment documentation
✅ **frontend/.env.production** - Production API configuration
✅ **render.yaml** - Render.com configuration file

---

## What Happens After Deployment?

### Automatic Updates
- Every time you `git push`, both frontend and backend redeploy automatically
- No manual deployment needed after initial setup

### Sharing Your App
1. Copy your Vercel URL: `https://baniere-xxxx.vercel.app`
2. Share with classmates/friends
3. They can use it immediately - no installation needed

### Updating Course Data
```powershell
# 1. Replace courses.json with new data
# 2. Commit and push
git add courses.json
git commit -m "Update course data"
git push

# 3. Backend auto-redeploys with new data (2-3 min)
```

---

## Support & Documentation

📖 **README.md** - Project overview
📋 **CHANGELOG.md** - Features implemented
🔧 **SETUP.md** - Local development setup
📝 **instructions.md** - Technical documentation

---

## Ready to Start?

**Next action:** Open [GITHUB-SETUP.md](./GITHUB-SETUP.md) and follow the commands to push to GitHub.

After GitHub is set up, follow [QUICK-DEPLOY.md](./QUICK-DEPLOY.md) for deployment.

**Questions?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed explanations and troubleshooting.

Good luck! 🎉
