const fs = require('fs');
const path = require('path');
const { syncToSupabase, deleteFromSupabase, fetchFromSupabase, getSupabase } = require('../supabase-client');

function parseBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', err => reject(err));
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200).end();
    return;
  }

  if (req.method === 'GET') {
    const dbHandler = require('./db');
    return dbHandler(req, res);
  }

  if (req.method === 'POST') {
    try {
      const payload = await parseBody(req);
      
      const mapKey = {
        'lb_properties_data': 'properties',
        'lb_new_projects_data': 'newProjects',
        'lb_farmland_data': 'farmland',
        'lb_site_tours_data': 'siteTours',
        'lb_approvals_data': 'approvals',
        'lb_interior_consultations': 'interiors',
        'lb_griha_pravesh_bookings': 'poojas',
        'lb_admin_audit_logs': 'auditLogs'
      };

      if (payload && payload.key && payload.data !== undefined) {
        const dbKey = mapKey[payload.key] || payload.key;
        let isSupabaseSynced = false;
        
        // Auto-sync into Supabase Cloud
        try {
          const syncResult = await syncToSupabase(dbKey, payload.data);
          isSupabaseSynced = Boolean(syncResult);
          if (dbKey === 'properties' && Array.isArray(payload.data)) {
            const farmItems = payload.data.filter(p => {
              const cat = (p.category || '').toLowerCase();
              const t = (p.title || p.name || '').toLowerCase();
              return cat.includes('farm') || cat.includes('agro') || cat.includes('dry land') || t.includes('farm') || t.includes('pannai');
            });
            if (farmItems.length > 0) {
              await syncToSupabase('farmland', farmItems);
            }
          }
        } catch(syncErr) {
          console.warn('Vercel Supabase sync notice:', syncErr.message);
        }

        // Cache in /tmp/db.json if available
        try {
          const tmpPath = path.join('/tmp', 'db.json');
          let currentTmp = {};
          if (fs.existsSync(tmpPath)) {
            try { currentTmp = JSON.parse(fs.readFileSync(tmpPath, 'utf8')); } catch(e) {}
          }
          currentTmp[dbKey] = payload.data;
          currentTmp[payload.key] = payload.data;
          fs.writeFileSync(tmpPath, JSON.stringify(currentTmp, null, 2), 'utf8');
        } catch(tmpErr) {}

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, supabaseSynced: isSupabaseSynced, key: payload.key }));
        return;
      } else if (payload && typeof payload === 'object' && Object.keys(payload).length > 0) {
        for (const k of Object.keys(payload)) {
          try {
            await syncToSupabase(k, payload[k]);
          } catch(e) {}
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, supabaseSynced: true }));
        return;
      }

      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid payload structure: key and data required' }));
    } catch(err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  res.writeHead(405, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Method Not Allowed' }));
};
