
  # Sports Betting Dashboard

  This is a code bundle for Sports Betting Dashboard. The original project is available at https://www.figma.com/design/7dIRXU1t9Yv2ynTLkysgDv/Sports-Betting-Dashboard.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Backend (TypeScript)

  1. Create a `.env` file in the project root (copy from `.env.example`).
  2. Set `SPORTSGAMEODDS_API_KEY` in `.env`.
  3. Run `npm run backend:dev` to start the backend on `http://localhost:4000`.

  ### Backend API

  - `GET /health`
  - `GET /api/events`

  `GET /api/events` supports these query params:
  - `oddsAvailable` (`true` or `false`)
  - `leagueID` (comma-separated, e.g. `NBA,NFL`)
  - `oddID` (comma-separated odd IDs)
  - `includeAltLines` (`true` or `false`)
  - `cursor` (pagination cursor)
  - `limit` (number)
  
