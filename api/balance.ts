import { client, getAccessToken } from '../plaidClient'
import { prettyPrintResponse } from '../utils'
import { Request, Response } from 'express'

export const balanceHandler = (request: Request, response: Response) => {
  client.getBalance(getAccessToken(), function(error, balanceResponse) {
    if (error != null) {
      prettyPrintResponse(error)
      return response.json({
        error: error,
      })
    }
    prettyPrintResponse(balanceResponse)
    response.json({ error: null, balance: balanceResponse })
  })
}
