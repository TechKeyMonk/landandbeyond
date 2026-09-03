const fs = require('fs');
const path = require('path');
const { getSupabase } = require('../supabase-client');

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

  // Try reading local seed file
  try {
    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    if (fs.existsSync(dbPath)) {
      db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    }
  } catch(e) {}

  // Try fetching fresh data from Supabase Cloud if connected
  const supabase = getSupabase();
  if (supabase) {
    try {
      const [pRes, nRes, fRes, tRes, iRes, pjRes] = await Promise.all([
        supabase.from('properties').select('*').limit(100),
        supabase.from('new_projects').select('*').limit(50),
        supabase.from('farmland').select('*').limit(50),
        supabase.from('site_tours').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('interiors').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('poojas').select('*').order('created_at', { ascending: false }).limit(100)
      ]);

      if (pRes && pRes.data && pRes.data.length > 0) {
        db.properties = pRes.data.map(item => item.data || item);
      }
      if (nRes && nRes.data && nRes.data.length > 0) {
        db.newProjects = nRes.data.map(item => item.data || item);
      }
      if (fRes && fRes.data && fRes.data.length > 0) {
        db.farmland = fRes.data.map(item => item.data || item);
      }
      if (tRes && tRes.data && tRes.data.length > 0) {
        db.siteTours = tRes.data.map(item => item.data || item);
      }
      if (iRes && iRes.data && iRes.data.length > 0) {
        db.interiors = iRes.data.map(item => item.data || item);
      }
      if (pjRes && pjRes.data && pjRes.data.length > 0) {
        db.poojas = pjRes.data.map(item => item.data || item);
      }
    } catch(err) {
      console.warn('Vercel Supabase fetch fallback to local disk db:', err.message);
    }
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(db));
};
