param(
    # Uses STRIPE_SECRET_KEY env var if not passed explicitly
    [string]$StripeApiKey = $env:STRIPE_SECRET_KEY
)

if (-not $StripeApiKey) {
    Write-Error "Stripe API key not provided. Set STRIPE_SECRET_KEY or pass -StripeApiKey."
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $StripeApiKey"
}

# Base Stripe products endpoint
$endpoint = "https://api.stripe.com/v1/products"

$hasMore = $true
$startingAfter = $null

Write-Host "Using Stripe key (first 10 chars): $($StripeApiKey.Substring(0,10))..."
Write-Host "Base endpoint: $endpoint"
Write-Host "Fetching and deleting Stripe products..." -ForegroundColor Yellow

while ($hasMore) {

    # --- Build query params ---
    $queryParams = @{
        limit = 100
    }
    if ($startingAfter) {
        $queryParams["starting_after"] = $startingAfter
    }

    # Build query string like "limit=100&starting_after=prod_xxx"
    $qs = ($queryParams.GetEnumerator() | ForEach-Object {
            "$($_.Key)=$($_.Value)"
        }) -join "&"

    # Use UriBuilder to avoid any weird string issues
    $builder = New-Object System.UriBuilder($endpoint)
    $builder.Query = $qs
    $url = $builder.Uri.AbsoluteUri

    Write-Host "Requesting: $url"

    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get

    if (-not $response.data -or $response.data.Count -eq 0) {
        Write-Host "No more products returned."
        break
    }

    foreach ($product in $response.data) {
        Write-Host "Deleting product $($product.id) - '$($product.name)'" -ForegroundColor Cyan
        try {
            $deleteResp = Invoke-RestMethod `
                -Uri "$endpoint/$($product.id)" `
                -Headers $headers `
                -Method Delete

            if ($deleteResp.deleted -eq $true) {
                Write-Host "  -> Deleted" -ForegroundColor Green
            }
            else {
                Write-Host "  -> Not deleted, response:" -ForegroundColor Yellow
                $deleteResp | ConvertTo-Json -Depth 5
            }
        }
        catch {
            Write-Warning "  -> Failed to delete $($product.id): $($_.Exception.Message)"
        }
    }

    $hasMore = $response.has_more
    if ($hasMore) {
        $startingAfter = $response.data[-1].id
        Write-Host "More products exist, continuing after: $startingAfter"
    }
}

Write-Host "Done processing Stripe products." -ForegroundColor Yellow
