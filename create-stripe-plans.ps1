param(
    # If not passed, it will read from $env:STRIPE_SECRET_KEY
    [string]$StripeApiKey = $env:STRIPE_SECRET_KEY
)

if (-not $StripeApiKey) {
    Write-Error "Stripe API key not provided. Set STRIPE_SECRET_KEY env var or pass -StripeApiKey."
    exit 1
}

# Change this if you want GBP/EUR/etc.
$currency = "usd"

$headers = @{
    "Authorization" = "Bearer $StripeApiKey"
    "Content-Type"  = "application/x-www-form-urlencoded"
}

# Tiers that have paid Stripe prices (free plan is skipped)
$tiers = @(
    @{
        Key                   = "garage"
        ProductName           = "Garage Parking"
        Description           = "CPU-based generations for hobbyists and individual creators"
        MonthlyPrice          = 9
        YearlyDiscountPercent = 20
        CreditsMonthly        = 50
        CreditsYearly         = 600
        EnvPrefix             = "STRIPE_GARAGE"
    },
    @{
        Key                   = "showroom"
        ProductName           = "Showroom Floor"
        Description           = "GPU-based generations for serious creators and small studios"
        MonthlyPrice          = 29
        YearlyDiscountPercent = 20
        CreditsMonthly        = 200
        CreditsYearly         = 2400
        EnvPrefix             = "STRIPE_SHOWROOM"
    },
    @{
        Key                   = "dealership"
        ProductName           = "Dealership"
        Description           = "Enterprise-grade GPU generations for teams and agencies"
        MonthlyPrice          = 49
        YearlyDiscountPercent = 20
        CreditsMonthly        = 500
        CreditsYearly         = 6000
        EnvPrefix             = "STRIPE_DEALERSHIP"
    },
    @{
        Key                   = "factory"
        ProductName           = "Factory Owner"
        Description           = "Enterprise-grade AI with custom models, dedicated infra, and SLAs"
        MonthlyPrice          = 199
        YearlyDiscountPercent = 20
        CreditsMonthly        = 2000
        CreditsYearly         = 24000
        EnvPrefix             = "STRIPE_FACTORY"
    }
)

$envLines = @()

foreach ($tier in $tiers) {

    Write-Host ""
    Write-Host "=== Creating product '$($tier.ProductName)' ==="

    # 1) Create product
    $productBody = @{
        name                        = $tier.ProductName
        description                 = $tier.Description
        "metadata[tier_key]"        = $tier.Key
        "metadata[credits_monthly]" = $tier.CreditsMonthly
        "metadata[credits_yearly]"  = $tier.CreditsYearly
    }

    $product = Invoke-RestMethod `
        -Uri "https://api.stripe.com/v1/products" `
        -Method Post `
        -Headers $headers `
        -Body $productBody

    Write-Host " Product ID: $($product.id)"

    # 2) Amounts in cents
    $monthlyAmountCents = [int]($tier.MonthlyPrice * 100)

    $grossYearlyCents = [int]($tier.MonthlyPrice * 12 * 100)
    $yearlyAmountCents = [int](
        [math]::Round(
            $grossYearlyCents * (1 - ($tier.YearlyDiscountPercent / 100.0))
        )
    )

    # 3) Monthly price
    Write-Host "  Creating monthly price..."
    $monthlyBody = @{
        product               = $product.id
        currency              = $currency
        unit_amount           = $monthlyAmountCents
        "recurring[interval]" = "month"
        nickname              = "$($tier.ProductName) Monthly"
    }

    $monthlyPrice = Invoke-RestMethod `
        -Uri "https://api.stripe.com/v1/prices" `
        -Method Post `
        -Headers $headers `
        -Body $monthlyBody

    Write-Host "   Monthly price ID: $($monthlyPrice.id)"

    # 4) Yearly price
    Write-Host "  Creating yearly price..."
    $yearlyBody = @{
        product               = $product.id
        currency              = $currency
        unit_amount           = $yearlyAmountCents
        "recurring[interval]" = "year"
        nickname              = "$($tier.ProductName) Yearly"
    }

    $yearlyPrice = Invoke-RestMethod `
        -Uri "https://api.stripe.com/v1/prices" `
        -Method Post `
        -Headers $headers `
        -Body $yearlyBody

    Write-Host "   Yearly price ID: $($yearlyPrice.id)"

    # 5) Collect .env-style lines
    $envLines += "$($tier.EnvPrefix)_MONTHLY_PRICE_ID=$($monthlyPrice.id)"
    $envLines += "$($tier.EnvPrefix)_YEARLY_PRICE_ID=$($yearlyPrice.id)"
}

Write-Host ""
Write-Host "=========== COPY THESE INTO YOUR .env ===========" -ForegroundColor Green
$envLines | ForEach-Object { Write-Host $_ }
Write-Host "=================================================" -ForegroundColor Green
