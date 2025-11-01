# PowerShell script to upload Baniere to GitHub
# Run this script to initialize git and push to GitHub

Write-Host "🚀 Baniere GitHub Deployment Script" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
try {
    git --version | Out-Null
} catch {
    Write-Host "❌ Error: Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Check if already initialized
if (Test-Path ".git") {
    Write-Host "✓ Git repository already initialized" -ForegroundColor Green
} else {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Git initialized" -ForegroundColor Green
}

# Get GitHub username
Write-Host ""
$username = Read-Host "Enter your GitHub username"

if ([string]::IsNullOrWhiteSpace($username)) {
    Write-Host "❌ Error: Username cannot be empty!" -ForegroundColor Red
    exit 1
}

# Create remote URL
$remoteUrl = "https://github.com/$username/baniere.git"

# Check if remote exists
$remoteExists = git remote | Select-String -Pattern "origin" -Quiet

if ($remoteExists) {
    Write-Host "✓ Remote 'origin' already configured" -ForegroundColor Green
    $currentRemote = git remote get-url origin
    Write-Host "  Current remote: $currentRemote" -ForegroundColor Gray
    
    $change = Read-Host "Do you want to change it to $remoteUrl? (y/n)"
    if ($change -eq "y") {
        git remote set-url origin $remoteUrl
        Write-Host "✓ Remote URL updated" -ForegroundColor Green
    }
} else {
    Write-Host "Adding remote 'origin'..." -ForegroundColor Yellow
    git remote add origin $remoteUrl
    Write-Host "✓ Remote added: $remoteUrl" -ForegroundColor Green
}

# Stage all files
Write-Host ""
Write-Host "Staging files..." -ForegroundColor Yellow
git add .

# Create commit
Write-Host "Creating commit..." -ForegroundColor Yellow
git commit -m "Initial commit: Baniere schedule generator with cycle support and advanced filters"

# Rename branch to main if needed
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-Host "Renaming branch to 'main'..." -ForegroundColor Yellow
    git branch -M main
}

# Instructions
Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✓ Git repository is ready!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to: https://github.com/new" -ForegroundColor White
Write-Host "   - Repository name: baniere" -ForegroundColor Gray
Write-Host "   - Make it PUBLIC (required for free deployment)" -ForegroundColor Gray
Write-Host "   - DON'T initialize with README" -ForegroundColor Gray
Write-Host ""
Write-Host "2. After creating the repo, run:" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Then follow DEPLOYMENT.md for hosting setup" -ForegroundColor White
Write-Host ""
Write-Host "Your repository URL will be:" -ForegroundColor Yellow
Write-Host "https://github.com/$username/baniere" -ForegroundColor Cyan
Write-Host ""

# Offer to open GitHub
$openGitHub = Read-Host "Open GitHub in browser to create repository? (y/n)"
if ($openGitHub -eq "y") {
    Start-Process "https://github.com/new"
}

Write-Host ""
Write-Host "✓ Setup complete! Follow the steps above." -ForegroundColor Green
