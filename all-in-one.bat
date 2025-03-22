@echo off
echo ========================================
echo  LOVE SITE - INICIALIZAÇÃO COMPLETA
echo ========================================
echo.
echo Este script inicia o servidor e o túnel Cloudflare automaticamente.
echo Sua namorada poderá acessar o site de qualquer lugar!
echo.

REM Verificar se o Node.js está instalado
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js não encontrado! Por favor, instale o Node.js antes de continuar.
    echo Baixe em: https://nodejs.org/
    goto :end
)

REM Verificar se o MongoDB está instalado/rodando
echo Verificando MongoDB...
mongosh --eval "db.version()" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo AVISO: MongoDB não parece estar rodando.
    echo Por favor, inicie o MongoDB antes de continuar.
    echo Se ainda não instalou, baixe em: https://www.mongodb.com/try/download/community
    echo.
    set /p CONTINUE=Continuar mesmo assim? (S/N): 
    if /i not "%CONTINUE%"=="S" goto :end
)

REM Verificar se o cloudflared já está instalado
where cloudflared >nul 2>&1
if %errorlevel% equ 0 (
    echo Cloudflared já está instalado!
) else (
    echo Cloudflared não encontrado. Vamos instalar...
    echo.
    
    echo Baixando o instalador do Cloudflared...
    curl -Lo cloudflared.exe https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
    
    if exist cloudflared.exe (
        echo Download concluído com sucesso!
        echo.
    ) else (
        echo Falha ao baixar o Cloudflared. 
        echo Por favor, baixe manualmente em: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation
        goto :end
    )
)

REM Definindo qual executável usar para cloudflared
if exist cloudflared.exe (
    set CLOUDFLARED=cloudflared.exe
) else (
    set CLOUDFLARED=cloudflared
)

echo.
echo Instalando dependências do servidor...
call npm install

echo.
echo Iniciando o servidor em nova janela...
start cmd /k "npm start"

echo.
echo Aguardando o servidor iniciar (10 segundos)...
timeout /t 10 /nobreak >nul

echo.
echo Iniciando o túnel Cloudflare...
echo O URL gerado poderá ser compartilhado com sua namorada.
echo.
echo IMPORTANTE: Mantenha ambas as janelas abertas enquanto quiser compartilhar o site!
echo.
echo Pressione qualquer tecla para iniciar o túnel...
pause > nul

%CLOUDFLARED% tunnel --url http://localhost:3000

:end
echo.
echo Pressione qualquer tecla para sair...
pause > nul 