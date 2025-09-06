# 📊 PicMoney Dashboard - Backend API

**Sistema backend completo para análise de dados de transações, comportamento de usuários e inteligência de negócios da plataforma PicMoney.**

## 🎯 Sobre o Projeto

Este backend é o núcleo de um sistema de business intelligence que processa e disponibiliza dados da plataforma PicMoney através de uma API RESTful robusta. O sistema integra dados de múltiplas fontes para fornecer insights estratégicos sobre:

- **Transações em tempo real**: Análise de cupons capturados e receita gerada
- **Comportamento do usuário**: Padrões de consumo e segmentação demográfica  
- **Performance de estabelecimentos**: Ranking e métricas de lojas parceiras
- **Análise geográfica**: Distribuição espacial de pedestres e estabelecimentos
- **Inteligência temporal**: Análise de picos de usage e padrões sazonais

## 🏗️ Arquitetura e Funcionalidades

### 📊 Pipeline de Dados
O sistema processa 4 datasets principais com mais de 220.000 registros:
- **Transações** (~100k registros): Cupons capturados com detalhes completos
- **Players** (~10k registros): Base cadastral de usuários da plataforma
- **Pedestres** (~100k registros): Dados simulados de tráfego na Av. Paulista
- **Lojas** (~10k registros): Estabelecimentos parceiros com geolocalização

### 🔄 Processamento Inteligente
- **Data Enrichment**: Enriquecimento automático das transações com dados dos players
- **Categorização**: Mapeamento automático de estabelecimentos para categorias de negócio
- **Normalização**: Limpeza e padronização de coordenadas geográficas e dados temporais
- **Cache em Memória**: Sistema de cache otimizado para consultas rápidas

## 🚀 Tecnologias e Stack

### Core Backend
- **Node.js** - Runtime JavaScript de alta performance
- **Express.js** - Framework web minimalista e flexível
- **ES Modules** - Sintaxe moderna de módulos JavaScript

### Processamento de Dados
- **CSV Parser** - Processamento eficiente de grandes volumes de dados CSV
- **date-fns** - Manipulação avançada de datas e análise temporal
- **Python + Pandas** - Scripts de limpeza e transformação de dados

### Segurança e Performance
- **Helmet** - Middleware de segurança com headers HTTP
- **CORS** - Cross-Origin Resource Sharing configurado
- **Compression** - Compressão gzip para otimização de rede

## 🔗 API Endpoints Completos

### 📈 Estatísticas Gerais
- `GET /api/general-stats` - Métricas consolidadas (transações, receita, comissão)
- `GET /api/transactions-over-time` - Série temporal de transações
- `GET /api/revenue-by-region` - Receita segmentada por região

### 🏪 Análise de Estabelecimentos  
- `GET /api/stores/performance-ranking` - Ranking de performance de lojas
- `GET /api/top-categories` - Top 10 categorias por volume/valor
- `GET /api/coupon-distribution` - Distribuição de tipos de cupom

### 🗺️ Inteligência Geográfica
- `GET /api/geographic/pedestres-heatmap` - Dados para heatmap de pedestres
- `GET /api/geographic/lojas-locations` - Geolocalização de estabelecimentos

### ⏰ Análise Temporal
- `GET /api/time-analysis/peak-hours` - Matriz de picos por dia/hora
- `GET /api/time-distribution` - Distribuição de transações por hora

### 👥 Segmentação de Clientes
- `GET /api/customer-segments` - Dados demográficos para segmentação
- `GET /api/filter-options` - Opções dinâmicas para filtros
- `GET /api/status` - Health check e métricas do sistema

## 🔧 Sistema de Filtros Avançados

Todos os endpoints analíticos suportam filtros dinâmicos via query parameters:

### 📅 Filtros Temporais
- `startDate` / `endDate` - Intervalos de data (YYYY-MM-DD)

### 🏷️ Filtros Categoriais  
- `categoria` - Categoria de estabelecimento
- `bairro` - Filtro geográfico por bairro
- `tipoCupom` - Tipo de cupom (múltiplos valores suportados)

### 👤 Filtros Demográficos
- `gender` - Segmentação por gênero
- `ageRange` - Faixas etárias (ex: "18-25", "26-35", "60+")

### 💰 Filtros de Valor
- `minValue` / `maxValue` - Range de valores de cupom

**Exemplo de uso:**
```
GET /api/general-stats?startDate=2025-07-01&categoria=Restaurantes&gender=F&ageRange=25-35
```

## 🚀 Como Executar

### 1. Pré-requisitos
```bash
# Node.js 18+ e npm
node --version && npm --version
```

### 2. Instalação
```bash
# Navegue para o diretório backend
cd Backend/

# Instale dependências
npm install
```

### 3. Processamento de Dados (Opcional)
```bash
# Para reprocessar os CSVs (Python necessário)
cd raw_data/
python clean_database.py
```

### 4. Inicialização
```bash
# Produção
npm start

# Desenvolvimento com hot-reload  
npm run dev
```

### 5. Verificação
- **Status**: http://localhost:3001/api/status
- **Docs**: Todos os endpoints em http://localhost:3001/api

## 📊 Métricas do Sistema

**Dados processados:**
- 🔄 ~220.000 registros carregados em memória
- ⚡ Cache inteligente para consultas sub-segundo
- 🗃️ 4 datasets integrados com relacionamentos
- 📍 Geolocalização de ~20.000 pontos únicos

**Performance:**
- 🚀 Startup: ~2-3 segundos para carga completa
- ⚡ Consultas: <100ms tempo de resposta médio
- 💾 Uso de memória: ~150MB footprint otimizado

## 🛡️ Segurança e Boas Práticas

- **Headers de segurança** configurados via Helmet
- **CORS** configurado para frontend específico
- **Sanitização** de inputs e validação de parâmetros  
- **Error handling** robusto com logs estruturados
- **Compression** automática para reduzir payload

---

**Desenvolvido para o projeto PicMoney Dashboard - Sistema de Business Intelligence para análise de dados de cupons e comportamento do consumidor.**