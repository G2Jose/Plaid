import express from 'express'
import bodyParser from 'body-parser'
import { rootHandler } from './root'
import { getTokenHandler, setTokenHandler } from './token'
import { getIdentityHandler } from './identity'
import { transactionsHandler } from './transactions'
import { balanceHandler } from './balance'
import { accountsHandler } from './accounts'
import { authHandler } from './auth'
import { holdingsHandler } from './holdings'
import { investmentTransactionsHandler } from './investmentTransactions'
import { assetsHandler } from './assets'
import { itemHandler } from './item'

const app = express()
app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
)
app.use(bodyParser.json())

app.get('/', rootHandler)
app.get('/accounts', accountsHandler)
app.get('/assets', assetsHandler)
app.get('/auth', authHandler)
app.get('/balance', balanceHandler)
app.get('/holdings', holdingsHandler)
app.get('/identity', getIdentityHandler)
app.get('/investment_transactions', investmentTransactionsHandler)
app.get('/item', itemHandler)
app.get('/transactions', transactionsHandler)
app.post('/get_access_token', getTokenHandler)
app.post('/set_access_token', setTokenHandler)

export default app
