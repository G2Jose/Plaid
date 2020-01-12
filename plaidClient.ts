import plaid, { Iso8601DateString, TransactionsRequestOptions } from "plaid";
import {
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  ACCESS_TOKEN
} from "./.env";
import { PLAID_ENV } from "./constants";

let accessToken: string = ACCESS_TOKEN;
let itemId: string;

export const client = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  plaid.environments[PLAID_ENV],
  { version: "2019-05-29", clientApp: "App" }
);

export const setAccessToken = (token: string) => {
  accessToken = token;
};
export const getAccessToken = () => accessToken;
export const setItemId = (id: string) => {
  itemId = id;
};
export const getItemId = () => itemId;
