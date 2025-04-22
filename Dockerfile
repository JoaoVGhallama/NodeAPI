# Imagem base oficial do Node.js
FROM node:18

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante da aplicação
COPY . .

# Expõe a porta da aplicação (ajuste se necessário)
EXPOSE 3000

# Comando para iniciar a API
CMD ["node", "src/index.js"]
