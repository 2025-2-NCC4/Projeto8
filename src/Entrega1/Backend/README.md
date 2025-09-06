# Pick Money Dashboard - Backend API

API backend para o dashboard Pick Money que processa dados de transações, lojas, players e pedestres através de arquivos CSV.

## 🚀 Como iniciar o backend

### 1. Navegue até a pasta do backend
```bash
cd "/home/saulo/Área de Trabalho/my-codes/PicMoneyDash/src/Entrega1/Backend"
```

### 2. Instale as dependências (se ainda não instalou)
```bash
npm install
```

### 3. Inicie o servidor
```bash
npm start
```

Ou para desenvolvimento com auto-reload:
```bash
npm run dev
```

## 📊 Dados processados

O servidor carrega automaticamente os seguintes arquivos CSV da pasta `datasets/`:
- `transacoes_cleaned.csv` - Dados de transações
- `lojas_cleaned.csv` - Dados de lojas
- `players_cleaned.csv` - Dados de players  
- `pedestres_cleaned.csv` - Dados de pedestres

## 🔗 Endpoints da API

Todos os endpoints estão disponíveis em `http://localhost:3001/api`

- `GET /api/status` - Status do servidor e informações dos dados
- `GET /api/general-stats` - Estatísticas gerais (total transações, receita, etc.)
- `GET /api/transactions-over-time` - Evolução das transações ao longo do tempo
- `GET /api/top-categories` - Top 10 categorias por valor
- `GET /api/coupon-distribution` - Distribuição por tipo de cupom
- `GET /api/filter-options` - Opções disponíveis para filtros

## 🔧 Filtros suportados

Todos os endpoints (exceto `/status` e `/filter-options`) aceitam os seguintes filtros via query params:

- `startDate` - Data inicial (formato: YYYY-MM-DD)
- `endDate` - Data final (formato: YYYY-MM-DD)  
- `categoria` - Filtro por categoria do estabelecimento
- `bairro` - Filtro por bairro
- `tipoCupom` - Filtro por tipo de cupom

Exemplo: `GET /api/general-stats?startDate=2025-07-01&categoria=Lojas`

## ✅ Verificação

Após iniciar o servidor, acesse:
- http://localhost:3001/api/status - Para verificar se tudo está funcionando
- O frontend em http://localhost:5173 deve conseguir carregar os dados

## 🛠️ Tecnologias utilizadas

- Node.js + Express
- CSV Parser para leitura dos arquivos
- CORS habilitado para o frontend
- Helmet para segurança
- Compression para otimização