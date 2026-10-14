# Plan — Marcacao_Horario_Back-End

## 1. Visão geral

- **Nome:** Marcacao_Horario_Back-End (gêmeo **canônico** do sistema de marcação de horário — decisão §9 do MELHORIAS)
- **Descrição:** serviço Node/Express 4 + Mongoose 7 com cadastro de usuários (bcrypt, validação, rate limit), bootstrap com tratamento de porta e controladores de autenticação e índice.
- **Relação entre gêmeos:** este repositório é a fonte canônica; `Marcacao_Horario` (API de entrada) traz a rota extra `GET /post`. Manutenção de funcionalidades novas deve acontecer aqui primeiro.
- **Estado atual:** todos os itens P0–P3 do `MELHORIAS.md` executados em 2026-10-11; DEVOPS-02 (CI) executado nesta sessão.

## 2. Arquitetura e tecnologias

- Node ≥ 22, Express 4, Mongoose 7, bcryptjs 3, express-rate-limit 8.
- `src/start.js` (bootstrap + `EADDRINUSE`), `src/controller/` (authController, indexController), `src/database/` (conexão no boot), `src/models/User.js`.
- Sem frontend/Docker; MongoDB externo configurável; sem suíte de testes (TEST-01 pendente por regra).

## 3. Funcionalidades existentes

- [x] Cadastro com validação/normalização, bcrypt e rate limit — validado estaticamente.
- [x] Conexão Mongo carregada no bootstrap — corrigido em 2026-10-11.
- [x] `start` em produção usa `node` puro (nodemon removido em DEVOPS-01).
- [x] Controlador de índice (`indexController.js`) — implementado.
- [ ] Suíte de testes (`npm test` ainda `Missing script`) — TEST-01 pendente.
- [ ] CI — **implementada nesta sessão** (estática).

## 4. Objetivos futuros

- **OBJ-01 (P2, concluído nesta sessão):** DEVOPS-02 — CI estática Node 22/24.
- **OBJ-02 (P3):** TEST-01 — suíte real (supertest + mongodb-memory-server) assim que a restrição de testes cair.
- **OBJ-03 (P3, decisão de produto):** consolidar o `GET /post` existente só no gêmeo — portar para cá ou aposentar o outro repositório (README deve declarar o caminho).
- **OBJ-04 (P3):** Compose de dev com Mongo local.

## 5. Melhorias técnicas

- **Infraestrutura:** ✅ workflow `.github/workflows/ci.yml` (sintaxe dos 5 fontes, `npm ci`, audit high, diff-check).
- **Qualidade:** cobertura real é o próximo degrau; sem ela, mudanças novas devem ficar congeladas (risco de regressão invisível).

## 6. Roadmap

- **Fase 1–3:** concluídas (auditoria e hardening de 2026-10-11, CI agora).
- **Fase 4:** TEST-01 (OBJ-02) quando permitido.
- **Fase 5:** consolidação dos gêmeos (OBJ-03) e container dev (OBJ-04).

## 7. Backlog priorizado

1. OBJ-02 — TEST-01 suíte mínima (P3 → sobe para P2 quando testes forem liberados).
2. OBJ-03 — decisão canônica dos gêmeos (P3).
3. OBJ-04 — Compose dev (P3).

## 8. Riscos e pendências

- Ausência de testes = verde falso em CI; mitigação registrada (CI estática apenas).
- Gêmeo não-canônico ainda publicado; deriva de código pode reaparecer até OBJ-03.

## 9. Ideias adicionais

- `GET /health` padronizado + logger estruturado (pino) se virar serviço real.

---
*(Gerado em 2026-10-14 pelo agente orquestrador)*
