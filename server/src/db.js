const path = require('path');

// Load .env for local dev (Vercel injects env vars directly)
if (process.env.VERCEL !== '1') {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

const { neonConfig, Pool } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { PrismaClient } = require('@prisma/client');

// Use ws WebSocket only in local dev — Vercel uses native fetch
if (process.env.VERCEL !== '1') {
  try {
    const ws = require('ws');
    neonConfig.webSocketConstructor = ws;
  } catch (e) {
    // ignore
  }
}

// Neon serverless HTTP connection caching
neonConfig.fetchConnectionCache = true;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
