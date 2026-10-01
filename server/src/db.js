require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const dns = require('dns');

// Configure reliable DNS resolvers (Cloudflare, Google)
try {
  dns.setServers(['1.1.1.1', '8.8.8.8', '1.0.0.1', '8.8.4.4']);
} catch (e) {
  console.warn('DNS server configuration warning:', e.message);
}

const { Pool, neonConfig } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { PrismaClient } = require('@prisma/client');
const ws = require('ws');

// Use WebSocket for Neon serverless — connects via HTTPS/WSS (port 443)
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
