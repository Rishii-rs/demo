import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from './db.js';
import { Show } from './models.js';

const shows = [
  { movieTitle: 'Neon Monsoon', description: 'A restless city, one impossible night, and a soundtrack that refuses to fade.', duration: '2h 18m', showtime: 'Friday, 7:30 PM', tiers: [{ name: 'Silver', pricePaise: 18000, available: 20 }, { name: 'Gold', pricePaise: 28000, available: 8 }, { name: 'Recliner', pricePaise: 45000, available: 0 }] },
  { movieTitle: 'The Last Signal', description: 'A quiet sci-fi mystery about the message hidden in the static.', duration: '1h 54m', showtime: 'Friday, 9:45 PM', tiers: [{ name: 'Silver', pricePaise: 16000, available: 14 }, { name: 'Gold', pricePaise: 26000, available: 5 }, { name: 'Recliner', pricePaise: 42000, available: 3 }] },
  { movieTitle: 'Paper Planets', description: 'Three friends, one train, and a map drawn entirely from memory.', duration: '2h 06m', showtime: 'Saturday, 6:15 PM', tiers: [{ name: 'Silver', pricePaise: 15000, available: 30 }, { name: 'Gold', pricePaise: 24000, available: 10 }, { name: 'Recliner', pricePaise: 39000, available: 4 }] }
];

await connectDatabase();
await Show.deleteMany({});
await Show.insertMany(shows);
await mongoose.disconnect();
console.log(`Seeded ${shows.length} shows.`);
