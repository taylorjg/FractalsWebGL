/* eslint-env node */

const express = require('express')
const path = require('path')

const port = process.env.PORT || 3332
const publicFolder = path.join(__dirname, 'public')

const app = express()
app.use('/', express.static(publicFolder))

app.listen(port, () => console.log(`Listening on port ${port}`))
