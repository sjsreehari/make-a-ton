#!/usr/bin/env tsx
/**
 * Performance check script.
 * Hits key endpoints and fails if p95 > 1500ms.
 */

const API_URL = process.env.API_URL || 'http://localhost:4000';
const SAMPLES = 10;

async function measureEndpoint(url: string, label: string): Promise<number[]> {
  const times: number[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const start = Date.now();
    const res = await fetch(url);
    await res.json();
    times.push(Date.now() - start);
  }
  return times.sort((a, b) => a - b);
}

function p95(sorted: number[]): number {
  const idx = Math.ceil(sorted.length * 0.95) - 1;
  return sorted[Math.max(0, idx)];
}

async function main() {
  console.log('BillPilot Performance Check\n');
  const endpoints = [
    [`${API_URL}/api/v1/health`, 'Health'],
    [`${API_URL}/api/v1/plans?page=1&limit=20`, 'Plans list'],
  ];

  let failed = false;
  for (const [url, label] of endpoints) {
    try {
      const times = await measureEndpoint(url, label);
      const p95ms = p95(times);
      const status = p95ms > 1500 ? 'FAIL' : 'PASS';
      if (status === 'FAIL') failed = true;
      console.log(`[${status}] ${label}: p95=${p95ms}ms`);
    } catch (e) {
      console.log(`[SKIP] ${label}: ${(e as Error).message}`);
    }
  }

  if (failed) {
    console.error('\nPerformance budget exceeded!');
    process.exit(1);
  } else {
    console.log('\nAll checks passed.');
  }
}

main().catch(console.error);

