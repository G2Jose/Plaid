import { Request, Response } from 'express'
import { client, getAccessToken } from '../plaidClient'
import { prettyPrintResponse } from '../utils'

export const getIdentityHandler = async (_: Request, response: Response) => {
  try {
    const identityResponse = await client.getIdentity(getAccessToken())
    prettyPrintResponse(identityResponse)
    return response.json({ error: null, identity: identityResponse })
  } catch (error) {
    prettyPrintResponse(error)
    return response.json({
      error: error,
    })
  }
}
