/**
 * LAND & BEYOND REAL ESTATE & AGRO PLATFORM
 * Supabase & PostgreSQL Database Client Interface
 *
 * File: supabase-client.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zwmvlhsfcezciegbmasp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_HvyGX56IRzn_NNmiibwtng_dpDJnbQe';
const DATABASE_URL = process.env.DATABASE_URL || '';

let supabase = null;
let pgPool = null;
let isSupabaseConnected = false;
let isPgConnected = false;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    supabase.from('properties').select('id').limit(1).then(({ error }) => {
      if (error && (error.message.includes('Invalid API key') || error.message.includes('JWT') || error.code === '401')) {
        console.warn(`⚠️ Supabase auth notice (Invalid Key): ${error.message}`);
        isSupabaseConnected = false;
      } else {
        isSupabaseConnected = true;
        console.log(`⚡ Supabase Cloud Connected successfully!`);
      }
    }).catch(() => { isSupabaseConnected = true; });
  } catch (err) {
    console.warn(`⚠️ Supabase init warning: ${err.message}`);
    isSupabaseConnected = false;
  }
}

// 2. Initialize Direct PostgreSQL Connection Pool
if (DATABASE_URL) {
  try {
    pgPool = new Pool({
      connectionString: DATABASE_URL,
      ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });

    pgPool.connect((err, client, release) => {
      if (err) {
        console.warn(`⚠️ PostgreSQL connection notice: ${err.message}`);
        isPgConnected = false;
      } else {
        isPgConnected = true;
        console.log(`🐘 PostgreSQL Database Connected successfully`);
        release();
      }
    });
  } catch (err) {
    console.warn(`⚠️ PostgreSQL pool init warning: ${err.message}`);
  }
}

/**
 * Get Supabase Client Instance
 */
function getSupabase() {
  return supabase;
}

/**
 * Get PostgreSQL Pool Instance
 */
function getPgPool() {
  return pgPool;
}

/**
 * Check Connection Status
 */
function getDbStatus() {
  return {
    supabaseConfigured: Boolean(SUPABASE_URL && SUPABASE_KEY),
    supabaseConnected: isSupabaseConnected,
    pgConfigured: Boolean(DATABASE_URL),
    pgConnected: isPgConnected
  };
}

/**
 * Synchronize Category Data to Supabase
 */
async function syncToSupabase(tableName, items) {
  if (!supabase || !Array.isArray(items)) return false;

  const tableMap = {
    'properties': 'properties',
    'lb_properties_data': 'properties',
    'newProjects': 'new_projects',
    'lb_new_projects_data': 'new_projects',
    'new_projects': 'new_projects',
    'farmland': 'farmland',
    'lb_farmland_data': 'farmland',
    'siteTours': 'site_tours',
    'site_tours': 'site_tours',
    'lb_site_tours_data': 'site_tours',
    'interiors': 'interiors',
    'lb_interiors_data': 'interiors',
    'lb_interior_consultations': 'interiors',
    'poojas': 'poojas',
    'lb_poojas_data': 'poojas',
    'lb_griha_pravesh_bookings': 'poojas'
  };

  const targetTable = tableMap[tableName] || tableName;

  try {
    const formatted = items.map((item, idx) => {
      const id = String(item.id || item._id || ('rec_' + Date.now() + '_' + idx));
      const title = String(item.title || item.name || 'Untitled');

      if (targetTable === 'properties') {
        return {
          id: id,
          title: title,
          category: item.category || 'Residential',
          location: item.location || '',
          builder: String(item.builder || item.developer || ''),
          price: String(item.price || item.startingPrice || ''),
          status: item.status || 'Active',
          metrics: String(item.metrics || ''),
          image_url: String(item.imageUrl || item.image_url || ''),
          data: item
        };
      } else if (targetTable === 'new_projects') {
        return {
          id: id,
          title: title,
          name: String(item.name || title),
          developer: String(item.developer || item.builder || ''),
          location: item.location || '',
          category: item.category || 'New Launch',
          price: String(item.price || item.startingPrice || ''),
          starting_price: String(item.startingPrice || item.price || ''),
          launch_date: String(item.date || item.launchDate || ''),
          description: String(item.description || item.summary || ''),
          highlights: String(item.badge || item.featureBadge || ''),
          status: item.status || 'Active',
          image_url: String(item.imageUrl || item.image_url || item.image || ''),
          data: item
        };
      } else if (targetTable === 'farmland') {
        return {
          id: id,
          title: title,
          location: item.location || '',
          category: item.category || 'Farmland',
          acres: String(item.acres || item.area || ''),
          soil_type: String(item.soilType || item.soil_type || ''),
          price: String(item.price || item.startingPrice || ''),
          status: item.status || 'Active',
          data: item
        };
      } else if (targetTable === 'site_tours') {
        return {
          id: id,
          name: String(item.name || item.customerName || 'Guest'),
          phone: String(item.phone || item.contact || ''),
          email: String(item.email || ''),
          visit_date: String(item.date || item.visitDate || item.preferredDate || ''),
          time_slot: String(item.slot || item.timeSlot || ''),
          status: item.status || 'New',
          data: item
        };
      } else if (targetTable === 'interiors') {
        return {
          id: id,
          name: String(item.name || item.clientName || item.customerName || 'Client'),
          phone: String(item.phone || item.contact || ''),
          property_type: String(item.propertyType || item.propType || ''),
          budget: String(item.budget || item.budgetTier || ''),
          status: item.status || 'New',
          data: item
        };
      } else if (targetTable === 'poojas') {
        return {
          id: id,
          name: String(item.name || item.customerName || 'Devotee'),
          phone: String(item.phone || item.contact || ''),
          pooja_type: String(item.packageTier || item.package || item.poojaType || ''),
          status: item.status || 'New',
          data: item
        };
      }

      return {
        id: id,
        title: title,
        data: item
      };
    });

    if (formatted.length > 0) {
      const { error } = await supabase.from(targetTable).upsert(formatted, { onConflict: 'id' });
      if (error) {
        console.warn(`⚠️ Supabase sync notice for table ${targetTable}: ${error.message}`);
        return false;
      }
      return true;
    }
  } catch (err) {
    console.warn(`⚠️ Supabase sync exception for ${targetTable}: ${err.message}`);
  }
  return false;
}

async function fetchFromSupabase(tableName) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn(`⚠️ Supabase fetch notice for ${tableName}: ${error.message}`);
      return null;
    }
    return data;
  } catch (err) {
    console.warn(`⚠️ Supabase fetch exception for ${tableName}: ${err.message}`);
    return null;
  }
}

/**
 * Fetch full consolidated database directly from Supabase Cloud
 * Used across Localhost, Subdomain, and Official Domain for 100% unified source of truth
 */
async function fetchFullSupabaseDB() {
  if (!supabase) return null;
  try {
    const [pRes, nRes, fRes, tRes, iRes, pjRes] = await Promise.all([
      supabase.from('properties').select('*').limit(100),
      supabase.from('new_projects').select('*').limit(100),
      supabase.from('farmland').select('*').limit(100),
      supabase.from('site_tours').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('interiors').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('poojas').select('*').order('created_at', { ascending: false }).limit(100)
    ]);

    const result = {};

    if (pRes && pRes.data) {
      result.properties = pRes.data.map(r => {
        const d = r.data || {};
        return {
          id: r.id,
          title: r.title || d.title || 'Untitled Property',
          builder: r.builder || d.builder || '',
          location: r.location || d.location || '',
          category: r.category || d.category || 'Residential',
          price: r.price || d.price || '',
          priceLabel: d.priceLabel || r.price || '',
          metrics: r.metrics || d.metrics || '',
          status: r.status || d.status || 'Active',
          approvalType: d.approvalType || 'DTCP Approved',
          imageUrl: r.image_url || d.imageUrl || d.image || '',
          image: r.image_url || d.imageUrl || d.image || '',
          ...d
        };
      });
    }

    if (nRes && nRes.data) {
      result.newProjects = nRes.data.map(r => {
        const d = r.data || {};
        return {
          id: r.id,
          title: r.title || r.name || d.title || 'Untitled Launch',
          name: r.name || r.title || d.name || 'Untitled Launch',
          builder: r.builder || r.developer || d.builder || '',
          developer: r.developer || r.builder || d.developer || '',
          location: r.location || d.location || '',
          category: r.category || d.category || 'New Launch',
          price: r.price || r.starting_price || d.price || '',
          startingPrice: r.starting_price || r.price || d.startingPrice || '',
          date: r.launch_date || d.date || 'Launching Soon',
          description: r.description || d.description || '',
          summary: r.description || d.summary || '',
          badge: r.highlights || d.badge || '★ Pre-Launch Offer',
          status: r.status || d.status || 'Active',
          imageUrl: r.image_url || d.imageUrl || d.image || '',
          image: r.image_url || d.imageUrl || d.image || '',
          ...d
        };
      });
    }

    if (fRes && fRes.data) {
      result.farmland = fRes.data.map(r => r.data || r);
    }

    if (tRes && tRes.data) {
      result.siteTours = tRes.data.map(r => {
        const d = r.data || {};
        return {
          id: r.id,
          name: r.name || d.name || d.customerName || 'Customer',
          customerName: r.name || d.customerName || d.name || 'Customer',
          phone: r.phone || d.phone || d.contact || '',
          contact: r.phone || d.contact || d.phone || '',
          email: r.email || d.email || '',
          date: r.visit_date || d.date || '',
          preferredDate: d.preferredDate || r.visit_date || '',
          timeSlot: r.time_slot || d.timeSlot || '',
          status: r.status || d.status || 'New Lead',
          propertyTitle: d.propertyTitle || d.propertyRequested || '',
          propertyRequested: d.propertyRequested || d.propertyTitle || '',
          pickupNeeded: d.pickupNeeded || false,
          pickupAddress: d.pickupAddress || '',
          createdAt: r.created_at || d.createdAt || new Date().toISOString(),
          ...d
        };
      });
    }

    if (iRes && iRes.data) {
      result.interiors = iRes.data.map(r => r.data || r);
    }

    if (pjRes && pjRes.data) {
      result.poojas = pjRes.data.map(r => r.data || r);
    }

    return result;
  } catch (err) {
    console.warn('⚠️ Supabase full DB fetch notice:', err.message);
    return null;
  }
}

async function deleteFromSupabase(tableName, id) {
  if (!supabase || !id) return false;
  const tableMap = {
    'properties': 'properties',
    'lb_properties_data': 'properties',
    'newProjects': 'new_projects',
    'lb_new_projects_data': 'new_projects',
    'new_projects': 'new_projects',
    'farmland': 'farmland',
    'lb_farmland_data': 'farmland',
    'siteTours': 'site_tours',
    'site_tours': 'site_tours',
    'lb_site_tours_data': 'site_tours',
    'interiors': 'interiors',
    'lb_interiors_data': 'interiors',
    'lb_interior_consultations': 'interiors',
    'poojas': 'poojas',
    'lb_poojas_data': 'poojas',
    'lb_griha_pravesh_bookings': 'poojas'
  };
  const targetTable = tableMap[tableName] || tableName;
  try {
    const { error } = await supabase.from(targetTable).delete().eq('id', String(id));
    if (error) {
      console.warn(`⚠️ Supabase delete notice for ${targetTable}: ${error.message}`);
      return false;
    }
    console.log(`🗑️ Deleted record ${id} from Supabase table ${targetTable}`);
    return true;
  } catch (err) {
    console.warn(`⚠️ Supabase delete exception: ${err.message}`);
    return false;
  }
}

module.exports = {
  getSupabase,
  getPgPool,
  getDbStatus,
  syncToSupabase,
  deleteFromSupabase,
  fetchFromSupabase,
  fetchFullSupabaseDB,
  SUPABASE_URL,
  SUPABASE_KEY,
  DATABASE_URL
};

