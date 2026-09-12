import http from 'http';
import app from '../app.js';
import mongoose from 'mongoose';
import { config } from '../config/env.js';

let server;

const startServer = () => {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(5099, () => {
      resolve();
    });
  });
};

const stopServer = () => {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
};

const request = async (path, options = {}) => {
  const url = `http://localhost:5099${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  return { status: res.status, data };
};

export const runPhase1Verification = async () => {
  console.log('=== STARTING PHASE 1 VERIFICATION SUITE ===\n');
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(config.mongoUri);
  }
  await startServer();

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${details}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await request('/api/health');
    assert(health.status === 200 && health.data.status === 'online', 'Health endpoint /api/health');

    // 2. Demo citizen authentication
    const citizenLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'citizen@smartbhavnagar.demo',
        password: 'Demo@123'
      })
    });
    assert(
      citizenLogin.status === 200 && citizenLogin.data.data.user.role === 'citizen',
      'Citizen demo login (citizen@smartbhavnagar.demo)'
    );
    const citizenToken = citizenLogin.data.data?.token;

    // 3. Demo admin authentication
    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@smartbhavnagar.demo',
        password: 'Demo@123'
      })
    });
    assert(
      adminLogin.status === 200 && adminLogin.data.data.user.role === 'admin',
      'Admin demo login (admin@smartbhavnagar.demo)'
    );

    // 4. Legacy phone authentication
    const legacyLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        phone: '9898000001',
        password: 'password123'
      })
    });
    assert(legacyLogin.status === 200, 'Legacy phone login (9898000001 / password123)');

    // 5. GET /api/departments
    const depts = await request('/api/departments');
    assert(
      depts.status === 200 && depts.data.data.length === 8,
      'GET /api/departments returns all 8 departments'
    );

    // 6. GET /api/categories
    const cats = await request('/api/categories');
    assert(
      cats.status === 200 && cats.data.data.length === 9,
      'GET /api/categories returns all 9 categories'
    );

    // 7. GET /api/users
    const users = await request('/api/users');
    assert(users.status === 200 && users.data.data.length >= 6, 'GET /api/users returns users');

    // 8. GET /api/issues (all seeded issues)
    const issues = await request('/api/issues?limit=50');
    assert(
      issues.status === 200 && issues.data.total >= 30,
      'GET /api/issues returns at least 30 issues'
    );

    // 9. Status filtering
    const pendingIssues = await request('/api/issues?status=Pending');
    const inProgressIssues = await request('/api/issues?status=In Progress');
    const resolvedIssues = await request('/api/issues?status=Resolved');
    const reopenedIssues = await request('/api/issues?status=Reopened');
    assert(pendingIssues.data.total > 0, `Filter status=Pending (Found ${pendingIssues.data.total})`);
    assert(inProgressIssues.data.total > 0, `Filter status=In Progress (Found ${inProgressIssues.data.total})`);
    assert(resolvedIssues.data.total >= 3, `Filter status=Resolved (Found ${resolvedIssues.data.total} >= 3)`);
    assert(reopenedIssues.data.total > 0, `Filter status=Reopened (Found ${reopenedIssues.data.total})`);

    // 10. Severity filtering
    const criticalIssues = await request('/api/issues?severity=Critical');
    const highIssues = await request('/api/issues?severity=High');
    const medIssues = await request('/api/issues?severity=Medium');
    const lowIssues = await request('/api/issues?severity=Low');
    assert(criticalIssues.data.total > 0, `Filter severity=Critical (Found ${criticalIssues.data.total})`);
    assert(highIssues.data.total > 0, `Filter severity=High (Found ${highIssues.data.total})`);
    assert(medIssues.data.total > 0, `Filter severity=Medium (Found ${medIssues.data.total})`);
    assert(lowIssues.data.total > 0, `Filter severity=Low (Found ${lowIssues.data.total})`);

    // 11. Category filtering
    const roadIssues = await request('/api/issues?category=Road %26 Pothole');
    assert(roadIssues.data.total >= 5, `Filter category=Road & Pothole (Found ${roadIssues.data.total})`);

    // 12. Verification of resolved issues data
    const resolvedSample = resolvedIssues.data.data.filter((i) => i.resolutionNote && i.resolvedAt);
    assert(
      resolvedSample.length >= 3,
      'At least 3 resolved issues contain full resolutionNote and resolvedAt data'
    );

    // 13. Verification of duplicate issues
    const dupSearch = await request('/api/issues?search=Victoria%20Park');
    const dupCandidates = dupSearch.data.data.filter(
      (i) => i.category === 'Road & Pothole' && i.area === 'Victoria Park'
    );
    assert(
      dupCandidates.length >= 2,
      'At least 2 potentially duplicate issues found in Victoria Park area'
    );

    // 14. GET /api/issues/:id by issueNumber
    const singleByNumber = await request('/api/issues/BH-2026-00001');
    assert(
      singleByNumber.status === 200 && singleByNumber.data.data.issueNumber === 'BH-2026-00001',
      'GET /api/issues/:id by issueNumber BH-2026-00001'
    );
    assert(
      singleByNumber.data.data.history && singleByNumber.data.data.history.length >= 2,
      'Issue includes timeline history records'
    );

    // 15. Dual route prefix verification (/api/v1/...)
    const v1Depts = await request('/api/v1/departments');
    assert(v1Depts.status === 200 && v1Depts.data.data.length === 8, 'Dual route /api/v1/departments');

    console.log(`\n=== VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  } catch (err) {
    console.error('Test runner exception:', err);
    failed++;
  } finally {
    await stopServer();
    return failed === 0;
  }
};

if (process.argv[1]?.endsWith('verifyPhase1.js')) {
  runPhase1Verification()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch(() => process.exit(1));
}
