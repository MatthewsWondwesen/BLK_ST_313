# Deploy BLK_ST_313 syllabus to a NEW GitHub Pages site.
# Usage: .\deploy.ps1

$ErrorActionPreference = "Stop"
$RepoName = "BLK_ST_313"
$RemoteUrl = "https://github.com/MatthewsWondwesen/BLK_ST_313.git"

$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

Write-Host "Checking GitHub login..." -ForegroundColor Cyan
$authCheck = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "Log in to GitHub (browser will open)..." -ForegroundColor Yellow
  gh auth login -h github.com -p https -w
  if ($LASTEXITCODE -ne 0) {
    Write-Error "GitHub login failed. Run: gh auth login -h github.com -p https -w"
  }
}

$owner = (gh api user -q .login)
Write-Host "GitHub account: $owner" -ForegroundColor Green

Write-Host "Checking if repo '$RepoName' already exists..." -ForegroundColor Cyan
$exists = gh repo view "MatthewsWondwesen/$RepoName" 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Warning "Could not verify repo via gh. Continuing with push to $RemoteUrl"
}

if (-not (Test-Path ".git")) {
  git init -b main
}

git add .
$staged = git diff --cached --name-only
if ($staged) {
  $gitName = gh api user -q .name
  if (-not $gitName) { $gitName = gh api user -q .login }
  $gitEmail = gh api user -q .email
  if (-not $gitEmail) { $gitEmail = "$(gh api user -q .login)@users.noreply.github.com" }
  git -c "user.name=$gitName" -c "user.email=$gitEmail" commit -m "Publish BLK_ST_313 Motherhood as Survival syllabus site"
}

$remote = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Connecting to $RemoteUrl" -ForegroundColor Cyan
  git remote add origin $RemoteUrl
  git push -u origin main
} else {
  Write-Host "Pushing to existing remote..." -ForegroundColor Cyan
  git push -u origin main
}

Write-Host "Enabling GitHub Pages..." -ForegroundColor Cyan
gh api "repos/MatthewsWondwesen/$RepoName/pages" -X POST -f "build_type=legacy" -f "source[branch]=main" -f "source[path]=/" 2>$null
if ($LASTEXITCODE -ne 0) {
  gh api "repos/MatthewsWondwesen/$RepoName/pages" -X PUT -f "build_type=legacy" -f "source[branch]=main" -f "source[path]=/" 2>$null
}

Start-Sleep -Seconds 3
$pagesUrl = "https://matthewswondwesen.github.io/BLK_ST_313/"
Write-Host ""
Write-Host "Done! Your site will be live at:" -ForegroundColor Green
Write-Host $pagesUrl -ForegroundColor White
Write-Host "(GitHub Pages can take 1-2 minutes to build the first time.)" -ForegroundColor DarkGray
