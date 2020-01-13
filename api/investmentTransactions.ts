import { client, getAccessToken } from '../plaidClient'
import { prettyPrintResponse } from '../utils'
import { Request, Response } from 'express'
import moment from 'moment'

export function investmentTransactionsHandler(
  request: Request,
  response: Response
) {
  const startDate = moment()
    .subtract(30, 'days')
    .format('YYYY-MM-DD')
  const endDate = moment().format('YYYY-MM-DD')
  return client
    .getInvestmentTransactions(getAccessToken(), startDate, endDate)
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
}
