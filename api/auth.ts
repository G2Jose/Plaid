import { Request, Response } from 'express'
import { client, getAccessToken } from '../plaidClient'
import { prettyPrintResponse } from '../utils'

export function authHandler(request: Request, response: Response) {
  client.getAuth(getAccessToken(), function(error, authResponse) {
    if (error != null) {
      prettyPrintResponse(error)
      return response.json({
        error: error,
      })
    }
    prettyPrintResponse(authResponse)
    response.json({ error: null, auth: authResponse })
  })
}
