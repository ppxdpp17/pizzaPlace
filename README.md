# 🛍️ Projeto Ecommerce MERN

Este projeto consiste numa aplicação de e-commerce desenvolvida com o stack MERN (MongoDB, Express, React, Node.js). Esta permite que os utilizadores navegarem por páginas que contenham produtos, adicioná-los ao carrinho, fazerem compras (incluíndo pagamento). Para além disto, permite aos administradores gerir produtos e ver análises estatísticas das vendas.

## 🚀 Funcionalidades Principais

### Cliente (Utilizador)
- Registo e login com autenticação JWT
- Visualização de produtos por categoria
- Adição ao carrinho 
- Compra de produtos presentes no carrinho
- Aplicação de cupões de desconto

### Admin
- Painel administrativo protegido
- Gestão de produtos
- Acompanhamento de vendas e estatísticas

## 🛠️ Tecnologias Usadas
### Frontend
- React (com Hooks)
- TailwindCSS para estilização
- Axios para chamadas HTTP
- React Router DOM para navegação
- Framer Motion para animações
- Recharts para visualização de dados (gráficos)

### Backend
- Node.js + Express
- MongoDB com Mongoose
- JWT para autenticação
- Bcrypt para hash de palavras-passe
- Middleware para proteção de rotas

## ⚙️ Como Executar Localmente
### 1.Clonar o repositório
```
git clone [https://github.com/seu-usuario/nome-do-projeto.git](https://github.com/ppxdpp17/pizzaPlace)
cd pizzaPlace
```

### 2. Instalar dependências
```
cd backend
npm install
cd ../frontend
npm install
```

### 3. Criar arquivo .env no backend com o seguinte conteudo
```
PORT=5000
MONGO_URI=your_mongo_uri

UPSTASH_REDIS_URL=your_redis_url
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 4. Executar os servidores em dois terminais separados
```
cd backend
npm run dev
```
```
cd frontend
npm run dev
```

## Extras
- Integração com pagamento utilizando Stripe
- Carregamento de imagem com Cloudinary
- Filtros avançados por categoria/preço
- Pesquisa de produtos
