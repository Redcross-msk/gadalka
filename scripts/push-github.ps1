# Push на GitHub (после создания репо на github.com/new)

# 1) Создайте пустой Private-репозиторий: https://github.com/new
#    Имя: gadalka  |  без README
# 2) Подставьте ВАШ_ЛОГИН ниже и выполните:

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$login = Read-Host "GitHub login или org (например Redcross-msk)"
$repo  = Read-Host "Имя репозитория [gadalka]"
if ([string]::IsNullOrWhiteSpace($repo)) { $repo = "gadalka" }

$url = "https://github.com/$login/$repo.git"
Write-Host "Remote: $url"

$existing = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
  git remote set-url origin $url
} else {
  git remote add origin $url
}

git branch -M main
git push -u origin main
Write-Host "Готово. Напишите в чат: готово + $url"
