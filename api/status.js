const fs = require('fs');
const path = require('path');
const { getDbStatus, fetchFullSupabaseDB } = require('../supabase-client');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.writeHead(200).end();
    return;
  }

  let db = {};
  try {
    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    if (fs.existsSync(dbPath)) {
      db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    }
  } catch(e) {}

  try {
    const sbData = await fetchFullSupabaseDB();
    if (sbData) {
      db = { ...db, ...sbData };
    }
  } catch(e) {}

  const dbStatus = getDbStatus();
  let primaryStorage = 'High-Speed Dynamic JSON Storage';
  if (dbStatus.supabaseConnected) primaryStorage = 'Supabase Cloud (PostgreSQL)';
  else if (dbStatus.pgConnected) primaryStorage = 'PostgreSQL Database';

  const isAnyDbConnected = Boolean(dbStatus.supabaseConnected || dbStatus.pgConnected);
  const isAnyDbConfigured = Boolean(dbStatus.supabaseConfigured || dbStatus.pgConfigured);

  const statusData = {
    status: 'online',
    dbConnected: isAnyDbConnected,
    hasCreds: isAnyDbConfigured,
    indicatorState: isAnyDbConnected ? 'green' : (isAnyDbConfigured ? 'orange' : 'red'),
    serverTime: new Date().toISOString(),
    primaryStorage: primaryStorage,
    environment: 'vercel-serverless',
    supabase: {
      configured: dbStatus.supabaseConfigured,
      connected: dbStatus.supabaseConnected,
      url: process.env.SUPABASE_URL || 'https://zwmvlhsfcezciegbmasp.supabase.co'
    },
    postgresql: {
      configured: dbStatus.pgConfigured,
      connected: dbStatus.pgConnected
    },
    activeRecords: {
      properties: (db.properties || []).length,
      newProjects: (db.newProjects || []).length,
      farmland: (db.farmland || []).length,
      siteTours: (db.siteTours || []).length,
      interiors: (db.interiors || []).length,
      poojas: (db.poojas || []).length
    }
  };

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(statusData, null, 2));
};

