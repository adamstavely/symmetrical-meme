import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {identityFromHeaders,sanitizeUserId} from '../scripts/identity.mjs';
import {createProgressStore} from '../scripts/progress-store.mjs';

test('identity prefers cert email and isolates query users',()=>{
 const cert=identityFromHeaders({'ssl-client-s-dn':'CN=Ada Lovelace,E=ada@example.com'});
 assert.equal(cert.id,'ada@example.com');
 assert.equal(cert.name,'Ada Lovelace');
 assert.equal(cert.authenticated,true);
 const q=identityFromHeaders({}, {allowQueryUser:true, queryUser:'Ben Bytes'});
 assert.equal(q.id,'ben-bytes');
 assert.equal(q.authenticated,true);
 const blocked=identityFromHeaders({'x-dev-user':'mallory'}, {allowQueryUser:false});
 assert.equal(blocked.authenticated,false);
 assert.equal(sanitizeUserId('Ada Lovelace'),'ada-lovelace');
});

test('progress store keeps users separate',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'crucible-progress-'));
 try{
  const store=createProgressStore(dir);
  await store.write('ada',{learned:{ai:true},pos:3,view:'learn',userName:'Ada'});
  await store.write('ben',{learned:{ml:true},pos:1,view:'map',userName:'Ben'});
  const ada=await store.read('ada');
  const ben=await store.read('ben');
  assert.equal(ada.learned.ai,true);
  assert.equal(ada.learned.ml,undefined);
  assert.equal(ben.learned.ml,true);
  assert.equal(ben.learned.ai,undefined);
  assert.equal(ada.pos,3);
  assert.equal(ben.pos,1);
 }finally{ await rm(dir,{recursive:true,force:true}); }
});
