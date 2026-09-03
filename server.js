require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 8080;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Master Initial DB Seeds if file missing
const INITIAL_DB = {
  properties: [
    {
      id: 'prop_kozhi_pannai',
      title: 'kozhi pannai',
      builder: 'Pollachi Agro Estates',
      location: 'pollachi',
      category: 'Farmland',
      price: '2 cr',
      priceLabel: '2 cr',
      metrics: '2,200 sq.ft 2,200 sq.ft - 3 BHK Villa - Gated Community',
      status: 'Active',
      approvalType: 'DTCP Approved',
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop',
      createdAt: '2026-09-01T12:00:00.000Z'
    },
    {
      id: 'prop_daddy_home',
      title: 'daddy home',
      builder: 'Saravanampatti Promoters',
      location: 'Saravanampatti, Coimbatorebatore',
      category: 'Residential Plots',
      price: '25 lakh',
      priceLabel: '25 lakh',
      metrics: '2,200 sq.ft 2,200 sq.ft - 3 BHK Villa - Gated Community',
      status: 'Active',
      approvalType: 'DTCP Approved',
      imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&auto=format&fit=crop',
      createdAt: '2026-09-01T12:05:00.000Z'
    },
    {
      id: 'prop_rasul',
      title: 'rasul',
      builder: 'Skyline Infra',
      location: 'Saravanampatti, Coimbatorebatore',
      category: 'Apartments',
      price: '1.20 cr',
      priceLabel: '1.20 cr',
      metrics: '2,200 sq.ft 2,200 sq.ft - 3 BHK Villa - Gated Community',
      status: 'Active',
      approvalType: 'TN RERA Verified',
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&auto=format&fit=crop',
      createdAt: '2026-09-01T12:10:00.000Z'
    },
    {
      id: 'prop_emerald_crest',
      title: 'Emerald Crest Smart Villa Enclave',
      builder: 'Emerald Crest Infra',
      location: 'Saravanampatti, CoimSaravanampatti, Coimbatorebatore',
      category: 'Residential Plots',
      price: 'Rs 54.5 Lakhs onwards',
      priceLabel: 'Rs 54.5 Lakhs onwards',
      metrics: '2,200 sq.ft 2,200 sq.ft - 3 BHK Villa - Gated Community',
      status: 'Active',
      approvalType: 'DTCP Approved',
      imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&auto=format&fit=crop',
      createdAt: '2026-09-01T12:15:00.000Z'
    },
    {
      id: 'prop_coconut_saravanampatti',
      title: 'coconut',
      builder: 'Jegan Promoters',
      location: 'Saravanampatti, Coimbatore',
      category: 'Plots',
      price: '₹ 32.5 Lakhs',
      priceLabel: '₹ 32.5 Lakhs',
      metrics: '9.25 Cents • Facing: North • Parking: Yes',
      status: 'Active',
      approvalType: 'DTCP Approved',
      imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&auto=format&fit=crop',
      createdAt: '2026-09-01T12:20:00.000Z'
    },
    {
      id: 'prop_shyam_homes',
      title: 'shyam homes',
      builder: 'Shyam Constructions',
      location: 'Saravanampatti, Coimbatore',
      category: 'Villas',
      price: '₹ 42 Lakhs',
      priceLabel: '₹ 42 Lakhs',
      metrics: '2400 sq.ft • 3 BHK Luxury Living',
      status: 'Active',
      approvalType: 'DTCP / RERA',
      imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&auto=format&fit=crop',
      createdAt: '2026-09-01T12:25:00.000Z'
    }
  ],
  newProjects: [],
  farmland: [],
  siteTours: [],
  approvals: [],
  auditLogs: [],
  interiors: [],
  poojas: []
};

// Write initial DB if missing
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf8');
}

function readDB() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(raw);

    // Normalize dual-key compatibility across client and server conventions
    const syncDual = (k1, k2) => {
      const arr1 = Array.isArray(data[k1]) ? data[k1] : [];
      const arr2 = Array.isArray(data[k2]) ? data[k2] : [];
      if (arr1.length > 0 && arr2.length === 0) {
        data[k2] = arr1;
      } else if (arr2.length > 0 && arr1.length === 0) {
        data[k1] = arr2;
      } else if (arr1.length >= arr2.length) {
        data[k2] = arr1;
      } else {
        data[k1] = arr2;
      }
    };

    syncDual('newProjects', 'lb_new_projects_data');
    syncDual('properties', 'lb_properties_data');
    syncDual('farmland', 'lb_farmland_data');
    syncDual('siteTours', 'lb_site_tours_data');
    syncDual('approvals', 'lb_approvals_data');
    syncDual('interiors', 'lb_interior_consultations');
    syncDual('poojas', 'lb_griha_pravesh_bookings');
    syncDual('auditLogs', 'lb_admin_audit_logs');

    return data;
  } catch (e) {
    return INITIAL_DB;
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing DB file:', e);
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = parsedUrl.pathname;

const { getSupabase, getPgPool, getDbStatus, syncToSupabase } = require('./supabase-client');

// Database Status Endpoint
  if (pathname === '/api/status' || pathname === '/api/health') {
    const db = readDB();
    const dbStatus = getDbStatus();
    let primaryStorage = 'High-Speed Dynamic JSON Disk DB';
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
      supabase: {
        configured: dbStatus.supabaseConfigured,
        connected: dbStatus.supabaseConnected,
        url: process.env.SUPABASE_URL || 'Not configured'
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
    return;
  }

  // REST API Endpoints
  if (pathname === '/api/db' || pathname === '/api/data') {
    if (req.method === 'GET') {
      const db = readDB();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(db));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          const db = readDB();
          if (payload.key && payload.data !== undefined) {
            // Mapping localStorage key to db property
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
            const dbKey = mapKey[payload.key] || payload.key;
            db[dbKey] = payload.data;
            db[payload.key] = payload.data; // Store under original key as well for 100% compatibility
            writeDB(db);
            // Auto-sync into Supabase Cloud
            syncToSupabase(dbKey, payload.data).then(res => {
              if (res && res.success) console.log(`☁️ Synced ${payload.data.length} records of ${dbKey} to Supabase`);
            }).catch(err => {
              console.warn(`⚠️ Supabase sync warning for ${dbKey}:`, err.message);
            });
            if (dbKey === 'properties' && Array.isArray(payload.data)) {
              const farmItems = payload.data.filter(p => {
                const cat = (p.category || '').toLowerCase();
                const t = (p.title || p.name || '').toLowerCase();
                return cat.includes('farm') || cat.includes('agro') || cat.includes('dry land') || t.includes('farm') || t.includes('pannai');
              });
              if (farmItems.length > 0) {
                syncToSupabase('farmland', farmItems).catch(() => {});
              }
            }
          } else if (typeof payload === 'object') {
            Object.assign(db, payload);
            writeDB(db);
            Object.keys(payload).forEach(k => {
              syncToSupabase(k, payload[k]).catch(() => {});
            });
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, db: readDB() }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }
  }

  // Static File Serving
  if (pathname === '/') pathname = '/index.html';
  let filePath = path.join(__dirname, pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`🌐 Unified Real-Time Master Server running on http://localhost:${PORT}`);
  console.log(`💾 Shared Disk Database active at ${DB_FILE}`);
});
