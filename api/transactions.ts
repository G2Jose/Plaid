import moment from 'moment'
import plaid from 'plaid'
import { Request, Response } from 'express'
import { prettyPrintResponse } from '../utils'
import { client, getAccessToken } from '../plaidClient'
const getAllTransactions = async () => {
  const startDate = moment()
    .subtract(5, 'years')
    .format('YYYY-MM-DD')
  const endDate = moment().format('YYYY-MM-DD')

  let offset = 0
  const BATCH_SIZE = 250
  let transactions: plaid.Transaction[] = []
  let totalTransactions: number | undefined = undefined

  do {
    prettyPrintResponse({ before: { offset, totalTransactions } })
    const response = await client.getTransactions(
      getAccessToken(),
      startDate,
      endDate,
      {
        count: BATCH_SIZE,
        offset,
      }
    )

    transactions = [...transactions, ...response.transactions]
    offset = offset + response.transactions.length
    if (!totalTransactions) totalTransactions = response.total_transactions
    prettyPrintResponse({ after: { offset, totalTransactions } })
  } while (!totalTransactions || offset < totalTransactions)

  return transactions
}

export const transactionsHandler = async (
  request: Request,
  response: Response
) => {
  const transactions = await getAllTransactions()
  return response.json({ transactions })
}
