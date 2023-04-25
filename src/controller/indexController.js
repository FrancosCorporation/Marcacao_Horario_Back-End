const express = require('express')
const router = express.Router()

router.get('/teste', async (req, res) => {
    return res.status(200).send({ "Nice": "Job" })
})
module.exports = app => app.use(router)