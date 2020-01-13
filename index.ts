'use strict'

import moment from 'moment'
import plaid from 'plaid'

import { ACCESS_TOKEN as TOKEN } from './.env'
import { getTokenHandler, setTokenHandler } from './api/token'
import { transactionsHandler } from './api/transactions'
import { rootHandler } from './api/root'
import app from './api'
import { prettyPrintResponse } from './utils'
import { getIdentityHandler } from './api/identity'
import { client } from './plaidClient'
import { GetInstitutionByIdResponse, Institution } from 'plaid'
import { Response } from 'express'
const APP_PORT = 8000

let ACCESS_TOKEN: string = TOKEN

app.get('/', rootHandler)
app.post('/get_access_token', getTokenHandler)
app.post('/set_access_token', setTokenHandler)
app.get('/identity', getIdentityHandler)

app.get('/balance', function(request, response) {
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

app.get('/accounts', function(request, response) {
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

app.get('/auth', function(request, response) {
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

app.get('/holdings', function(request, response) {
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

app.get('/investment_transactions', function(request, response) {
  const startDate = moment()
    .subtract(30, 'days')
    .format('YYYY-MM-DD')
  const endDate = moment().format('YYYY-MM-DD')
  return client
    .getInvestmentTransactions(ACCESS_TOKEN, startDate, endDate)
    .then(investmentTransactionsResponse => {
      prettyPrintResponse(investmentTransactionsResponse)
      response.json({
        error: null,
        investment_transactions: investmentTransactionsResponse,
      })
    })
    .catch((error: any) => {
      if (error != null) {
        prettyPrintResponse(error)
        return response.json({
          error: error,
        })
      }
    })
})

app.get('/assets', function(request, response) {
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

app.get('/item', function(request, response) {
  client.getItem(ACCESS_TOKEN, function(error, itemResponse) {
    if (error != null) {
      prettyPrintResponse(error)
      return response.json({
        error: error,
      })
    }
    client.getInstitutionById(itemResponse.item.institution_id, function(
      err: any,
      instRes: GetInstitutionByIdResponse<Institution>
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

app.get('/transactions', transactionsHandler)

const respondWithAssetReport = (
  numRetriesRemaining: number,
  assetReportToken: string,
  client: plaid.Client,
  response: Response
) => {
  if (numRetriesRemaining == 0) {
    return response.json({
      error: 'Timed out when polling for Asset Report',
    })
  }

  const includeInsights = false
  client.getAssetReport(assetReportToken, includeInsights, function(
    error: any,
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

app.listen(APP_PORT, function() {
  console.log('Plaid API running on port' + APP_PORT)
})
