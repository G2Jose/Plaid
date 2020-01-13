### How to use

- Install dependencies `yarn`
- Sign up for a [Plaid development account](https://dashboard.plaid.com/signup)
- Create a `.env.ts` file in this folder with the following contents (replace placeholders with actual account secrets):

  ```javascript
  export const PLAID_CLIENT_ID = 'xxx'
  export const PLAID_SECRET = 'xxx'
  export const PLAID_PUBLIC_KEY = 'xxx'
  ```

- Start server `yarn start`
- Navigate to [http://localhost:8000](http://localhost:8000)
- Link a card
- Add the access-token received during linking to `.env.ts`

  ```javascript
  export const ACCESS_TOKEN = 'xxx'
  ```

- Restart server
- You can now make requests via postman to `localhost:8000`
