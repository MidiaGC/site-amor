@echo off
echo ========================================
echo  LOVE SITE - CLOUDFLARE TÚNEL PERMANENTE
echo ========================================
echo.
echo Este script cria um túnel PERMANENTE para compartilhar seu site.
echo O URL gerado não mudará cada vez que você reiniciar, diferente do túnel básico.
echo.
echo PASSO 1: Verifique se o servidor está rodando (execute start-server.bat primeiro)
echo PASSO 2: Vamos criar um túnel nomeado
echo.

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

REM Definindo qual executável usar
if exist cloudflared.exe (
    set CLOUDFLARED=cloudflared.exe
) else (
    set CLOUDFLARED=cloudflared
)

echo.
echo Para criar um túnel permanente, você precisa fazer login na sua conta Cloudflare.
echo Se você não tiver uma conta, pode criá-la gratuitamente em: https://dash.cloudflare.com/sign-up
echo.
echo Pressione qualquer tecla para continuar e fazer login (seu navegador será aberto)...
pause > nul

echo.
echo Executando login no Cloudflare...
%CLOUDFLARED% tunnel login

echo.
echo Agora, vamos criar seu túnel permanente.
echo.
set /p TUNNEL_NAME=Digite um nome para seu túnel (ex: site-amor): 

echo.
echo Criando túnel: %TUNNEL_NAME%
%CLOUDFLARED% tunnel create %TUNNEL_NAME%

echo.
echo Túnel criado com sucesso!
echo.
echo Configurando o arquivo de configuração...

REM Criar diretório .cloudflared se não existir
mkdir .cloudflared 2>nul

REM Criar arquivo de configuração
echo url: http://localhost:3000 > .cloudflared\config.yml
echo tunnel: %TUNNEL_NAME% >> .cloudflared\config.yml
echo credentials-file: %USERPROFILE%\.cloudflared\%TUNNEL_NAME%.json >> .cloudflared\config.yml

echo.
echo Configuração concluída.
echo.
echo Se você quiser um domínio personalizado, execute este comando:
echo %CLOUDFLARED% tunnel route dns %TUNNEL_NAME% seu-site.exemplo.com
echo.
echo Pressione qualquer tecla para iniciar o túnel permanente...
pause > nul

echo.
echo Iniciando túnel permanente para http://localhost:3000...
echo Este túnel continuará funcionando sempre que você executar este script.
echo Um URL permanente será gerado. Compartilhe-o com sua namorada!
echo.
echo IMPORTANTE: Mantenha esta janela aberta enquanto quiser compartilhar o site!
echo.

%CLOUDFLARED% tunnel run %TUNNEL_NAME%

:end
echo.
echo Pressione qualquer tecla para sair...
pause > nul 