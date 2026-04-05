param(
    [Parameter(Mandatory = $true)]
    [string]$Email,

    [Parameter(Mandatory = $true)]
    [string]$FullName,

    [Parameter(Mandatory = $true)]
    [string]$Password,

    [Parameter(Mandatory = $true)]
    [ValidateSet("staff", "superuser")]
    [string]$Role,

    [string]$Institution = "",
    [string]$BaseUrl = "http://localhost",
    [string]$InternalToken = "",
    [bool]$IsActive = $true
)

$ErrorActionPreference = "Stop"

function Get-HeaderValue {
    param([string]$Token)

    if ($Token) {
        return $Token
    }

    if ($env:CONIITI_INTERNAL_SERVICE_TOKEN) {
        return $env:CONIITI_INTERNAL_SERVICE_TOKEN
    }

    return "coniiti-internal-token"
}

$resolvedBaseUrl = $BaseUrl.TrimEnd("/")
$resolvedInternalToken = Get-HeaderValue -Token $InternalToken
$headers = @{
    "Content-Type" = "application/json"
    "X-Internal-Service-Token" = $resolvedInternalToken
}

$authPayload = @{
    email = $Email
    password = $Password
    full_name = $FullName
    is_active = $IsActive
} | ConvertTo-Json

$createdUserId = $null

try {
    Write-Host "Creando cuenta en auth-service..."
    $authResponse = Invoke-RestMethod `
        -Method Post `
        -Uri "$resolvedBaseUrl/api/auth/internal/users" `
        -Headers $headers `
        -Body $authPayload

    $createdUserId = $authResponse.user_id

    $profilePayload = @{
        id = $createdUserId
        full_name = $FullName
        email = $Email
        role = $Role
        institution = if ($Institution) { $Institution } else { $null }
        is_active = $IsActive
    } | ConvertTo-Json

    Write-Host "Creando perfil en users-service..."
    $profileResponse = Invoke-RestMethod `
        -Method Post `
        -Uri "$resolvedBaseUrl/api/users/internal/profiles" `
        -Headers $headers `
        -Body $profilePayload

    Write-Host ""
    Write-Host "Usuario creado correctamente."
    Write-Host "ID: $($profileResponse.id)"
    Write-Host "Nombre: $($profileResponse.full_name)"
    Write-Host "Correo: $($profileResponse.email)"
    Write-Host "Rol: $($profileResponse.role)"
    Write-Host "Activo: $($profileResponse.is_active)"
}
catch {
    if ($createdUserId) {
        try {
            Write-Host "Error creando perfil; intentando rollback en auth-service..."
            Invoke-RestMethod `
                -Method Delete `
                -Uri "$resolvedBaseUrl/api/auth/internal/users/$createdUserId" `
                -Headers $headers | Out-Null
        }
        catch {
            Write-Warning "No se pudo revertir la cuenta auth para user_id=$createdUserId"
        }
    }

    throw
}
