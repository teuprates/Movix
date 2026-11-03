# MOVIX

Fundação de uma plataforma SaaS para gestão de pequenas frotas de locação. Interface feita em HTML, Tailwind CSS e JavaScript puro; API em Node.js/Express; PostgreSQL/Supabase preparado via migrations.

## Requisitos

- Node.js 20 ou superior
- PostgreSQL 15 ou projeto Supabase (a conexão usa `DATABASE_URL`)

## Executar

```sh
cd backend
npm install
cp .env.example .env
# Preencha DATABASE_URL e SESSION_SECRET em .env
npm run dev
```

Abra `http://localhost:3000`. O Express serve o frontend e a API no mesmo host. `GET /api/health` verifica o servidor; `GET /api/health/database` verifica a conexão configurada. Sem `DATABASE_URL`, a interface e health básico funcionam, mas endpoints que dependem do banco retornam erro de configuração.

## Banco de dados

Configure `DATABASE_URL` com a string de conexão PostgreSQL do Supabase. Em produção, use SSL e uma senha segura. Aplique as migrations em ordem usando o SQL Editor do Supabase ou uma ferramenta PostgreSQL: `backend/database/migrations/001_initial_schema.sql`, depois `002_row_level_security.sql`. As tabelas e relações estão descritas nos comentários SQL.

## Estrutura

- `frontend/`: páginas estáticas, estilos e JavaScript modular por arquivo.
- `backend/src/`: configuração, rotas, controllers, services e middlewares.
- `backend/database/migrations/`: schema inicial e políticas de isolamento por organização.

## Escopo atual

A interface contém páginas de estrutura para proprietário e locatário. Cadastro, login e recuperação estão preparados como fluxos de interface, enquanto as rotas de autenticação retornam `501` até a integração de um provedor de identidade. Não há regras operacionais de frota, cobrança, rastreamento ou IA nesta fundação. Antes de habilitar dados reais, integre autenticação confiável e faça as políticas RLS validarem a identidade autenticada via JWT Supabase.

## Segurança e expansão

As rotas de API têm validação básica, middleware de sessão preparado e tratamento central de erros. A autorização de organização deve ser aplicada no servidor ao implementar módulos. O middleware atual não cria sessões nem autentica usuários. A migration liga RLS; políticas restritivas só devem ser ativadas quando a identidade JWT da aplicação estiver integrada. Não exponha credenciais administrativas no navegador.
