const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
require('./controller/authController')(app)
require('./controller/indexController')(app)

app.listen(port,() => {
  console.log("Listeing in http://192.168.1.106:"+port)
})