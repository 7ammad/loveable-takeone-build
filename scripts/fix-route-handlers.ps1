# Script to fix Next.js 15 async params in route handlers

$files = @(
    "app/api/v1/applications/[id]/route.ts",
    "app/api/v1/applications/[id]/status/route.ts", 
    "app/api/v1/applications/[id]/withdraw/route.ts",
    "app/api/v1/casting-calls/[id]/route.ts",
    "app/api/v1/casting-calls/[id]/applications/route.ts",
    "app/api/v1/messages/[id]/route.ts",
    "app/api/v1/messages/[id]/read/route.ts",
    "app/api/v1/notifications/[id]/route.ts",
    "app/api/v1/notifications/[id]/read/route.ts",
    "app/api/v1/admin/digital-twin/validation/[id]/approve/route.ts",
    "app/api/v1/admin/digital-twin/validation/[id]/edit/route.ts",
    "app/api/v1/admin/digital-twin/validation/[id]/reject/route.ts",
    "app/api/v1/admin/digital-twin/sources/[id]/route.ts",
    "app/api/v1/auth/reset-password/[token]/route.ts",
    "app/api/v1/auth/verify-email/[token]/route.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing $file..." -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw
        
        # Fix params type signature
        $content = $content -replace '\{ params \}: \{ params: \{ ([^}]+) \}', '{ params }: { params: Promise<$1> }'
        
        # Add await params destructuring at the beginning of each function
        # This is a more complex regex to find function definitions and add the await params line
        $content = $content -replace '(export async function \w+\([^)]+\)\s*\{[^}]*?)(const user = await getUserFromRequest\(request\);)', '$1    const { id } = await params;' + "`n    " + '$2'
        
        # For token-based routes, use token instead of id
        if ($file -match 'token') {
            $content = $content -replace '(export async function \w+\([^)]+\)\s*\{[^}]*?)(const user = await getUserFromRequest\(request\);)', '$1    const { token } = await params;' + "`n    " + '$2'
        }
        
        # Replace params.id with id, and params.token with token
        $content = $content -replace 'params\.id', 'id'
        $content = $content -replace 'params\.token', 'token'
        
        Set-Content $file $content -NoNewline
        Write-Host "✓ Fixed $file" -ForegroundColor Green
    } else {
        Write-Host "⚠ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nRoute handler fixes completed!" -ForegroundColor Cyan
