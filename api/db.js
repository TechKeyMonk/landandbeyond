const fs = require('fs');
const path = require('path');
const { getSupabase, fetchFullSupabaseDB } = require('../supabase-client');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.writeHead(200).end();
    return;
  }

  let db = {
    properties: [],
    newProjects: [],
    farmland: [],
    siteTours: [],
    approvals: [],
    auditLogs: [],
    interiors: [],
    poojas: []
  };

  // 1. Try reading local seed file / tmp fallback
  try {
    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    if (fs.existsSync(dbPath)) {
      db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    }
  } catch(e) {}

  // 2. Fetch fresh real-time data from Supabase Cloud (Single Source of Truth)
  try {
    const sbData = await fetchFullSupabaseDB();
    if (sbData) {
      if (sbData.properties && sbData.properties.length > 0) db.properties = sbData.properties;
      if (sbData.newProjects && sbData.newProjects.length > 0) db.newProjects = sbData.newProjects;
      if (sbData.farmland && sbData.farmland.length > 0) db.farmland = sbData.farmland;
      if (sbData.siteTours && sbData.siteTours.length > 0) db.siteTours = sbData.siteTours;
      if (sbData.interiors && sbData.interiors.length > 0) db.interiors = sbData.interiors;
      if (sbData.poojas && sbData.poojas.length > 0) db.poojas = sbData.poojas;
    }
  } catch(err) {
    console.warn('Vercel Supabase fetch fallback to local disk db:', err.message);
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(db));
};
