# MOVIX

Fundação SaaS para gestão de frotas de locação, com HTML, Tailwind CSS, JavaScript puro, Node.js, Express, PostgreSQL e Supabase Auth/Storage.

## Executar

Requer Node.js 20+ e um projeto Supabase. Em `backend`, instale e configure:

```sh
npm install
cp .env.example .env
npm run dev
```

Preencha `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `ALLOWED_ORIGIN` no `.env`. Defina `COOKIE_SECURE=true` em HTTPS/produção. A aplicação abre em `http://localhost:3000`; Express serve o frontend e a API. `GET /api/health` verifica o servidor e `GET /api/health/database` a conexão PostgreSQL.

## Migrations e relações

Aplique em ordem pelo SQL Editor do Supabase:

1. `backend/database/migrations/001_initial_schema.sql` cria perfis, organizações, membros, veículos, locatários e contratos.
2. `002_row_level_security.sql` ativa RLS nas tabelas.
3. `003_profiles_and_resources.sql` adiciona os campos pedidos mantendo compatibilidade com o schema inicial.
4. `004_row_level_security_policies.sql` limita leituras pela identidade Supabase e pelas organizações relacionadas.
5. `005_avatar_storage.sql` cria o bucket público `avatars` com upload autenticado restrito à pasta UUID de cada usuário.

`profiles.id` referencia o UUID do Supabase Auth; `organizations.owner_id` e `organization_members` associam proprietários e membros; cada veículo/locatário pertence a uma organização; contratos referenciam veículo e locatário da mesma organização. Senhas nunca são gravadas nas tabelas MOVIX: ficam no Supabase Auth.

## Perfil e autenticação

Cadastro, login, logout, recuperação e troca de senha usam a API Supabase Auth. A sessão usa cookies `httpOnly`, `SameSite=Lax`; o backend valida e renova o token com Supabase antes de servir APIs protegidas. Em produção, habilite `COOKIE_SECURE=true`. O modal permite editar nome, telefone, solicitar alteração de e-mail (confirmação por e-mail) e enviar foto JPG/PNG/WebP de até 5 MB. Para exibir avatar, o bucket `avatars` fica público; uploads só podem gravar em `<user-uuid>/`.

## Endpoints

- `GET /api/health`, `GET /api/health/database`
- `POST /api/auth/register`, `/login`, `/logout`, `/recover`, `/recovery-session`; `GET /api/auth/session`; `PUT /api/auth/password`
- `GET /api/profile`, `PATCH /api/profile`, `POST /api/profile/avatar`
- `GET /api/organizations/me`, `GET /api/vehicles`, `GET /api/contracts`

As consultas verificam papel e participação na organização no backend e no banco. `DATABASE_URL` deve ser uma conexão PostgreSQL privada do servidor; nunca a coloque no frontend. A chave `SUPABASE_ANON_KEY` é pública por natureza, mas a `service_role` não é usada nem deve ser exposta.

## Estrutura e limites

- `frontend/`: páginas de entrada e dashboards responsivos dos dois perfis; páginas de módulos são placeholders.
- `backend/src/`: rotas, controllers, serviços, autenticação, validação e tratamento de erros.
- `backend/database/migrations/`: schema versionado, índices, chaves e políticas RLS.

Os painéis ainda mostram conteúdo demonstrativo e não implementam regras operacionais de frota, pagamentos, rastreamento ou IA. Nenhuma credencial Supabase é incluída no repositório. Antes do uso, configure o projeto Supabase, aplique migrations e habilite confirmação de e-mail conforme a política do produto.
