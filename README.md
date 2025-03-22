# Site de Amor

Um site para compartilhar fotos, mensagens e momentos especiais com sua namorada. Agora com servidor para que ambos possam acessar e compartilhar!

## Recursos

### Galeria de Fotos
- Upload e armazenamento de fotos
- Edição de legendas
- Exclusão de fotos

### Blogzinho
- Escrever e salvar entradas de blog
- Editar entradas existentes
- Ver histórico de mensagens em ordem cronológica

### Planejador de Dates
- Planejar dates especiais
- Ver contagem regressiva para o próximo evento
- Diferentes tipos de eventos (romântico, natureza, viagem, restaurante)

## Configuração do Servidor

### Requisitos
- [Node.js](https://nodejs.org/) - Versão 14 ou superior
- [MongoDB](https://www.mongodb.com/try/download/community) - Banco de dados

### Instalação rápida (Windows)
1. Instale o Node.js (se ainda não tiver)
2. Instale o MongoDB (se ainda não tiver)
3. Inicie o MongoDB
4. Execute o arquivo `start-server.bat` para instalar as dependências e iniciar o servidor

### Instalação manual
1. Instale o Node.js (se ainda não tiver)
2. Instale o MongoDB (se ainda não tiver)
3. Inicie o MongoDB
4. Abra o terminal na pasta do projeto
5. Execute `npm install` para instalar as dependências 
6. Execute `npm start` para iniciar o servidor

### Configuração avançada
Você pode modificar as configurações no arquivo `.env`:
- `PORT`: Porta em que o servidor será executado (padrão: 3000)
- `MONGODB_URI`: URI de conexão com o MongoDB
- `UPLOAD_DIR`: Diretório para salvar fotos enviadas

## Acesso
- Servidor local: http://localhost:3000
- Para acesso externo: Configure o redirecionamento de porta no roteador para o IP do seu computador

## Para uso entre dispositivos
1. Certifique-se de que seu servidor está rodando
2. Identifique o endereço IP local do seu computador (use `ipconfig` no Windows ou `ifconfig` no Linux/Mac)
3. No dispositivo externo, acesse `http://SEU_IP_LOCAL:3000`
   
*Observação: Para acesso permanente fora da rede local, considere usar um serviço como ngrok ou hospedar em uma plataforma como Heroku.*

## Tecnologias utilizadas
- **Backend**: Node.js, Express, MongoDB
- **Frontend**: HTML, CSS, JavaScript
- **Armazenamento de fotos**: Sistema de arquivos local

## Personalização
Sinta-se à vontade para personalizar o site como desejar:
- Edite as cores no arquivo CSS (procure pelas variáveis `:root`)
- Altere os textos e títulos no HTML
- Adicione novos recursos ao servidor 