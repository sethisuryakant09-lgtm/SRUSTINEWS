require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { neonConfig, Pool } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { PrismaClient } = require('@prisma/client');

// Use WebSocket only in non-serverless environments (local dev)
// On Vercel serverless, Neon uses HTTP fetch-based pooling automatically
if (typeof WebSocket === 'undefined' && process.env.VERCEL !== '1') {
  try {
    const ws = require('ws');
    neonConfig.webSocketConstructor = ws;
  } catch (e) {
    // ws not available — Neon will use fetch transport
  }
}

// Enable connection caching for serverless environments (Vercel)
neonConfig.fetchConnectionCache = true;

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
