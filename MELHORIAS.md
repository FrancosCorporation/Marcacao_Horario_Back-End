# MELHORIAS — Marcacao_Horario_Back-End

> **Gerado por análise de código em 2026-10-05** · Stack: Node/Express 4 + Mongoose 7
> Branch `master` (local e `origin/HEAD`) · 6 arquivos em `src/` · 79 LOC · **0 testes**
> (`npm test` → `Missing script: "test"` → **exit 1**) · sem CI
>
> **Este arquivo é um plano de execução.** Cada item tem ID, `arquivo:linha`, mudança exata,
> critério de aceite e comando de verificação.
>
> **Nota (gêmeos):** a decisão da §9 escolhe este repositório como canônico para os arquivos
> compartilhados. O par é quase idêntico — `diff -r` dos dois `src/`: `models/User.js`
> e `database/index.js` **idênticos**; `authController.js` difere **só** pela rota `GET /post` (existe
> lá, não aqui); `start.js` difere (lá: typo `Listeing` e sem `EADDRINUSE`; aqui: `Listening` correto,
> handler de porta e `indexController`). Extras **só aqui**: `src/controller/indexController.js` e
> `src/verify/Verify.js`. A decisão canônica foi registrada antes dos fixes.

---

> **Execução em 2026-10-11:** BUG-01, SEC-01, BUG-02, BUG-03, SEC-02,
> DEVOPS-01, DOC-01 e IMP-01 implementados. Também foi corrigida a conexão
> MongoDB, que não era carregada pelo bootstrap. TEST-01 e DEVOPS-02 seguem
> pendentes: esta rodada não adicionou nem executou testes, e o workflow precisa de
> credencial GitHub com escopo de escrita em Actions. Foram feitos apenas checks
> estáticos (node --check, git diff --check) e npm audit.

## 0. Como usar este documento

1. Execute na ordem **P0 → P1 → P2**, respeitando as ondas da §8.
2. Ao terminar um item: marque `- [x]`, rode o **Verificação**, comite `fix(<ID>): descrição`.
3. A decisão canônica foi registrada na §9 e nos dois READMEs antes dos fixes: este repositório é
   a fonte de `src/models/User.js` e `src/database/index.js`; manter as cópias espelhadas.
4. Itens citam `arquivo:linha` lidos na data do header; se o arquivo mudou, recalcule a linha.
5. **Idioma:** português.

---

## 1. Diagnóstico executivo

Back-end do sistema de marcação de horário: Express 4 com `POST /auth/register`
(`src/controller/authController.js:7`, montado em `/auth` na linha 16) e `GET /teste`
(`src/controller/indexController.js:4-6` → `{"Nice": "Job"}`); grava usuários no MongoDB via
Mongoose 7. **Não existe login nem autenticação** — o registro é o único endpoint com efeito de
escrita. O `Readme.md` descreve o par de repositórios.

**O que está bem (não reaja):**

| Item | Evidência |
|---|---|
| **Handler de `EADDRINUSE`** com mensagem acionável e `exit 1` | `src/start.js:14-20` (o gêmeo **não** tem) |
| Log `"Listening on http://localhost:"` correto | `src/start.js:12` (o gêmeo tem o typo `Listeing`) |
| `password` com **`select: false`** | `src/models/User.js:17` — não vaza em `find()` |
| E-mail **`unique` + `lowercase`** | `src/models/User.js:10-12` |
| URI do Mongo via **`MONGO_URI`** com fallback local | `src/database/index.js:3` |
| **Listener de erro** da conexão com mensagem acionável | `src/database/index.js:7-9` (`defina MONGO_URI...`) |
| `GET /teste` responde **200 honesto** `{"Nice": "Job"}` | `src/controller/indexController.js:4-6` |
| `description` dedicada ao back-end | `package.json:5` (o gêmeo diz "front-end/API") |
| `register` com `try/catch` que **não vaza stack** | `src/controller/authController.js:8-14` (400 genérico) |

**O que está quebrado:**

1. **`Verify.js` referencia o identificador `Verify` que nunca existe** — `ReferenceError` armadilhado (`BUG-01`).
2. **Senha gravada em claro** — `User.create(req.body)` sem hash (`SEC-01`).
3. **Validação do schema desligada** — `require: true` (typo) em 3 campos (`BUG-02`).
4. **`nodemon` como `start` de produção** (`DEVOPS-01`).
5. **Nenhum script `test`** — `npm test` dá `Missing script` (`TEST-01`).
6. **`license: ISC`** no package, mas `LICENSE` e Readme dizem **MIT**; `author` vazio (`DOC-01`).

## 2. Tabela de prioridades

| ID | Título | Sev | Arquivo | Depende de |
|---|---|---|---|---|
| BUG-01 | `Verify.js` exporta identificador indefinido (`ReferenceError`) | **P0** | `src/verify/Verify.js:7` | — |
| SEC-01 | Senha em claro: register grava sem hash | **P0** | `src/controller/authController.js:10` | — |
| BUG-02 | Typo `require` vs `required` — validação desligada | **P0** | `src/models/User.js:6,11,16` | — |
| BUG-03 | `User.create(req.body)` — mass assignment | **P1** | `src/controller/authController.js:10` | BUG-02 |
| TEST-01 | Nenhum script `test` (`npm test` → `Missing script`) | **P1** | `package.json:7-9` | BUG-02 |
| SEC-02 | Sem rate limit no register | **P2** | `src/controller/authController.js:7` | — |
| DEVOPS-01 | `nodemon` (devDep) como `start` de produção | **P2** | `package.json:8,26` | — |
| DOC-01 | `license: ISC` vs `LICENSE`/Readme MIT + `author` vazio | **P2** | `package.json:15-16` | — |
| IMP-01 | Espelhar arquivos compartilhados no `Marcacao_Horario` | **P2** | `src/` (par) | Decisão registrada |
| DEVOPS-02 | Sem CI (sem `.github/`) | **P2** | *(ausente)* | TEST-01 |

**Placar: 3 P0 · 2 P1 · 5 P2 = 10 itens.**

---

## 3. Segurança

### SEC-01 · Senha em claro: register grava a senha sem hash · [P0]

- **Arquivo:** `src/controller/authController.js:10`
- **Evidência:**
  ```javascript
  const user = await User.create(req.body)   // linha 10 — a senha vai sem hash
  ```
  `grep -rn 'bcrypt\|hash' src/ package.json` → **nada**; `bcrypt` não está em `dependencies`
  (`package.json:21-24` declara só `express@^4.18.2` e `mongoose@^7.0.5`). A senha vai ao Mongo
  **exatamente** como veio do body.
- **Impacto:** qualquer leitura do banco (dump, backup, `mongosh`, injetão futura, insider) entrega
  credenciais **reutilizáveis** — as pessoas reutilizam senhas, então um vazamento do banco expõe
  também outras contas da vítima. E sem hash não há como implementar login com segurança depois.
- **Mudança:** (1) `npm i bcrypt` (ou `bcryptjs`); (2) hashear antes do `create` e **já** usar
  allowlist (ver `BUG-03`):
  ```javascript
  const bcrypt = require('bcrypt')
  const { name, email, password } = req.body
  const hash = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, password: hash })
  ```
  (3) nunca logar `req.body`/`user.password`.
- **Aceite:** o documento no Mongo tem `password` começando com `$2a$`/`$2b$`; a senha crua não
  existe em nenhuma coleção.
- **Verificação:**
  ```bash
  curl -s -X POST http://localhost:3000/auth/register -H 'Content-Type: application/json' \
    -d '{"name":"A","email":"a@x.com","password":"MinhaSenha123"}'
  mongosh --quiet marcacao --eval 'db.users.find({email:"a@x.com"},{password:1,_id:0}).toArray()'
  # esperado: password "$2b$..." — e NUNCA "MinhaSenha123" (hoje: a senha crua aparece)
  ```

### SEC-02 · Register sem rate limit (enumeração/spam de criação) · [P2]

- **Arquivo:** `src/controller/authController.js:7-15` (aplicação em `src/start.js`)
- **Evidência:** `grep -rn 'rate\|limiter\|helmet' src/` → **nada**; `package.json` não tem
  `express-rate-limit`. A rota aceita POST ilimitado do mesmo IP.
- **Impacto:** (a) **spam de criação** — qualquer um enche a coleção `users` (disco/write do Atlas);
  (b) **enumeração de e-mails** — o `unique` do e-mail vira oráculo: `200` = não existia,
  `400 "Registration failed"` = já existe (`authController.js:13-14`), permitindo testar se um
  e-mail está cadastrado; (c) nenhuma defesa contra abuso futuro.
- **Mudança:** `express-rate-limit` global ou só no `POST /auth/register` (ex.: 5 req/15 min/IP,
  `standardHeaders: true`), + documentar `app.set('trust proxy', 1)` se houver proxy.
- **Aceite:** 6ª requisição de registro do mesmo IP em 15 min → **429**.
- **Verificação:**
  ```bash
  for i in $(seq 1 6); do
    curl -s -o /dev/null -w "req $i -> %{http_code}\n" -X POST http://localhost:3000/auth/register \
      -H 'Content-Type: application/json' \
      -d "{\"name\":\"n$i\",\"email\":\"n$i@x.com\",\"password\":\"SenhaForte1!\"}"
  done
  # esperado: 200/400 nas 5 primeiras, 429 na 6ª
  ```

---

## 4. Bugs e defeitos funcionais

### BUG-01 · `Verify.js` exporta o identificador `Verify`, que nunca foi definido · [P0]

- **Arquivo:** `src/verify/Verify.js:1-7` (linha 7)
- **Evidência:** o arquivo tem 7 linhas:
  ```javascript
  const express= require('express')
  const router = express.Router()   // criado e nunca usado
  // ...
  module.exports = Verify           // linha 7 — "Verify" não existe em lugar nenhum
  ```
  `grep -rn 'Verify' src/` → **só a própria linha 7**; `grep -n 'verify' src/start.js` → **sem
  ocorrência** (o `start.js` só exige `authController` na linha 8 e `indexController` na linha 9).
  Ou seja: hoje o módulo é **morto**; no primeiro `require('./verify/Verify')` o Node executa o
  arquivo e lança **`ReferenceError: Verify is not defined`** no boot.
- **Impacto:** armadilha P0 latente: o nome do diretório promete "verificação" (o único endpoint de
  verificação real é `GET /teste` no `indexController.js:4-6`), então é o módulo que alguém "ativa"
  primeiro ao estender o app — e leva `ReferenceError` em produção. Além disso `router` fica morto
  dentro do arquivo (lixo eletrônico que passa por código revisável).
- **Mudança:** escolher **UMA** e registrar no PR: **(a) remover** `src/verify/` inteiro
  (recomendado — módulo morto, zero referências); **ou (b) implementar**: rotas de verdade no
  `router` e `module.exports = router` (hoje `module.exports = Verify`), exigindo-o no `start.js`.
- **Aceite:** opção (a): `grep -rn 'Verify' src/` vazio. Opção (b):
  `node -e "require('./src/verify/Verify')"` → exit 0, **sem** `ReferenceError`.
- **Verificação:**
  ```bash
  grep -rn 'Verify' src/                        # opção (a): sem saída
  node -e "require('./src/verify/Verify')"      # opção (b): exit 0, sem ReferenceError
  node -e "require('./src/verify/Verify')" 2>&1 | grep -i 'ReferenceError' && echo "AINDA QUEBRADO"
  ```

### BUG-02 · Typo `require` vs `required` — validação do schema silenciosamente desligada · [P0]

- **Arquivo:** `src/models/User.js:6,11,16`
- **Evidência:**
  ```javascript
  name:     { type: String, require: true },                  // linha 6
  email:    { type: String, unique: true, require: true, ... },// linha 11
  password: { type: String, require: true, select: false },   // linha 16
  ```
  A opção do Mongoose é **`required`**. `grep -n 'required' src/models/User.js` → **sem
  ocorrências**; as 3 ocorrências são `require:`. O Mongoose 7 **ignora** a chave desconhecida sem
  avisar — a obrigatoriedade nunca é registrada. (O arquivo é **idêntico** ao do gêmeo — diff sem
  saída —, então o mesmo fix vale para os dois.)
- **Impacto:** `POST /auth/register` com body `{}` **cria documento sem `name`/`email`/`password`**
  (o `catch` não dispara). O `unique` do e-mail não protege campos ausentes. Qualquer front/teste
  que espere `400` p/ dado incompleto quebra em produção **sem nenhum log** — falha silenciosa,
  exatamente o tipo que só aparece quando os dados já estão sujos.
- **Mudança:** trocar as 3 ocorrências por `required: true` (não deixe a chave morta):
  ```javascript
  email: { type: String, unique: true, required: true, lowercase: true },
  ```
- **Aceite:** `User.create({})` → `ValidationError`; body `{}` no endpoint → **400**;
  `grep -n 'require:' src/models/User.js` → vazio.
- **Verificação:**
  ```bash
  grep -n 'require:' src/models/User.js        # esperado: NENHUMA saída
  curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:3000/auth/register \
    -H 'Content-Type: application/json' -d '{}'
  # esperado: 400 (hoje: 200 e documento vazio no Mongo)
  ```

### BUG-03 · `User.create(req.body)` — mass assignment · [P1]

- **Arquivo:** `src/controller/authController.js:10`
- **Evidência:** o body vai **integro** ao `create`:
  ```javascript
  const user = await User.create(req.body)
  ```
  O schema expõe os caminhos `name`, `email`, `password`, `createdAt` (`src/models/User.js:4-22`).
  `createdAt` tem `default: Date.now`, mas **default só age quando o campo não vem** — vindo do body,
  é aceito. *(Campos fora do schema são descartados pelo strict mode do Mongoose; o risco é sobre os
  campos **do** schema e sobre `"_id"` opcional.)*
- **Impacto:** cliente malicioso/bug de front envia `createdAt` fabricado (auditoria/ordenação falsa),
  `_id` escolhido, ou qualquer campo futuro do schema — sem allowlist, **toda** mudança de schema
  vira superfície de ataque sem tocar no controller. Combina com `BUG-02`: sem `required`, um
  "create" aceita corpo mínimos. (O gêmeo tem exatamente o mesmo defeito — `Marcacao_Horario`
  `authController.js:9`.)
- **Mudança:** desestruturar allowlist no controller (junto do `SEC-01`):
  ```javascript
  const { name, email, password } = req.body   // allowlist explícita
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) })
  ```
- **Aceite:** `POST` com `{"createdAt":"1999-01-01T00:00:00Z", ...}` grava `createdAt` = **agora**
  (default do schema); campos fora da allowlist são ignorados.
- **Verificação:**
  ```bash
  curl -s -X POST http://localhost:3000/auth/register -H 'Content-Type: application/json' \
    -d '{"name":"A","email":"c@x.com","password":"SenhaForte1!","createdAt":"1999-01-01T00:00:00Z"}' >/dev/null
  mongosh --quiet marcacao --eval 'db.users.find({email:"c@x.com"},{createdAt:1,_id:0}).toArray()'
  # esperado: createdAt ~ HOJE (hoje: 1999-01-01 persistido)
  ```

### IMP-01 · Par de gêmeos quase-idêntico — sincronização pendente · [P2]

- **Arquivo:** `src/` (inteiros) do par `Marcacao_Horario_Back-End` × `Marcacao_Horario`
- **Evidência:** `diff -r` dos dois `src/` executado na data desta análise:
  `models/User.js` e `database/index.js` **idênticos**; `authController.js` difere **só** pela rota
  `GET /post` (existe no gêmeo, não aqui); `start.js` difere (aqui: `Listening` correto, handler de
  `EADDRINUSE` e `indexController`; lá: typo `Listeing` e sem handler); extras só aqui:
  `src/controller/indexController.js` e `src/verify/Verify.js`. Divergências já **presentes no
  metadata**: `license` ISC × MIT; `author` vazio × preenchido; `test` ausente × `echo` fake;
  `description` dedicada × "front-end/API".
- **Impacto:** os dois repos **já corrigiram sozinhos metade dos defeitos um do outro** (aqui estão
  `EADDRINUSE`, log correto e `/teste` honesto; lá não foram copiados; lá existe `GET /post` com
  resposta enganosa que não veio para cá) e **já divergiram em metadata** — a cada fix manual em um
  só lado o par regride (`SEC-01`/`BUG-02` corrigidos aqui e esquecidos lá = senha em claro e
  `require:` morto vivendo em produção pela metade). É a causa-raiz dos defeitos de sincronismo:
  manter duas cópias sem processo é dívida permanente.
- **Mudança:** aplicar a decisão (A) já registrada na §9: manter este repositório como canônico e
  espelhar `models/User.js` e `database/index.js` no app de entrada; automatizar a checagem em uma
  etapa futura de CI.
- **Aceite:** decisão documentada; os arquivos compartilhados são idênticos nos dois repos; as
  diferenças restantes em `src/` correspondem aos papéis descritos; os fixes P0/P1 compartilhados
  existem em ambos.
- **Verificação:**
  ```bash
  diff -r ../Marcacao_Horario/src src | head -20
  # esperado após a decisão: apenas start.js/authController.js e os extras indexController/verify
  # (models/User.js e database/index.js NUNCA devem aparecer no diff)
  grep -n 'require:' src/models/User.js ../Marcacao_Horario/src/models/User.js   # ambos vazios
  ```

---

## 5. Qualidade: testes

### TEST-01 · Nenhum script `test` — `npm test` falha com `Missing script` · [P1]

- **Arquivo:** `package.json:7-9`
- **Evidência:**
  ```json
  "scripts": {
    "start": "nodemon src/start.js"
  }
  ```
  Não há chave `test`. Executado **ao vivo**: `npm test` → `npm ERR! Missing script: "test"` e
  **exit 1**. (Diferença importante com o gêmeo `Marcacao_Horario`: lá o script **existe mas é
  fake** — `echo "sem testes automatizados"` com exit 0; aqui ele **nem existe**. Dois gêmeos, duas
  falhas distintas de mesma natureza: zero testes.)
- **Impacto:** nenhuma barreira automática contra regressão — o typo do `BUG-02` (validação
  desligada) e o `ReferenceError` do `BUG-01` passariam por qualquer PR; CI futuro
  (`DEVOPS-02`) não tem o que rodar; impossível provar que fixes do par não quebram o outro repo.
- **Mudança:** runner nativo **`node:test`** (zero dependências novas) com testes que **não precisam
  de Mongo** — validação de schema via `validateSync()` e controller com `User.create` mockado:
  ```json
  "test": "node --test test/"
  ```
  ```javascript
  // test/user.schema.test.js
  const { test } = require('node:test'); const assert = require('node:assert')
  const User = require('../src/models/User')
  test('email/password são obrigatórios', () => {
    assert.ok(new User({}).validateSync().errors.email)
  })
  ```
  Mínimo: **3 casos** (schema vazio → erro; e-mail inválido → erro; `require` morto não volta).
- **Aceite:** `npm test` roda ≥ 3 casos reais com exit 0; **sabotar** o `required` deixa a suíte
  vermelha (exit ≠ 0).
- **Verificação:**
  ```bash
  npm test; echo "exit=$?"                                  # casos reais, exit=0
  sed -i 's/required: true/require: true/' src/models/User.js
  npm test; echo "sabotage exit=$?"                         # esperado: !=0
  git checkout src/models/User.js                           # restaurar
  ```

---

## 6. DevOps / Infra

### DEVOPS-01 · `nodemon` (devDependency) como `start` de produção · [P2]

- **Arquivo:** `package.json:8` (script) e `package.json:26` (devDep)
- **Evidência:**
  ```json
  "start": "nodemon src/start.js"        // linha 8
  ...
  "devDependencies": { "nodemon": "^2.0.22" }   // linhas 25-27
  ```
  `npm ls nodemon` → `nodemon@2.0.22` **(dev: true)**. Ou seja, o **modo de produção** depende de
  uma ferramenta de desenvolvimento. O gêmeo `Marcacao_Horario` usa `"start": "node src/start.js"`
  (o padrão correto).
- **Impacto:** (a) `npm ci --omit=dev && npm start` (instalação de produção) → `nodemon: command not
  found` — **o serviço não sobe**; (b) rodando, o nodemon faz watch de arquivos em produção
  (overhead de I/O e restart inesperado se alguém escrever no container); (c) scripts/orquestradores
  (systemd, compose, PM2) esperam que `start` seja o processo final, não um wrapper.
- **Mudança:**
  ```json
  "start": "node src/start.js",
  "dev": "nodemon src/start.js"
  ```
  (documentar no `Readme.md:45-49`, que hoje descreve o start como nodemon).
- **Aceite:** `npm ci --omit=dev && npm start` sobe o serviço; `npm run dev` mantém o reload.
- **Verificação:**
  ```bash
  npm ci --omit=dev && (npm start & sleep 2; curl -s -o /dev/null -w '%{http_code}\n' \
    http://localhost:3000/teste; kill %1)
  # esperado: 200 (hoje: npm start falha — nodemon não instalado em produção)
  npm pkg get scripts.start             # esperado: "node src/start.js"
  ```

### DEVOPS-02 · Sem CI (nem `.github/`) · [P2]

- **Arquivo:** *(ausente)* — `ls -la .github` → **não existe**; a árvore completa do repo é
  `.gitignore`, `LICENSE`, `package.json`, `package-lock.json`, `Readme.md` e `src/**` — nenhum
  workflow, `.gitlab-ci.yml` ou Dockerfile.
- **Evidência:** nenhum arquivo de automação versionado; commits vão direto para a `master`.
- **Impacto:** (a) nada executa o `TEST-01` — mesmo depois de existirem testes, PRs quebrados
  passam; (b) nenhum passo impede que o `ReferenceError` do `BUG-01` volte; (c) o fix do `IMP-01`
  (gêmeos) é manual nos dois repos — é aqui que um CI com diff contra o gêmeo canônico pagaria o
  investimento.
- **Mudança:** `.github/workflows/ci.yml` em `push`/`pull_request`: `npm ci` → `npm test` →
  (opcional) `npm audit --omit=dev`; depois, se adotar a sincronização da §9, um passo
  `diff -r` contra o repo canônico.
- **Aceite:** workflow verde no próximo push; um PR que sabote o teste fica vermelho.
- **Verificação:**
  ```bash
  ls .github/workflows/ci.yml && gh run list --limit 3
  # esperado: workflow listado e último run "success" (hoje: "No such file or directory")
  ```

---

## 7. Documentação

### DOC-01 · `license: ISC` contradiz `LICENSE`/Readme (MIT) e `author` vazio · [P2]

- **Arquivo:** `package.json:15` (`author`) e `package.json:16` (`license`)
- **Evidência:** três fontes, dois veredictos:
  ```json
  "author": "",          // linha 15 — vazio
  "license": "ISC",      // linha 16
  ```
  mas o `LICENSE` do repo começa **`MIT License / Copyright (c) 2023 Rodolfo Franco`** e é
  **byte-idêntico** ao do gêmeo (`diff LICENSE` → sem saída); o `Readme.md:6` (badge) e
  `Readme.md:70` ("Distribuído sob a licença **MIT**") também dizem MIT; o gêmeo declara
  `"license": "MIT"` com `"author": "Rodolfo Franco (FrancosCorporation)"`.
- **Impacto:** (a) **licença ambígua** — `npm`/registros mostram ISC enquanto o código distribuído
  traz MIT; ISC e MIT são compatíveis na prática, mas a inconsistência desorienta quem reusa o
  código (qual prevalece? o `package.json` ou o `LICENSE`?) e quebra ferramentas de compliance/SBOM;
  (b) `author` vazio perde crédito/contato obrigatório em metadados e é divergência gratuita em
  relação ao gêmeo.
- **Mudança:** alinhar para **MIT** (é o que `LICENSE` e Readme dizem, e o par já usa):
  ```json
  "author": "Rodolfo Franco (FrancosCorporation)",
  "license": "MIT"
  ```
  e revisar `bugs.url`/`homepage` (linhas 17-20), que apontam para `Marcacao_Consultas` — o mesmo
  defeito do `DOC-01` do gêmeo.
- **Aceite:** `npm pkg get license` → `"MIT"`; `author` não vazio; os três metadados batem com o
  arquivo `LICENSE`.
- **Verificação:**
  ```bash
  npm pkg get license | grep -F '"MIT"'        # deve existir
  npm pkg get author | grep -F 'Rodolfo Franco' # não pode ser ""
  head -1 LICENSE                               # MIT License
  diff LICENSE ../Marcacao_Horario/LICENSE && echo 'par alinhado'
  ```

---

## 8. Ordem de execução (waves)

### Wave 1 — P0 (armadilha + segurança/integridade)
1. **`BUG-01`** — remover/implementar `src/verify/Verify.js` (tira o `ReferenceError` de circulação).
2. **`SEC-01`** — hash da senha (bcrypt + allowlist mínima no mesmo trecho).
3. **`BUG-02`** — `require` → `required` (reativa as validações do schema).

### Wave 2 — P1 (correção funcional + rede de segurança)
4. **`BUG-03`** — allowlist no `create` (mesmo trecho do `SEC-01`; depende de `BUG-02` para o
   `required` valer).
5. **`TEST-01`** — suíte `node:test` que **trava** a Wave 1-2 (senha hasheada, `required` ativo,
   allowlist).

### Wave 3 — P2 (robustez e higiene)
6. **`SEC-02`** — rate limit no register.
7. **`DEVOPS-01`** — `start` = `node`, `dev` = `nodemon` (+ Readme).
8. **`DOC-01`** — `license`/`author` (e URLs do `package.json`).
9. **`DEVOPS-02`** — CI (passa a rodar o `TEST-01`).
10. **`IMP-01`** — espelhar os arquivos canônicos após os fixes; a decisão já está registrada.

**Dependências que não podem ser invertidas:**
`BUG-02` antes de `BUG-03`/`TEST-01` (sem `required`, o teste de obrigatório não faz sentido) ·
`SEC-01`+`BUG-03` juntos (tocam o mesmo trecho do controller) · `TEST-01` antes de `DEVOPS-02`
(CI sem teste não teria o que rodar) · **`IMP-01` por último** — espelhar os arquivos canônicos
depois dos fixes.

---

## 9. Fora de escopo / riscos

| Item | Decisão | Motivo |
|---|---|---|
| **Qual repo do par vira canônico** | **Decidido: este repositório** | Fonte dos arquivos compartilhados; `Marcacao_Horario` mantém a entrada `/auth/register`. |
| Adicionar login/JWT | **Não (ainda)** | Não existe rota de login; escopo de feature. |
| Upgrade Express 4 / Mongoose 7 | **Não** | Versões atuais para o uso; sem necessidade. |
| Renomear branch `master` → `main` | **Opcional** | Branch real (local e `origin/HEAD`) é `master` — decisão de time. |
| Reescrever em TypeScript | **Não** | 79 LOC; dívida pequena demais para justificar. |

**Decisão registrada antes do primeiro fix — destino do par:**

O `diff -r` dos dois `src/` foi executado: `models/User.js` e `database/index.js` são
**idênticos**; `authController.js` difere **só** pela rota `GET /post` (existe no gêmeo
`Marcacao_Horario`, não aqui); `start.js` difere (aqui: `Listening` correto + `EADDRINUSE` +
`indexController`; lá: typo `Listeing` e sem handler). Extras só aqui: `indexController.js` e
`verify/Verify.js`. Ou seja, **cada gêmeo já tem metade das correções do outro**. Se
`SEC-01`/`BUG-02` forem corrigidos só aqui, o `Marcacao_Horario` **regride** com senha em claro e
`require:` morto — e vice-versa. A divergência atual de licenças (`ISC` × `MIT`), de `author`
(vazio × preenchido) e de `test` (ausente × `echo` fake) já é a prova do custo da falta de
sincronismo.

**Decisão adotada (A) — Back-End canônico + cópia espelhada:**
- Este repositório é canônico para `src/models/User.js` e `src/database/index.js`; tem o bootstrap
  mais completo e pertence ao papel de back-end.
- `Marcacao_Horario` mantém o papel de entrada/cadastro; suas cópias compartilhadas serão
  sincronizadas junto aos fixes equivalentes do par.
- A automação de sincronismo/CI permanece no item `IMP-01`; nenhum código será divergente ao final
  desta rodada.

**Riscos desta execução:**

- **`BUG-02` corrigido muda comportamento:** body vazio passa a dar **400** — coleções de
  insomnia/front que enviavam `{}` vão quebrar (é o efeito desejado, mas avise quem testa).
- **`SEC-01` exige migração de dados legados:** não existem senhas hashadas hoje; se houver
  coleção `users` em produção com senha crua, o registro novo hasheia mas as antigas continuam
  cruas — como **não há login**, a saída é **reset/limpeza das senhas antigas**, não re-hash cego.
- **`BUG-01` opção (b) exige design:** implementar `Verify` de verdade significa definir **o que**
  ele verifica (o `GET /teste` já existe) — não transforme o fix em feature creep.
- **`DEVOPS-01` muda o modo de rodar:** quem usava `npm start` para dev perde o watch — documentar
  `npm run dev` no Readme **no mesmo PR**.
- **`TEST-01` sabotagem:** o `sed` de verificação modifica `src/models/User.js` — rode em working
  tree limpo e restaure com `git checkout`.
- **`IMP-01` automação pendente:** os arquivos compartilhados serão espelhados neste lote; um
  verificador automático continua pendente para prevenir divergências futuras.

---

## 10. Definição de pronto (DoD)

**Segurança**
- [x] `SEC-01` — senha hasheada com bcrypt antes de persistir e não enviada na resposta
- [x] `SEC-02` — limite configurado para 5 cadastros por IP em 15 minutos, com resposta 429

**Funcional**
- [x] `BUG-01` — opção (a): `grep -rn 'Verify' src/` vazio · opção (b): `node -e "require('./src/verify/Verify')"` sem `ReferenceError`
- [x] `BUG-02` — `grep -n 'require:' src/models/User.js` sem saída; body `{}` → `400`
- [x] `BUG-03` — `createdAt` fabricado **não** persiste (default do schema); campos fora da allowlist ignorados

**Testes, docs e infra**
- [ ] `TEST-01` — `npm test` roda ≥ 3 casos reais; sabotar o `required` deixa a suíte vermelha
- [x] `DEVOPS-01` — start usa node, dev usa node --watch e o engine declara Node.js 22 ou superior
- [x] `DOC-01` — `license` = `MIT`, `author` preenchido; batem com o arquivo `LICENSE` e o Readme
- [ ] `DEVOPS-02` — workflow de CI verde em push/PR
- [x] `IMP-01` — decisão A registrada; arquivos compartilhados idênticos nos dois repos; diferenças restantes são intencionais

**Validação final:**
```bash
grep -rn 'Verify' src/                          # opção (a): vazio
grep -rn 'require:' src/models/User.js          # esperado: vazio
grep -rn 'bcrypt' package.json                  # esperado: presente
npm pkg get license                             # esperado: "MIT"
npm test; echo "exit=$?"                        # casos reais, exit=0
python3 /tmp/validate.py Marcacao_Horario_Back-End   # esperado: OK
```

---

*Fim do plano. Gerado por leitura direta do código em 2026-10-05. Todos os `grep`, `diff`, `git remote` e `npm test` citados foram executados na data da análise; nenhum item já estava corrigido.*
