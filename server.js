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
      id: 'prop_daddy_home',
      title: 'daddy home',
      builder: 'Saravanampatti Promoters',
      location: 'Saravanampatti, Coimbatore',
      category: 'Residential Plots',
      price: '25 lakh',
      priceLabel: '25 lakh',
      metrics: '1,500 sq.ft - Gated Community Plot',
      status: 'Active',
      approvalType: 'DTCP Approved',
      imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&auto=format&fit=crop',
      createdAt: '2026-09-01T12:05:00.000Z'
    },
    {
      id: 'prop_rasul',
      title: 'rasul',
      builder: 'Skyline Infra',
      location: 'Saravanampatti, Coimbatore',
      category: 'Apartments',
      price: '1.20 cr',
      priceLabel: '1.20 cr',
      metrics: '1,850 sq.ft - 3 BHK Luxury Apartment',
      status: 'Active',
      approvalType: 'TN RERA Verified',
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&auto=format&fit=crop',
      createdAt: '2026-09-01T12:10:00.000Z'
    },
    {
      id: 'prop_emerald_crest',
      title: 'Emerald Crest Smart Villa Enclave',
      builder: 'Emerald Crest Infra',
      location: 'Saravanampatti, Coimbatore',
      category: 'Residential Plots',
      price: 'Rs 54.5 Lakhs onwards',
      priceLabel: 'Rs 54.5 Lakhs onwards',
      metrics: '2,200 sq.ft - 3 BHK Villa - Gated Community',
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

const { getSupabase, getPgPool, getDbStatus, syncToSupabase, deleteFromSupabase, fetchFromSupabase, fetchFullSupabaseDB } = require('./supabase-client');

// Auto-sync initial data from Supabase Cloud on server boot across ALL modules
async function loadSupabaseOnStartup() {
  try {
    const sbData = await fetchFullSupabaseDB();
    if (!sbData) return;

    const db = readDB();
    let updated = false;

    // 1. Sync Upcoming Projects
    if (Array.isArray(sbData.newProjects) && sbData.newProjects.length > 0) {
      const currentNP = Array.isArray(db.newProjects) ? db.newProjects : [];
      sbData.newProjects.forEach(item => {
        const idx = currentNP.findIndex(p => p.id === item.id || (p.title && item.title && p.title.toLowerCase().trim() === item.title.toLowerCase().trim()));
        if (idx !== -1) {
          currentNP[idx] = { ...currentNP[idx], ...item };
        } else {
          currentNP.unshift(item);
        }
      });
      db.newProjects = currentNP;
      db.lb_new_projects_data = currentNP;
      updated = true;
      console.log(`⚡ Supabase Live Sync: Loaded ${sbData.newProjects.length} upcoming projects`);
    }

    // 2. Sync Properties
    if (Array.isArray(sbData.properties) && sbData.properties.length > 0) {
      const currentP = Array.isArray(db.properties) ? db.properties : [];
      sbData.properties.forEach(item => {
        const idx = currentP.findIndex(p => p.id === item.id || (p.title && item.title && p.title.toLowerCase().trim() === item.title.toLowerCase().trim()));
        if (idx !== -1) {
          currentP[idx] = { ...currentP[idx], ...item };
        } else {
          currentP.push(item);
        }
      });
      db.properties = currentP;
      db.lb_properties_data = currentP;
      updated = true;
      console.log(`⚡ Supabase Live Sync: Loaded ${sbData.properties.length} properties`);
    }

    // 3. Sync Farmland
    if (Array.isArray(sbData.farmland) && sbData.farmland.length > 0) {
      const currentF = Array.isArray(db.farmland) ? db.farmland : [];
      sbData.farmland.forEach(item => {
        if (!currentF.some(f => f.id === item.id || (f.title && item.title && f.title.toLowerCase().trim() === item.title.toLowerCase().trim()))) {
          currentF.push(item);
        }
      });
      db.farmland = currentF;
      db.lb_farmland_data = currentF;
      updated = true;
    }

    // 4. Sync Site Tours / Leads
    if (Array.isArray(sbData.siteTours) && sbData.siteTours.length > 0) {
      const currentT = Array.isArray(db.siteTours) ? db.siteTours : [];
      sbData.siteTours.forEach(item => {
        const idx = currentT.findIndex(t => t.id === item.id);
        if (idx !== -1) {
          currentT[idx] = { ...currentT[idx], ...item };
        } else {
          currentT.unshift(item);
        }
      });
      db.siteTours = currentT;
      db.lb_site_tours_data = currentT;
      updated = true;
      console.log(`⚡ Supabase Live Sync: Loaded ${sbData.siteTours.length} customer site tour leads`);
    }

    // 5. Sync Interiors & Poojas
    if (Array.isArray(sbData.interiors) && sbData.interiors.length > 0) {
      db.interiors = sbData.interiors;
      db.lb_interior_consultations = sbData.interiors;
      updated = true;
    }
    if (Array.isArray(sbData.poojas) && sbData.poojas.length > 0) {
      db.poojas = sbData.poojas;
      db.lb_griha_pravesh_bookings = sbData.poojas;
      updated = true;
    }

    if (updated) {
      writeDB(db);
      console.log('✅ Supabase Master Cloud Sync complete.');
    }
  } catch (err) {
    console.warn('⚠️ Supabase initial load notice:', err.message);
  }
}
setTimeout(loadSupabaseOnStartup, 1000);

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

  // Dedicated DELETE Endpoint for properties, farmland, new projects, leads
  if (req.method === 'DELETE' || pathname.startsWith('/api/property/') || pathname.startsWith('/api/properties/') || pathname.startsWith('/api/delete/')) {
    const id = decodeURIComponent(pathname.split('/').pop());
    const db = readDB();
    
    // Remove from all property lists
    if (Array.isArray(db.properties)) {
      db.properties = db.properties.filter(p => p.id !== id && (p.title || p.name || '').toLowerCase().trim() !== id.toLowerCase().trim());
      db.lb_properties_data = db.properties;
    }
    if (Array.isArray(db.farmland)) {
      db.farmland = db.farmland.filter(f => f.id !== id && (f.title || f.name || '').toLowerCase().trim() !== id.toLowerCase().trim());
      db.lb_farmland_data = db.farmland;
    }
    if (Array.isArray(db.newProjects)) {
      db.newProjects = db.newProjects.filter(np => np.id !== id && (np.title || np.name || '').toLowerCase().trim() !== id.toLowerCase().trim());
      db.lb_new_projects_data = db.newProjects;
    }
    if (Array.isArray(db.siteTours)) {
      db.siteTours = db.siteTours.filter(st => st.id !== id);
      db.lb_site_tours_data = db.siteTours;
    }
    writeDB(db);

    // Delete directly from Supabase Cloud
    deleteFromSupabase('properties', id).catch(() => {});
    deleteFromSupabase('farmland', id).catch(() => {});
    deleteFromSupabase('new_projects', id).catch(() => {});
    deleteFromSupabase('site_tours', id).catch(() => {});

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, deletedId: id, db: readDB() }));
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
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body);
          const db = readDB();
          let isSupabaseSynced = false;
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
            // Real-time Simultaneous Sync to Supabase Cloud
            try {
              const res = await syncToSupabase(dbKey, payload.data);
              isSupabaseSynced = Boolean(res);
              if (res) console.log(`☁️ Synced ${payload.data.length} records of ${dbKey} simultaneously to Supabase Cloud`);
            } catch (err) {
              console.warn(`⚠️ Supabase sync warning for ${dbKey}:`, err.message);
            }

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
            for (const k of Object.keys(payload)) {
              await syncToSupabase(k, payload[k]).catch(() => {});
            }
            isSupabaseSynced = true;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, supabaseSynced: isSupabaseSynced, db: readDB() }));
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
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    const pubPath = path.join(__dirname, 'public', pathname);
    if (fs.existsSync(pubPath) && fs.statSync(pubPath).isFile()) {
      filePath = pubPath;
    }
  }

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
