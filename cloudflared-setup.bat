@echo off
echo ========================================
echo  LOVE SITE - CLOUDFLARE TUNNEL SETUP
echo ========================================
echo.
echo Este script vai configurar o Cloudflare Tunnel para compartilhar seu site.
echo Este serviço é GRATUITO e mais estável que outras alternativas.
echo.
echo PASSO 1: Verifique se o servidor está rodando (execute start-server.bat primeiro)
echo PASSO 2: Instale o Cloudflared se ainda não o fez
echo.

REM Verificar se o cloudflared já está instalado
where cloudflared >nul 2>&1
if %errorlevel% equ 0 (
    echo Cloudflared já está instalado!
    goto :run_tunnel
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

:run_tunnel
echo.
echo Iniciando o túnel para o servidor local na porta 3000...
echo.
echo Após conectar, um URL permanente será gerado para você.
echo Compartilhe este URL com sua namorada para que ela acesse o site de qualquer lugar!
echo.
echo IMPORTANTE: Mantenha esta janela aberta enquanto quiser compartilhar o site!
echo.
echo Se você quiser uma URL permanente que não mude, você pode:
echo 1. Criar uma conta gratuita na Cloudflare
echo 2. Executar: cloudflared tunnel login
echo 3. Seguir as instruções para criar um túnel nomeado
echo.
echo Pressione qualquer tecla para iniciar o túnel...
pause > nul

REM Se o arquivo foi baixado neste script, usar o executável local
if exist cloudflared.exe (
    cloudflared.exe tunnel --url http://localhost:3000
) else (
    REM Usar o cloudflared do sistema
    cloudflared tunnel --url http://localhost:3000
)

:end
echo.
echo Pressione qualquer tecla para sair...
pause > nul 