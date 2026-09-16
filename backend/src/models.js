import mongoose from 'mongoose';

const tierSchema = new mongoose.Schema({
  name: { type: String, enum: ['Silver', 'Gold', 'Recliner'], required: true },
  pricePaise: { type: Number, required: true, min: 0 },
  available: { type: Number, required: true, min: 0 }
}, { _id: false });

export const Show = mongoose.model('Show', new mongoose.Schema({
  movieTitle: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: String, required: true },
  showtime: { type: String, required: true },
  tiers: { type: [tierSchema], required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true }));

export const Booking = mongoose.model('Booking', new mongoose.Schema({
  showId: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  movieTitle: String,
  showtime: String,
  tier: String,
  quantity: Number,
  member: Boolean,
  festivalOffer: Boolean,
  pricing: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true }));
