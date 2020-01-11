'use strict'

import util from 'util'

import envvar from 'envvar'
import express from 'express'
import bodyParser from 'body-parser'
import moment from 'moment'
import plaid from 'plaid'

import { PLAID_ENV, PLAID_PRODUCTS, PLAID_COUNTRY_CODES } from './constants'
import { PLAID_CLIENT_ID, PLAID_SECRET, PLAID_PUBLIC_KEY } from './.env'

const APP_PORT = 8000

let ACCESS_TOKEN: string
let PUBLIC_TOKEN: string
let ITEM_ID: string

const client = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  plaid.environments[PLAID_ENV],
  { version: '2019-05-29', clientApp: 'Plaid Quickstart' }
)

const app = express()
app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
)
app.use(bodyParser.json())

app.get('/', function(request, response, next) {
  const params = {
    PLAID_PUBLIC_KEY: PLAID_PUBLIC_KEY,
    PLAID_ENV: PLAID_ENV,
    PLAID_PRODUCTS: PLAID_PRODUCTS,
    PLAID_COUNTRY_CODES: PLAID_COUNTRY_CODES,
  }
  console.log('params', params)
  response.render('index.ejs', params)
})

app.post('/get_access_token', function(request, response, next) {
  PUBLIC_TOKEN = request.body.public_token

  return client
    .exchangePublicToken(PUBLIC_TOKEN)
    .then((tokenResponse: plaid.TokenResponse) => {
      ACCESS_TOKEN = tokenResponse.access_token
      ITEM_ID = tokenResponse.item_id
      prettyPrintResponse(tokenResponse)
      return response.json({
        access_token: ACCESS_TOKEN,
        item_id: ITEM_ID,
        error: null,
      })
    })
    .catch((error: any) => {
      prettyPrintResponse(error)
      return response.json({
        error: error,
      })
    })
})

app.get('/transactions', function(request, response, next) {
  const startDate = moment()
    .subtract(30, 'days')
    .format('YYYY-MM-DD')
  const endDate = moment().format('YYYY-MM-DD')

  client
    .getTransactions(ACCESS_TOKEN, startDate, endDate, {
      count: 250,
      offset: 0,
    })
    .then((transactionsResponse: plaid.TransactionsResponse) => {
      prettyPrintResponse(transactionsResponse)
      return response.json({ error: null, transactions: transactionsResponse })
    })
    .catch((error: any) => {
      prettyPrintResponse(error)
      return response.json({
        error: error,
      })
    })
})

app.get('/identity', function(request, response, next) {
  client.getIdentity(ACCESS_TOKEN, function(error, identityResponse) {
    if (error != null) {
      prettyPrintResponse(error)
      return response.json({
        error: error,
      })
    }
    prettyPrintResponse(identityResponse)
    response.json({ error: null, identity: identityResponse })
  })
})

app.get('/balance', function(request, response, next) {
  client.getBalance(ACCESS_TOKEN, function(error, balanceResponse) {
    if (error != null) {
      prettyPrintResponse(error)
      return response.json({
        error: error,
      })
    }
    prettyPrintResponse(balanceResponse)
    response.json({ error: null, balance: balanceResponse })
  })
})

app.get('/accounts', function(request, response, next) {
  client.getAccounts(ACCESS_TOKEN, function(error, accountsResponse) {
    if (error != null) {
      prettyPrintResponse(error)
      return response.json({
        error: error,
      })
    }
    prettyPrintResponse(accountsResponse)
    response.json({ error: null, accounts: accountsResponse })
  })
})

app.get('/auth', function(request, response, next) {
  client.getAuth(ACCESS_TOKEN, function(error, authResponse) {
    if (error != null) {
      prettyPrintResponse(error)
      return response.json({
        error: error,
      })
    }
    prettyPrintResponse(authResponse)
    response.json({ error: null, auth: authResponse })
  })
})

app.get('/holdings', function(request, response, next) {
  client.getHoldings(ACCESS_TOKEN, function(error, holdingsResponse) {
    if (error != null) {
      prettyPrintResponse(error)
      return response.json({
        error: error,
      })
    }
    prettyPrintResponse(holdingsResponse)
    response.json({ error: null, holdings: holdingsResponse })
  })
})

app.get('/investment_transactions', function(request, response, next) {
  const startDate = moment()
    .subtract(30, 'days')
    .format('YYYY-MM-DD')
  const endDate = moment().format('YYYY-MM-DD')
  client.getInvestmentTransactions(ACCESS_TOKEN, startDate, endDate, function(
    error,
    investmentTransactionsResponse
  ) {
    if (error != null) {
      prettyPrintResponse(error)
      return response.json({
        error: error,
      })
    }
    prettyPrintResponse(investmentTransactionsResponse)
    response.json({
      error: null,
      investment_transactions: investmentTransactionsResponse,
    })
  })
})

app.get('/assets', function(request, response, next) {
  const daysRequested = 10

  const options = {
    client_report_id: 'Custom Report ID #123',
    user: {
      client_user_id: 'Custom User ID #456',
      first_name: 'Alice',
      middle_name: 'Bobcat',
      last_name: 'Cranberry',
      ssn: '123-45-6789',
      phone_number: '555-123-4567',
      email: 'alice@example.com',
    },
  }
  client.createAssetReport([ACCESS_TOKEN], daysRequested, options, function(
    error,
    assetReportCreateResponse
  ) {
    if (error != null) {
      prettyPrintResponse(error)
      return response.json({
        error: error,
      })
    }
    prettyPrintResponse(assetReportCreateResponse)

    const assetReportToken = assetReportCreateResponse.asset_report_token
    respondWithAssetReport(20, assetReportToken, client, response)
  })
})

app.get('/item', function(request, response, next) {
  client.getItem(ACCESS_TOKEN, function(error, itemResponse) {
    if (error != null) {
      prettyPrintResponse(error)
      return response.json({
        error: error,
      })
    }
    client.getInstitutionById(itemResponse.item.institution_id, function(
      err,
      instRes
    ) {
      if (err != null) {
        const msg = 'Unable to pull institution information from the Plaid API.'
        console.log(msg + '\n' + JSON.stringify(error))
        return response.json({
          error: msg,
        })
      } else {
        prettyPrintResponse(itemResponse)
        response.json({
          item: itemResponse.item,
          institution: instRes.institution,
        })
      }
    })
  })
})

const server = app.listen(APP_PORT, function() {
  console.log('plaid-quickstart server listening on port ' + APP_PORT)
})

const prettyPrintResponse = response => {
  console.log(util.inspect(response, { colors: true, depth: 4 }))
}

const respondWithAssetReport = (
  numRetriesRemaining,
  assetReportToken,
  client,
  response
) => {
  if (numRetriesRemaining == 0) {
    return response.json({
      error: 'Timed out when polling for Asset Report',
    })
  }

  const includeInsights = false
  client.getAssetReport(assetReportToken, includeInsights, function(
    error,
    assetReportGetResponse
  ) {
    if (error != null) {
      prettyPrintResponse(error)
      if (error.error_code == 'PRODUCT_NOT_READY') {
        setTimeout(
          () =>
            respondWithAssetReport(
              --numRetriesRemaining,
              assetReportToken,
              client,
              response
            ),
          1000
        )
        return
      }

      return response.json({
        error: error,
      })
    }

    client.getAssetReportPdf(assetReportToken, function(
      error,
      assetReportGetPdfResponse
    ) {
      if (error != null) {
        return response.json({
          error: error,
        })
      }

      response.json({
        error: null,
        json: assetReportGetResponse.report,
        pdf: assetReportGetPdfResponse.buffer.toString('base64'),
      })
    })
  })
}

app.post('/set_access_token', function(request, response, next) {
  ACCESS_TOKEN = request.body.access_token
  client.getItem(ACCESS_TOKEN, function(error, itemResponse) {
    response.json({
      item_id: itemResponse.item.item_id,
      error: false,
    })
  })
})
