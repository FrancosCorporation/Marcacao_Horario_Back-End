# Marcação de Horário — Back-end

![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-blue)
![Status](https://img.shields.io/badge/status-prot%C3%B3tipo-orange)

Repositório back-end do sistema de marcação de horário: serviço Node/Express com cadastro de usuários em MongoDB, par do repositório [Marcacao_Horario](https://github.com/FrancosCorporation/Marcacao_Horario).

## Sobre

O projeto **Marcação de Horário** está dividido em dois repositórios que funcionam juntos:

- **[Marcacao_Horario](https://github.com/FrancosCorporation/Marcacao_Horario)**: camada de entrada do sistema.
- **Marcacao_Horario_Back-End** (este): back-end, responsável pelo cadastro de usuários e pelo endpoint de verificação `/teste`.

Os dois compartilham o mesmo modelo de usuário (`src/models/User.js`) e a mesma configuração de banco (`src/database/index.js`), então devem ser executados em conjunto.

## Funcionalidades

- `POST /auth/register`: cria um usuário a partir do corpo da requisição (`name`, `email`, `password`) via Mongoose, respondendo `{"user": "Usuario Registrado"}` em caso de sucesso e `400` em caso de falha.
- `GET /teste`: endpoint de verificação que responde `{"Nice": "Job"}`.
- Modelo de usuário com `name`, `email` (único, minúsculo), `password` (`select: false`) e `createdAt`.
- Parsing de JSON e `urlencoded` via `body-parser`.
- Reload automático em desenvolvimento com **nodemon**.

## Stack

- **Node.js 18** (CommonJS)
- **Express 4**
- **Mongoose 7** (MongoDB)
- **Nodemon 2** (desenvolvimento)

## Como rodar

Requer configuração de ambiente: a conexão com o MongoDB está fixada no código em `src/database/index.js`.

```bash
# 1. Instalar dependências
npm install

# 2. Ajustar a string de conexão do MongoDB em src/database/index.js

# 3. Subir o serviço (nodemon + src/start.js, porta 3000)
npm start
```

Scripts disponíveis no `package.json`: `start`.

Observação: a conexão usa a opção `useMongoClient`, removida nas versões recentes do Mongoose — com a versão declarada (`^7.0.5`) a chamada de conexão precisa ser revista antes de subir o serviço.

## Estrutura do projeto

```
Marcacao_Horario_Back-End/
├── src/
│   ├── start.js                  # bootstrap do Express (porta 3000)
│   ├── database/index.js         # conexão Mongoose
│   ├── models/User.js            # schema de usuário
│   ├── controller/
│   │   ├── authController.js     # POST /auth/register
│   │   └── indexController.js    # GET /teste
│   └── verify/Verify.js
└── package.json
```

## Licença

Distribuído sob a licença MIT. Consulte o arquivo [LICENSE](./LICENSE).
