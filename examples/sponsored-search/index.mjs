/** One sponsored submission, bounded polling, no paid fallback. */
import { pathToFileURL } from 'node:url';
export async function search(query, { fetcher = fetch, sleep = ms => new Promise(r => setTimeout(r, ms)), now = Date.now } = {}) {
  if (typeof query !== 'string' || !query.trim() || query.length > 200) throw Error('query must contain 1–200 characters');
  const deadline = now() + 90000;
  async function request(path, options = {}) {
    const res = await fetcher('https://ailn.ai' + path, { ...options, signal: AbortSignal.timeout(15000) });
    if (!res.headers.get('content-type')?.includes('application/json')) throw Error('Non-JSON response; do not resubmit');
    const body = await res.json();
    if (!res.ok || body.ok !== true) throw Error(`HTTP ${res.status}: ${body.error?.code || 'request_failed'}; do not resubmit automatically`);
    if (body.demo !== true || body.chargedMicros !== 0) throw Error('Unexpected charge or demo state');
    return body;
  }
  let body = await request('/demo/search', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query }) });
  while (body.status === 'RUNNING') {
    if (!/^[A-Za-z0-9_.:-]{1,256}$/.test(body.runId) || ['.', '..'].includes(body.runId)) throw Error('Invalid run id');
    const wait = Math.max(1500, Math.min(Number(body.pollAfterMs) || 1500, 10000));
    if (now() + wait >= deadline) throw Error('Trial expired; do not resubmit automatically');
    await sleep(wait);
    body = await request('/demo/search/' + encodeURIComponent(body.runId));
  }
  if (body.status !== 'COMPLETED' || !Array.isArray(body.results) || !body.results.length) throw Error('No completed results');
  return body;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { console.log(JSON.stringify(await search(process.argv.slice(2).join(' ')), null, 2)); }
  catch (e) { console.error(e.message); process.exitCode = 1; }
}
