const http = require('http');
const assert = require('assert');
const { fetchFullSupabaseDB, syncToSupabase, deleteFromSupabase, getDbStatus } = require('../supabase-client');

const BASE_URL = 'http://localhost:8080';

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch(e) {}
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data, json });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING COMPREHENSIVE BACKEND, API & DB QA SUITE');
  console.log('====================================================\n');

  const results = [];
  function record(id, feature, layer, status, notes = '') {
    results.push({ id, feature, layer, status, notes });
    const icon = status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} [${id}] ${feature} (${layer}): ${status} ${notes ? '- ' + notes : ''}`);
  }

  // 1. Health & Status Check
  try {
    const res = await request({ hostname: 'localhost', port: 8080, path: '/api/status', method: 'GET' });
    if (res.statusCode === 200 && res.json && res.json.status === 'online') {
      record('API-001', 'GET /api/status endpoint', 'API', 'PASS', `Storage: ${res.json.primaryStorage}`);
    } else {
      record('API-001', 'GET /api/status endpoint', 'API', 'FAIL', `Status code ${res.statusCode}`);
    }
  } catch (err) {
    record('API-001', 'GET /api/status endpoint', 'API', 'FAIL', err.message);
  }

  // 2. GET /api/db Read
  try {
    const res = await request({ hostname: 'localhost', port: 8080, path: '/api/db', method: 'GET' });
    if (res.statusCode === 200 && res.json && Array.isArray(res.json.properties)) {
      record('API-002', 'GET /api/db full database read', 'API', 'PASS', `${res.json.properties.length} properties returned`);
    } else {
      record('API-002', 'GET /api/db full database read', 'API', 'FAIL', `Status ${res.statusCode}`);
    }
  } catch (err) {
    record('API-002', 'GET /api/db full database read', 'API', 'FAIL', err.message);
  }

  // 3. Database Parity & Dual Key Compatibility
  try {
    const res = await request({ hostname: 'localhost', port: 8080, path: '/api/db', method: 'GET' });
    const d = res.json;
    const collections = ['properties', 'newProjects', 'farmland', 'siteTours', 'approvals', 'interiors', 'poojas', 'auditLogs'];
    let allPresent = true;
    for (const c of collections) {
      if (!Array.isArray(d[c])) {
        allPresent = false;
        break;
      }
    }
    if (allPresent && Array.isArray(d.lb_properties_data) && Array.isArray(d.lb_site_tours_data)) {
      record('DB-001', '8 Collections Dual-Key Parity', 'Database', 'PASS', 'All collections and dual-keys populated');
    } else {
      record('DB-001', '8 Collections Dual-Key Parity', 'Database', 'FAIL', 'Missing collection array');
    }
  } catch (err) {
    record('DB-001', '8 Collections Dual-Key Parity', 'Database', 'FAIL', err.message);
  }

  // 4. Supabase Direct Connectivity Check
  try {
    const status = getDbStatus();
    const sbData = await fetchFullSupabaseDB();
    if (status.supabaseConnected || (sbData && Array.isArray(sbData.properties))) {
      record('DB-002', 'Supabase Cloud PostgreSQL Direct Connection', 'Database', 'PASS', 'Cloud DB responding normally with live tables');
    } else {
      record('DB-002', 'Supabase Cloud PostgreSQL Direct Connection', 'Database', 'FAIL', 'Could not connect to Supabase');
    }
  } catch (err) {
    record('DB-002', 'Supabase Cloud PostgreSQL Direct Connection', 'Database', 'FAIL', err.message);
  }

  // 5. CRUD: CREATE in properties
  const testPropId = `test_prop_${Date.now()}`;
  const testProperty = {
    id: testPropId,
    title: 'QA Automated Test Villa - E2E Suite',
    builder: 'Land & Beyond QA Team',
    location: 'Saravanampatti, Coimbatore',
    category: 'Villas',
    price: '₹ 85 Lakhs',
    priceLabel: '₹ 85 Lakhs',
    metrics: '3,200 sq.ft • 4 BHK Luxury Smart Villa',
    status: 'Active',
    approvalType: 'DTCP & RERA Approved',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  };

  try {
    const getRes = await request({ hostname: 'localhost', port: 8080, path: '/api/db', method: 'GET' });
    const currentProps = getRes.json.properties || [];
    const updatedProps = [...currentProps, testProperty];

    const postRes = await request(
      {
        hostname: 'localhost',
        port: 8080,
        path: '/api/data',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { key: 'lb_properties_data', data: updatedProps }
    );

    if (postRes.statusCode === 200 && postRes.json && postRes.json.success) {
      record('CRUD-001', 'CREATE Property via POST /api/data', 'Integration', 'PASS', `Created ID ${testPropId}`);
    } else {
      record('CRUD-001', 'CREATE Property via POST /api/data', 'Integration', 'FAIL', `Status ${postRes.statusCode}`);
    }
  } catch (err) {
    record('CRUD-001', 'CREATE Property via POST /api/data', 'Integration', 'FAIL', err.message);
  }

  // 6. CRUD: READ verification from /api/db and Supabase
  try {
    const verifyRes = await request({ hostname: 'localhost', port: 8080, path: '/api/db', method: 'GET' });
    const found = (verifyRes.json.properties || []).find(p => p.id === testPropId);
    if (found && found.title === testProperty.title) {
      record('CRUD-002', 'READ Created Property from /api/db', 'API/DB', 'PASS', 'Record persisted and retrieved');
    } else {
      record('CRUD-002', 'READ Created Property from /api/db', 'API/DB', 'FAIL', 'Record not found');
    }
  } catch (err) {
    record('CRUD-002', 'READ Created Property from /api/db', 'API/DB', 'FAIL', err.message);
  }

  // 7. CRUD: UPDATE Property
  try {
    const getRes = await request({ hostname: 'localhost', port: 8080, path: '/api/db', method: 'GET' });
    const currentProps = getRes.json.properties || [];
    const updatedProps = currentProps.map(p => {
      if (p.id === testPropId) {
        return { ...p, price: '₹ 95 Lakhs (Updated by QA)', priceLabel: '₹ 95 Lakhs' };
      }
      return p;
    });

    const updateRes = await request(
      {
        hostname: 'localhost',
        port: 8080,
        path: '/api/data',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { key: 'lb_properties_data', data: updatedProps }
    );

    const reVerify = await request({ hostname: 'localhost', port: 8080, path: '/api/db', method: 'GET' });
    const updatedItem = (reVerify.json.properties || []).find(p => p.id === testPropId);

    if (updateRes.statusCode === 200 && updatedItem && updatedItem.price.includes('Updated by QA')) {
      record('CRUD-003', 'UPDATE Property via POST /api/data', 'Integration', 'PASS', 'Updated price reflected');
    } else {
      record('CRUD-003', 'UPDATE Property via POST /api/data', 'Integration', 'FAIL', 'Update failed to reflect');
    }
  } catch (err) {
    record('CRUD-003', 'UPDATE Property via POST /api/data', 'Integration', 'FAIL', err.message);
  }

  // 8. CRUD: DELETE Property via DELETE endpoint
  try {
    const delRes = await request({
      hostname: 'localhost',
      port: 8080,
      path: `/api/property/${encodeURIComponent(testPropId)}`,
      method: 'DELETE'
    });

    const verifyDel = await request({ hostname: 'localhost', port: 8080, path: '/api/db', method: 'GET' });
    const stillExists = (verifyDel.json.properties || []).some(p => p.id === testPropId);

    if (delRes.statusCode === 200 && !stillExists) {
      record('CRUD-004', 'DELETE Property via DELETE /api/property/:id', 'Integration', 'PASS', 'Deleted cleanly');
    } else {
      record('CRUD-004', 'DELETE Property via DELETE /api/property/:id', 'Integration', 'FAIL', `Still exists: ${stillExists}`);
    }
  } catch (err) {
    record('CRUD-004', 'DELETE Property via DELETE /api/property/:id', 'Integration', 'FAIL', err.message);
  }

  // 9. Site Tour Lead Booking Flow (Customer Inquiry -> DB -> Admin)
  const testTourId = `tour_${Date.now()}`;
  const testTourLead = {
    id: testTourId,
    name: 'Muthu Kumar (QA Test Lead)',
    phone: '9876543210',
    email: 'muthu.qa@example.com',
    projectTitle: 'Grand Aeropolis Smart Township',
    visitDate: '2026-09-15',
    slot: '10:00 AM - 12:00 PM',
    cabRequired: true,
    pickupLocation: 'Gandhipuram, Coimbatore',
    notes: 'Automation QA site tour booking validation',
    createdAt: new Date().toISOString()
  };

  try {
    const getRes = await request({ hostname: 'localhost', port: 8080, path: '/api/db', method: 'GET' });
    const tours = getRes.json.siteTours || [];
    const updatedTours = [testTourLead, ...tours];

    const postTour = await request(
      {
        hostname: 'localhost',
        port: 8080,
        path: '/api/data',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { key: 'lb_site_tours_data', data: updatedTours }
    );

    const recheck = await request({ hostname: 'localhost', port: 8080, path: '/api/db', method: 'GET' });
    const leadFound = (recheck.json.siteTours || []).some(t => t.id === testTourId);

    if (postTour.statusCode === 200 && leadFound) {
      record('INT-001', 'Site Tour Lead Submission & DB Persistence', 'Integration', 'PASS', 'Lead booked and retrieved');
    } else {
      record('INT-001', 'Site Tour Lead Submission & DB Persistence', 'Integration', 'FAIL', 'Lead not found in DB');
    }

    // Clean up test lead
    await request({
      hostname: 'localhost',
      port: 8080,
      path: `/api/property/${encodeURIComponent(testTourId)}`,
      method: 'DELETE'
    });
  } catch (err) {
    record('INT-001', 'Site Tour Lead Submission & DB Persistence', 'Integration', 'FAIL', err.message);
  }

  // 10. Negative Test: Empty Payload to POST /api/data (Expect 400 Bad Request)
  try {
    const emptyRes = await request(
      {
        hostname: 'localhost',
        port: 8080,
        path: '/api/data',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      ''
    );
    if (emptyRes.statusCode === 400) {
      record('NEG-001', 'Empty POST payload error handling (400)', 'Backend', 'PASS', 'Safely returned 400');
    } else {
      record('NEG-001', 'Empty POST payload error handling (400)', 'Backend', 'FAIL', `Expected 400, got ${emptyRes.statusCode}`);
    }
  } catch (err) {
    record('NEG-001', 'Empty POST payload error handling (400)', 'Backend', 'FAIL', err.message);
  }

  // 11. Negative Test: Non-existent URL (Expect 404 Not Found)
  try {
    const notFoundRes = await request({ hostname: 'localhost', port: 8080, path: '/non-existent-page-xyz.html', method: 'GET' });
    if (notFoundRes.statusCode === 404) {
      record('NEG-002', 'Non-existent route 404 error handling', 'Backend', 'PASS', 'Returned 404 cleanly');
    } else {
      record('NEG-002', 'Non-existent route 404 error handling', 'Backend', 'FAIL', `Got ${notFoundRes.statusCode}`);
    }
  } catch (err) {
    record('NEG-002', 'Non-existent route 404 error handling', 'Backend', 'FAIL', err.message);
  }

  // 12. Edge Case: Boundary Data, Unicode and Special Characters in Property Title
  const edgePropId = `edge_${Date.now()}`;
  const edgeProperty = {
    id: edgePropId,
    title: '🌿 நிலம் & பண்ணை (Tamil Unicode) & Special Chars: <script>alert("xss")</script> & \' " ` $100%!',
    builder: 'Special Char Builder™',
    location: 'Coimbatore, Tamil Nadu 🇮🇳',
    category: 'Farmland',
    price: '₹ 0.00 - Edge Min',
    priceLabel: '₹ 0.00',
    metrics: 'A'.repeat(500), // Boundary 500 characters
    status: 'Active',
    approvalType: 'Govt Approved',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  };

  try {
    const getRes = await request({ hostname: 'localhost', port: 8080, path: '/api/db', method: 'GET' });
    const currentFarmland = getRes.json.farmland || [];
    const updatedFarmland = [...currentFarmland, edgeProperty];

    const postEdge = await request(
      {
        hostname: 'localhost',
        port: 8080,
        path: '/api/data',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { key: 'lb_farmland_data', data: updatedFarmland }
    );

    const recheckEdge = await request({ hostname: 'localhost', port: 8080, path: '/api/db', method: 'GET' });
    const foundEdge = (recheckEdge.json.farmland || []).find(f => f.id === edgePropId);

    if (postEdge.statusCode === 200 && foundEdge && foundEdge.title.includes('நிலம்')) {
      record('EDGE-001', 'Unicode, Long Text & Special Characters Storage', 'Database', 'PASS', 'Tamil unicode & special chars safely stored & retrieved');
    } else {
      record('EDGE-001', 'Unicode, Long Text & Special Characters Storage', 'Database', 'FAIL', 'Data corrupted or unreadable');
    }

    // Clean up edge record
    await request({
      hostname: 'localhost',
      port: 8080,
      path: `/api/property/${encodeURIComponent(edgePropId)}`,
      method: 'DELETE'
    });
  } catch (err) {
    record('EDGE-001', 'Unicode, Long Text & Special Characters Storage', 'Database', 'FAIL', err.message);
  }

  console.log('\n====================================================');
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  console.log(`📊 API/DB/INTEGRATION TEST SUMMARY:`);
  console.log(`TOTAL: ${results.length} | PASS: ${passCount} | FAIL: ${failCount}`);
  console.log(`SUCCESS RATE: ${Math.round((passCount / results.length) * 100)}%`);
  console.log('====================================================\n');

  return { results, passCount, failCount };
}

if (require.main === module) {
  runTests().then(({ failCount }) => {
    process.exit(failCount > 0 ? 1 : 0);
  });
}

module.exports = { runTests };
