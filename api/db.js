const fs = require('fs');
const path = require('path');
const { getSupabase, fetchFullSupabaseDB } = require('../supabase-client');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
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
      const diskDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      Object.assign(db, diskDb);
    }
  } catch(e) {}

  // 2. Fetch fresh real-time data from Supabase Cloud (Master Source of Truth)
  try {
    const sbData = await fetchFullSupabaseDB();
    if (sbData) {
      if (Array.isArray(sbData.properties) && sbData.properties.length > 0) db.properties = sbData.properties;
      if (Array.isArray(sbData.newProjects) && sbData.newProjects.length > 0) db.newProjects = sbData.newProjects;
      if (Array.isArray(sbData.farmland) && sbData.farmland.length > 0) db.farmland = sbData.farmland;
      if (Array.isArray(sbData.siteTours) && sbData.siteTours.length > 0) db.siteTours = sbData.siteTours;
      if (Array.isArray(sbData.interiors) && sbData.interiors.length > 0) db.interiors = sbData.interiors;
      if (Array.isArray(sbData.poojas) && sbData.poojas.length > 0) db.poojas = sbData.poojas;
    }
  } catch(err) {
    console.warn('Vercel Supabase fetch notice:', err.message);
  }

  // Dual-key symmetry for 100% frontend and client backward compatibility
  db.lb_properties_data = db.properties || [];
  db.lb_new_projects_data = db.newProjects || [];
  db.lb_farmland_data = db.farmland || [];
  db.lb_site_tours_data = db.siteTours || [];
  db.lb_interior_consultations = db.interiors || [];
  db.lb_griha_pravesh_bookings = db.poojas || [];
  db.lb_approvals_data = db.approvals || [];
  db.lb_admin_audit_logs = db.auditLogs || [];

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(db));
};

