#!/usr/bin/env node
/**
 * Read the live pay-per-call quote. Read-only, no wallet, no payment.
 *
 * The endpoint speaks JSON-RPC over POST; a bare GET answers 405 by design.
 * Exit codes: 0 ok, 1 network, HTTP or protocol failure.
 */
const ENDPOINT = process.env.AILN_MCP_URL || 'https://ailn.ai/mcp';
const ENDPOINT_ID = process.env.AILN_ENDPOINT_ID || 'ep-0001';
const TIMEOUT_MS = 20000;

function fmt(intOrString) {
  // amounts are integer base units; never do float math on them
  try { return BigInt(intOrString).toString(); } catch { return String(intOrString); }
}

const rpc = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: { name: 'ailn_quote', arguments: { endpointId: ENDPOINT_ID } },
};

const main = async () => {
  console.log(`endpoint  ${ENDPOINT}`);
  console.log(`tool      ailn_quote(${ENDPOINT_ID})`);
  const started = Date.now();
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(rpc),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    console.error(`unreachable after ${Date.now() - started}ms: ${e.name} ${e.message}`);
    console.error('Exit 2 means the network was unreachable. This is a diagnostic, not a protocol failure.');
    console.error('If this is a proxy issue, clear HTTPS_PROXY / HTTP_PROXY and retry.');
    process.exit(2);
  }
  console.log(`status    ${res.status} (${Date.now() - started}ms)`);
  const text = await res.text();

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
  if (body.error) {
    console.error(`json-rpc error ${body.error.code}: ${body.error.message}`);
    process.exit(1);
  }

  // MCP wraps tool output as content[].text; that text is itself JSON here.
  const raw = body?.result?.content?.[0]?.text;
  const quote = typeof raw === 'string' ? JSON.parse(raw) : body?.result;

  console.log('');
  console.log('quote:');
  const walk = (obj, prefix = '') => {
    for (const [k, v] of Object.entries(obj || {})) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) { walk(v, key); continue; }
      if (Array.isArray(v)) { console.log(`  ${key.padEnd(28)} [${v.length} item(s)]`); continue; }
      const shown = typeof v === 'number' ? fmt(v) : String(v);
      console.log(`  ${key.padEnd(28)} ${shown.slice(0, 120)}`);
    }
  };
  walk(quote);

  console.log('');
  console.log('This example does not sign or pay. Pricing is quoted live — do not hardcode it.');
};

main();