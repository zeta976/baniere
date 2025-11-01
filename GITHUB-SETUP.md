# GitHub Setup - Step by Step

## Run These Commands in PowerShell

Open PowerShell in the Baniere directory and run:

```powershell
# 1. Initialize git repository
git init

# 2. Add all files
git add .

# 3. Create initial commit
git commit -m "Initial commit: Baniere schedule generator"

# 4. Rename branch to main
git branch -M main
```

## Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: **baniere**
3. Make it **PUBLIC** (required for free deployment)
4. **Don't** initialize with README
5. Click "Create repository"

## Push to GitHub

After creating the repository, run (replace YOUR_USERNAME with your GitHub username):

```powershell
# 5. Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/baniere.git

# 6. Push to GitHub
git push -u origin main
```

## What's Next?

After pushing to GitHub, follow **QUICK-DEPLOY.md** for deployment to Render + Vercel.

**Total time:** 5 minutes
