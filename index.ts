"use strict";

import moment from "moment";
import plaid from "plaid";

import { PLAID_ENV, PLAID_PRODUCTS, PLAID_COUNTRY_CODES } from "./constants";
import {
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  ACCESS_TOKEN as TOKEN
} from "./.env";
import { getTokenHandler, setTokenHandler } from "./api/token";
import { transactionsHandler } from "./api/transactions";
import { rootHandler } from "./api/root";
import app from "./api";
import { prettyPrintResponse } from "./utils";
import { getIdentityHandler } from "./api/identity";

const APP_PORT = 8000;

let ACCESS_TOKEN: string = TOKEN;

const client = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  plaid.environments[PLAID_ENV],
  { version: "2019-05-29", clientApp: "App" }
);

app.get("/", rootHandler);
app.post("/get_access_token", getTokenHandler);
app.get("/identity", getIdentityHandler);

app.get("/balance", function(request, response, next) {
  client.getBalance(ACCESS_TOKEN, function(error, balanceResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error
      });
    }
    prettyPrintResponse(balanceResponse);
    response.json({ error: null, balance: balanceResponse });
  });
});

app.get("/accounts", function(request, response, next) {
  client.getAccounts(ACCESS_TOKEN, function(error, accountsResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error
      });
    }
    prettyPrintResponse(accountsResponse);
    response.json({ error: null, accounts: accountsResponse });
  });
});

app.get("/auth", function(request, response, next) {
  client.getAuth(ACCESS_TOKEN, function(error, authResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error
      });
    }
    prettyPrintResponse(authResponse);
    response.json({ error: null, auth: authResponse });
  });
});

app.get("/holdings", function(request, response, next) {
  client.getHoldings(ACCESS_TOKEN, function(error, holdingsResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error
      });
    }
    prettyPrintResponse(holdingsResponse);
    response.json({ error: null, holdings: holdingsResponse });
  });
});

app.get("/investment_transactions", function(request, response, next) {
  const startDate = moment()
    .subtract(30, "days")
    .format("YYYY-MM-DD");
  const endDate = moment().format("YYYY-MM-DD");
  client.getInvestmentTransactions(ACCESS_TOKEN, startDate, endDate, function(
    error,
    investmentTransactionsResponse
  ) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error
      });
    }
    prettyPrintResponse(investmentTransactionsResponse);
    response.json({
      error: null,
      investment_transactions: investmentTransactionsResponse
    });
  });
});

app.get("/assets", function(request, response, next) {
  const daysRequested = 10;

  const options = {
    client_report_id: "Custom Report ID #123",
    user: {
      client_user_id: "Custom User ID #456",
      first_name: "Alice",
      middle_name: "Bobcat",
      last_name: "Cranberry",
      ssn: "123-45-6789",
      phone_number: "555-123-4567",
      email: "alice@example.com"
    }
  };
  client.createAssetReport([ACCESS_TOKEN], daysRequested, options, function(
    error,
    assetReportCreateResponse
  ) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error
      });
    }
    prettyPrintResponse(assetReportCreateResponse);

    const assetReportToken = assetReportCreateResponse.asset_report_token;
    respondWithAssetReport(20, assetReportToken, client, response);
  });
});

app.get("/item", function(request, response, next) {
  client.getItem(ACCESS_TOKEN, function(error, itemResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error
      });
    }
    client.getInstitutionById(itemResponse.item.institution_id, function(
      err,
      instRes
    ) {
      if (err != null) {
        const msg =
          "Unable to pull institution information from the Plaid API.";
        console.log(msg + "\n" + JSON.stringify(error));
        return response.json({
          error: msg
        });
      } else {
        prettyPrintResponse(itemResponse);
        response.json({
          item: itemResponse.item,
          institution: instRes.institution
        });
      }
    });
  });
});

require("./api/transactions");

const server = app.listen(APP_PORT, function() {
  console.log("plaid-quickstart server listening on port " + APP_PORT);
});

const respondWithAssetReport = (
  numRetriesRemaining,
  assetReportToken,
  client,
  response
) => {
  if (numRetriesRemaining == 0) {
    return response.json({
      error: "Timed out when polling for Asset Report"
    });
  }

  const includeInsights = false;
  client.getAssetReport(assetReportToken, includeInsights, function(
    error,
    assetReportGetResponse
  ) {
    if (error != null) {
      prettyPrintResponse(error);
      if (error.error_code == "PRODUCT_NOT_READY") {
        setTimeout(
          () =>
            respondWithAssetReport(
              --numRetriesRemaining,
              assetReportToken,
              client,
              response
            ),
          1000
        );
        return;
      }

      return response.json({
        error: error
      });
    }

    client.getAssetReportPdf(assetReportToken, function(
      error,
      assetReportGetPdfResponse
    ) {
      if (error != null) {
        return response.json({
          error: error
        });
      }

      response.json({
        error: null,
        json: assetReportGetResponse.report,
        pdf: assetReportGetPdfResponse.buffer.toString("base64")
      });
    });
  });
};

app.post("/set_access_token", setTokenHandler);
