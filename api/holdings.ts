import { client, getAccessToken } from '../plaidClient'
import { prettyPrintResponse } from '../utils'
import { Request, Response } from 'express'

export function holdingsHandler(request: Request, response: Response) {
  client.getHoldings(getAccessToken(), function(error, holdingsResponse) {
    if (error != null) {
      prettyPrintResponse(error)
      return response.json({
        error: error,
      })
    }
    prettyPrintResponse(holdingsResponse)
    response.json({ error: null, holdings: holdingsResponse })
  })
}
