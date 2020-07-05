/* eslint-env node */

const express = require('express')
const path = require('path')

const PORT = process.env.PORT || 3332
const PUBLIC_FOLDER = path.join(__dirname, 'public')

const app = express()
app.use(express.static(PUBLIC_FOLDER))

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))
