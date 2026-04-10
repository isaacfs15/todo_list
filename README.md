# 🎓 TodoList Distribuído — UniEvangélica

Arquitetura de microsserviços com 3 linguagens, 3 ORMs e autenticação JWT.

---

## 🏗 Arquitetura

```
frontend/          → HTML + CSS + JS (pronto, com alterações)
task-service/      → 🟢 Node.js + Express + Prisma      (porta 3001)
log-service/       → 🟠 PHP + Laravel + Eloquent         (porta 8000)
analyzer-service/  → 🔵 Python + FastAPI + SQLAlchemy   (porta 8001)
```

Banco de dados compartilhado: **MySQL** (`atividade_todo_list`)

---

## ✅ Pré-requisitos

| Software | Versão | Verificar |
|---|---|---|
| Laragon (Full) | Qualquer | MySQL ativo na porta 3306 |
| Node.js LTS | v20+ | `node -v` |
| Python | 3.11+ | `python --version` |
| PHP + Composer | PHP 8.x | `php -v` e `composer -V` |

> **Windows:** adicione `C:\laragon\bin\php\php-8.x.x` e `C:\laragon\bin\composer` ao PATH e reinicie o IntelliJ IDEA.

---

## 🗄 Passo 0 — Banco de dados (execute uma única vez)

No HeidiSQL (Laragon → Database), execute:

```sql
CREATE DATABASE IF NOT EXISTS atividade_todo_list
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 🟢 Terminal 1 — task-service (Node.js + Express + Prisma)

### Estrutura de arquivos

```
task-service/
├── src/
│   ├── server.js
│   ├── routes/
│   │   ├── rotasAutenticacao.js
│   │   └── rotasTarefas.js
│   ├── controllers/
│   │   ├── controladorAutenticacao.js
│   │   └── controladorTarefas.js
│   ├── middleware/
│   │   └── middlewareAutenticacao.js
│   └── services/
│       └── servicoLog.js
├── prisma/
│   └── schema.prisma
├── .env
└── package.json
```

### Comandos

```powershell
cd task-service
npm init -y
npm install express prisma@5 @prisma/client@5 bcryptjs jsonwebtoken cors dotenv axios
npm install --save-dev nodemon
```

> ⚠️ Use obrigatoriamente `prisma@5` e `@prisma/client@5`. Versões 6+ mudaram a API e quebram o projeto.

Confirme que o `package.json` tem os scripts corretos:

```json
"scripts": {
  "dev": "nodemon src/server.js",
  "start": "node src/server.js"
}
```

> ⚠️ O script `dev` deve apontar explicitamente para `src/server.js`. O `nodemon` sem argumento usa o campo `main` do `package.json` e pode não encontrar o arquivo correto.

```powershell
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

✅ Esperado: `[task-service] Rodando em http://localhost:3001`

---

## 🟠 Terminal 2 — log-service (PHP + Laravel + Eloquent)

### Estrutura de arquivos

```
log-service/                        ← projeto Laravel completo
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── LogController.php   ← customizado
│   └── Models/
│       └── Log.php                 ← customizado
├── config/
│   └── cors.php                    ← customizado
├── database/
│   └── migrations/
│       └── 2024_01_01_000000_create_logs_table.php  ← customizado
├── routes/
│   └── api.php                     ← customizado
├── .env
└── (demais arquivos gerados pelo Laravel)
```

> Execute a partir da raiz do projeto (fora de qualquer subpasta)

```powershell
composer create-project laravel/laravel log-service-temp
```

Copie os arquivos customizados para dentro do projeto Laravel criado:

```powershell
Copy-Item log-service\app\Models\Log.php                                          log-service-temp\app\Models\Log.php
Copy-Item log-service\app\Http\Controllers\LogController.php                      log-service-temp\app\Http\Controllers\LogController.php
Copy-Item log-service\database\migrations\2024_01_01_000000_create_logs_table.php log-service-temp\database\migrations\2024_01_01_000000_create_logs_table.php
Copy-Item log-service\routes\api.php                                              log-service-temp\routes\api.php
Copy-Item log-service\config\cors.php                                             log-service-temp\config\cors.php
```

Renomeie as pastas:

```powershell
Rename-Item log-service log-service-backup
Rename-Item log-service-temp log-service
cd log-service
```

Crie o `.env` e configure o banco de dados:

```powershell
Copy-Item .env.example .env
```

Edite o `.env` e altere as linhas do banco para:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=atividade_todo_list
DB_USERNAME=root
DB_PASSWORD=
```

```powershell
composer install
php artisan key:generate
```

> ⚠️ Se aparecer erro de migration duplicada (`Table 'logs' already exists`), delete o arquivo `database\migrations\xxxx_create_logs_table.php`.

```powershell
php artisan migrate
```

> ✅ "Nothing to migrate" é resultado válido — significa que as tabelas já foram criadas.

Habilite as rotas de API (necessário no Laravel 11+):

```powershell
php artisan install:api
```

> Quando perguntar `Would you like to run all pending database migrations?`, responda `yes`.

Registre o arquivo de rotas API no `bootstrap/app.php`. Abra o arquivo e localize o trecho `->withRouting(` — ele deve ficar assim:

```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
)
```

> ⚠️ Certifique-se de que não há `)` duplicado após o bloco `->withRouting(`. O arquivo completo deve ser:

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
```

```powershell
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan serve --port=8000
```

Confirme que as rotas estão registradas:

```powershell
php artisan route:list
```

Deve aparecer `/api/logs` na lista.

✅ Esperado: `INFO Server running on [http://127.0.0.1:8000]`

---

## 🔵 Terminal 3 — analyzer-service (Python + FastAPI + SQLAlchemy)

### Estrutura de arquivos

```
analyzer-service/
├── app/
│   ├── __init__.py       ← torna app/ um pacote Python
│   ├── bancoDados.py     ← engine, sessão e obter_bd()
│   ├── modelos.py        ← models SQLAlchemy (espelham tabelas do Prisma)
│   ├── esquemas.py       ← schemas Pydantic para validação de resposta
│   ├── crud.py           ← consultas ORM somente leitura
│   └── main.py           ← rotas FastAPI e configuração CORS
├── .env
├── requirements.txt
└── venv/                 ← ambiente virtual (não versionar)
```

```powershell
cd analyzer-service
python -m venv venv
```

Ativar o ambiente virtual:

```powershell
# Windows PowerShell — se der erro de ExecutionPolicy, execute primeiro:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\venv\Scripts\Activate.ps1
```

```bash
# Linux / Mac:
source venv/bin/activate
```

> ✅ O prompt deve exibir `(venv)` indicando que o ambiente está ativo.

```powershell
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

✅ Esperado: `Uvicorn running on http://0.0.0.0:8001`

---

## 🔄 Nas próximas vezes (já configurado)

```powershell
# Terminal 1
cd task-service && npm run dev

# Terminal 2
cd log-service && php artisan serve --port=8000

# Terminal 3
cd analyzer-service && .\venv\Scripts\Activate.ps1 && uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

---

## 🧪 Testes no Postman

> **Ordem obrigatória:** cadastre e faça login antes de testar rotas de tarefas.
> O token retornado no login deve ser usado em todas as rotas protegidas.

### Como configurar o token no Postman

1. Faça o login e copie o valor do campo `token` da resposta
2. Em qualquer requisição protegida, vá em **Authorization**
3. Selecione o tipo **Bearer Token**
4. Cole o token no campo **Token**

---

### 🔐 Autenticação — task-service (porta 3001)

#### 1. Cadastrar usuário

```
POST http://localhost:3001/api/auth/cadastro
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw → JSON):**
```json
{
  "nome": "Isaac Silva",
  "email": "isaac@email.com",
  "senha": "123456"
}
```

**Resposta esperada — 201 Created:**
```json
{
  "id": 1,
  "nome": "Isaac Silva",
  "email": "isaac@email.com",
  "criadoEm": "2025-01-01T00:00:00.000Z"
}
```

**Erros possíveis:**
```json
{ "erro": "E-mail já cadastrado" }                     // 409
{ "erro": "nome, email e senha são obrigatórios" }     // 400
```

---

#### 2. Fazer login

```
POST http://localhost:3001/api/auth/login
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw → JSON):**
```json
{
  "email": "isaac@email.com",
  "senha": "123456"
}
```

**Resposta esperada — 200 OK:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuarioId": 1,
  "nome": "Isaac Silva"
}
```

> ⚠️ Copie o valor de `token` — necessário em todas as próximas requisições.

**Erros possíveis:**
```json
{ "erro": "Credenciais inválidas" }  // 401
```

---

### ✅ Tarefas — task-service (porta 3001)

> Todas as rotas abaixo exigem: `Authorization: Bearer <token>`

#### 3. Listar tarefas

```
GET http://localhost:3001/api/tarefas
```

**Resposta esperada — 200 OK:**
```json
[
  {
    "id": 1,
    "titulo": "Estudar Node.js",
    "concluida": false,
    "usuarioId": 1,
    "criadoEm": "2025-01-01T00:00:00.000Z",
    "atualizadoEm": "2025-01-01T00:00:00.000Z"
  }
]
```

---

#### 4. Criar tarefa

```
POST http://localhost:3001/api/tarefas
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body (raw → JSON):**
```json
{
  "titulo": "Estudar Node.js"
}
```

**Resposta esperada — 201 Created:**
```json
{
  "id": 1,
  "titulo": "Estudar Node.js",
  "concluida": false,
  "usuarioId": 1,
  "criadoEm": "2025-01-01T00:00:00.000Z",
  "atualizadoEm": "2025-01-01T00:00:00.000Z"
}
```

---

#### 5. Alternar tarefa (concluída ↔ pendente)

```
PATCH http://localhost:3001/api/tarefas/1/alternar
```

**Body:** nenhum

**Resposta esperada — 200 OK:**
```json
{
  "id": 1,
  "titulo": "Estudar Node.js",
  "concluida": true,
  "usuarioId": 1,
  "criadoEm": "2025-01-01T00:00:00.000Z",
  "atualizadoEm": "2025-01-01T00:10:00.000Z"
}
```

**Erros possíveis:**
```json
{ "erro": "Tarefa não encontrada" }  // 404
{ "erro": "Acesso negado" }          // 403
```

---

#### 6. Atualizar título

```
PUT http://localhost:3001/api/tarefas/1
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body (raw → JSON):**
```json
{
  "titulo": "Estudar Node.js e Express"
}
```

**Resposta esperada — 200 OK:**
```json
{
  "id": 1,
  "titulo": "Estudar Node.js e Express",
  "concluida": false,
  "usuarioId": 1,
  "criadoEm": "2025-01-01T00:00:00.000Z",
  "atualizadoEm": "2025-01-01T00:15:00.000Z"
}
```

---

#### 7. Excluir tarefa

```
DELETE http://localhost:3001/api/tarefas/1
```

**Body:** nenhum

**Resposta esperada — 204 No Content**

**Erros possíveis:**
```json
{ "erro": "Tarefa não encontrada" }  // 404
{ "erro": "Acesso negado" }          // 403
```

---

#### 8. Health check — task-service

```
GET http://localhost:3001/api/health
```

**Resposta esperada — 200 OK:**
```json
{
  "servico": "task-service",
  "status": "online",
  "porta": "3001"
}
```

---

### 📄 Logs — log-service (porta 8000)

#### 9. Listar todos os logs

```
GET http://localhost:8000/api/logs
```

**Resposta esperada — 200 OK:**
```json
[
  {
    "id": 1,
    "acao": "CRIACAO",
    "usuario_id": 1,
    "tarefa_id": 1,
    "descricao": "Tarefa criada: Estudar Node.js",
    "created_at": "2025-01-01T00:00:00.000000Z",
    "updated_at": "2025-01-01T00:00:00.000000Z"
  }
]
```

**Ações possíveis no campo `acao`:**

| Valor | Quando é gerado |
|---|---|
| `CRIACAO` | Ao criar uma tarefa |
| `CONCLUSAO` | Ao marcar uma tarefa como concluída |
| `REABERTURA` | Ao reabrir uma tarefa concluída |
| `ERRO` | Quando ocorre um erro no task-service |

---

#### 10. Listar logs de um usuário

```
GET http://localhost:8000/api/logs/1
```

> Substitua `1` pelo `usuarioId` retornado no login.

**Resposta esperada — 200 OK:**
```json
[
  {
    "id": 1,
    "acao": "CRIACAO",
    "usuario_id": 1,
    "tarefa_id": 1,
    "descricao": "Tarefa criada: Estudar Node.js",
    "created_at": "2025-01-01T00:00:00.000000Z",
    "updated_at": "2025-01-01T00:00:00.000000Z"
  }
]
```

---

#### 11. Criar log manualmente

```
POST http://localhost:8000/api/logs
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw → JSON):**
```json
{
  "acao": "CRIACAO",
  "usuarioId": 1,
  "tarefaId": 1,
  "descricao": "Teste manual de log"
}
```

**Resposta esperada — 201 Created:**
```json
{
  "id": 3,
  "acao": "CRIACAO",
  "usuario_id": 1,
  "tarefa_id": 1,
  "descricao": "Teste manual de log",
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-01T00:00:00.000000Z"
}
```

---

### 📊 Estatísticas — analyzer-service (porta 8001)

#### 12. Buscar estatísticas de um usuário

```
GET http://localhost:8001/api/estatisticas/1
```

> Substitua `1` pelo `usuarioId` retornado no login.

**Resposta esperada — 200 OK:**
```json
{
  "usuarioId": 1,
  "nomeUsuario": "Isaac Silva",
  "estatisticas": {
    "total": 3,
    "concluidas": 1,
    "pendentes": 2
  }
}
```

**Erros possíveis:**
```json
{ "detail": "Usuário não encontrado" }  // 404
```

---

#### 13. Health check — analyzer-service

```
GET http://localhost:8001/api/health
```

**Resposta esperada — 200 OK:**
```json
{
  "servico": "analyzer-service",
  "status": "online",
  "porta": 8001
}
```

---

### 🔁 Fluxo completo de teste sugerido no Postman

Execute nesta ordem para validar toda a integração entre os 3 serviços:

1. `POST http://localhost:3001/api/auth/cadastro` → cria o usuário
2. `POST http://localhost:3001/api/auth/login` → obtém o token e o `usuarioId`
3. `POST http://localhost:3001/api/tarefas` → cria uma tarefa (gera log CRIACAO)
4. `POST http://localhost:3001/api/tarefas` → cria mais uma tarefa
5. `GET  http://localhost:3001/api/tarefas` → lista as tarefas criadas
6. `PATCH http://localhost:3001/api/tarefas/1/alternar` → conclui (gera log CONCLUSAO)
7. `GET  http://localhost:8000/api/logs` → confirma os logs gerados
8. `GET  http://localhost:8001/api/estatisticas/1` → total=2, concluidas=1, pendentes=1
9. `DELETE http://localhost:3001/api/tarefas/2` → remove a segunda tarefa
10. `GET  http://localhost:8001/api/estatisticas/1` → total=1, concluidas=1, pendentes=0

---

## 🌐 Verificar se está tudo no ar

| URL | Esperado |
|---|---|
| http://localhost:3001/api/health | `{ "status": "online" }` |
| http://localhost:8000/api/logs | `[]` (lista vazia) |
| http://localhost:8001/api/health | `{ "status": "online" }` |
| http://localhost:8001/docs | Swagger UI do analyzer-service |

---

## 🔐 Autenticação

- Cadastro cria usuário com senha em **bcrypt** (hash)
- Login retorna **JWT** válido por 8 horas
- Token enviado como `Authorization: Bearer <token>`
- Cada usuário acessa **apenas suas próprias tarefas** (isolamento por `usuarioId`)
- Tentativas de acesso a tarefas de outros usuários retornam **403 Forbidden**

---

## 🛠 Erros Comuns

| Erro | Causa | Solução |
|---|---|---|
| `url is no longer supported` | Prisma 6+ instalado | `npm install prisma@5 @prisma/client@5` |
| `isError is not a function` | Cache corrompido do npx | `npm install prisma@5 @prisma/client@5` |
| `Cannot find module './routes/...'` | `server.js` com caminho errado | Verifique se os `require` usam `./routes/` e não `../routes/` |
| `Cannot find module '@prisma/client'` | Prisma Client não gerado | `npx prisma generate` |
| `P2002` no Prisma | E-mail duplicado | Use outro e-mail ou limpe a tabela |
| `MySQL connection refused` | Laragon parado | Inicie o Laragon, verifique porta 3306 |
| `vendor/autoload.php not found` | Dependências não instaladas | `composer install` |
| `file_get_contents(.env) failed` | Arquivo .env não existe | `Copy-Item .env.example .env` |
| `Table 'logs' already exists` | Migration duplicada | Delete `xxxx_create_logs_table.php` e rode `php artisan migrate:reset && php artisan migrate` |
| `Nothing to migrate` | Tabelas já criadas | ✅ Normal — continue para o próximo passo |
| `Not Found` em `/api/logs` | Rotas API não registradas | Rode `php artisan install:api` e adicione `api:` no `bootstrap/app.php` |
| `)` duplicado no `bootstrap/app.php` | Edição incorreta do arquivo | Substitua o conteúdo completo do arquivo pelo modelo da seção do log-service |
| Rotas `/api/logs` não aparecem no `route:list` | `api.php` não registrado | Verifique se `api: __DIR__.'/../routes/api.php'` está no `bootstrap/app.php` |
| `php` / `composer` não reconhecido | PATH não configurado | Adicione PHP/Composer ao PATH e reinicie o IntelliJ |
| `ExecutionPolicy` no PowerShell | Política restritiva | `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| `ModuleNotFoundError` Python | venv não ativo | Ative o venv — deve aparecer `(venv)` no prompt |
| `422 Unprocessable Entity` FastAPI | Tipo errado na URL | `usuario_id` deve ser inteiro, não string |
| `500` no Laravel `/api/logs` | Cache desatualizado | `php artisan config:clear && php artisan cache:clear` |
| Tabela não encontrada (Python) | `__tablename__` diferente | Alinhe `modelos.py` com `schema.prisma` |
| CORS bloqueado no navegador | Middleware não registrado | Verifique `config/cors.php` e rode `php artisan config:clear` |
