import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './db.js';

const port = Number(process.env.PORT || 4000);
try {
  await connectDatabase();
  app.listen(port, () => console.log(`Multiplex API listening on http://localhost:${port}`));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
