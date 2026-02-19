import { createSchema } from '../lib/db/schema';
import { seedDatabase } from '../lib/db/seed';
import { closeDatabase } from '../lib/db/connection';

console.log('Setting up database...');

try {
  createSchema();
  console.log('Schema created successfully.');
  
  seedDatabase();
  console.log('Database seeded successfully.');
} catch (error) {
  console.error('Error setting up database:', error);
  process.exit(1);
} finally {
  closeDatabase();
}

console.log('Database setup complete!');
