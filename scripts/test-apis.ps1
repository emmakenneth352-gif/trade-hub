$Base = "https://trade-hub-xgi2.onrender.com"
$results = [System.Collections.Generic.List[object]]::new()

function Test-Api {
  param(
    [string]$Name,
    [string]$Method = "GET",
    [string]$Path,
    [hashtable]$Headers = @{},
    $Body = $null,
    [int[]]$OkStatus = @(200, 201),
    [switch]$ExpectAuth
  )
  $url = if ($Path.StartsWith("http")) { $Path } else { "$Base$Path" }
  try {
    $params = @{
      Uri = $url
      Method = $Method
      Headers = @{ "accept" = "application/json" } + $Headers
      TimeoutSec = 120
    }
    if ($Body -ne $null) {
      $params["ContentType"] = "application/json"
      $params["Body"] = ($Body | ConvertTo-Json -Compress)
    }
    $r = Invoke-WebRequest @params -UseBasicParsing
    $code = [int]$r.StatusCode
    $ok = $OkStatus -contains $code
    if ($ExpectAuth -and $code -eq 401) { $ok = $true }
    $preview = $r.Content
    if ($preview.Length -gt 120) { $preview = $preview.Substring(0, 120) + "..." }
    $results.Add([pscustomobject]@{ Test = $Name; Status = $code; Pass = $ok; Note = $preview })
  } catch {
    $code = 0
    $msg = $_.Exception.Message
    if ($_.Exception.Response) {
      $code = [int]$_.Exception.Response.StatusCode.value__
      try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $msg = $reader.ReadToEnd()
        if ($msg.Length -gt 120) { $msg = $msg.Substring(0, 120) + "..." }
      } catch {}
    }
    $ok = $false
    if ($ExpectAuth -and $code -eq 401) { $ok = $true; $msg = "401 as expected (auth required)" }
    $results.Add([pscustomobject]@{ Test = $Name; Status = $code; Pass = $ok; Note = $msg })
  }
}

Write-Host "Testing Trade Hub APIs at $Base`n" -ForegroundColor Cyan

Test-Api "Health" GET "/health"
Test-Api "VTU catalog" GET "/api/v1/vtu/catalog"
Test-Api "VTU data plans" GET "/api/v1/vtu/data-plans"
Test-Api "VTU cable packages" GET "/api/v1/vtu/cable-packages"
Test-Api "Marketplace categories" GET "/api/v1/marketplace/categories"
Test-Api "Marketplace products" GET "/api/v1/marketplace/products"
Test-Api "Marketplace flash deals" GET "/api/v1/marketplace/flash-deals"
Test-Api "Reels" GET "/api/v1/reels"
Test-Api "Live sessions" GET "/api/v1/live"
Test-Api "Trading listings" GET "/api/v1/trading"
Test-Api "Music library" GET "/api/v1/music"
Test-Api "Subscription types" GET "/api/v1/subscriptions/types"
Test-Api "Legacy subscription types" GET "/subscriptions/types"

$testEmail = "apitest+$([guid]::NewGuid().ToString('N').Substring(0,8))@example.com"
Test-Api "SignUp getOTP" POST "/auth/signUp/getOTP" -Body @{ email = $testEmail } -OkStatus @(200, 201)

$protected = @(
  @{ Name = "Wallet"; Path = "/api/v1/wallet" },
  @{ Name = "VTU history"; Path = "/api/v1/vtu/history" },
  @{ Name = "VTU provider wallet"; Path = "/api/v1/vtu/provider-wallet" },
  @{ Name = "Favorites"; Path = "/api/v1/favorites" },
  @{ Name = "Following"; Path = "/api/v1/following" },
  @{ Name = "Notifications"; Path = "/api/v1/notifications" },
  @{ Name = "Orders"; Path = "/api/v1/orders" },
  @{ Name = "Live access"; Path = "/api/v1/live/access" },
  @{ Name = "Seller Pro status"; Path = "/api/v1/seller-pro/status" },
  @{ Name = "My posts"; Path = "/api/v1/posts/mine" },
  @{ Name = "Shop conversations"; Path = "/api/v1/shop/conversations" },
  @{ Name = "Profile (legacy)"; Path = "/profile" }
)
foreach ($p in $protected) {
  Test-Api $p.Name GET $p.Path -ExpectAuth
}

try {
  $prod = Invoke-RestMethod "$Base/api/v1/marketplace/products" -TimeoutSec 120
  $id = $prod.data.products[0].id
  if ($id) { Test-Api "Product by id" GET "/api/v1/marketplace/products/$id" }
} catch {}

try {
  $reels = Invoke-RestMethod "$Base/api/v1/reels" -TimeoutSec 120
  $rid = $reels.data.reels[0].id
  if ($rid) {
    Test-Api "Reel by id" GET "/api/v1/reels/$rid"
    Test-Api "Reel comments" GET "/api/v1/reels/$rid/comments"
  }
} catch {}

try {
  $live = Invoke-RestMethod "$Base/api/v1/live" -TimeoutSec 120
  $lid = $live.data.liveSellers[0].id
  if ($lid) {
    Test-Api "Live session" GET "/api/v1/live/$lid"
    Test-Api "Live comments" GET "/api/v1/live/$lid/comments"
  }
} catch {}

try {
  $reels = Invoke-RestMethod "$Base/api/v1/reels" -TimeoutSec 120
  $sid = $reels.data.reels[0].sellerId
  if ($sid) {
    Test-Api "Seller profile" GET "/api/v1/sellers/$sid"
    Test-Api "Seller videos" GET "/api/v1/sellers/$sid/videos"
  }
} catch {}

Write-Host "`n--- RESULTS ---`n"
$results | Format-Table -AutoSize Test, Status, Pass, Note
$passed = ($results | Where-Object Pass).Count
$total = $results.Count
Write-Host "`n$passed / $total passed" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })
