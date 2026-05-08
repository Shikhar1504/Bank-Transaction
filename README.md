# AegisLedger -- Core Banking API

Production-grade banking backend and React dashboard focused on safe money movement, correctness under concurrency, and operational observability.

Built with Node.js, Express, MongoDB, and React. Deployed at [aegisledger.vercel.app](https://aegisledger.vercel.app).

---

## Table of Contents

- [System Overview](#system-overview)
- [Architecture](#architecture)
- [Why This Is Not a CRUD App](#why-this-is-not-a-crud-app)
- [How to Think About This System](#how-to-think-about-this-system)
- [Core Backend Features](#core-backend-features)
- [Engineering Challenges Solved](#engineering-challenges-solved)
- [Security](#security)
- [API Reference](#api-reference)
- [Transaction Lifecycle](#transaction-lifecycle)
- [Frontend Dashboard](#frontend-dashboard)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Run Locally](#run-locally)
- [Future Improvements](#future-improvements)

---

## System Overview

When a transfer request arrives, the system executes the following pipeline:

```
1. Client submits POST /api/transactions with an idempotencyKey
2. Zod validates the payload at the controller layer
3. Service layer checks for an existing transaction with the same {idempotencyKey, fromAccount}
   - If COMPLETED: returns the existing result (idempotent replay)
   - If PROCESSING: rejects as duplicate-in-flight
   - If FAILED and retryCount < 3: re-enters PROCESSING for retry
   - If no match: creates a new transaction record in PROCESSING state
4. MongoDB session transaction begins (all-or-nothing):
   a. Atomic debit on sender: findOneAndUpdate with { balance: { $gte: amount } } guard
   b. Atomic credit on receiver
   c. Two immutable ledger entries created (DEBIT + CREDIT)
   d. Transaction status set to COMPLETED
   e. Session committed
5. Audit log persisted (success or failure)
6. Domain event emitted: transaction.completed or transaction.failed
7. Notification handler consumes the event asynchronously
```

On any failure within the session, the entire transaction is rolled back, the transaction record is marked FAILED with a `failureReason`, `retryCount` is incremented, and the failure is audit-logged.

---

## Architecture

```
                                 +------------------+
                                 |     Client       |
                                 | (React Dashboard)|
                                 +--------+---------+
                                          |
                                    POST /api/transactions
                                          |
                              +-----------v-----------+
                              |     Express API       |
                              |  Zod Validation       |
                              |  Rate Limiting        |
                              |  JWT Auth Middleware   |
                              +-----------+-----------+
                                          |
                              +-----------v-----------+
                              |    Service Layer      |
                              |  (transaction.service)|
                              +-----------+-----------+
                                          |
                     +--------------------+--------------------+
                     |                    |                    |
              +------v------+    +-------v-------+    +------v------+
              |   Accounts  |    | Transactions  |    |   Ledger    |
              |   (balance  |    | (state, retry |    | (immutable  |
              |   source of |    |  idempotency) |    |  DEBIT /    |
              |   truth)    |    |               |    |  CREDIT)    |
              +-------------+    +---------------+    +-------------+
                                          |
                     +--------------------+--------------------+
                     |                                         |
              +------v------+                          +-------v-------+
              |  Audit Log  |                          |   Event Bus   |
              | (success /  |                          | (EventEmitter)|
              |  failure)   |                          +-------+-------+
              +-------------+                                  |
                                                       +-------v-------+
                                                       | Notification  |
                                                       |   Handler     |
                                                       +---------------+
```

---

## Why This Is Not a CRUD App

Most project backends are simple read/write wrappers around a database. This system solves problems that only surface under real-world conditions:

| Concern | How It Is Handled |
|---|---|
| **Concurrent overdrafts** | Guarded atomic update: `findOneAndUpdate` with `{ balance: { $gte: amount } }` and `$inc` in a single write, inside a MongoDB session. Two parallel debits cannot both succeed if funds are insufficient. |
| **Duplicate charges on retry** | Unique compound index on `{ idempotencyKey, fromAccount }` in the transaction collection. Duplicate inserts throw a constraint violation at the database level, not in application code. |
| **Partial writes** | All critical mutations (debit, credit, ledger, status update) are wrapped in a MongoDB multi-document session transaction. Any failure aborts the entire batch. |
| **Uncontrolled retries** | Failed transactions track `retryCount` and `failureReason`. Retries are bounded at 3 attempts and are state-driven (only FAILED transactions can be retried). |
| **Mutable audit history** | Ledger entries are append-only. All fields are marked `immutable` in the Mongoose schema, and `pre` hooks block `update`, `delete`, `remove`, `findOneAndUpdate`, `findOneAndDelete`, `updateMany`, `deleteMany`, and `findOneAndReplace`. |
| **Tight coupling of side effects** | Transaction completion/failure emits domain events via a Node.js `EventEmitter`. Notification handling is a decoupled listener, not inline code. |

---

## How to Think About This System

Understanding the data model clarifies every design decision:

**Account** = Source of truth for spendable balance. `account.balance` is the real-time value used for transfer authorization. Modified only via guarded atomic `$inc` operations.

**Transaction** = Business event record. Captures transfer intent, lifecycle state (`INITIATED -> PROCESSING -> COMPLETED | FAILED`), retry metadata (`retryCount`, `failureReason`), and the `idempotencyKey` used for deduplication.

**Ledger** = Immutable audit trail. Every completed transfer produces exactly two entries: one DEBIT (sender) and one CREDIT (receiver), each recording the `balanceAfter` at the time of posting. The ledger is never the source of truth for balance -- it exists for reconciliation, forensics, and compliance.

**Audit Log** = Operational observability layer. Records every transfer outcome (success or failure) with user and transaction linkage, independent of the ledger.

---

## Core Backend Features

### Authentication and Authorization

- JWT issuance on register/login, delivered via HttpOnly cookie with secure flags in production
- Bearer token fallback for non-browser clients
- Token blacklisting on logout with a 3-day TTL auto-expiry index
- RBAC with two roles: `USER` and `ADMIN`
- System-user middleware for privileged funding endpoints (immutable `systemUser` flag on user model)
- Admin middleware guards all `/admin/*` routes

### Account Management

- One account per user, enforced by a unique index on `user`
- Account status state machine: `ACTIVE`, `FROZEN`, `CLOSED`
- Transfers are blocked for any non-ACTIVE account (enforced in the service layer query filter)
- Admin-only freeze and unfreeze with state validation (cannot freeze an already-frozen account, cannot freeze a closed account)
- Default currency: INR

### Money Movement

- Per-transaction amount cap of 10,000 (enforced in the service layer)
- Self-transfer prevention via a Mongoose `pre("validate")` hook
- Sender debit uses a guarded atomic update: balance check and decrement in a single `findOneAndUpdate`
- Receiver credit via atomic `$inc`
- System account funding flow with controlled overdraft behavior (no balance floor check on system account debit)

### Idempotency

Idempotency is enforced at the database level using the transaction collection itself:

- Each transaction is uniquely identified by `{ idempotencyKey, fromAccount }`
- A unique compound index prevents duplicate creation, even under concurrent requests
- Replay behavior by state:
  - `COMPLETED` -- return the existing transaction (safe replay)
  - `PROCESSING` -- reject with "already processing" (prevents double-execution)
  - `FAILED` with `retryCount < 3` -- re-enter PROCESSING for a bounded retry

No separate idempotency table or cache is needed. The transaction record itself is the deduplication mechanism.

### Retry Logic

Failed transactions support bounded, state-driven retries:

- Maximum 3 attempts, tracked via `retryCount`
- Retry is triggered only when the existing transaction status is `FAILED`
- Each retry reuses the same `idempotencyKey`, ensuring deduplication continuity
- `failureReason` is cleared on retry entry and set on subsequent failure
- No time-based polling or cron jobs -- retries are user-initiated via the same API endpoint

### Double-Entry Ledger

- Every completed transfer creates exactly two ledger entries: one DEBIT, one CREDIT
- Each entry records: `account`, `amount`, `type`, `transaction` (linkage), `balanceAfter`, `currency`
- All fields are `immutable` at the schema level
- Mongoose pre-hooks block all update and delete operations on ledger documents
- Composite indexes on `{ account, transaction }` and `{ account, createdAt }` for efficient queries

### Event-Driven Processing

- `transaction.completed` and `transaction.failed` events emitted from the service layer after session commit/abort
- Events are consumed by a notification handler registered at server startup
- Side effects are fully decoupled from core transfer execution

### Audit Logging

- Separate `auditLog` collection with `action`, `status`, `userId`, `transactionId`, and `details`
- Both success (`TRANSFER_SUCCESS`, `SYSTEM_TRANSFER_SUCCESS`) and failure (`TRANSFER_FAILED`, `SYSTEM_TRANSFER_FAILED`) paths are logged
- Independent of the ledger -- the audit log captures operational metadata, not accounting entries

### Pagination and Filtering

- Transaction history and admin listing endpoints support `page`, `limit`, and `hasNextPage`
- Limit is capped at 50 per request
- Admin transaction listing supports filtering by `status` and `accountId`
- Results are sorted by `createdAt` descending
- Populated account references for frontend-ready responses
- Internal fields (`__v`, `idempotencyKey`) excluded from admin responses

---

## Engineering Challenges Solved

### 1. Race-Condition Overdrafts

**Problem:** Two parallel transfers from the same account can both read a sufficient balance, then both debit, resulting in a negative balance.

**Solution:** The sender debit is a single `findOneAndUpdate` with a query filter `{ balance: { $gte: amount } }` and an update of `{ $inc: { balance: -amount } }`. This is atomic at the MongoDB document level. If the balance is insufficient at write time, the update returns `null` and the transfer is rejected. Combined with a MongoDB session, this prevents any interleaving that could produce an overdraft.

### 2. Multi-Document Consistency

**Problem:** A transfer involves four writes: sender balance, receiver balance, two ledger entries, and a transaction status update. A crash between any of these creates an inconsistent state.

**Solution:** All writes are wrapped in a MongoDB multi-document session transaction. On any failure, `session.abortTransaction()` rolls back every mutation atomically.

### 3. Duplicate Charges on Network Retry

**Problem:** A client retries a request after a timeout, but the original request already succeeded. Without protection, the transfer executes twice.

**Solution:** The unique compound index `{ idempotencyKey, fromAccount }` on the transaction collection makes duplicate creation impossible at the database level. The service layer checks the existing transaction state and returns the appropriate response.

### 4. Safe Recovery from Transient Failures

**Problem:** A transfer fails due to a transient issue (e.g., destination account temporarily frozen). The user should be able to retry without creating a new business operation.

**Solution:** The client retries with the same `idempotencyKey`. The service finds the existing FAILED transaction, verifies `retryCount < 3`, transitions it back to PROCESSING, and re-executes the transfer logic. This is the same code path as idempotent replay, differentiated by status.

### 5. Immutable Financial History

**Problem:** If ledger entries can be modified, post-hoc reconciliation and audit are unreliable.

**Solution:** Every field on the ledger schema is marked `immutable`. Mongoose pre-hooks on eight different operations (`findOneAndUpdate`, `updateOne`, `deleteOne`, `deleteMany`, `remove`, `updateMany`, `findOneAndDelete`, `findOneAndReplace`) throw an error if any code attempts to modify or delete a ledger entry.

---

## Security

| Layer | Implementation |
|---|---|
| **Authentication** | JWT with 3-day expiry, issued via HttpOnly cookie (`secure` and `sameSite` flags in production) with Bearer fallback |
| **Token Revocation** | Logout persists the token to a blacklist collection with a TTL index (auto-expires after 3 days) |
| **Input Validation** | All incoming payloads validated with Zod schemas before reaching business logic |
| **Password Storage** | bcrypt with 10 salt rounds, `select: false` on the password field |
| **Ownership Enforcement** | Account-scoped queries always include `user: req.user._id` in the filter |
| **Role-Based Access** | Admin middleware checks `req.user.role === ADMIN`; system-user middleware checks the immutable `systemUser` flag |
| **Rate Limiting** | Global limiter: 500 requests per 15 minutes per IP. Strict limiter on auth, transaction, and admin routes: 50 requests per 15 minutes |
| **Error Masking** | Production error responses return "Internal Server Error" instead of stack traces |

---

## API Reference

Base URL: `http://localhost:3000/api`

### Public

| Method | Route | Purpose |
|---|---|---|
| POST | `/auth/register` | Register user, issue JWT |
| POST | `/auth/login` | Authenticate user, issue JWT |

### Authenticated (User)

| Method | Route | Purpose |
|---|---|---|
| POST | `/auth/logout` | Blacklist token, clear cookie |
| POST | `/accounts` | Create account (one per user) |
| GET | `/accounts` | List user's accounts |
| GET | `/accounts/balance/:accountId` | Get balance for owned account |
| POST | `/transactions` | Create idempotent transfer with retry support |
| GET | `/transactions/:accountId?page=1&limit=10` | Paginated transaction history via ledger |

### System User

| Method | Route | Purpose |
|---|---|---|
| POST | `/transactions/system/initial-funds` | Fund account from system account |

### Admin

| Method | Route | Purpose |
|---|---|---|
| PATCH | `/admin/freeze/:accountId` | Freeze a user account |
| PATCH | `/admin/unfreeze/:accountId` | Unfreeze a frozen account |
| GET | `/admin/users` | Paginated user listing with account status |
| GET | `/admin/transactions` | Filterable, paginated transaction inspection |
| GET | `/admin/stats` | System metrics: users, transactions, volume, failures |

### Example: Create Transfer

```http
POST /api/transactions
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "fromAccount": "6806b52f0ec9f5f6a1234568",
  "toAccount": "6806b5480ec9f5f6a1234569",
  "amount": 1500,
  "idempotencyKey": "txn-20260415-001",
  "note": "Wallet top-up"
}
```

```json
{
  "success": true,
  "message": "Transaction processed",
  "transaction": {
    "status": "COMPLETED",
    "amount": 1500,
    "retryCount": 0,
    "failureReason": null
  }
}
```

### Example: Paginated History

```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "total": 25,
  "transactions": [
    {
      "type": "DEBIT",
      "amount": 1500,
      "direction": "OUT",
      "balanceAfter": 3500,
      "transaction": {
        "note": "Wallet top-up",
        "status": "COMPLETED"
      }
    }
  ]
}
```

---

## Transaction Lifecycle

```
   INITIATED
       |
       v
   PROCESSING ----------+
       |                 |
       v                 v
   COMPLETED          FAILED
                         |
                   retryCount < 3?
                    /          \
                  yes           no
                   |             |
                   v             v
              PROCESSING    Terminal failure
                   |         (retry limit
                   v          exceeded)
            COMPLETED / FAILED
```

- New transactions are created directly in `PROCESSING` state
- `INITIATED` exists in the schema but is used primarily as a UI display state
- Failed transactions track `retryCount` (incremented on each failure) and `failureReason`
- Retry re-enters `PROCESSING`, clears `failureReason`, and re-executes the full transfer pipeline

---

## Frontend Dashboard

The `frontend/` directory contains a React dashboard that mirrors backend transaction state and retry behavior.

### Stack

React 18 (Vite), Tailwind CSS, Axios, React Router 6, Zustand

### Key Design Decisions

**State-driven UI:** The frontend renders transaction status (`INITIATED`, `PROCESSING`, `COMPLETED`, `FAILED`) using color-coded badges with distinct visual treatments (spinner for PROCESSING, dot indicators for terminal states). Account status (`ACTIVE`, `FROZEN`) controls whether the transfer form is enabled or disabled.

**Idempotency-aware transfers:** The Transfer page generates a `crypto.randomUUID()` as the `idempotencyKey` for each new transaction intent. Changing the amount or recipient generates a new key. Retries reuse the same key, ensuring the backend correctly identifies them as retries rather than new transactions.

**Bounded retry handling:** The retry button appears only for FAILED transactions with `retryCount < 3`. After 3 attempts, the UI disables retry and instructs the user to modify their request. The frontend displays `retryCount`, `failureReason`, and the `idempotencyKey` for full diagnostic transparency.

**Automatic session management:** Axios interceptors attach Bearer tokens to requests and redirect to `/login` on 401 responses. Auth state is persisted in `localStorage` via Zustand.

### Pages

| Page | Purpose |
|---|---|
| Dashboard | Virtual card with live balance, account status, recent transactions with direction badges |
| Transfer | Idempotent transfer form with retry workflow, account status enforcement, transaction metadata display |
| Transactions | Full transaction history with status badges, direction indicators, retry metadata |
| Admin Users | Paginated user listing with account status, freeze/unfreeze controls |
| Admin Transactions | Filterable transaction inspection with details modal showing retry count, failure reason, and idempotency key |
| Admin Stats | System-level metrics: total users, transactions, failures, volume |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | -- |
| Framework | Express | 4.x |
| Database | MongoDB | -- |
| ODM | Mongoose | 9.x |
| Validation | Zod | 4.x |
| Auth | jsonwebtoken | 9.x |
| Password Hashing | bcrypt | 6.x |
| Rate Limiting | express-rate-limit | 8.x |
| Frontend | React | 18.x |
| Frontend Build | Vite | 5.x |
| Frontend Styling | Tailwind CSS | 3.x |
| State Management | Zustand | 4.x |
| HTTP Client | Axios | 1.x |

---

## Project Structure

```
.
├── backend/
│   ├── server.js                          # Entry point, process signal handlers
│   ├── package.json
│   └── src/
│       ├── app.js                         # Express app, CORS, rate limiting, routes, error handling
│       ├── config/
│       │   └── db.js                      # MongoDB connection with reconnect listeners
│       ├── controllers/
│       │   ├── auth.controller.js         # Register, login, logout with Zod validation
│       │   ├── account.controller.js      # Create, list, balance with ownership checks
│       │   ├── transaction.controller.js  # Transfer, system funding, history with pagination
│       │   └── admin.controller.js        # Freeze, unfreeze, users, transactions, stats
│       ├── services/
│       │   └── transaction.service.js     # Core transfer logic, idempotency, retry, sessions
│       ├── middleware/
│       │   ├── auth.middleware.js          # JWT verification, blacklist check, system-user guard
│       │   ├── admin.middleware.js         # ADMIN role enforcement
│       │   └── rateLimit.middleware.js     # Global (500/15min) and strict (50/15min) limiters
│       ├── models/
│       │   ├── user.model.js              # Email, name, password (bcrypt), role, systemUser
│       │   ├── account.model.js           # User (unique), status, currency, balance
│       │   ├── transaction.model.js       # Accounts, status, retryCount, idempotencyKey (compound unique)
│       │   ├── ledger.model.js            # Immutable DEBIT/CREDIT entries with balanceAfter
│       │   ├── auditLog.model.js          # Action, status, userId, transactionId, details
│       │   └── blacklist.model.js         # Token with 3-day TTL index
│       ├── events/
│       │   ├── eventBus.js                # Node.js EventEmitter singleton
│       │   └── notification.handler.js    # Listeners for transaction.completed / transaction.failed
│       └── utils/
│           └── constants.js               # TRANSACTION_STATUS, ACCOUNT_STATUS, ROLES, LEDGER_TYPE, AUDIT_STATUS
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js                     # Proxy /api to localhost:3000
    ├── tailwind.config.js
    └── src/
        ├── main.jsx                       # React entry with BrowserRouter
        ├── App.jsx                        # Route definitions, protected routes, admin guards
        ├── index.css                      # Global styles and dark theme
        ├── api/
        │   └── axios.js                   # Axios instance with auth interceptors
        ├── components/
        │   ├── Navbar.jsx                 # Navigation with admin section, user avatar, logout
        │   ├── ProtectedRoute.jsx         # Auth and admin role guard
        │   ├── StatusBadge.jsx            # INITIATED/PROCESSING/COMPLETED/FAILED badges
        │   ├── ToastContainer.jsx         # Global notification toasts (Zustand-driven)
        │   └── admin/
        │       ├── AccountActionButtons.jsx        # Freeze/unfreeze toggle
        │       └── TransactionDetailsModal.jsx     # Full transaction inspection modal
        ├── pages/
        │   ├── Landing.jsx                # Public landing page
        │   ├── Login.jsx                  # Login form
        │   ├── Register.jsx               # Registration form
        │   ├── Dashboard.jsx              # Virtual card, balance, recent activity
        │   ├── Transfer.jsx               # Idempotent transfer with retry workflow
        │   ├── Transactions.jsx           # Full transaction history
        │   ├── AdminUsers.jsx             # User management with freeze controls
        │   ├── AdminTransactions.jsx       # Filterable transaction monitoring
        │   └── AdminStats.jsx             # System metrics dashboard
        └── store/
            ├── authStore.js               # Auth state with localStorage persistence
            └── notificationStore.js       # Toast queue with auto-dismiss
```

---

## Run Locally

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/bank
JWT_SECRET=replace_with_a_long_random_secret
NODE_ENV=development
```

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite dev server runs at `http://localhost:5173` and proxies `/api` requests to the backend at `http://localhost:3000`.

### Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | No | API port (default: 3000) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret |
| `NODE_ENV` | No | `development` or `production` |

---

## Future Improvements

- Reversal and dispute workflows
- Cursor-based pagination for high-volume transaction streams
- OpenAPI spec and integration test suite
- Structured logging and distributed tracing
- Outbox pattern for durable event delivery across services
- Statement exports (CSV/PDF)

---

## Resume Snapshot

Built a full-stack banking system handling concurrent transfers, idempotent request deduplication, and financial data integrity using atomic MongoDB sessions, compound index-based idempotency, bounded state-driven retries, immutable double-entry ledgering, event-driven architecture, and RBAC -- with a React dashboard that mirrors backend transaction lifecycle and retry behavior in the UI.
