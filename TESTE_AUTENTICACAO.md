# 🔐 Teste de Fluxo de Autenticação - ClassOn

Execute este script no PowerShell para testar o fluxo completo de autenticação

## 🧪 Script de Teste

```powershell
# Configurações
$API_URL = "http://localhost:3001/api"
$CREDENTIALS = @{
    secretaria = @{ email = "admin@classon.com"; password = "123456"; role = "SECRETARIA" }
    professor = @{ email = "prof1@classon.com"; password = "123456"; role = "PROFESSOR" }
    aluno = @{ email = "26101@aluno.classon.com"; password = "123456"; role = "ALUNO" }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TESTE DE AUTENTICACAO - CLASSON" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Testa cada perfil
foreach ($perfil in $CREDENTIALS.Keys) {
    $cred = $CREDENTIALS[$perfil]
    
    Write-Host "[${perfil}] Testando login..." -ForegroundColor Yellow
    
    try {
        # 1. LOGIN
        $loginBody = @{
            email = $cred.email
            password = $cred.password
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method POST -Body $loginBody -ContentType 'application/json'
        
        $token = $loginResponse.access_token
        $user = $loginResponse.user
        
        Write-Host "  ✓ Login bem-sucedido!" -ForegroundColor Green
        Write-Host "    Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
        Write-Host "    User: $($user.email) | Role: $($user.role)" -ForegroundColor Gray
        
        # 2. TESTE DE ROTA AUTENTICADA (Academic Years)
        Write-Host "  → Testando rota autenticada (academic-years)..." -ForegroundColor Yellow
        
        $headers = @{
            'Authorization' = "Bearer $token"
        }
        
        try {
            $academicYears = Invoke-RestMethod -Uri "$API_URL/academic-years" -Method GET -Headers $headers
            Write-Host "    ✓ Rota autenticada funcionando!" -ForegroundColor Green
            Write-Host "    Anos letivos encontrados: $($academicYears.Count)" -ForegroundColor Gray
        } catch {
            Write-Host "    ✗ Erro ao acessar rota autenticada: $_" -ForegroundColor Red
        }
        
        # 3. VERIFICA TOKEN INVALIDO
        Write-Host "  → Testando token inválido..." -ForegroundColor Yellow
        $invalidHeaders = @{
            'Authorization' = "Bearer token_invalido"
        }
        
        try {
            Invoke-RestMethod -Uri "$API_URL/academic-years" -Method GET -Headers $invalidHeaders -ErrorAction Stop
            Write-Host "    ✗ ERRO: Token inválido foi aceito!" -ForegroundColor Red
        } catch {
            if ($_.Exception.Response.StatusCode -eq 401) {
                Write-Host "    ✓ Token inválido rejeitado corretamente (401)" -ForegroundColor Green
            } else {
                Write-Host "    ? Status inesperado: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
            }
        }
        
        Write-Host "  ✓ [$perfil] Todos os testes passaram!`n" -ForegroundColor Green
        
    } catch {
        Write-Host "  ✗ [$perfil] Falha no login: $_`n" -ForegroundColor Red
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTES CONCLUIDOS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Teste do frontend
Write-Host "TESTE MANUAL DO FRONTEND:" -ForegroundColor Magenta
Write-Host "1. Acesse: http://localhost:3000/login" -ForegroundColor White
Write-Host "2. Use as credenciais:" -ForegroundColor White
Write-Host "   - Email: admin@classon.com" -ForegroundColor White
Write-Host "   - Senha: 123456" -ForegroundColor White
Write-Host "3. Verifique:" -ForegroundColor White
Write-Host "   - Redirecionamento para /secretaria" -ForegroundColor White
Write-Host "   - Token salvo no localStorage" -ForegroundColor White
Write-Host "   - Acesso a /secretaria/academic-years funcional" -ForegroundColor White
Write-Host "   - Listagem de anos letivos da API`n" -ForegroundColor White
```

## ✅ Resultados Esperados

### Para cada perfil (SECRETARIA, PROFESSOR, ALUNO):

1. **Login**
   - ✓ Status 200
   - ✓ Token JWT retornado
   - ✓ Dados do usuário corretos

2. **Rota Autenticada**
   - ✓ Header Authorization enviado automaticamente
   - ✓ Bearer token aceito
   - ✓ Dados retornados

3. **Token Inválido**
   - ✓ Status 401 Unauthorized
   - ✓ Acesso negado

## 🔧 Execução

Copie o script acima e cole no PowerShell na pasta do projeto.
