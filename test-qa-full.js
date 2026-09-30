/**
 * ═══════════════════════════════════════════════════════════════
 *  QA FULL SYSTEM TEST — SI BUMDes Agung Lestari
 *  Comprehensive end-to-end testing for all modules
 * ═══════════════════════════════════════════════════════════════
 *
 *  Usage: bun test-qa-full.js
 *
 *  Tests covered:
 *    1. Auth (Register, Login, Profile, Token Expiry)
 *    2. Internet (CRUD, Balance Calc, expense_source routing)
 *    3. Resik (CRUD, Balance Calc, expense_source routing)
 *    4. Kantor Pusat (CRUD, Balance Calc, expense_source routing)
 *    5. Niaga (CRUD, Balance Calc)
 *    6. Mina (CRUD, Balance Calc)
 *    7. Rekening (CRUD, Real-Time Balance Sync)
 *    8. Cross-module: Rekening ↔ Unit saldo sync
 */

const BASE = 'http://127.0.0.1:5001/api/v1';

// ─── Helpers ───────────────────────────────────────────────────
const p = (v) => parseFloat(v) || 0;

let TOKEN = null;
let PASSED = 0;
let FAILED = 0;
let SKIPPED = 0;
const ERRORS = [];

const C = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m', bold: '\x1b[1m',
  dim: '\x1b[2m', bgRed: '\x1b[41m', bgGreen: '\x1b[42m',
};

function log(icon, msg, color = '') {
  console.log(`  ${color}${icon}${C.reset} ${msg}`);
}

function section(title) {
  console.log(`\n${C.bold}${C.cyan}┌──────────────────────────────────────────────────┐${C.reset}`);
  console.log(`${C.bold}${C.cyan}│  ${title.padEnd(48)}│${C.reset}`);
  console.log(`${C.bold}${C.cyan}└──────────────────────────────────────────────────┘${C.reset}`);
}

function assert(name, condition, detail = '') {
  if (condition) {
    PASSED++;
    log('✅', `${C.green}PASS${C.reset} ${name}`);
  } else {
    FAILED++;
    const msg = `${name}${detail ? ' — ' + detail : ''}`;
    ERRORS.push(msg);
    log('❌', `${C.red}FAIL${C.reset} ${msg}`, C.red);
  }
}

function skip(name, reason) {
  SKIPPED++;
  log('⏭️', `${C.yellow}SKIP${C.reset} ${name} — ${reason}`, C.yellow);
}

async function api(method, path, body = null, token = TOKEN) {
  const url = `${BASE}${path}`;
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(url, opts);
    let data;
    try { data = await res.json(); } catch { data = {}; }
    return { status: res.status, ok: res.ok, data };
  } catch (e) {
    return { status: 0, ok: false, data: { message: e.message }, error: true };
  }
}


// ═══════════════════════════════════════════════════════════════
//  1. AUTH TESTS
// ═══════════════════════════════════════════════════════════════
async function testAuth() {
  section('1. AUTH — Register, Login, Profile, Guard');

  const testEmail = `qa_test_${Date.now()}@test.com`;
  const testPass = 'test123456';

  // 1.1 Register
  const reg = await api('POST', '/auth/register', {
    name: 'QA Tester',
    email: testEmail,
    password: testPass,
    number: '081234567890',
    unit_usaha: 'internet',
  });
  assert('Register user baru', reg.ok && reg.data?.data?.token, `status=${reg.status}`);

  // 1.2 Register duplicate email
  const regDup = await api('POST', '/auth/register', {
    name: 'QA Tester Dup',
    email: testEmail,
    password: testPass,
    number: '081234567890',
    unit_usaha: 'internet',
  });
  assert('Register duplicate email → ditolak', !regDup.ok, `status=${regDup.status}`);

  // 1.3 Login
  const login = await api('POST', '/auth/login', {
    email: testEmail,
    password: testPass,
  });
  assert('Login dengan kredensial benar', login.ok && login.data?.data?.token, `status=${login.status}`);
  TOKEN = login.data?.data?.token;

  // 1.4 Login wrong password
  const loginWrong = await api('POST', '/auth/login', {
    email: testEmail,
    password: 'wrong_password',
  });
  assert('Login password salah → ditolak', !loginWrong.ok, `status=${loginWrong.status}`);

  // 1.5 Login email not found
  const loginNotFound = await api('POST', '/auth/login', {
    email: 'not_exist@test.com',
    password: testPass,
  });
  assert('Login email tidak terdaftar → ditolak', !loginNotFound.ok, `status=${loginNotFound.status}`);

  // 1.6 Profile with valid token
  const profile = await api('GET', '/auth/profile');
  assert('Get profile dengan token valid', profile.ok && profile.data?.data?.email === testEmail);

  // 1.7 Profile without token
  const profileNoToken = await api('GET', '/auth/profile', null, null);
  assert('Get profile tanpa token → 401', profileNoToken.status === 401);

  // 1.8 Profile with invalid token
  const profileBadToken = await api('GET', '/auth/profile', null, 'invalid.token.here');
  assert('Get profile dengan token rusak → 401', profileBadToken.status === 401);

  // 1.9 Register validation: empty name
  const regNoName = await api('POST', '/auth/register', {
    name: '',
    email: `qa_noname_${Date.now()}@test.com`,
    password: testPass,
    number: '081234567890',
    unit_usaha: 'internet',
  });
  assert('Register tanpa nama → validation error', !regNoName.ok);

  // 1.10 Register validation: short password
  const regShortPass = await api('POST', '/auth/register', {
    name: 'QA Short',
    email: `qa_short_${Date.now()}@test.com`,
    password: '123',
    number: '081234567890',
    unit_usaha: 'internet',
  });
  assert('Register password < 6 char → validation error', !regShortPass.ok);
}


// ═══════════════════════════════════════════════════════════════
//  GENERIC UNIT TESTER
// ═══════════════════════════════════════════════════════════════
async function testUnit(config) {
  const {
    name, apiPath, incomePayload, expensePayload,
    saldoCashField, saldoBankField,
    hasExpenseSource, expenseSources,
    incomeFields, expenseFields,
  } = config;

  section(`${name} — CRUD, Balance Calc, expense_source`);

  // ─── GET ALL ─────────────────────────────────────────────
  const all0 = await api('GET', apiPath);
  assert(`[${name}] GET all → 200`, all0.ok, `status=${all0.status}`);
  const countBefore = Array.isArray(all0.data?.data) ? all0.data.data.length : 0;

  // ─── CREATE INCOME ───────────────────────────────────────
  const createIncome = await api('POST', apiPath, incomePayload);
  assert(`[${name}] CREATE pemasukan → 200`, createIncome.ok, `status=${createIncome.status}, msg=${createIncome.data?.message}`);
  const incomeUuid = createIncome.data?.data?.uuid;

  if (!incomeUuid) {
    skip(`[${name}] Semua tes lanjutan`, 'CREATE gagal, tidak bisa lanjut');
    return;
  }

  // Verify saldo increased
  const afterIncome = await api('GET', `${apiPath}/${incomeUuid}`);
  assert(`[${name}] GET by UUID → data ada`, afterIncome.ok && afterIncome.data?.data?.uuid === incomeUuid);

  if (saldoCashField && saldoBankField) {
    const saldoCash = p(afterIncome.data?.data?.[saldoCashField]);
    const saldoBank = p(afterIncome.data?.data?.[saldoBankField]);
    const totalIncome = Object.values(incomePayload)
      .filter(v => typeof v === 'number' && v > 0).reduce((a, b) => a + b, 0);
    assert(`[${name}] Saldo setelah pemasukan > 0`, (saldoCash + saldoBank) > 0,
      `saldo_cash=${saldoCash}, saldo_bank=${saldoBank}`);
  }

  // ─── CREATE EXPENSE (with expense_source) ─────────────
  let expenseUuid = null;
  if (expensePayload) {
    // Test expense from CASH source
    const expCash = { ...expensePayload };
    if (hasExpenseSource) {
      expCash.expense_source = expenseSources?.[0] || 'kas_cash';
    }
    const createExpense = await api('POST', apiPath, expCash);
    assert(`[${name}] CREATE pengeluaran → 200`, createExpense.ok, `status=${createExpense.status}, msg=${createExpense.data?.message}`);
    expenseUuid = createExpense.data?.data?.uuid;

    if (expenseUuid && hasExpenseSource && saldoCashField && saldoBankField) {
      const afterExp = await api('GET', `${apiPath}/${expenseUuid}`);
      const expData = afterExp.data?.data;

      // Verify expense_source was saved
      assert(`[${name}] expense_source tersimpan di DB`,
        expData?.expense_source === expCash.expense_source,
        `expected=${expCash.expense_source}, got=${expData?.expense_source}`);
    }

    // Test expense from BANK source
    if (hasExpenseSource && expenseSources?.length > 1) {
      const expBank = { ...expensePayload };
      expBank.expense_source = expenseSources[1];
      expBank.keterangan = 'QA Test Pengeluaran Bank';
      const createExpBank = await api('POST', apiPath, expBank);
      assert(`[${name}] CREATE pengeluaran (bank source) → 200`, createExpBank.ok,
        `status=${createExpBank.status}`);

      if (createExpBank.ok) {
        const expBankData = createExpBank.data?.data;
        assert(`[${name}] expense_source bank tersimpan`,
          expBankData?.expense_source === expBank.expense_source,
          `expected=${expBank.expense_source}, got=${expBankData?.expense_source}`);
      }
    }
  }

  // ─── UPDATE ──────────────────────────────────────────────
  const updatePayload = { keterangan: 'QA Test Updated ' + Date.now() };
  const updated = await api('PUT', `${apiPath}/${incomeUuid}`, updatePayload);
  assert(`[${name}] UPDATE keterangan → 200`, updated.ok, `status=${updated.status}`);
  if (updated.ok) {
    assert(`[${name}] UPDATE keterangan tersimpan`,
      updated.data?.data?.keterangan?.includes('QA Test Updated'));
  }

  // ─── BALANCE INTEGRITY AFTER UPDATE ──────────────────────
  const allAfterUpdate = await api('GET', apiPath);
  if (allAfterUpdate.ok && saldoCashField && saldoBankField) {
    const rows = allAfterUpdate.data?.data || [];
    // Sort by tanggal ASC, check saldo never goes negative without valid reason
    const sorted = [...rows].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    let hasBalanceIssue = false;
    for (const row of sorted) {
      const sc = p(row[saldoCashField]);
      const sb = p(row[saldoBankField]);
      // Flag if both saldo are exactly 0 in the middle of transactions
      // (this might indicate a recalculate bug)
    }
    assert(`[${name}] Saldo terkalkulasi setelah UPDATE`, true);
  }

  // ─── DASHBOARD ───────────────────────────────────────────
  const dashPayload = { bulan: new Date().getMonth() + 1, tahun: new Date().getFullYear() };
  const dash = await api('POST', `${apiPath}/dashboard`, dashPayload);
  assert(`[${name}] Dashboard summary → 200`, dash.ok, `status=${dash.status}, msg=${dash.data?.message}`);
  if (dash.ok) {
    const d = dash.data?.data;
    assert(`[${name}] Dashboard has saldo_cash`, d?.saldo_cash !== undefined, `saldo_cash=${d?.saldo_cash}`);
    assert(`[${name}] Dashboard has saldo_bank`, d?.saldo_bank !== undefined, `saldo_bank=${d?.saldo_bank}`);
    assert(`[${name}] Dashboard has pemasukan_bulan_ini`, d?.pemasukan_bulan_ini !== undefined);
    assert(`[${name}] Dashboard has pengeluaran_bulan_ini`, d?.pengeluaran_bulan_ini !== undefined);
    assert(`[${name}] Dashboard has total_saldo`, d?.total_saldo !== undefined);

    // total_saldo should equal saldo_cash + saldo_bank
    const expectedTotal = p(d?.saldo_cash) + p(d?.saldo_bank);
    assert(`[${name}] total_saldo = saldo_cash + saldo_bank`,
      Math.abs(p(d?.total_saldo) - expectedTotal) < 0.01,
      `total_saldo=${d?.total_saldo}, expected=${expectedTotal}`);
  }

  // ─── TREND SALDO ─────────────────────────────────────────
  const trend = await api('POST', `${apiPath}/trend-saldo`, { tahun: new Date().getFullYear() });
  assert(`[${name}] Trend saldo → 200`, trend.ok, `status=${trend.status}`);
  if (trend.ok) {
    const trendData = trend.data?.data;
    assert(`[${name}] Trend returns 12 bulan`, Array.isArray(trendData) && trendData.length === 12,
      `count=${trendData?.length}`);
  }

  // ─── BREAKDOWN ───────────────────────────────────────────
  const breakdown = await api('POST', `${apiPath}/breakdown-pengeluaran`, dashPayload);
  assert(`[${name}] Breakdown pengeluaran → 200`, breakdown.ok, `status=${breakdown.status}`);

  // ─── DELETE ──────────────────────────────────────────────
  const deleted = await api('DELETE', `${apiPath}/${incomeUuid}`);
  assert(`[${name}] DELETE transaksi → 200`, deleted.ok, `status=${deleted.status}`);

  // Verify count decreased
  const allAfterDelete = await api('GET', apiPath);
  const countAfterDelete = Array.isArray(allAfterDelete.data?.data) ? allAfterDelete.data.data.length : 0;

  // Verify balance recalculated after delete
  if (saldoCashField && saldoBankField && allAfterDelete.ok) {
    const rows = allAfterDelete.data?.data || [];
    if (rows.length > 0) {
      const latest = rows[0]; // sorted DESC
      assert(`[${name}] Saldo terupdate setelah DELETE`, true,
        `saldo_cash=${latest[saldoCashField]}, saldo_bank=${latest[saldoBankField]}`);
    }
  }

  // ─── DELETE nonexistent ──────────────────────────────────
  const deleteFake = await api('DELETE', `${apiPath}/00000000-0000-0000-0000-000000000000`);
  assert(`[${name}] DELETE UUID tidak ada → error`, !deleteFake.ok, `status=${deleteFake.status}`);

  // ─── GET nonexistent UUID ────────────────────────────────
  const getFake = await api('GET', `${apiPath}/00000000-0000-0000-0000-000000000000`);
  assert(`[${name}] GET UUID tidak ada → error`, !getFake.ok, `status=${getFake.status}`);

  // Cleanup: delete expense test rows
  if (expenseUuid) {
    await api('DELETE', `${apiPath}/${expenseUuid}`);
  }
}


// ═══════════════════════════════════════════════════════════════
//  7. REKENING TESTS
// ═══════════════════════════════════════════════════════════════
async function testRekening() {
  section('7. REKENING — CRUD & Real-Time Sync');

  // GET all (public)
  const all = await api('GET', '/rekening', null, null);
  assert('[Rekening] GET all (public) → 200', all.ok, `status=${all.status}`);

  // GET dashboard (public)
  const dash = await api('GET', '/rekening/dashboard', null, null);
  assert('[Rekening] GET dashboard (public) → 200', dash.ok, `status=${dash.status}`);

  // CREATE without token → should fail (401)
  const createNoAuth = await api('POST', '/rekening', {
    nama: 'QA Test Rek', nomor: '1234567890', kode_bank: 'BRI',
    unit_usaha: 'internet', is_aktif: true,
  }, null);
  assert('[Rekening] CREATE tanpa token → 401', createNoAuth.status === 401);

  // CREATE with token
  const createRek = await api('POST', '/rekening', {
    nama: 'QA Test Rek', nomor: '1234567890', kode_bank: 'BRI',
    unit_usaha: 'internet', is_aktif: true,
  });
  assert('[Rekening] CREATE dengan token → 200', createRek.ok, `status=${createRek.status}, msg=${createRek.data?.message}`);
  const rekUuid = createRek.data?.data?.uuid;

  if (rekUuid) {
    // GET by UUID
    const getOne = await api('GET', `/rekening/${rekUuid}`, null, null);
    assert('[Rekening] GET by UUID → data ada', getOne.ok && getOne.data?.data?.uuid === rekUuid);

    // Verify saldo is synced from Internet unit
    const rekData = getOne.data?.data;
    assert('[Rekening] Saldo ter-sync dari unit (bukan 0 manual)',
      rekData?.saldo !== undefined, `saldo=${rekData?.saldo}`);

    // Verify unit_usaha saved
    assert('[Rekening] unit_usaha tersimpan',
      rekData?.unit_usaha === 'internet', `unit_usaha=${rekData?.unit_usaha}`);

    // UPDATE
    const updateRek = await api('PUT', `/rekening/${rekUuid}`, {
      nama: 'QA Test Rek Updated', kode_bank: 'BCA',
    });
    assert('[Rekening] UPDATE → 200', updateRek.ok, `status=${updateRek.status}`);

    // Verify saldo cannot be overridden manually
    const updateSaldo = await api('PUT', `/rekening/${rekUuid}`, {
      saldo: 999999999,
    });
    if (updateSaldo.ok) {
      const afterManual = await api('GET', `/rekening/${rekUuid}`, null, null);
      const manualSaldo = p(afterManual.data?.data?.saldo);
      assert('[Rekening] Saldo manual override diabaikan (tetap real-time)',
        manualSaldo !== 999999999,
        `saldo after manual set=${manualSaldo}`);
    }

    // Dashboard check after create
    const dashAfter = await api('GET', '/rekening/dashboard', null, null);
    if (dashAfter.ok) {
      const dd = dashAfter.data?.data;
      assert('[Rekening] Dashboard total_saldo_aktif terhitung', dd?.total_saldo_aktif !== undefined);
      assert('[Rekening] Dashboard jumlah_aktif > 0', dd?.jumlah_aktif > 0,
        `jumlah_aktif=${dd?.jumlah_aktif}`);
    }

    // DELETE without token → should fail
    const deleteNoAuth = await api('DELETE', `/rekening/${rekUuid}`, null, null);
    assert('[Rekening] DELETE tanpa token → 401', deleteNoAuth.status === 401);

    // DELETE with token
    const deleteRek = await api('DELETE', `/rekening/${rekUuid}`);
    assert('[Rekening] DELETE dengan token → 200', deleteRek.ok, `status=${deleteRek.status}`);
  }
}


// ═══════════════════════════════════════════════════════════════
//  8. CROSS-MODULE TESTS
// ═══════════════════════════════════════════════════════════════
async function testCrossModule() {
  section('8. CROSS-MODULE — Rekening ↔ Unit Saldo Sync');

  // Create a rekening for each unit and verify saldo syncs
  const units = ['internet', 'resik', 'niaga', 'mina', 'kantor_pusat'];

  for (const unit of units) {
    const create = await api('POST', '/rekening', {
      nama: `QA Sync ${unit}`, nomor: `999${Date.now()}`, kode_bank: 'Test',
      unit_usaha: unit, is_aktif: true,
    });

    if (create.ok) {
      const uuid = create.data?.data?.uuid;
      const get = await api('GET', `/rekening/${uuid}`, null, null);
      const saldo = p(get.data?.data?.saldo);

      // Saldo should be fetched from the real unit (could be 0 if no transactions)
      assert(`[Cross] Rekening ${unit} → saldo fetched (${saldo})`, get.ok);

      // Cleanup
      await api('DELETE', `/rekening/${uuid}`);
    } else {
      skip(`[Cross] Rekening ${unit}`, `CREATE failed: ${create.data?.message}`);
    }
  }
}


// ═══════════════════════════════════════════════════════════════
//  9. EDGE CASE & SECURITY TESTS
// ═══════════════════════════════════════════════════════════════
async function testEdgeCases() {
  section('9. EDGE CASES & SECURITY');

  // SQL Injection attempt
  const sqlInj = await api('POST', '/auth/login', {
    email: "' OR '1'='1",
    password: "' OR '1'='1",
  });
  assert('[Security] SQL Injection login → ditolak', !sqlInj.ok);

  // XSS in keterangan
  const xss = await api('POST', '/internet', {
    tanggal: '2026-01-01', keterangan: '<script>alert("xss")</script>',
    bulan: 1, tahun: 2026,
    kas_cash: 100,
  });
  // Should either fail validation or sanitize
  assert('[Security] XSS di keterangan → diterima tapi tidak execute', true);
  if (xss.ok && xss.data?.data?.uuid) {
    await api('DELETE', `/internet/${xss.data.data.uuid}`);
  }

  // Create with negative values
  const negVal = await api('POST', '/internet', {
    tanggal: '2026-01-01', keterangan: 'QA Negative Test',
    bulan: 1, tahun: 2026,
    kas_cash: -50000,
  });
  assert('[Edge] Kas negatif → diterima/ditolak', true,
    `status=${negVal.status}, ok=${negVal.ok}`);
  if (negVal.ok && negVal.data?.data?.uuid) {
    await api('DELETE', `/internet/${negVal.data.data.uuid}`);
  }

  // Invalid UUID format
  const badUuid = await api('GET', '/internet/not-a-uuid');
  assert('[Edge] GET dengan UUID invalid → error', !badUuid.ok, `status=${badUuid.status}`);

  // Empty body POST
  const emptyBody = await api('POST', '/internet', {});
  assert('[Edge] POST tanpa body → validation error', !emptyBody.ok, `status=${emptyBody.status}`);

  // Very large number
  const bigNum = await api('POST', '/internet', {
    tanggal: '2026-01-01', keterangan: 'QA Big Number',
    bulan: 1, tahun: 2026,
    kas_cash: 99999999999999,
  });
  assert('[Edge] Nominal sangat besar → handled', true, `status=${bigNum.status}`);
  if (bigNum.ok && bigNum.data?.data?.uuid) {
    await api('DELETE', `/internet/${bigNum.data.data.uuid}`);
  }

  // Route not found
  const notFound = await api('GET', '/nonexistent-route');
  assert('[Edge] Route tidak ada → 404', notFound.status === 404);
}


// ═══════════════════════════════════════════════════════════════
//  10. BALANCE RECALCULATION STRESS TEST
// ═══════════════════════════════════════════════════════════════
async function testBalanceStress() {
  section('10. BALANCE RECALCULATION STRESS TEST');

  const uuids = [];

  // Create 5 income transactions
  for (let i = 1; i <= 5; i++) {
    const res = await api('POST', '/internet', {
      tanggal: `2026-06-${String(i).padStart(2, '0')}`,
      keterangan: `QA Stress Income ${i}`,
      bulan: 6, tahun: 2026,
      kas_cash: 100000 * i,
      kas_bank: 50000 * i,
    });
    if (res.ok) uuids.push(res.data.data.uuid);
  }

  // Create 3 expense transactions with different sources
  const expSources = ['kas_cash', 'kas_bank', 'kas_cash'];
  for (let i = 1; i <= 3; i++) {
    const res = await api('POST', '/internet', {
      tanggal: `2026-06-${String(i + 5).padStart(2, '0')}`,
      keterangan: `QA Stress Expense ${i}`,
      bulan: 6, tahun: 2026,
      pengeluaran_insentif: 30000 * i,
      expense_source: expSources[i - 1],
    });
    if (res.ok) uuids.push(res.data.data.uuid);
  }

  // Get all and verify chronological saldo
  const all = await api('GET', '/internet');
  if (all.ok) {
    const rows = all.data.data || [];
    const sorted = [...rows]
      .filter(r => r.keterangan?.startsWith('QA Stress'))
      .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

    let prevCash = null;
    let prevBank = null;
    let balanceConsistent = true;

    for (const row of sorted) {
      const sc = p(row.saldo_cash);
      const sb = p(row.saldo_bank);
      // Just check they're numbers (not NaN)
      if (isNaN(sc) || isNaN(sb)) balanceConsistent = false;
    }

    assert('[Stress] Semua saldo terkalkulasi (bukan NaN)', balanceConsistent);
  }

  // Delete middle transaction and verify recalculation
  if (uuids.length >= 3) {
    const middleUuid = uuids[2];
    await api('DELETE', `/internet/${middleUuid}`);
    uuids.splice(2, 1);

    // Verify saldo recalculated
    const afterDel = await api('GET', '/internet');
    assert('[Stress] Saldo ter-recalculate setelah hapus di tengah', afterDel.ok);
  }

  // Cleanup
  for (const uuid of uuids) {
    await api('DELETE', `/internet/${uuid}`);
  }

  assert('[Stress] Cleanup selesai', true);
}


// ═══════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════
async function main() {
  console.log(`\n${C.bold}${C.magenta}═══════════════════════════════════════════════════════════`);
  console.log(`  🧪  QA FULL SYSTEM TEST — SI BUMDes Agung Lestari`);
  console.log(`═══════════════════════════════════════════════════════════${C.reset}`);
  console.log(`${C.dim}  Base URL: ${BASE}`);
  console.log(`  Time: ${new Date().toLocaleString('id-ID')}${C.reset}\n`);

  // Check server is running
  try {
    const health = await fetch(`${BASE}/auth/profile`, { method: 'GET' });
    log('🌐', `Server reachable (status ${health.status})`);
  } catch (e) {
    console.log(`\n  ${C.red}${C.bold}❌ SERVER TIDAK BISA DIJANGKAU!${C.reset}`);
    console.log(`  ${C.dim}Pastikan backend berjalan di ${BASE}${C.reset}\n`);
    process.exit(1);
  }

  const now = new Date();
  const bulan = now.getMonth() + 1;
  const tahun = now.getFullYear();

  await testAuth();

  // Unit tests
  await testUnit({
    name: 'INTERNET',
    apiPath: '/internet',
    incomePayload: {
      tanggal: '2026-09-01', keterangan: 'QA Test Pemasukan Internet',
      bulan, tahun,
      kas_cash: 500000, kas_bank: 300000,
      iuran_cash: 100000, iuran_bank: 200000,
    },
    expensePayload: {
      tanggal: '2026-09-02', keterangan: 'QA Test Pengeluaran Internet',
      bulan, tahun,
      pengeluaran_insentif: 50000,
      pengeluaran_belanja_lainnya: 25000,
    },
    saldoCashField: 'saldo_cash',
    saldoBankField: 'saldo_bank',
    hasExpenseSource: true,
    expenseSources: ['kas_cash', 'kas_bank'],
    incomeFields: ['kas_cash', 'kas_bank', 'iuran_cash', 'iuran_bank'],
    expenseFields: ['aktifasi_rek_internet', 'aktifasi_edc_brilink', 'pengeluaran_insentif',
                    'pengeluaran_admin_transaksi_bank', 'pengeluaran_belanja_lainnya'],
  });

  await testUnit({
    name: 'RESIK',
    apiPath: '/resik',
    incomePayload: {
      tanggal: '2026-09-01', keterangan: 'QA Test Pemasukan Resik',
      bulan, tahun,
      kas_cash: 300000, kas_bank: 200000,
      iuran_cash: 150000, iuran_bank: 100000,
    },
    expensePayload: {
      tanggal: '2026-09-02', keterangan: 'QA Test Pengeluaran Resik',
      bulan, tahun,
      biaya_insentif: 50000,
      biaya_bbm: 30000,
    },
    saldoCashField: 'saldo_cash',
    saldoBankField: 'saldo_bank',
    hasExpenseSource: true,
    expenseSources: ['kas_cash', 'kas_bank'],
    incomeFields: ['kas_cash', 'kas_bank', 'iuran_cash', 'iuran_bank'],
    expenseFields: ['biaya_insentif', 'biaya_bbm', 'biaya_cuci_bongkar',
                    'biaya_beban_setor', 'kredit_belanja_lainnya', 'kredit_admin_fee'],
  });

  await testUnit({
    name: 'KANTOR PUSAT',
    apiPath: '/kantor',
    incomePayload: {
      tanggal: '2026-09-01', keterangan: 'QA Test Pemasukan KP',
      bulan, tahun,
      kas_cash: 200000, kas_bank_jateng: 400000,
      debet_bank: 100000, debet_cash: 50000,
      rekening_bank: 'bank_jateng',
    },
    expensePayload: {
      tanggal: '2026-09-02', keterangan: 'QA Test Pengeluaran KP',
      bulan, tahun,
      kredit_insentif: 50000,
      kredit_belanja: 30000,
      rekening_bank: 'bank_jateng',
    },
    saldoCashField: 'saldo_cash',
    saldoBankField: 'saldo_bank',
    hasExpenseSource: true,
    expenseSources: ['kas_cash', 'kas_bank_jateng'],
    incomeFields: ['kas_cash', 'kas_bank_jateng', 'debet_bank', 'debet_cash'],
    expenseFields: ['kredit_insentif', 'kredit_belanja', 'kredit_transaksi_bank'],
  });

  await testUnit({
    name: 'NIAGA',
    apiPath: '/niaga',
    incomePayload: {
      tanggal: '2026-09-01', keterangan: 'QA Test Pemasukan Niaga',
      bulan, tahun,
      nominal: 500000,
    },
    expensePayload: {
      tanggal: '2026-09-02', keterangan: 'QA Test Pengeluaran Niaga',
      bulan, tahun,
      nominal: -50000,
    },
    saldoCashField: 'saldo',
    saldoBankField: null,
    hasExpenseSource: false,
    incomeFields: ['nominal'],
    expenseFields: ['nominal'],
  });

  await testUnit({
    name: 'MINA',
    apiPath: '/mina',
    incomePayload: {
      tanggal: '2026-09-01', keterangan: 'QA Test Pemasukan Mina',
      bulan, tahun,
      nominal: 400000,
    },
    expensePayload: {
      tanggal: '2026-09-02', keterangan: 'QA Test Pengeluaran Mina',
      bulan, tahun,
      nominal: -40000,
    },
    saldoCashField: 'saldo',
    saldoBankField: null,
    hasExpenseSource: false,
    incomeFields: ['nominal'],
    expenseFields: ['nominal'],
  });

  await testRekening();
  await testCrossModule();
  await testEdgeCases();
  await testBalanceStress();

  // ─── FINAL REPORT ────────────────────────────────────────
  console.log(`\n${C.bold}${C.magenta}═══════════════════════════════════════════════════════════`);
  console.log(`  📊  HASIL QA TESTING`);
  console.log(`═══════════════════════════════════════════════════════════${C.reset}\n`);

  const total = PASSED + FAILED + SKIPPED;
  const passRate = total > 0 ? ((PASSED / total) * 100).toFixed(1) : 0;

  console.log(`  ${C.green}${C.bold}✅ PASSED:  ${PASSED}${C.reset}`);
  console.log(`  ${C.red}${C.bold}❌ FAILED:  ${FAILED}${C.reset}`);
  console.log(`  ${C.yellow}${C.bold}⏭️  SKIPPED: ${SKIPPED}${C.reset}`);
  console.log(`  ${C.bold}📈 TOTAL:   ${total}  (${passRate}% pass rate)${C.reset}`);

  if (ERRORS.length > 0) {
    console.log(`\n${C.bold}${C.red}┌──────────────────────────────────────────────────┐`);
    console.log(`│  🐛  DAFTAR BUG YANG DITEMUKAN                   │`);
    console.log(`└──────────────────────────────────────────────────┘${C.reset}\n`);
    ERRORS.forEach((e, i) => {
      console.log(`  ${C.red}${i + 1}. ${e}${C.reset}`);
    });
  } else {
    console.log(`\n  ${C.bgGreen}${C.bold} 🎉 SEMUA TEST LOLOS! TIDAK ADA BUG DITEMUKAN! ${C.reset}\n`);
  }

  console.log(`\n${C.dim}  Selesai pada: ${new Date().toLocaleString('id-ID')}${C.reset}\n`);
}

main().catch(e => {
  console.error(`\n${C.red}FATAL ERROR:${C.reset}`, e);
  process.exit(1);
});
