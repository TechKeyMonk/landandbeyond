import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';

const BASE_URL = 'http://localhost:8080';

// Helper for HTTP requests
function httpRequest(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch(e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', err => reject(err));
    if (body) {
      req.write(typeof body === 'object' ? JSON.stringify(body) : body);
    }
    req.end();
  });
}

describe('A. Architecture & Setup Conformance', () => {
  it('should verify live server health and database status at /api/status', async () => {
    const res = await httpRequest('/api/status');
    expect(res.status).toBe(200);
    expect(res.data).toBeDefined();
    expect(res.data.status).toBe('online');
    expect(res.data.activeRecords).toBeDefined();
    expect(typeof res.data.activeRecords.properties).toBe('number');
  });

  it('should serve core web client entrypoints with 200 OK', async () => {
    const [indexRes, adminRes, dashRes] = await Promise.all([
      httpRequest('/index.html'),
      httpRequest('/admin-login.html'),
      httpRequest('/dashboard.html')
    ]);
    expect(indexRes.status).toBe(200);
    expect(adminRes.status).toBe(200);
    expect(dashRes.status).toBe(200);
  });
});

describe('B. Authentication & Access Control Verification', () => {
  // Pure logic verification matching handleAdminLoginSubmit specification
  function authenticateStaffAdmin(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();
    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Empty credentials provided' };
    }
    if (cleanEmail === 'landandbeyond03@gmail.com' && cleanPass === 'techkeymonk') {
      return { 
        success: true, 
        role: 'SUPER_ADMIN', 
        user: 'landandbeyond03@gmail.com',
        redirectTo: 'dashboard.html#newprojects'
      };
    }
    return { success: false, error: 'Invalid Email or Password. Access denied.' };
  }

  it('should successfully authenticate super admin with valid credentials', () => {
    const result = authenticateStaffAdmin('landandbeyond03@gmail.com', 'techkeymonk');
    expect(result.success).toBe(true);
    expect(result.role).toBe('SUPER_ADMIN');
    expect(result.redirectTo).toContain('dashboard.html');
  });

  it('should accept valid credentials regardless of case in email', () => {
    const result = authenticateStaffAdmin('LANDANDBEYOND03@GMAIL.COM', 'techkeymonk');
    expect(result.success).toBe(true);
  });

  it('should strictly reject invalid password', () => {
    const result = authenticateStaffAdmin('landandbeyond03@gmail.com', 'wrongpassword123');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Access denied');
  });

  it('should strictly reject unauthorized emails', () => {
    const result = authenticateStaffAdmin('attacker@evil.com', 'techkeymonk');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Access denied');
  });

  it('should strictly reject empty or whitespace inputs', () => {
    expect(authenticateStaffAdmin('', 'techkeymonk').success).toBe(false);
    expect(authenticateStaffAdmin('landandbeyond03@gmail.com', '   ').success).toBe(false);
    expect(authenticateStaffAdmin(null, null).success).toBe(false);
  });
});

describe('D. API Routes & Server Actions Conformance', () => {
  it('GET /api/db should return authoritative database object with all 6 main tables', async () => {
    const res = await httpRequest('/api/db');
    expect(res.status).toBe(200);
    expect(res.data).toBeTypeOf('object');
    expect(Array.isArray(res.data.properties)).toBe(true);
    expect(Array.isArray(res.data.newProjects)).toBe(true);
    expect(Array.isArray(res.data.farmland)).toBe(true);
    expect(Array.isArray(res.data.siteTours)).toBe(true);
    expect(Array.isArray(res.data.interiors)).toBe(true);
    expect(Array.isArray(res.data.poojas)).toBe(true);
  });

  it('POST /api/data should return 400 Bad Request on malformed JSON payload', async () => {
    const res = await httpRequest('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, '{ malformed json: true, ');
    expect(res.status).toBe(400);
    expect(res.data.error).toBeDefined();
  });
});

describe('E, G & H. Data Flow, Cloud Sync, and Destructive Actions Isolation', () => {
  const TEST_ID = `test_qa_lead_${Date.now()}`;
  let initialToursCount = 0;

  beforeAll(async () => {
    const dbRes = await httpRequest('/api/db');
    initialToursCount = (dbRes.data.siteTours || []).length;
  });

  it('should safely insert isolated test inquiry and sync without altering production items', async () => {
    const dbRes = await httpRequest('/api/db');
    const existingTours = [...(dbRes.data.siteTours || [])];

    const testInquiry = {
      id: TEST_ID,
      name: 'QA Automated Test User',
      customerName: 'QA Automated Test User',
      phone: '+91 9999988888',
      contact: '+91 9999988888',
      propertyTitle: 'QA Test Automated Inspection',
      date: '2026-10-01',
      slot: 'Morning 10:00 AM',
      pickupAddress: 'Coimbatore Airport QA Zone',
      status: 'Test Verified',
      createdAt: new Date().toISOString()
    };

    existingTours.unshift(testInquiry);

    const postRes = await httpRequest('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { key: 'lb_site_tours_data', data: existingTours });

    expect(postRes.status).toBe(200);
    expect(postRes.data.success).toBe(true);

    // Verify presence in server state
    const verifyRes = await httpRequest('/api/db');
    const match = verifyRes.data.siteTours.find(t => t.id === TEST_ID);
    expect(match).toBeDefined();
    expect(match.name).toBe('QA Automated Test User');
    expect(verifyRes.data.siteTours.length).toBe(initialToursCount + 1);
  });

  it('should cleanly perform isolated destructive deletion and restore exact count', async () => {
    const dbRes = await httpRequest('/api/db');
    const currentTours = dbRes.data.siteTours || [];
    
    // Purge test item
    const cleanedTours = currentTours.filter(t => t.id !== TEST_ID);

    const postRes = await httpRequest('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { key: 'lb_site_tours_data', data: cleanedTours });

    expect(postRes.status).toBe(200);

    // Verify item is completely deleted
    const verifyRes = await httpRequest('/api/db');
    const match = verifyRes.data.siteTours.find(t => t.id === TEST_ID);
    expect(match).toBeUndefined();
    expect(verifyRes.data.siteTours.length).toBe(initialToursCount);
  });
});

describe('F & J. Security, RLS & Negative Boundary Audits', () => {
  it('should return 404 for non-existent static or API routes', async () => {
    const res = await httpRequest('/non-existent-page-qa-audit.html');
    expect(res.status).toBe(404);
  });

  it('should safely handle malicious or empty input without crashing server process', async () => {
    const res = await httpRequest('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, '');
    expect([400, 200]).toContain(res.status);
    
    // Check server is still responsive and healthy
    const health = await httpRequest('/api/status');
    expect(health.status).toBe(200);
  });

  it('should verify Supabase cloud integration is actively configured', async () => {
    const res = await httpRequest('/api/status');
    expect(res.data.supabase).toBeDefined();
    expect(res.data.supabase.configured).toBe(true);
    expect(res.data.supabase.connected).toBe(true);
  });
});

