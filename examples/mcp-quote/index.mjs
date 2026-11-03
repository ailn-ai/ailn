#!/usr/bin/env node
/** Discover the current tool schemas. No tool execution, wallet or payment. */
const ENDPOINT = process.env.AILN_MCP_URL || 'https://ailn.ai/mcp';
const TIMEOUT_MS = 20000;

async function rpc(id, method, params) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await res.text();
  console.log(`${method} HTTP ${res.status}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  const body = JSON.parse(text);
  if (body.error) throw new Error(`JSON-RPC ${body.error.code}: ${body.error.message}`);
  if (body.jsonrpc !== '2.0' || body.id !== id || !body.result) {
    throw new Error('Unexpected JSON-RPC response');
  }
  return body.result;
}

try {
  console.log(`endpoint ${ENDPOINT}`);
  await rpc(1, 'initialize', {
    protocolVersion: '2024-11-05', capabilities: {},
    clientInfo: { name: 'ailn-discovery-example', version: '1.0.0' },
  });
  const result = await rpc(2, 'tools/list', {});
  if (!Array.isArray(result.tools)) throw new Error('Missing tools array');
  console.log(`tools ${result.tools.length}`);
  // Schemas describe capabilities; do not assume they contain a payable quote.
  console.log(JSON.stringify(result.tools, null, 2));
  console.log('Discovery only: no tools/call, signature, payment or mint. Request current pricing before any separately authorized paid operation.');
} catch (error) {
  console.error(`Discovery failed: ${error.name}: ${error.message}`);
  process.exitCode = 1;
}
