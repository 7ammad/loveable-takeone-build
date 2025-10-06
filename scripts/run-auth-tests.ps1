# TakeOne Authentication Test Runner
# PowerShell script to run auth tests with proper setup

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🧪 TakeOne Authentication Test Suite" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if server is running
Write-Host "Checking if server is running..." -ForegroundColor White
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 2 -ErrorAction Stop
    $serverRunning = $true
    Write-Host "✓ Server is running at http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "✗ Server is not running" -ForegroundColor Red
    Write-Host "  Starting server..." -ForegroundColor Yellow
    
    # Start server in background
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; pnpm start" -WindowStyle Minimized
    Write-Host "  Waiting for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Check again
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✓ Server started successfully" -ForegroundColor Green
        $serverRunning = $true
    } catch {
        Write-Host "✗ Failed to start server" -ForegroundColor Red
        Write-Host "  Please start the server manually with: pnpm start" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""

# Check environment variables
Write-Host "Checking environment configuration..." -ForegroundColor White
$envOk = $true

if (-not (Test-Path ".env.local")) {
    Write-Host "✗ .env.local file not found" -ForegroundColor Red
    $envOk = $false
}

if ($envOk) {
    Write-Host "✓ Environment configured" -ForegroundColor Green
}

Write-Host ""

# Run tests
Write-Host "Running tests..." -ForegroundColor White
Write-Host ""

# Run vitest
pnpm test

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test run complete!" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

