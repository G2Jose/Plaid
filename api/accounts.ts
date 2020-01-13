import { client, getAccessToken } from '../plaidClient'
import { Request, Response } from 'express'
import { prettyPrintResponse } from '../utils'

export const accountsHandler = async (request: Request, response: Response) => {
  try {
    const accountsResponse = await client.getAccounts(getAccessToken())

    prettyPrintResponse(accountsResponse)
    response.json({ error: null, accounts: accountsResponse })
  } catch (error) {
    prettyPrintResponse(error)
    return response.json({
      error: error,
    })
  }
}
