# 🍕 Big Bob's / Pizza Mais - Sistema de Gestão e Encomendas

Este projeto consiste numa aplicação web completa de encomendas de comida (focada em Pizzas), desenvolvida com o stack MERN (MongoDB, Express, React, Node.js). A plataforma permite aos clientes explorar o menu, criar pizzas personalizadas, encomendar metade/metade, aplicar cupões e realizar o pagamento (online ou no local). Os administradores têm acesso a uma dashboard completa para gerir produtos, ingredientes, estados dos pedidos e visualizar estatísticas de vendas.

## 🚀 Funcionalidades Principais

### 🧑‍💻 Cliente (Utilizador)
- **Autenticação Segura:** Registo, Login, Verificação de Email e Recuperação de Palavra-Passe (de forma segura utilizando tokens).
- **Menu Dinâmico:** Visualização paginada de produtos separados por categorias (Pizzas, Bebidas, Entradas & Sobremesas).
- **Personalização Avançada:** 
  - Criação de "Pizza Personalizada" de raiz (escolha de tamanho, massa, molho e toppings extra).
  - Opção "Mix 2 Pizzas" (Metade/Metade) para combinar dois sabores na mesma pizza.
- **Carrinho Inteligente:** Gestão local e sincronizada com a base de dados, com limite de segurança (máximo de 15 quantidades por produto).
- **Checkout e Pagamentos:** Suporte para encomendas de Takeaway e Entrega ao Domicílio. Pagamentos via Stripe (Online) ou Dinheiro/Multibanco no ato da entrega.
- **Histórico:** Secção "Os Meus Pedidos" com paginação para acompanhamento do estado das encomendas.

### 🛡️ Administração (Dashboard)
- **Gestão de Produtos e Ingredientes:** Criar, editar, apagar produtos e gerir o stock de ingredientes (usados nas pizzas customizadas).
- **Gestão de Pedidos:** Acompanhamento em tempo real dos pedidos recebidos com alteração de estados (A Cozinhar, A Entregar, Entregue).
- **Analytics:** Gráficos interativos (via Recharts) para monitorizar receitas, vendas e clientes ativos.

## 🛠️ Tecnologias e Segurança

### Frontend
- **Framework:** React (com Hooks) + Vite
- **Estilização:** TailwindCSS + Framer Motion (para animações suaves)
- **Gestão de Estado:** Zustand
- **Navegação:** React Router DOM
- **Comunicação:** Axios

### Backend & Segurança
- **Servidor e Base de Dados:** Node.js + Express + MongoDB (Mongoose)
- **Autenticação:** JWT (Access e Refresh Tokens em HTTP-only Cookies) e Bcrypt para hashing.
- **Serviço de Emails:** Integração com Nodemailer / Mailtrap para e-mails de boas-vindas e reset de password.
- **Segurança Avançada:** 
  - Rate Limiter Global (100 req/min) e Rate Limiter restrito no Login (5 req/15min).
  - Sanitização de Inputs (`express-mongo-sanitize`).
  - Proteção de Memória via paginação no MongoDB (`.skip()` e `.limit()`).
  - Validação estrita de preços e campos calculados diretamente no Backend durante o checkout (evitando manipulação de dados).

## ⚙️ Como Executar Localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/ppxdpp17/pizzaPlace.git
cd pizzaPlace
```

### 2. Instalar dependências
O projeto está dividido em duas pastas principais:
```bash
# Instalar dependências do Backend
cd backend
npm install

# Instalar dependências do Frontend
cd ../frontend
npm install
```

### 3. Variáveis de Ambiente (.env)
Cria um ficheiro `.env` na raiz da pasta `backend/` com as tuas credenciais:
```env
PORT=5000
MONGO_URI=your_mongo_uri
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Autenticação
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret

# Upload de Imagens
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Pagamentos
STRIPE_SECRET_KEY=your_stripe_secret_key

# Serviço de Emails (Mailtrap)
MAILTRAP_TOKEN=your_mailtrap_token
MAILTRAP_ENDPOINT=https://send.api.mailtrap.io/
```

### 4. Executar os servidores
Abre dois terminais distintos:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Acede à aplicação através de `http://localhost:5173`.
