# Marcação de Horário — Back-end

![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-blue)
![Status](https://img.shields.io/badge/status-prot%C3%B3tipo-orange)

Serviço Node/Express para cadastro de usuários em MongoDB. Ele faz parte do par de repositórios com [Marcacao_Horario](https://github.com/FrancosCorporation/Marcacao_Horario).

## Organização

- **Marcacao_Horario** é a camada de entrada/cadastro.
- **Marcacao_Horario_Back-End** (este repositório) mantém o serviço, o modelo de usuário e a verificação `GET /teste`.
- Este repositório é a fonte canônica de `src/models/User.js` e `src/database/index.js`; as cópias no repositório de entrada devem permanecer iguais.

O serviço oferece cadastro, mas ainda não tem login nem autenticação de usuários.

## API

### `POST /auth/register`

Recebe JSON com `name`, `email` e `password`. Campos adicionais são ignorados. O nome e o e-mail são normalizados; o e-mail deve ter formato válido e a senha precisa ter ao menos 8 caracteres. Senhas que excedem 72 bytes em UTF-8 são rejeitadas para evitar truncamento pelo bcrypt.

~~~json
{
  "name": "Ana Silva",
  "email": "ana@example.com",
  "password": "uma-senha-com-8-ou-mais"
}
~~~

- `201`: usuário cadastrado.
- `400`: dados inválidos ou cadastro não concluído.
- `429`: mais de 5 tentativas do mesmo IP em 15 minutos.
- `503`: serviço de cadastro indisponível.

A senha é armazenada com bcrypt e nunca é enviada na resposta. O corpo das requisições JSON e URL-encoded tem limite de 10 KB.

### `GET /teste`

Retorna `{"Nice":"Job"}` para indicar que o serviço está respondendo.

## Configuração e execução

Requer Node.js 22 ou superior e um MongoDB acessível. O serviço usa `MONGO_URI`; sem essa variável, tenta `mongodb://localhost:27017/marcacao`. A porta padrão é 3000.

~~~bash
npm ci

export MONGO_URI='mongodb://localhost:27017/marcacao'
export PORT=3000

# Produção
npm start

# Desenvolvimento com recarga automática
npm run dev
~~~

Em hospedagens atrás de proxy, a aplicação precisa receber o IP real do cliente para aplicar corretamente o limite por IP. Configure `trust proxy` somente de acordo com a topologia e os proxies confiáveis do ambiente.

Ainda não há suíte de testes automatizados.

## Estrutura

~~~
src/
├── start.js
├── database/index.js
├── models/User.js
└── controller/
    ├── authController.js
    └── indexController.js
~~~

## Licença

Distribuído sob a licença MIT. Consulte o arquivo [LICENSE](./LICENSE).
