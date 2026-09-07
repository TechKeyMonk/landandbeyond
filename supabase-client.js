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
// Use Service Role Key for server-side operations if available, fallback to Publishable/Anon Key
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_HvyGX56IRzn_NNmiibwtng_dpDJnbQe';
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
        // Ensure storage bucket exists
        ensureStorageBucket().catch(() => {});
      }
    }).catch(() => { isSupabaseConnected = true; });
  } catch (err) {
    console.warn(`⚠️ Supabase init warning: ${err.message}`);
    isSupabaseConnected = false;
  }
}

// 2. Initialize Direct PostgreSQL Connection Pool
if (DATABASE_URL && !DATABASE_URL.includes('localhost:5432')) {
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
 * Ensure property-images storage bucket is available
 */
async function ensureStorageBucket() {
  if (!supabase) return;
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const hasBucket = Array.isArray(buckets) && buckets.some(b => b.name === 'property-images');
    if (!hasBucket) {
      const { error } = await supabase.storage.createBucket('property-images', { public: true });
      if (error) {
        console.warn('⚠️ Notice creating property-images bucket:', error.message);
      } else {
        console.log('📦 Created public storage bucket: property-images');
      }
    }
  } catch (err) {
    console.warn('⚠️ Bucket verification notice:', err.message);
  }
}

/**
 * Upload a Base64 image data string directly to Supabase Storage.
 * Returns public URL if successful, otherwise falls back to original string.
 */
async function uploadBase64ImageToSupabase(base64Str, prefix = 'prop') {
  if (!supabase || !base64Str || typeof base64Str !== 'string' || !base64Str.startsWith('data:image/')) {
    return base64Str;
  }

  try {
    const matches = base64Str.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length < 3) return base64Str;

    const rawExt = matches[1].toLowerCase();
    const ext = rawExt === 'jpeg' ? 'jpg' : (rawExt === 'svg+xml' ? 'svg' : rawExt);
    const mimeType = rawExt === 'svg+xml' ? 'image/svg+xml' : `image/${rawExt}`;
    const buffer = Buffer.from(matches[2], 'base64');
    const safePrefix = String(prefix || 'item').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${safePrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

    const { data, error } = await supabase.storage.from('property-images').upload(fileName, buffer, {
      contentType: mimeType,
      upsert: true
    });

    if (error) {
      console.warn(`⚠️ Supabase Storage upload notice for ${fileName}:`, error.message);
      return base64Str;
    }

    const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(fileName);
    if (urlData && urlData.publicUrl) {
      console.log(`🖼️ Uploaded image to Supabase Storage: ${fileName}`);
      return urlData.publicUrl;
    }
    return base64Str;
  } catch (err) {
    console.warn('⚠️ Base64 upload exception:', err.message);
    return base64Str;
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
    pgConfigured: Boolean(DATABASE_URL && !DATABASE_URL.includes('localhost:5432')),
    pgConnected: isPgConnected
  };
}

/**
 * Clean data object so it does NOT store giant Base64 strings or duplicate data objects
 */
function sanitizeItemPayload(item, cleanImageUrl) {
  if (!item || typeof item !== 'object') return item;
  const clean = { ...item };
  // Remove recursive or huge data properties
  delete clean.data;

  // Use clean image URL
  if (cleanImageUrl && typeof cleanImageUrl === 'string' && !cleanImageUrl.startsWith('data:')) {
    clean.imageUrl = cleanImageUrl;
    clean.image = cleanImageUrl;
    clean.image_url = cleanImageUrl;
  } else {
    // If still base64, don't duplicate it in multiple keys
    if (clean.imageUrl && clean.imageUrl.startsWith('data:')) {
      delete clean.image;
      delete clean.image_url;
    }
  }

  return clean;
}

const TABLE_MAP = {
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

/**
 * Delete Record Directly From Supabase Cloud Table
 */
async function deleteFromSupabase(tableName, id) {
  if (!supabase || !id) return false;
  const targetTable = TABLE_MAP[tableName] || tableName;
  try {
    const { error } = await supabase.from(targetTable).delete().eq('id', String(id));
    if (error) {
      console.warn(`⚠️ Supabase delete warning for ${targetTable} [${id}]:`, error.message);
      return false;
    }
    console.log(`🗑️ Deleted record ${id} from Supabase ${targetTable}`);
    return true;
  } catch (err) {
    console.warn(`⚠️ Supabase delete exception for ${targetTable}:`, err.message);
    return false;
  }
}

/**
 * Synchronize Category Data to Supabase
 */
async function syncToSupabase(tableName, items) {
  if (!supabase || !Array.isArray(items)) return false;

  const targetTable = TABLE_MAP[tableName];
  if (!targetTable) return false;

  try {
    const formatted = [];
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      if (!item || typeof item !== 'object') continue;

      const id = String(item.id || item._id || ('rec_' + Date.now() + '_' + idx));
      const title = String(item.title || item.name || 'Untitled');
      
      let rawImage = item.imageUrl || item.image || item.image_url || '';
      let cleanImage = rawImage;

      // Migrate Base64 image to Supabase Storage on the fly
      if (typeof rawImage === 'string' && rawImage.startsWith('data:image/')) {
        try {
          cleanImage = await uploadBase64ImageToSupabase(rawImage, `${targetTable}_${id}`);
          // Update item in place
          item.imageUrl = cleanImage;
          item.image = cleanImage;
          item.image_url = cleanImage;
        } catch (imgErr) {
          console.warn('⚠️ Image migration notice during sync:', imgErr.message);
        }
      }

      // Migrate any gallery images in images array
      if (Array.isArray(item.images)) {
        for (let j = 0; j < item.images.length; j++) {
          const subImg = item.images[j];
          if (typeof subImg === 'string' && subImg.startsWith('data:image/')) {
            try {
              const uploadedSub = await uploadBase64ImageToSupabase(subImg, `${targetTable}_${id}_gallery_${j}`);
              if (uploadedSub && !uploadedSub.startsWith('data:')) {
                item.images[j] = uploadedSub;
              }
            } catch (err) {
              console.warn('⚠️ Gallery image upload notice:', err.message);
            }
          }
        }
      }

      const cleanData = sanitizeItemPayload(item, cleanImage);

      if (targetTable === 'properties') {
        formatted.push({
          id: id,
          title: title,
          category: item.category || 'Residential',
          location: item.location || '',
          builder: String(item.builder || item.developer || ''),
          price: String(item.price || item.startingPrice || ''),
          status: item.status || 'Active',
          metrics: String(item.metrics || ''),
          image_url: cleanImage,
          data: cleanData
        });
      } else if (targetTable === 'new_projects') {
        formatted.push({
          id: id,
          title: title,
          name: String(item.name || title),
          developer: String(item.developer || item.builder || ''),
          location: item.location || '',
          category: item.category || 'New Launch',
          price: String(item.price || item.startingPrice || ''),
          starting_price: String(item.startingPrice || item.price || ''),
          description: String(item.description || item.summary || ''),
          status: item.status || 'Active',
          image_url: cleanImage,
          data: cleanData
        });
      } else if (targetTable === 'farmland') {
        formatted.push({
          id: id,
          title: title,
          location: item.location || '',
          category: item.category || 'Farmland',
          acres: String(item.acres || item.area || ''),
          soil_type: String(item.soilType || item.soil_type || ''),
          price: String(item.price || item.startingPrice || ''),
          status: item.status || 'Active',
          data: cleanData
        });
      } else if (targetTable === 'site_tours') {
        formatted.push({
          id: id,
          name: String(item.name || item.customerName || 'Guest'),
          phone: String(item.phone || item.contact || ''),
          email: String(item.email || ''),
          visit_date: String(item.date || item.visitDate || item.preferredDate || ''),
          time_slot: String(item.slot || item.timeSlot || ''),
          status: item.status || 'New',
          data: cleanData
        });
      } else if (targetTable === 'interiors') {
        formatted.push({
          id: id,
          name: String(item.name || item.clientName || item.customerName || 'Client'),
          phone: String(item.phone || item.contact || ''),
          property_type: String(item.propertyType || item.propType || ''),
          budget: String(item.budget || item.budgetTier || ''),
          status: item.status || 'New',
          data: cleanData
        });
      } else if (targetTable === 'poojas') {
        formatted.push({
          id: id,
          name: String(item.name || item.customerName || 'Devotee'),
          phone: String(item.phone || item.contact || ''),
          pooja_type: String(item.packageTier || item.package || item.poojaType || ''),
          status: item.status || 'New',
          data: cleanData
        });
      } else {
        formatted.push({
          id: id,
          title: title,
          data: cleanData
        });
      }
    }

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
 * Master source of truth for Properties, New Projects, Farmland, Leads, Interiors, Poojas
 */
async function fetchFullSupabaseDB() {
  if (!supabase) return null;
  try {
    const [pRes, nRes, fRes, tRes, iRes, pjRes] = await Promise.all([
      supabase.from('properties').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('new_projects').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('farmland').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('site_tours').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('interiors').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('poojas').select('*').order('created_at', { ascending: false }).limit(500)
    ]);

    const result = {};

    if (pRes && pRes.data) {
      result.properties = pRes.data.map(r => {
        const d = (r.data && typeof r.data === 'object') ? { ...r.data } : {};
        delete d.data;

        // Determine best image URL (prefer clean URL from column or data)
        const primaryImg = (r.image_url && !r.image_url.startsWith('data:')) ? r.image_url : (d.imageUrl || d.image || r.image_url || '');

        // Sanitize d so it doesn't re-inject huge base64
        if (d.imageUrl && d.imageUrl.startsWith('data:') && primaryImg && !primaryImg.startsWith('data:')) {
          d.imageUrl = primaryImg;
        }
        if (d.image && d.image.startsWith('data:') && primaryImg && !primaryImg.startsWith('data:')) {
          d.image = primaryImg;
        }

        return {
          id: r.id,
          title: r.title || d.title || 'Untitled Property',
          builder: r.builder || d.builder || '',
          location: r.location || d.location || '',
          category: r.category || d.category || 'Residential',
          price: r.price || d.price || '',
          priceLabel: d.priceLabel || r.price_label || r.price || '',
          metrics: r.metrics || d.metrics || '',
          status: r.status || d.status || 'Active',
          approvalType: d.approvalType || r.approval_type || r.approval || 'DTCP Approved',
          createdAt: r.created_at || d.createdAt || new Date().toISOString(),
          ...d,
          imageUrl: primaryImg,
          image: primaryImg
        };
      });
    }

    if (nRes && nRes.data) {
      result.newProjects = nRes.data.map(r => {
        const d = (r.data && typeof r.data === 'object') ? { ...r.data } : {};
        delete d.data;

        const primaryImg = (r.image_url && !r.image_url.startsWith('data:')) ? r.image_url : (d.imageUrl || d.image || r.image_url || '');
        if (d.imageUrl && d.imageUrl.startsWith('data:') && primaryImg && !primaryImg.startsWith('data:')) {
          d.imageUrl = primaryImg;
        }
        if (d.image && d.image.startsWith('data:') && primaryImg && !primaryImg.startsWith('data:')) {
          d.image = primaryImg;
        }

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
          createdAt: r.created_at || d.createdAt || new Date().toISOString(),
          ...d,
          imageUrl: primaryImg,
          image: primaryImg
        };
      });
    }

    if (fRes && fRes.data) {
      result.farmland = fRes.data.map(r => {
        const d = (r.data && typeof r.data === 'object') ? { ...r.data } : {};
        delete d.data;

        const primaryImg = (r.image_url && !r.image_url.startsWith('data:')) ? r.image_url : (d.imageUrl || d.image || r.image_url || '');
        if (d.imageUrl && d.imageUrl.startsWith('data:') && primaryImg && !primaryImg.startsWith('data:')) {
          d.imageUrl = primaryImg;
        }
        if (d.image && d.image.startsWith('data:') && primaryImg && !primaryImg.startsWith('data:')) {
          d.image = primaryImg;
        }

        return {
          id: r.id,
          title: r.title || d.title || d.name || 'Untitled Farmland',
          location: r.location || d.location || '',
          category: r.category || d.category || 'Farmland',
          acres: r.acres || d.acres || d.acreCount || '',
          acreCount: r.acres || d.acreCount || d.acres || '',
          soilType: r.soil_type || d.soilType || d.soil_type || '',
          soil_type: r.soil_type || d.soilType || '',
          price: r.price || d.price || '',
          priceLabel: d.priceLabel || r.price_label || r.price || '',
          status: r.status || d.status || 'Active',
          createdAt: r.created_at || d.createdAt || new Date().toISOString(),
          ...d,
          imageUrl: primaryImg,
          image: primaryImg
        };
      });
    }

    if (tRes && tRes.data) {
      result.siteTours = tRes.data.map(r => {
        const d = (r.data && typeof r.data === 'object') ? { ...r.data } : {};
        delete d.data;
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
      result.interiors = iRes.data.map(r => {
        const d = (r.data && typeof r.data === 'object') ? { ...r.data } : {};
        delete d.data;
        return {
          id: r.id,
          name: r.name || d.name || d.clientName || 'Client',
          phone: r.phone || d.phone || d.contact || '',
          propertyType: r.property_type || d.propertyType || '',
          budget: r.budget || d.budget || '',
          status: r.status || d.status || 'New',
          createdAt: r.created_at || d.createdAt || new Date().toISOString(),
          ...d
        };
      });
    }

    if (pjRes && pjRes.data) {
      result.poojas = pjRes.data.map(r => {
        const d = (r.data && typeof r.data === 'object') ? { ...r.data } : {};
        delete d.data;
        return {
          id: r.id,
          name: r.name || d.name || d.customerName || 'Devotee',
          phone: r.phone || d.phone || d.contact || '',
          poojaType: r.pooja_type || d.poojaType || d.packageTier || '',
          status: r.status || d.status || 'New',
          createdAt: r.created_at || d.createdAt || new Date().toISOString(),
          ...d
        };
      });
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

/**
 * Migration helper to migrate all existing Base64 images from db.json into Supabase Storage
 */
async function migrateExistingBase64InDB(db) {
  if (!supabase || !db) return { migrated: 0, errors: [] };
  let migratedCount = 0;
  const errors = [];

  const collections = ['properties', 'newProjects', 'farmland'];
  for (const col of collections) {
    const items = db[col];
    if (!Array.isArray(items)) continue;

    for (const item of items) {
      const img = item.imageUrl || item.image || item.image_url;
      if (typeof img === 'string' && img.startsWith('data:image/')) {
        try {
          const publicUrl = await uploadBase64ImageToSupabase(img, `${col}_${item.id}`);
          if (publicUrl && !publicUrl.startsWith('data:')) {
            item.imageUrl = publicUrl;
            item.image = publicUrl;
            item.image_url = publicUrl;
            migratedCount++;
            console.log(`✅ Migrated Base64 image for ${item.id} (${item.title || item.name}) -> ${publicUrl}`);
          }
        } catch (err) {
          errors.push({ id: item.id, error: err.message });
        }
      }

      // Also migrate any gallery images in images array
      if (Array.isArray(item.images)) {
        for (let j = 0; j < item.images.length; j++) {
          const subImg = item.images[j];
          if (typeof subImg === 'string' && subImg.startsWith('data:image/')) {
            try {
              const uploadedSub = await uploadBase64ImageToSupabase(subImg, `${col}_${item.id}_gallery_${j}`);
              if (uploadedSub && !uploadedSub.startsWith('data:')) {
                item.images[j] = uploadedSub;
                migratedCount++;
                console.log(`✅ Migrated gallery image for ${item.id}[${j}] -> ${uploadedSub}`);
              }
            } catch (err) {
              errors.push({ id: item.id, error: err.message });
            }
          }
        }
      }
    }
  }

  return { migrated: migratedCount, errors };
}

module.exports = {
  getSupabase,
  getPgPool,
  getDbStatus,
  syncToSupabase,
  deleteFromSupabase,
  fetchFromSupabase,
  fetchFullSupabaseDB,
  uploadBase64ImageToSupabase,
  migrateExistingBase64InDB,
  ensureStorageBucket,
  SUPABASE_URL,
  SUPABASE_KEY,
  DATABASE_URL
};
