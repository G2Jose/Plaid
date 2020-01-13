import { Response, Request } from 'express'
import { PLAID_ENV, PLAID_PRODUCTS, PLAID_COUNTRY_CODES } from '../constants'
import { PLAID_PUBLIC_KEY } from '../.env'

export const rootHandler = (_: Request, response: Response) => {
  const params = {
    PLAID_PUBLIC_KEY: PLAID_PUBLIC_KEY,
    PLAID_ENV: PLAID_ENV,
    PLAID_PRODUCTS: PLAID_PRODUCTS,
    PLAID_COUNTRY_CODES: PLAID_COUNTRY_CODES,
  }
  response.render('index.ejs', params)
}
