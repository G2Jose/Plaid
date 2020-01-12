import { Request, Response } from "express";
import plaid from "plaid";
import {
  client,
  setAccessToken,
  setItemId,
  getAccessToken
} from "../plaidClient";
import { prettyPrintResponse } from "../utils";

export const getTokenHandler = (request: Request, response: Response) => {
  const PUBLIC_TOKEN = request.body.public_token;

  return client
    .exchangePublicToken(PUBLIC_TOKEN)
    .then((tokenResponse: plaid.TokenResponse) => {
      const accessToken = tokenResponse.access_token;
      setAccessToken(accessToken);

      const itemId = tokenResponse.item_id;
      setItemId(itemId);

      prettyPrintResponse(tokenResponse);

      return response.json({
        access_token: accessToken,
        item_id: itemId,
        error: null
      });
    })
    .catch((error: any) => {
      prettyPrintResponse(error);
      return response.json({
        error: error
      });
    });
};

export const setTokenHandler = (request: Request, response: Response) => {
  const accessToken = request.body.access_token;
  client.getItem(getAccessToken()).then((itemResponse: plaid.ItemResponse) => {
    response.json({
      item_id: itemResponse.item.item_id,
      error: false
    });
  });
};
