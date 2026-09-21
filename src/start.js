const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
require('./controller/authController')(app)
require('./controller/indexController')(app)

const server = app.listen(port, () => {
  console.log("Listening on http://localhost:" + port)
})
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Porta ${port} ja esta em uso. Defina PORT=<outra porta> e tente novamente.`)
    process.exit(1)
  }
  throw err
})