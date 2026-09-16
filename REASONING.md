# 1. Features I Built

- Express REST API for active movie screenings and booking retrieval.
- MongoDB Show and Booking schemas with a stored pricing snapshot.
- Seed data with three movies, multiple showtimes, all three seat tiers, and sold-out Recliner inventory on one show.
- Dedicated integer-paise pricing engine.
- Festival discount, capped member discount, per-ticket convenience fee, and GST.
- Backend validation for IDs, tiers, quantities, offers, and availability.
- Transactional availability decrement during booking.
- React/Vite/Tailwind-compatible responsive counter interface.
- Live quote retrieval, line-by-line bill, loading/error/empty states, and confirmation screen.
- Automated pricing tests.

# 2. Features I Inferred

- A customer can choose exactly one seat tier per booking. The prompt describes a tier and quantity but does not define mixed-tier carts; a single-tier booking keeps the API and receipt unambiguous.
- The festival offer is opt-in through the counter UI. This makes the offer visible and avoids silently applying an offer a customer did not request.
- A booking stores its complete pricing snapshot. This is needed for a historical receipt to remain understandable after rules change.
- A simple counter does not need authentication. There are no customer accounts or private resources in the stated workflow.

# 3. Key Decisions & Trade-offs

The project is a small monorepo with an Express/Mongoose backend and a React/Vite frontend. Pricing lives in `backend/src/services/pricing.js`, so it is independently testable and cannot drift into UI code. The frontend only submits selection inputs; it never submits or controls a final amount.

MongoDB stores shows as documents containing embedded tier price and availability records. Bookings store movie/showtime text and the pricing object at booking time, which makes the receipt durable. The availability update uses a conditional atomic update inside a transaction, so stale clients cannot oversell a tier. A MongoDB deployment that supports transactions is therefore required for production-like concurrency protection.

Amounts are integer paise instead of JavaScript floating point. The API returns structured fields and a breakdown array so the UI does not recreate calculations. Validation is intentionally located at the API boundary and repeated by the booking flow. CORS is limited to the configured frontend URL, request bodies have a size limit, and production errors do not expose stack traces.

The UI uses a compact counter-oriented layout: movie cards, tier cards, quantity controls, explicit offer toggles, and a receipt beside the selection. It favors scanning and transparency over a multi-page flow. Tailwind/PostCSS configuration is included, while the visual layer uses a focused stylesheet for precise layout and responsive behavior.

# 4. How I Handled the Twist

Silver, Gold, and Recliner are represented as separate tiers with independent integer-paise prices and inventory. A tier at zero availability is displayed as sold out and cannot be selected. The backend repeats that check and also rejects quantities greater than the current inventory.

The challenge gives no exact numeric rules, so the implementation makes the following configurable assumptions: festival discount ₹100 per booking, member discount 10%, member discount cap ₹150, convenience fee ₹25 per ticket, and GST 18%. The festival discount is applied first and is capped at the ticket subtotal. The member percentage is then calculated on the post-festival subtotal and capped at ₹150. Both discounts are cumulative only when their respective flags are enabled.

After discounts, the convenience fee is calculated as quantity times ₹25. GST is calculated on discounted tickets plus the fee, rounded to the nearest paise, and added to form the final payable amount. Discounts are clamped so the discounted subtotal cannot become negative. The line-item response exposes the ticket amount, each enabled discount, discounted subtotal, fee, GST, and final total. The frontend displays those values directly.

The engine rejects missing tiers and non-positive, fractional, or missing quantities. The API rejects malformed IDs, unknown shows, unknown tiers, sold-out tiers, and insufficient inventory. Booking recalculates from database values and conditionally decrements inventory before creating the booking snapshot, so a client cannot submit a fabricated total.

# 5. What I'd Do With More Time

- Add mixed-tier carts with an itemized receipt for each tier.
- Add an admin workflow for changing prices, inventory, and offer rules.
- Add contract tests for every REST endpoint and a MongoDB integration test suite.
- Add replica-set setup to the local development environment and a deployment configuration.
- Add payment integration, idempotency keys, booking expiry, and authenticated staff accounts.
- Add browser-level responsive and accessibility tests.
