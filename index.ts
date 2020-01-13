'use strict'

import app from './api'
const APP_PORT = 8000

app.listen(APP_PORT, function() {
  console.log('Plaid API running on port' + APP_PORT)
})
