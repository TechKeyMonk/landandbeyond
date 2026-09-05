const { deleteFromSupabase, getSupabase } = require('../supabase-client');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204).end();
    return;
  }

  // Extract ID from query param (e.g. ?id=xyz or Vercel dynamic route) or from URL path
  let id = req.query && req.query.id;
  if (!id && req.url) {
    const cleanUrl = req.url.split('?')[0];
    id = cleanUrl.split('/').filter(Boolean).pop();
    if (id === 'property' || id === 'properties' || id === 'delete') {
      id = null;
    }
  }

  if (id) {
    id = decodeURIComponent(id);
  }

  if (!id) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing record id to delete' }));
    return;
  }

  try {
    // Delete across all Supabase tables
    await Promise.all([
      deleteFromSupabase('properties', id),
      deleteFromSupabase('farmland', id),
      deleteFromSupabase('new_projects', id),
      deleteFromSupabase('site_tours', id)
    ]);

    // Also remove from /tmp/db.json cache if exists (Vercel runtime cache)
    try {
      const tmpPath = path.join('/tmp', 'db.json');
      if (fs.existsSync(tmpPath)) {
        const tmpDb = JSON.parse(fs.readFileSync(tmpPath, 'utf8'));
        if (Array.isArray(tmpDb.properties)) {
          tmpDb.properties = tmpDb.properties.filter(p => p.id !== id);
          tmpDb.lb_properties_data = tmpDb.properties;
        }
        if (Array.isArray(tmpDb.farmland)) {
          tmpDb.farmland = tmpDb.farmland.filter(f => f.id !== id);
          tmpDb.lb_farmland_data = tmpDb.farmland;
        }
        if (Array.isArray(tmpDb.newProjects)) {
          tmpDb.newProjects = tmpDb.newProjects.filter(np => np.id !== id);
          tmpDb.lb_new_projects_data = tmpDb.newProjects;
        }
        fs.writeFileSync(tmpPath, JSON.stringify(tmpDb, null, 2), 'utf8');
      }
    } catch(e) {}

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, deletedId: id }));
  } catch(err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
};
