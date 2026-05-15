# HS-Finance

Brief finance management web app built with Next.js and TypeScript. The app stores transaction/register/account data in a MySQL database and provides authenticated access via Google (NextAuth). It includes UI components for entries, funds, registers, transactions and provides export-to-PDF functionality.

## Quick Overview
- Purpose: Track income/expenses, assign funds and classes, and produce basic reports for a small organization or school.
- Tech: Next.js (app router), React, TypeScript, Tailwind (dev deps), MySQL (via `mysql2`), NextAuth (Google provider).

## What it does / How it works
- The UI (app/) renders pages and components for entries, transactions, registers and settings.
- API routes in `app/api/*` provide CRUD operations and talk to MySQL via a connection pool in `app/lib/db.ts`.
- Authentication uses `next-auth` with the Google provider; sessions are JWT-based.
- Export uses `html2canvas` and `jspdf` for PDF generation.

## Platform & External Services
- OS: Windows / macOS / Linux (development tested on Windows).
- Node.js: 18.x or later (LTS recommended).
- npm or yarn: latest stable.
- MySQL server: 8.0+ (or compatible MariaDB); used for persistent storage.
- Google Cloud project for OAuth credentials (Google OAuth Client ID & Secret).

## Required Environment Variables
Create a `.env.local` file in the `hs-finance` app folder with these variables:

```env
DB_HOST=127.0.0.1
DB_USER=your_db_user
DB_PASS=your_db_password
DB=hs_finance_db

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=some_long_random_string
```

## Installation (Sequential)
1. Install Node.js 18 LTS: https://nodejs.org/
2. Install MySQL (8.0+): https://dev.mysql.com/doc/
3. Clone this repository and open the project root:

```bash
git clone <repo-url>
cd "HS-Finance/hs-finance"
```

4. Install dependencies:

```bash
npm install
# or
# yarn install
```

5. Configure `.env.local` in `hs-finance/` using the variables above.

6. Create the database and tables (example SQL provided below).

7. Run the development server:

```bash
npm run dev
```

7. Open `http://localhost:3000` and sign in with the same Google account used in `User.Email` seed data.

## MySQL Schema
Use the following SQL as a starting point. Adjust types/constraints to match your needs.

Link to visual: https://docs.google.com/presentation/d/1fpfCEP-81SDjiyyyBNFE3G_4oHw4Mn3nen0ppOyg1x4/edit?usp=sharing


-- Add foreign keys if desired, e.g.:
-- ALTER TABLE entries ADD FOREIGN KEY (AccountID) REFERENCES accounts(ID);
-- ALTER TABLE funds ADD FOREIGN KEY (EntryID) REFERENCES entries(ID);
```

Notes: The app's TypeScript models are in `app/types/*.ts` and define the shape used by the UI and API.

## Data Schema (Detailed)
The current code expects these tables/columns.

- `School`
  - `ID` (PK, int)
  - `SchoolName` (varchar)

- `User`
  - `ID` (PK, int)
  - `Email` (varchar, unique)
  - `SchoolID` (FK -> `School.ID`)
  - `AccountType` (varchar; used values include `Dev`)
  - `Role` (varchar; used values include `HeadTreasurer`)

- `Register`
  - `ID` (PK, int)
  - `RegisterName` (varchar)
  - `SchoolID` (FK -> `School.ID`)

- `Account`
  - `ID` (PK, int)
  - `AccountName` (varchar)

- `Class`
  - `ID` (PK, int)
  - `ClassName` (varchar)

- `Transaction`
  - `ID` (PK, int)
  - `TransactionName` (varchar)
  - `MoneyIn` (boolean/tinyint)

- `Entry`
  - `ID` (PK, int)
  - `TransactionID` (FK -> `Transaction.ID`)
  - `Location` (varchar)
  - `AccountID` (FK -> `Account.ID`)
  - `Memo` (text)
  - `Date` (date)
  - `RegisterID` (FK -> `Register.ID`)
  - `Void` (boolean/tinyint)
  - `Rec` (boolean/tinyint)
  - `EntryType` (varchar)
  - `ClassID` (nullable FK -> `Class.ID`)

- `Fund`
  - `ID` (PK, int)
  - `EntryID` (FK -> `Entry.ID`)
  - `Target` (varchar)
  - `Description` (text)
  - `PaymentMethod` (varchar)
  - `ReferenceNumber` (bigint)
  - `Amount` (decimal)

## Product Backlog (Remaining User Stories)
Reference the Trello Board

## Known Issues
- No automated migration/seed mechanism exists yet (manual SQL setup is required).
- App authorization depends on a matching `User` DB row for the signed-in email; otherwise APIs return `Access Denied`.
- `Fund` delete route currently deletes by `EntryID` using provided `ID`, which may remove unexpected rows.
- Input validation is partial; additional server-side constraints are recommended.

## Troubleshooting First Run
- `npm run dev` warning about multiple lockfiles:
  - This does not block local startup.
  - To remove the warning, keep one lockfile at the intended workspace root or configure `outputFileTracingRoot` in `next.config.ts`.
- `npm run lint` currently fails with `Cannot find module ... eslint-config-next/core-web-vitals`:
  - This does not block running the app in dev mode.
  - Fix by aligning `eslint` and `eslint-config-next` versions (or updating `eslint.config.mjs` to a compatible config).

## Reference Files
- `hs-finance/app/lib/db.ts`
- `hs-finance/app/api/entries/route.ts`
- `hs-finance/app/api/funds/route.ts`
- `hs-finance/app/api/chartAccounts/route.ts`
- `hs-finance/app/api/school/route.ts`