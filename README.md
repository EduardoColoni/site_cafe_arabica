# ☕ Café Arábica - Comunidade e Conhecimento

> Portal educativo sobre o Café Arábica com sistema completo de autenticação e área interativa de comunidade, desenvolvido com arquitetura **MVC (Model-View-Controller)**.

---

## 🛠️ Tecnologias Utilizadas

### Back-end
| Tecnologia | Finalidade |
|---|---|
| **Node.js & Express** | Servidor e gerenciamento de rotas |
| **TypeScript** | Tipagem estática em 100% do back-end |
| **SQLite3** | Banco de dados relacional leve e embutido |
| **Sequelize (ORM)** | Abstração de queries SQL e proteção contra *SQL Injection* |
| **Bcrypt** | Criptografia de senhas (Hash) |

### Front-end
| Tecnologia | Finalidade |
|---|---|
| **EJS** | Renderização de páginas dinâmicas com *partials* |
| **TypeScript** | Lógica de interface, validações e consumo de API (Fetch) |
| **Bootstrap 5** | Responsividade e design |
| **CSS Nativo** | Componentes customizados e suporte a Dark Mode |

---

## 🏗️ Decisões de Arquitetura

### 1. Separação `src/` e `dist/`
Todo o código-fonte fica isolado em `src/`. Ao compilar, o TypeScript gera os arquivos `.js` finais somente dentro de `dist/`, mantendo o projeto limpo e organizado.

### 2. Duplo `tsconfig.json`
Fluxos de compilação separados para back-end e front-end. O front-end possui seu próprio `tsconfig.frontend.json`, que injeta o JavaScript compilado diretamente em `public/js`.

### 3. Fail Fast (Falhar Rápido)
Validações rigorosas (estrutura de e-mail, força de senha, cálculo de CPF) implementadas em duas camadas:
- **Front-end** → poupa processamento e melhora UX
- **Back-end (Controllers)** → garante a segurança da API

### 4. Sessões via Front-end (UX)
Uso de `sessionStorage` para controle de interface. Ao logar, os formulários de inscrição desaparecem e a área de comentários é desbloqueada dinamicamente.

---

## 🚀 Como Rodar o Projeto

### Usuário de testes pré criado(é totalmente possível criar seu próprio usuário):
- Login: teste@teste.com
- Senha: Teste@123

### 📋 Pré-requisitos
- **[Node.js](https://nodejs.org/pt-br)** instalado (versão **16+** recomendada)
- Caso o projeto esteja zipado, extraia a pasta completa antes de prosseguir

---

### ⚠️ Importante para usuários de Windows (PowerShell)
Caso você tente rodar os comandos abaixo e o terminal bloqueie a execução com um erro vermelho dizendo que "a execução de scripts foi desabilitada", será necessário liberar a permissão no Windows:
1. Abra o **PowerShell** do seu computador como **Administrador**.
2. Digite o comando abaixo e pressione Enter:
   ```bash
   Set-ExecutionPolicy Unrestricted
   ```
3. O sistema fará uma pergunta sobre alterar a política de execução. Digite "A" (Sim para Todos) e pressione Enter. Pronto, seu terminal está liberado para rodar o Node!

### Passo 1 — Instalar as dependências (Rodar todos códigos com o terminal aberto dentro da pasta do projeto)

```bash
npm install
```

> Faz o download da pasta `node_modules` com as bibliotecas necessárias (Express, Sequelize, etc.).

---

### Passo 2 — Compilar o projeto (Build)

```bash
npm run build
```

> Traduz o TypeScript para JavaScript, gerando a pasta `dist/` (back-end compilado) e o arquivo `public/js/script.js` (front-end compilado).

---

### Passo 3 — Iniciar o servidor

```bash
npm start
```

> Roda a aplicação em modo de produção a partir da pasta compilada.

> 💡 **Banco de dados automático:** Não é necessário criar o banco manualmente. Ao iniciar, o Sequelize verifica a existência do banco e, se necessário, cria o arquivo `banco_cafe.db` na raiz do projeto com as tabelas `Usuarios` e `Comentarios` interligadas por chave estrangeira.

---

### Passo 4 — Acessar o site

Abra o navegador e acesse:

```
http://localhost:3000
```

---

## 👨‍💻 Modo de Desenvolvimento (Opcional)

Para alterar o código e ver as mudanças em tempo real sem recompilar manualmente (requer Nodemon):

```bash
npm run dev
```

---

## 🐛 Bugs Conhecidos

- Não conseguir editar ou excluir o próprio comentário, caso deslogue e logue novamente.

---

## 📁 Estrutura do Projeto

```
/
├── src/               # Código-fonte TypeScript (back-end)
├── dist/              # Código compilado (gerado pelo build)
├── public/
│   └── js/            # TypeScript do front-end compilado
├── views/             # Templates EJS (partials, páginas)
├── banco_cafe.db      # Banco de dados SQLite (gerado automaticamente)
├── tsconfig.json      # Configuração TypeScript (back-end)
├── tsconfig.frontend.json  # Configuração TypeScript (front-end)
└── package.json
```

---

*Desenvolvido por **Eduardo Coloni***
