import test from 'node:test';
import assert from 'node:assert/strict';
import { search } from './index.mjs';
const done = {ok:true,demo:true,chargedMicros:0,status:'COMPLETED',results:[{title:'fixture'}]};
const response = (body,status=200) => new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
test('one submission completes without polling',async()=>{
  let calls=0;
  await search('test',{fetcher:async()=>{calls++;return response(done);}});
  assert.equal(calls,1);
});
test('RUNNING polls same id without another POST',async()=>{
  const methods=[];
  await search('test',{sleep:async()=>{},fetcher:async(url,opts)=>{
    methods.push(opts.method||'GET');
    if(methods.length===2) assert.equal(url,'https://ailn.ai/demo/search/abc');
    return response(methods.length===1?{...done,status:'RUNNING',runId:'abc'}:done);
  }});
  assert.deepEqual(methods,['POST','GET']);
});
for(const [name,body,status,reason] of [
  ['quota',{ok:false,error:{code:'E_DEMO_QUOTA'}},429,/E_DEMO_QUOTA/],
  ['charge',{...done,chargedMicros:1},200,/Unexpected charge/],
  ['empty',{...done,results:[]},200,/No completed results/],
  ['bad id',{...done,status:'RUNNING',runId:'..'},200,/Invalid run id/],
]) test(name+' stops without resubmission',async()=>{
  let calls=0;
  await assert.rejects(search('test',{fetcher:async()=>{calls++;return response(body,status);}}),reason);
  assert.equal(calls,1);
});
test('ambiguous timeout never retries',async()=>{
  let calls=0;
  await assert.rejects(search('test',{fetcher:async()=>{calls++;throw Error('timeout');}}),/timeout/);
  assert.equal(calls,1);
});
