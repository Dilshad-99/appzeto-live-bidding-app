# AuctionHub — Real-Time Timed Auction & Bidding Platform

> **Appzeto Machine Test — Task 1: Real-Time Auction & Bidding Platform**  
> Evaluated on practical full-stack engineering across architecture, database design, strict concurrency control, real-time WebSockets, wallet invariants, security, and automated testing.

---

## 🌟 Key Highlights & Engineering Features

1. **Dual-Layer Concurrency & Wallet Invariant Guarantee**:
   - **Keyed In-Memory Per-Auction Mutex (`async-mutex`)**: Serializes incoming requests per auction to prevent process-level race conditions.
   - **MongoDB ACID Transactions (`session.withTransaction`) & Optimistic Locking**: Ensures atomic hold creation, hold release for outbid users, bid document creation, and auction version increments in a single atomic database write.
   - **Result**: Under 100 simultaneous concurrent bids for the exact same valid amount, **EXACTLY ONE** bid succeeds, 99 receive meaningful error codes (`400/409`), and wallet balances never become negative or overspent.
2. **Anti-Sniping Engine (Snipe Guard)**:
   - If a valid bid is submitted within the last 2 minutes (`ANTI_SNIPING_THRESHOLD_SECONDS = 120`), the end time is automatically extended by +2 minutes (`ANTI_SNIPING_EXTENSION_SECONDS = 120`).
   - Clients connected to the auction receive the updated timer over WebSockets without page reload.
3. **Automated Auction Lifecycle Engine**:
   - Background ticker transitions `SCHEDULED` -> `LIVE` at `startTime`, and `LIVE` -> `CLOSED` / `SETTLED` at `endTime`.
   - **Reserve Price Settlement**: If the reserve price is unmet at close, the auction closes with no winner and all holds are released back to bidders. If reserve is met, the winner's hold is debited and credited directly to the seller's wallet.
4. **Targeted Real-Time Outbid Notifications (Socket.IO)**:
   - When a user is outbid, they receive an immediate targeted alert (`auction:outbid`) prompting them to rebid with their hold instantly refunded to available balance.
5. **Multi-Role RBAC & 1-Click Persona Switcher**:
   - Roles: `BIDDER`, `SELLER`, `ADMIN`.
   - Floating demo banner allows instant 1-click switching between test accounts (`Elena - Admin`, `Marcus - Seller`, `Alex - Bidder 1`, `Sophia - Bidder 2`).

---

## 🏗️ Architecture & Technology Stack

```
                               ┌─────────────────────────────┐
                               │   React 18 + Vite Frontend  │
                               │  (#6D5EF5 Electric Violet)  │
                               └──────────────┬──────────────┘
                                              │ HTTP / WebSockets
                               ┌──────────────▼──────────────┐
                               │     Node.js + Express API   │
                               │      (Socket.IO Server)     │
                               └──────┬───────────────┬──────┘
                                      │               │
            ┌─────────────────────────▼──┐         ┌──▼──────────────────────────┐
            │   Bidding Concurrency      │         │   Background Lifecycle      │
            │  (Per-Auction Mutex Lock)  │         │   Engine (Cron / Interval)  │
            └─────────────────────────┬──┘         └──┬──────────────────────────┘
                                      │               │
                               ┌──────▼───────────────▼──────┐
                               │     MongoDB 6.0 Database    │
                               │   (ACID Multi-Doc Txns)     │
                               └─────────────────────────────┘
```

- **Frontend**: React 18, Vite, React Router 6, Lucide Icons, Canvas Confetti, Custom Electric Violet & Slate Design System
- **Backend**: Node.js, Express.js, Socket.IO, Mongoose, Async-Mutex, Helmet, Rate Limiter, Bcrypt, JWT
- **Database**: MongoDB 6.0 with Replica Set (supporting full ACID transactions and atomic version locks)

---

## 🚀 Quick Start & How to Run

### Option 1: Run Locally (Recommended)

#### 1. Start MongoDB (with Replica Set for ACID transactions)
```bash
# Start MongoDB
mongod --nounixsocket --replSet rs0 --dbpath /home/dilshad/Projects/Appzeto_Machine_test/.mongo_data --bind_ip 127.0.0.1 --port 27017 &

# Initialize replica set (if first time)
mongosh --port 27017 --eval "rs.initiate()"
```

#### 2. Start Backend & Seed Data
```bash
cd backend
npm install
npm run seed      # Seeds demo accounts, live auctions, bids, and wallets
npm run dev       # Starts backend on http://localhost:5000
```

#### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev       # Starts Vite dev server on http://localhost:5173
```
Open **http://localhost:5173** in your browser!

---

### Option 2: Run with Docker Compose
```bash
docker-compose up --build
```

---

## 👥 Demo Accounts (Pre-Seeded)

| Persona | Role | Email | Password | Starting Wallet Balance |
| :--- | :--- | :--- | :--- | :--- |
| **Elena Rostova** | `ADMIN` | `admin@auctionhub.com` | `password123` | $15,000 |
| **Marcus Sterling** | `SELLER` | `seller@auctionhub.com` | `password123` | $2,500 |
| **Alex Rivera** | `BIDDER` | `bidder1@auctionhub.com` | `password123` | $11,050 Avail / $1,450 Held |
| **Sophia Chen** | `BIDDER` | `bidder2@auctionhub.com` | `password123` | $5,600 Avail / $4,200 Held |
| **David Kim** | `BIDDER` | `bidder3@auctionhub.com` | `password123` | $7,500 Avail |

*(Tip: Click any persona name in the top demo banner to test across roles instantly!)*

---

## 🧪 Automated Testing

Automated test suites covering **high-concurrency race conditions**, **anti-sniping dynamic extensions**, **seller self-bidding restrictions**, and **reserve price settlements**:

```bash
cd backend
npm test
```

### Test Suite Summary:
1. `Concurrent Identical Bids`: Fires 20 simultaneous bids with the exact same amount (`$1050`) using `Promise.all` -> **Exactly 1 succeeds, 19 rejected**.
2. `Concurrent Escalating Bids`: 20 concurrent bids of increasing amounts -> Verifies strict highest bid recording and 100% wallet hold accounting.
3. `Wallet Hold Invariant`: Verifies a bidder can never bid more than their available balance.
4. `Anti-Sniping`: Verifies a bid placed in the last 60 seconds extends the timer by +120 seconds.
5. `Seller Prevention`: Verifies sellers cannot bid on their own auctions.
6. `Reserve Price Settlement`: Verifies that if reserve price is unmet, the auction closes with no winner and all holds are refunded.
7. `Winner Settlement & Seller Payout`: Verifies the winning bidder's hold is debited and credited to the seller's wallet.

---

## 🔒 Concurrency Strategy & Data Consistency

### The Challenge
When multiple users submit simultaneous bids on the same timed auction, traditional read-modify-write patterns result in:
1. **Lost Updates**: Two bidders bidding `$500` simultaneously both get confirmed.
2. **Double Spending / Locked Balance Leaks**: Outbid holds are deducted or released incorrectly.
3. **Dirty Reads**: The client observes an outdated highest bid.

### Our Solution
1. **Per-Auction In-Memory Mutex (`async-mutex`)**:
   Incoming HTTP/WebSocket bid requests are queued sequentially per auction ID at the Node process level, preventing race conditions before DB queries are initiated.
2. **MongoDB ACID Session Transactions**:
   All database operations (`Auction` update, `Bid` insertion, `Wallet` hold increment for new bidder, `Wallet` hold decrement/release for outbid bidder, `Transaction` audit log) are wrapped in a single database transaction (`session.withTransaction`).
3. **Optimistic Version Check**:
   The auction document tracks an incrementing `version` and verifies `currentHighestBid` within the write condition. If a collision occurs, the transaction rolls back cleanly with zero balance corruption.

---

## 📊 Database Design & Indexing

- **Users**: Unique index on `email`.
- **Auctions**:
  - Compound index `{ status: 1, endTime: 1 }` for high-speed scheduler queries (`LIVE -> CLOSED`).
  - Compound index `{ status: 1, startTime: 1 }` for `SCHEDULED -> LIVE` transitions.
  - Index on `sellerId` and `category`.
- **Bids**:
  - Compound index `{ auctionId: 1, amount: -1, createdAt: -1 }` for instant retrieval of highest bids.
  - Index on `bidderId` for user bidding history.
- **Wallets**: Unique index on `userId`.
- **Transactions**: Compound index `{ userId: 1, createdAt: -1 }` for ledger queries.

---

## 📡 API Reference

### Authentication
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`, `role`)
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Get current user profile and balance

### Auctions
- `GET /api/auctions` — List auctions with filters (`status`, `category`, `search`, `sortBy`)
- `POST /api/auctions` — Create new auction in `DRAFT` state (`SELLER` / `ADMIN`)
- `GET /api/auctions/:id` — Get single auction details
- `PUT /api/auctions/:id` — Update `DRAFT` auction (only before 1st bid)
- `DELETE /api/auctions/:id` — Delete `DRAFT` auction
- `POST /api/auctions/:id/approve` — Approve `DRAFT` auction (`ADMIN` only)
- `POST /api/auctions/:id/cancel` — Force cancel auction & refund holds (`ADMIN` only)
- `GET /api/auctions/:id/bids` — Get real-time bid history for auction
- `POST /api/auctions/:id/bids` — Place atomic bid with wallet hold

### Wallet & User
- `GET /api/wallet` — Get current wallet balances & transaction audit ledger
- `POST /api/wallet/topup` — Top-up available wallet balance
- `GET /api/me/bids` — Get current user's bid history across all auctions

### Admin Dashboard
- `GET /api/admin/dashboard` — Platform overview (counts by state, live auctions, GMV, category statistics, recent bids)

---

## ⏱️ Known Limitations & Future Improvements (Next 2 Days)

1. **Distributed Mutex with Redis (Redlock)**:
   For multi-instance horizontal scaling across multiple Node.js processes/Kubernetes pods, replace the in-memory keyed mutex with Redis distributed locks (`Redlock`).
2. **Auto-Bidding (Proxy Bidding)**:
   Support maximum proxy bids where the system automatically places the minimum necessary increment on the user's behalf up to their maximum ceiling.
3. **Stripe / Payment Gateway Integration**:
   Replace the mock top-up endpoint with real card pre-authorizations (Stripe Payment Intents with `capture_method: manual`).
4. **Push / Email Notifications**:
   Integrate SendGrid / Web Push notifications when an outbid occurs while the user is offline.
