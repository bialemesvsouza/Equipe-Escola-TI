# MindLiner — Equipe Escola de TI

Hub do projeto MindLiner, o app de estudos gamificado do TCC de Engenharia de Software (Unicesumar).
Aqui ficam a documentação, o design e o mapa dos repositórios de código.

## Repositórios

| Repositório | O que tem | Stack |
|---|---|---|
| **Equipe-Escola-TI** (este) | Documentação, requisitos, diagramas, wireframes e Figma | — |
| [BackEnd_ML](https://github.com/bialemesvsouza/BackEnd_ML) | API REST usada pelo web e pelo mobile | Spring Boot 3, Java 17, PostgreSQL (Supabase) |
| [FrontEnd_ML](https://github.com/bialemesvsouza/FrontEnd_ML) | Interface web | React 19, TypeScript, Vite |
| [MindLiner-Mobile](https://github.com/IrinXD/MindLiner-Mobile) | App mobile | Expo, React Native |

```
                 ┌───────────────┐
  FrontEnd_ML ──▶│               │
  (web :5173)    │  BackEnd_ML   │──▶ PostgreSQL (Supabase)
                 │  API :8080    │
  Mobile ───────▶│  /api/**      │
  (Expo :8081)   └───────────────┘
```

Os clientes só falam com a API, por JSON e token JWT. O contrato está no Swagger do backend: `http://localhost:8080/swagger-ui/index.html`.

## Montar o ambiente

Clone os quatro repositórios lado a lado, na mesma pasta:

```
Escola de TI/
├── Equipe-Escola-TI/
├── BackEnd_ML/
├── FrontEnd_ML/
└── MindLiner-Mobile/
```

Com este repositório clonado, o script baixa os outros três (ou atualiza os que já existem):

```powershell
# Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File .\scripts\clonar-repos.ps1
```

```bash
# macOS / Linux
./scripts/clonar-repos.sh
```

Depois abra `MindLiner.code-workspace` no VS Code: ele mostra os quatro repositórios numa janela só, cada um com o próprio git.

## Rodar tudo junto

| Ordem | Repositório | Comando | Endereço |
|---|---|---|---|
| 1 | BackEnd_ML | `cd mindliner-backend` e `mvn spring-boot:run` (precisa do `.env` com as credenciais) | `http://localhost:8080` |
| 2 | FrontEnd_ML | `npm install` e `npm run dev` | `http://localhost:5173` |
| 3 | MindLiner-Mobile | `npm install` e `npx expo start` | Expo Go ou `http://localhost:8081` |

O front web usa um proxy do Vite para `/api`, então não depende do CORS. O backend libera `localhost:5173` e `localhost:8081` para quem chamar direto.

## Combinados da equipe

- Uma branch por card: `feature/TI-90-gerenciar-conteudos`, `fix/TI-164-erro-login`.
- Commits no padrão `tipo: descrição` (`feat`, `fix`, `docs`, `chore`, `refactor`).
- Mudança de contrato da API (endpoint, DTO, coluna nova) vai em duas PRs, uma no BackEnd_ML e outra no cliente afetado, citando uma na outra.
- Coluna nova no banco: o script SQL vai junto na PR do backend (`docs/sql/`), porque o Hibernate roda em `validate` e não cria tabela.

## Design

- Figma: [MindLiner-V2](https://www.figma.com/design/LnZBM8l8aZfuRsFkhKdAsg/MindLiner-V2?node-id=8-7) — senha em [`Design - UI/README.md`](Design%20-%20UI/README.md)
- Exportações das telas: [`Design - UI/Wireframes`](Design%20-%20UI/Wireframes) (`Fundamentos.pdf` tem cores, tipografia e espaçamentos)

## Documentação

| Pasta | Conteúdo |
|---|---|
| `Documentos de Diagramas/` | Casos de uso, diagramas de sequência e de classe, histórias de usuário, requisitos e regras de negócio |
| `Documentação Arquitetura/` | Documento de arquitetura |
| `Documentação de Gestão - Mercado/` | Abertura do projeto, RACI, SWOT, concorrentes, LGPD e CDC |
| `Design - UI/` | Pesquisa de branding e wireframes |
