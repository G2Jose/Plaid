import { client, getAccessToken } from '../plaidClient'
import { prettyPrintResponse } from '../utils'
import { Request, Response } from 'express'
import plaid from 'plaid'

export const assetsHandler = async (request: Request, response: Response) => {
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
  try {
    const assetReportCreateResponse = await client.createAssetReport(
      [getAccessToken()],
      daysRequested,
      options
    )

    prettyPrintResponse(assetReportCreateResponse)

    const assetReportToken = assetReportCreateResponse.asset_report_token
    respondWithAssetReport(20, assetReportToken, client, response)
  } catch (error) {
    prettyPrintResponse(error)
    return response.json({
      error: error,
    })
  }
}

const respondWithAssetReport = async (
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
  let assetReportGetResponse: undefined | plaid.AssetReportGetResponse
  try {
    assetReportGetResponse = await client.getAssetReport(
      assetReportToken,
      includeInsights
    )
  } catch (error) {
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

  let assetReportGetPdfResponse
  try {
    assetReportGetPdfResponse = await client.getAssetReportPdf(assetReportToken)
    return response.json({
      error: null,
      json: assetReportGetResponse.report,
      pdf: assetReportGetPdfResponse.buffer.toString('base64'),
    })
  } catch (error) {
    return response.json({
      error: error,
    })
  }
}
