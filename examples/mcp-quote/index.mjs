#!/usr/bin/env node
/**
 * Read the live pay-per-call quote. Read-only, no wallet, no payment.
 *
 * Exit codes: 0 ok, 1 network or HTTP failure.
 */
const ENDPOINT = process.env.AILN_MCP_URL || 'https://ailn.ai/mcp';
const TIMEOUT_MS = 20000;

function fmt(intOrString) {
  // amounts are integer base units; never do float math on them
  try { return BigInt(intOrString).toString(); } catch { return String(intOrString); }
}

const main = async () => {
  console.log(`endpoint  ${ENDPOINT}`);
  const started = Date.now();
  let res;
  try {
    res = await fetch(ENDPOINT, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    console.error(`unreachable after ${Date.now() - started}ms: ${e.name} ${e.message}`);
    console.error('If this is a proxy issue, clear HTTPS_PROXY / HTTP_PROXY and retry.');
    process.exit(1);
  }
  const elapsed = Date.now() - started;
  const text = await res.text();
  console.log(`status    ${res.status} (${elapsed}ms)`);

  if (!res.ok) {
    console.error(`non-2xx: ${text.slice(0, 300)}`);
    process.exit(1);
  }

  let body;
  try { body = JSON.parse(text); } catch {
    console.error('response is not JSON; first 300 bytes:');
    console.error(text.slice(0, 300));
    process.exit(1);
  }

  // Print what we can identify without assuming a schema that may change.
  console.log('');
  console.log('quote:');
  const walk = (obj, prefix = '') => {
    for (const [k, v] of Object.entries(obj || {})) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) { walk(v, key); continue; }
      if (Array.isArray(v)) { console.log(`  ${key.padEnd(28)} [${v.length} item(s)]`); continue; }
      const shown = typeof v === 'number' || /^-?\d+$/.test(String(v)) ? fmt(v) : String(v);
      console.log(`  ${key.padEnd(28)} ${shown}`);
    }
  };
  walk(body);

  console.log('');
  console.log('This example does not sign or pay. Pricing is quoted live — do not hardcode it.');
};

main();
