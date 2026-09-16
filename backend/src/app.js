import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Show, Booking } from './models.js';
import { calculateBookingPrice } from './services/pricing.js';

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '20kb' }));

const fail = (message, status = 400) => { const error = new Error(message); error.status = status; throw error; };
const findShow = async (id) => { if (!mongoose.isValidObjectId(id)) fail('Invalid show ID.'); const show = await Show.findOne({ _id: id, active: true }); if (!show) fail('Show not found.', 404); return show; };
const parseRequest = (body) => { const { showId, tier: tierName, quantity, member = false, festivalOffer = false } = body; if (typeof member !== 'boolean' || typeof festivalOffer !== 'boolean') fail('Member and offer values must be boolean.'); return { showId, tierName, quantity, member, festivalOffer }; };
const getQuote = (show, request) => { const tier = show.tiers.find((item) => item.name === request.tierName); if (!tier) fail('Unknown seat tier.'); if (tier.available === 0) fail(`${tier.name} is sold out.`); if (!Number.isInteger(request.quantity) || request.quantity <= 0) fail('Quantity must be a positive whole number.'); if (request.quantity > tier.available) fail(`Only ${tier.available} ${tier.name} seats remain.`); return { tier, pricing: calculateBookingPrice({ tier, quantity: request.quantity, member: request.member, festivalOffer: request.festivalOffer }) }; };

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/shows', async (_req, res, next) => { try { const shows = await Show.find({ active: true }).sort({ createdAt: 1 }); res.json({ data: shows }); } catch (error) { next(error); } });
app.get('/api/shows/:id', async (req, res, next) => { try { res.json({ data: await findShow(req.params.id) }); } catch (error) { next(error); } });
app.post('/api/pricing/calculate', async (req, res, next) => { try { const request = parseRequest(req.body); const show = await findShow(request.showId); const quote = getQuote(show, request); res.json({ data: { show: { id: show.id, movieTitle: show.movieTitle, showtime: show.showtime }, tier: quote.tier.name, ...quote.pricing } }); } catch (error) { next(error); } });
app.post('/api/bookings', async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const request = parseRequest(req.body);
    let response;
    await session.withTransaction(async () => {
      const show = await Show.findOne({ _id: request.showId, active: true }).session(session);
      if (!show) fail('Show not found.', 404);
      const tier = show.tiers.find((item) => item.name === request.tierName);
      if (!tier) fail('Unknown seat tier.');
      if (!Number.isInteger(request.quantity) || request.quantity <= 0) fail('Quantity must be a positive whole number.');
      const update = await Show.updateOne({ _id: show._id, active: true, 'tiers': { $elemMatch: { name: request.tierName, available: { $gte: request.quantity } } } }, { $inc: { 'tiers.$.available': -request.quantity } }, { session });
      if (update.modifiedCount !== 1) fail('Those seats are no longer available. Please refresh and try again.', 409);
      const pricing = calculateBookingPrice({ tier, quantity: request.quantity, member: request.member, festivalOffer: request.festivalOffer });
      const booking = await Booking.create([{ showId: show._id, movieTitle: show.movieTitle, showtime: show.showtime, tier: tier.name, quantity: request.quantity, member: request.member, festivalOffer: request.festivalOffer, pricing }], { session });
      response = booking[0];
    });
    res.status(201).json({ data: response });
  } catch (error) { next(error); } finally { await session.endSession(); }
});
app.get('/api/bookings/:id', async (req, res, next) => { try { if (!mongoose.isValidObjectId(req.params.id)) fail('Invalid booking ID.'); const booking = await Booking.findById(req.params.id); if (!booking) fail('Booking not found.', 404); res.json({ data: booking }); } catch (error) { next(error); } });
app.use((error, _req, res, _next) => { const status = error.status || 500; res.status(status).json({ error: status === 500 ? 'Internal server error.' : error.message }); });
export default app;
