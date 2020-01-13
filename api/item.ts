import { client, getAccessToken } from '../plaidClient'
import { prettyPrintResponse } from '../utils'
import { Request, Response } from 'express'
import { GetInstitutionByIdResponse, Institution } from 'plaid'

export function itemHandler(request: Request, response: Response) {
  client.getItem(getAccessToken(), function(error, itemResponse) {
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
}
