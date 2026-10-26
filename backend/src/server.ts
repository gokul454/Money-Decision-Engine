import { app } from './app.js';
import { connectDB } from './config/database.js';
import { ENV } from './config/environment.js';
import { seedDemoData } from './seed/demoData.js';

async function startServer() {
  await connectDB();
  await seedDemoData();

  app.listen(ENV.PORT, () => {
    console.log(`===========================================`);
    console.log(`  Money OS Backend Server Running`);
    console.log(`  Port: http://localhost:${ENV.PORT}`);
    console.log(`  Environment: ${ENV.NODE_ENV}`);
    console.log(`===========================================`);
  });
}

startServer().catch((err) => {
  console.error('[Server Error]', err);
  process.exit(1);
});
