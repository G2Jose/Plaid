import { Request, Response } from 'express'
import plaid from 'plaid'
import { client, getAccessToken } from '../plaidClient'
import { prettyPrintResponse } from '../utils'

export const getIdentityHandler = (_: Request, response: Response) => {
  client
    .getIdentity(getAccessToken())
    .then((identityResponse: plaid.IdentityResponse) => {
      prettyPrintResponse(identityResponse)
      response.json({ error: null, identity: identityResponse })
    })
    .catch((error: any) => {
      prettyPrintResponse(error)
      return response.json({
        error: error,
      })
    })
}
