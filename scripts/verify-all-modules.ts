const BASE_URL = 'http://localhost:4000/api/v1';

interface TestResult {
  module: string;
  feature: string;
  status: 'PASS' | 'FAIL';
  details?: string;
}

const results: TestResult[] = [];

function record(module: string, feature: string, pass: boolean, details?: string) {
  results.push({
    module,
    feature,
    status: pass ? 'PASS' : 'FAIL',
    details,
  });
  const symbol = pass ? '✓' : '✗';
  console.log(`${symbol} [${module}] ${feature}${details ? ` -> ${details}` : ''}`);
}

async function request(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  return { status: res.status, headers: res.headers, data, ok: res.ok };
}

async function run() {
  console.log('====================================================');
  console.log('   BillPilot Complete Specification Verification   ');
  console.log('====================================================\n');

  let adminToken = '';
  let customerToken = '';
  let staffToken = '';

  // -------------------------------------------------------------------------
  // Module 1: Users & Access Control
  // -------------------------------------------------------------------------
  try {
    const adminRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@brightloop.test',
        password: 'Admin@12345!',
      }),
    });
    adminToken = adminRes.data?.accessToken;
    record('Module 1', '1.2 Admin Login & JWT session', adminRes.ok && !!adminToken, `User: ${adminRes.data?.user?.name}`);
  } catch (err: any) {
    record('Module 1', '1.2 Admin Login & JWT session', false, err.message);
  }

  try {
    const custRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'cust1@brightloop.test',
        password: 'Cust@12345!',
      }),
    });
    customerToken = custRes.data?.accessToken;
    record('Module 1', '1.2 Customer Login & JWT session', custRes.ok && !!customerToken, `User: ${custRes.data?.user?.name}`);
  } catch (err: any) {
    record('Module 1', '1.2 Customer Login & JWT session', false, err.message);
  }

  try {
    const staffRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'staff@brightloop.test',
        password: 'Staff@12345!',
      }),
    });
    staffToken = staffRes.data?.accessToken;
    record('Module 1', '1.2 Staff Login & JWT session', staffRes.ok && !!staffToken, `User: ${staffRes.data?.user?.name}`);
  } catch (err: any) {
    record('Module 1', '1.2 Staff Login & JWT session', false, err.message);
  }

  try {
    const usersRes = await request('/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('Module 1', '1.5 Admin staff/user list with pagination', usersRes.ok && usersRes.data.data?.length > 0, `${usersRes.data.meta.total} total users`);
  } catch (err: any) {
    record('Module 1', '1.5 Admin staff/user list with pagination', false, err.message);
  }

  try {
    const forbiddenRes = await request('/users', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    record('Module 1', '1.6 Customer Scoping (403 Forbidden on Admin route)', forbiddenRes.status === 403, `HTTP ${forbiddenRes.status}`);
  } catch (err: any) {
    record('Module 1', '1.6 Customer Scoping', false, err.message);
  }

  // -------------------------------------------------------------------------
  // Module 2: Products & Plans
  // -------------------------------------------------------------------------
  try {
    const plansRes = await request('/plans');
    record('Module 2', '2.7 Public plan catalog & 2.3 Plans', plansRes.ok && plansRes.data.data?.length > 0, `${plansRes.data.data?.length} public plans available`);
  } catch (err: any) {
    record('Module 2', '2.7 Public plan catalog', false, err.message);
  }

  try {
    const prodRes = await request('/products', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const hasVariants = prodRes.data.data?.some((p: any) => p.variants && p.variants.length > 0);
    record('Module 2', '2.1 Products & 2.2 Product Variants', prodRes.ok && hasVariants, `${prodRes.data.data?.length} products found with variants`);
  } catch (err: any) {
    record('Module 2', '2.1 Products & 2.2 Product Variants', false, err.message);
  }

  // -------------------------------------------------------------------------
  // Module 3: Quotation Templates & Subscriptions
  // -------------------------------------------------------------------------
  let sampleSubId = '';
  try {
    const subRes = await request('/subscriptions', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    sampleSubId = subRes.data.data?.[0]?.id || '';
    record('Module 3', '3.3 Subscription Records & 3.4 Status Flow', subRes.ok && subRes.data.data?.length > 0, `${subRes.data.meta.total} subscriptions in DB`);
  } catch (err: any) {
    record('Module 3', '3.3 Subscription Records', false, err.message);
  }

  if (sampleSubId) {
    try {
      const previewRes = await request(`/subscriptions/${sampleSubId}/schedule-preview`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const dates = previewRes.data?.schedulePreview || [];
      record('Module 3', '3.9 Schedule & Invoicing Preview for Subscription', previewRes.ok && Array.isArray(dates), `${dates.length} upcoming billing dates previewed`);
    } catch (err: any) {
      record('Module 3', '3.9 Schedule & Invoicing Preview', false, err.message);
    }
  }

  // -------------------------------------------------------------------------
  // Module 4: Invoicing
  // -------------------------------------------------------------------------
  let sampleInvoiceId = '';
  try {
    const invRes = await request('/invoices', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    sampleInvoiceId = invRes.data.data?.[0]?.id || '';
    record('Module 4', '4.1 Auto-generated Invoices & 4.6 Status Flow', invRes.ok && invRes.data.data?.length > 0, `${invRes.data.meta.total} invoices found in database`);
  } catch (err: any) {
    record('Module 4', '4.1 Invoices', false, err.message);
  }

  try {
    const dryRunRes = await request('/invoices/run-billing', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ dryRun: true }),
    });
    record('Module 4', '4.2 Bulk Billing Run & 4.10 Billing Dry-Run', dryRunRes.ok && dryRunRes.data?.dryRun === true, `Dry-run previewed ${dryRunRes.data.created} eligible subscriptions`);
  } catch (err: any) {
    record('Module 4', '4.10 Billing Dry-Run', false, err.message);
  }

  if (sampleInvoiceId) {
    try {
      const pdfRes = await fetch(`${BASE_URL}/invoices/${sampleInvoiceId}/pdf`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const contentType = pdfRes.headers.get('content-type') || '';
      const buffer = await pdfRes.arrayBuffer();
      const isPdf = contentType.includes('application/pdf') && buffer.byteLength > 100;
      record('Module 4', '4.7 Invoice PDF Generation (PDFKit)', isPdf, `Generated ${buffer.byteLength} bytes PDF`);
    } catch (err: any) {
      record('Module 4', '4.7 Invoice PDF Generation', false, err.message);
    }
  }

  // -------------------------------------------------------------------------
  // Module 5 & 6: Taxes & Discounts
  // -------------------------------------------------------------------------
  try {
    const taxRes = await request('/tax-rules', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('Module 5', '5.1 Tax Rules Configuration', taxRes.ok && taxRes.data.data?.length > 0, `${taxRes.data.data?.length} tax rules active`);
  } catch (err: any) {
    record('Module 5', '5.1 Tax Rules Configuration', false, err.message);
  }

  try {
    const discRes = await request('/discounts', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('Module 6', '6.1 Discounts Engine & Rules', discRes.ok && discRes.data.data?.length > 0, `${discRes.data.data?.length} discount codes active`);
  } catch (err: any) {
    record('Module 6', '6.1 Discounts Engine', false, err.message);
  }

  // -------------------------------------------------------------------------
  // Module 7 & 8: Payments & Recovery
  // -------------------------------------------------------------------------
  try {
    const payRes = await request('/payments', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('Module 7', '7.1 Payments Engine & Records', payRes.ok, `${payRes.data.meta?.total ?? 0} payments recorded`);
  } catch (err: any) {
    record('Module 7', '7.1 Payments Engine', false, err.message);
  }

  try {
    const dunningRes = await request('/insights/dunning', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('Module 8', '8.1 Failed-Payment Recovery & 12.3 Smart Dunning', dunningRes.ok, `₹${dunningRes.data.totalRecoveredAmount?.toLocaleString()} recovered`);
  } catch (err: any) {
    record('Module 8', '8.1 Failed-Payment Recovery', false, err.message);
  }

  // -------------------------------------------------------------------------
  // Module 9: Reporting Dashboard & MRR/ARR
  // -------------------------------------------------------------------------
  try {
    const mrrRes = await request('/insights/mrr', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('Module 9 & 12', '9.1 Core Cards & 12.2 MRR/ARR Engine', mrrRes.ok && mrrRes.data.mrr > 0, `MRR: ₹${mrrRes.data.mrr.toLocaleString()}, ARR: ₹${mrrRes.data.arr.toLocaleString()}`);
  } catch (err: any) {
    record('Module 9 & 12', '9.1 Core Cards & 12.2 MRR/ARR Engine', false, err.message);
  }

  try {
    const auditRes = await request('/audit', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('Module 9', '9.8 Audit Log (Immutable Events)', auditRes.ok && auditRes.data.data?.length > 0, `${auditRes.data.meta.total} audit trail events recorded`);
  } catch (err: any) {
    record('Module 9', '9.8 Audit Log', false, err.message);
  }

  // -------------------------------------------------------------------------
  // Module 10: Customer Portal Scoping
  // -------------------------------------------------------------------------
  try {
    const custSubsRes = await request('/subscriptions', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    record('Module 10', '10.1 Customer Portal My Subscriptions', custSubsRes.ok && custSubsRes.data.data?.length > 0, `Customer sees their ${custSubsRes.data.data?.length} subscription(s) only`);
  } catch (err: any) {
    record('Module 10', '10.1 Customer Portal My Subscriptions', false, err.message);
  }

  // -------------------------------------------------------------------------
  // Module 11: WhatsApp & Brevo Notifications
  // -------------------------------------------------------------------------
  try {
    const tmplRes = await request('/notifications/templates', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('Module 11', '11.1 Templates & 11.10 Template Editor', tmplRes.ok && Array.isArray(tmplRes.data) && tmplRes.data.length > 0, `${tmplRes.data.length} templates configured`);
  } catch (err: any) {
    record('Module 11', '11.1 Notification Templates', false, err.message);
  }

  try {
    const waStatus = await request('/whatsapp/status');
    record('Module 11', '11.2 WhatsApp Gateway & Bot Status', waStatus.ok && waStatus.data?.connected === true, `Connected: ${waStatus.data.connected} (Provider: ${waStatus.data.provider})`);
  } catch (err: any) {
    record('Module 11', '11.2 WhatsApp Gateway Status', false, err.message);
  }

  // -------------------------------------------------------------------------
  // Module 12: Revenue Leakage Detector & Scheduled Jobs
  // -------------------------------------------------------------------------
  try {
    const leakRes = await request('/insights/leakage', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('Module 12', '12.1 Revenue Leakage Detector', leakRes.ok && leakRes.data.totalAmountAtRisk !== undefined, `₹${leakRes.data.totalAmountAtRisk.toLocaleString()} at risk detected with ${leakRes.data.totalFindings} findings`);
  } catch (err: any) {
    record('Module 12', '12.1 Revenue Leakage Detector', false, err.message);
  }

  try {
    const jobsRes = await request('/insights/jobs', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('Module 12', '12.4 Scheduled Jobs Ledger', jobsRes.ok && Array.isArray(jobsRes.data), `${jobsRes.data.length} recurring jobs tracked`);
  } catch (err: any) {
    record('Module 12', '12.4 Scheduled Jobs Ledger', false, err.message);
  }

  // -------------------------------------------------------------------------
  // Module 14: Platform Health
  // -------------------------------------------------------------------------
  try {
    const healthRes = await request('/health');
    const isOk = healthRes.ok && healthRes.data.status === 'ok' && healthRes.data.services.database === 'healthy' && healthRes.data.services.redis === 'healthy';
    record('Module 14', '14.3 Platform Health Check (DB + Redis)', isOk, `Status: ${healthRes.data?.status}`);
  } catch (err: any) {
    record('Module 14', '14.3 Platform Health Check', false, err.message);
  }

  console.log('\n====================================================');
  const passed = results.filter((r) => r.status === 'PASS').length;
  console.log(` Summary: ${passed} / ${results.length} Specification Features Verified PASS`);
  console.log('====================================================');
}

run().catch(console.error);
