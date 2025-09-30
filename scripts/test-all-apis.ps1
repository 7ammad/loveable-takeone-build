#!/usr/bin/env pwsh
# TakeOne Backend - API Endpoint Testing Script
# Tests all critical API endpoints to ensure they're working

param(
    [string]$BaseUrl = "http://localhost:3000",
    [switch]$Verbose
)

Write-Host "🚀 TakeOne API Endpoint Testing Suite" -ForegroundColor Cyan
Write-Host "Testing against: $BaseUrl`n" -ForegroundColor Gray
Write-Host "================================================`n" -ForegroundColor Cyan

$PassCount = 0
$FailCount = 0
$SkipCount = 0

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [int]$ExpectedStatus = 200,
        [string]$Description
    )

    Write-Host "Testing: $Description" -ForegroundColor Yellow
    Write-Host "  $Method $Endpoint" -ForegroundColor Gray

    try {
        $params = @{
            Uri = "$BaseUrl$Endpoint"
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }

        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }

        $response = Invoke-WebRequest @params -ErrorAction Stop

        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "  ✅ PASS (Status: $($response.StatusCode))" -ForegroundColor Green
            $script:PassCount++
            
            if ($Verbose -and $response.Content) {
                Write-Host "  Response: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))..." -ForegroundColor Gray
            }
        } else {
            Write-Host "  ❌ FAIL (Expected: $ExpectedStatus, Got: $($response.StatusCode))" -ForegroundColor Red
            $script:FailCount++
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "  ✅ PASS (Status: $statusCode)" -ForegroundColor Green
            $script:PassCount++
        } else {
            Write-Host "  ❌ FAIL (Expected: $ExpectedStatus, Got: $statusCode)" -ForegroundColor Red
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
            $script:FailCount++
        }
    }

    Write-Host ""
}

# Health Check
Write-Host "🏥 Health & Status Endpoints" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Test-Endpoint -Method "GET" -Endpoint "/api/v1/health" -ExpectedStatus 200 -Description "Health check endpoint"

# Authentication Endpoints (expect 400/401 without proper data)
Write-Host "🔐 Authentication Endpoints" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Test-Endpoint -Method "POST" -Endpoint "/api/v1/auth/register" -ExpectedStatus 400 -Description "Register endpoint (without body)"

Test-Endpoint -Method "POST" -Endpoint "/api/v1/auth/login" -ExpectedStatus 400 -Description "Login endpoint (without body)"

Test-Endpoint -Method "POST" -Endpoint "/api/v1/auth/logout" -ExpectedStatus 401 -Description "Logout endpoint (without auth)"

Test-Endpoint -Method "POST" -Endpoint "/api/v1/auth/refresh" -ExpectedStatus 401 -Description "Refresh token endpoint (without auth)"

# Nafath Endpoints
Write-Host "🛡️ Nafath Verification Endpoints" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Test-Endpoint -Method "POST" -Endpoint "/api/v1/auth/nafath/initiate" -ExpectedStatus 400 -Description "Nafath initiation (without data)"

Test-Endpoint -Method "GET" -Endpoint "/api/v1/auth/nafath/status?userId=test" -ExpectedStatus 200 -Description "Nafath status check"

Test-Endpoint -Method "POST" -Endpoint "/api/v1/auth/nafath/renew" -ExpectedStatus 400 -Description "Nafath renewal (without data)"

Test-Endpoint -Method "POST" -Endpoint "/api/v1/auth/nafath/webhook" -ExpectedStatus 400 -Description "Nafath webhook (without signature)"

# Digital Twin Admin Endpoints (expect 401 without auth)
Write-Host "🤖 Digital Twin Admin Endpoints" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Test-Endpoint -Method "GET" -Endpoint "/api/v1/admin/digital-twin/sources" -ExpectedStatus 401 -Description "List ingestion sources"

Test-Endpoint -Method "POST" -Endpoint "/api/v1/admin/digital-twin/sources" -ExpectedStatus 401 -Description "Create ingestion source"

Test-Endpoint -Method "GET" -Endpoint "/api/v1/admin/digital-twin/validation-queue" -ExpectedStatus 401 -Description "Get validation queue"

Test-Endpoint -Method "GET" -Endpoint "/api/v1/admin/nafath/status" -ExpectedStatus 401 -Description "Admin Nafath status"

# Search Endpoints (expect 400 without query params)
Write-Host "🔍 Search Endpoints" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Test-Endpoint -Method "GET" -Endpoint "/api/v1/search/talent" -ExpectedStatus 400 -Description "Talent search (without params)"

Test-Endpoint -Method "GET" -Endpoint "/api/v1/search/casting-calls" -ExpectedStatus 400 -Description "Casting call search (without params)"

# Media Endpoints (expect 401/400 without auth/data)
Write-Host "📸 Media Endpoints" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Test-Endpoint -Method "POST" -Endpoint "/api/v1/media/upload" -ExpectedStatus 401 -Description "Media upload (without auth)"

# Billing Endpoints (expect 401/400 without auth/data)
Write-Host "💳 Billing Endpoints" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Test-Endpoint -Method "POST" -Endpoint "/api/v1/billing/subscription/create" -ExpectedStatus 401 -Description "Create subscription (without auth)"

Test-Endpoint -Method "GET" -Endpoint "/api/v1/billing/subscription/status" -ExpectedStatus 401 -Description "Subscription status (without auth)"

Test-Endpoint -Method "POST" -Endpoint "/api/v1/billing/webhook" -ExpectedStatus 400 -Description "Billing webhook (without signature)"

# Summary Report
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📊 API Testing Summary" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "Total Tests: $($PassCount + $FailCount + $SkipCount)" -ForegroundColor Gray
Write-Host "Passed: $PassCount" -ForegroundColor Green
Write-Host "Failed: $FailCount" -ForegroundColor $(if ($FailCount -eq 0) { "Green" } else { "Red" })
Write-Host "Skipped: $SkipCount" -ForegroundColor Yellow

if ($FailCount -eq 0) {
    Write-Host "`n✅ All API endpoints are responding as expected!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n❌ Some API endpoints failed! Review the output above." -ForegroundColor Red
    exit 1
}

