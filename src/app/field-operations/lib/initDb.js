import { query } from './db.js';
import fs from 'fs';
import path from 'path';

export async function initDatabase() {
  const schemaPath = path.join(process.cwd(), 'lib', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  
  // Split on semicolons but be careful with SQL that has semicolons in strings
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  for (const statement of statements) {
    try {
      await query(statement);
    } catch (err) {
      // Ignore duplicate key errors on seeding
      if (!err.message.includes('duplicate key') && !err.message.includes('already exists')) {
        console.error('Schema error:', err.message.substring(0, 200));
      }
    }
  }
  
  console.log('Database initialized successfully');
}
