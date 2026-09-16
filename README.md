# Counter / Multiplex

A full-stack multiplex booking and pricing engine. The API is the pricing source of truth; the React client requests quotes and submits bookings without sending a trusted total.

## Features

- Movie/showtime selection with Silver, Gold, and Recliner tiers.
- Sold-out and limited availability states.
- Festival flat discount and capped member percentage discount.
- Integer-paise calculations, GST, convenience fees, and line-item receipts.
- Transactional MongoDB availability decrement at booking time.
- Responsive React/Vite booking experience with loading, empty, error, and confirmation states.

## Prerequisites

- Node.js 20 or newer
- MongoDB 6 or newer, running locally or reachable by URI

## Setup

```bash
cp .env.example .env
npm install
npm run install:all
npm run seed
```

Set `MONGODB_URI` in `.env` before running the seed. The default local URI is `mongodb://127.0.0.1:27017/multiplex_pricing`.

Run both applications:

```bash
npm run dev
```

The API runs at `http://localhost:4000`; the frontend runs at `http://localhost:5173`.

Run separately when needed:

```bash
npm run dev --prefix backend
npm run dev --prefix frontend
```

## Tests and build

```bash
npm test
npm run build --prefix frontend
```

The backend tests cover ordinary tickets, each tier, both offers, the member cap, fee/GST totals, negative-discount protection, and invalid quantities.

## Pricing rules

The challenge does not provide numeric values, so the demo uses configurable defaults in `backend/src/services/pricing.js`:

1. Ticket subtotal is `unit price x quantity`.
2. A festival offer removes ₹100 per booking, capped at the ticket subtotal.
3. Member pricing removes 10% of the post-festival subtotal, capped at ₹150.
4. A ₹25 convenience fee is added per ticket.
5. GST is 18% of discounted tickets plus convenience fees.
6. Percentage GST is rounded to the nearest paise and the final is never negative.

All monetary values are integer paise internally. The booking endpoint fetches the stored tier price, validates availability, recalculates the quote, atomically decrements the requested tier, and stores the pricing snapshot.

## API

- `GET /api/health`
- `GET /api/shows`
- `GET /api/shows/:id`
- `POST /api/pricing/calculate` with `showId`, `tier`, `quantity`, `member`, and `festivalOffer`
- `POST /api/bookings` with the same request fields
- `GET /api/bookings/:id`

## Project structure

```text
backend/src/services/pricing.js   # independently testable pricing engine
backend/src/app.js                # API, validation, and booking transaction
backend/src/models.js             # Show and Booking schemas
backend/src/seed.js               # demo data
frontend/src/main.jsx             # booking workflow
frontend/src/styles.css           # responsive visual design
```

## Debugging and limitations

Use `npm test` for pricing failures and inspect the JSON response from the API for validation failures. MongoDB transactions require a replica set in some local MongoDB installations; the booking endpoint intentionally uses a transaction to protect concurrent inventory updates. Authentication and payment processing are outside this counter MVP.