$dir = "C:\Users\User\Desktop\CONIITI\kubernetes\microservicios"
$files = Get-ChildItem -Path $dir -Filter "*.yaml" | Where-Object { $_.Name -notin @("frontend.yaml", "auth-service.yaml", "users-service.yaml") }

foreach ($file in $files) {
    $serviceName = $file.Name.Replace(".yaml", "")
    $pathName = $serviceName.Replace("-service", "")
    
    $content = Get-Content -Path $file.FullName -Raw
    
    if ($content -notmatch "command:") {
        $targetStr = "image: $serviceName`:latest"
        $replaceStr = "image: $serviceName`:latest`n        command: [""uvicorn"", ""app.main:app"", ""--host"", ""0.0.0.0"", ""--port"", ""8000"", ""--root-path"", ""/api/$pathName""]"
        
        $content = $content -replace $targetStr, $replaceStr
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated $($file.Name)"
    }
}
