import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {build} from './build.mjs';
import {identityFromHeaders} from './identity.mjs';
import {createProgressStore} from './progress-store.mjs';

await build();
const root=resolve('dist');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'};
const allowQueryIdentity=process.env.ALLOW_QUERY_IDENTITY!=='0';
const requireAuth=process.env.REQUIRE_AUTH==='1';
const store=createProgressStore(process.env.PROGRESS_DIR||'data/progress');

function identityFor(req,url){
  return identityFromHeaders(req.headers,{
    allowQueryUser:allowQueryIdentity,
    queryUser:url.searchParams.get('user')||url.searchParams.get('name')||''
  });
}

function sendJson(res,status,body){
  res.writeHead(status,{
    'Content-Type':'application/json',
    'Cache-Control':'no-store'
  });
  res.end(JSON.stringify(body));
}

function readBody(req){
  return new Promise((resolvePromise,reject)=>{
    const chunks=[];
    req.on('data',c=>{
      chunks.push(c);
      if(Buffer.concat(chunks).length>1_000_000){reject(new Error('body too large'));req.destroy();}
    });
    req.on('end',()=>resolvePromise(Buffer.concat(chunks).toString('utf8')));
    req.on('error',reject);
  });
}

const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  const identity=identityFor(req,url);

  if(url.pathname==='/whoami'){
    sendJson(res,200,{
      id:identity.id,
      name:identity.name,
      dn:identity.dn,
      authenticated:identity.authenticated,
      source:identity.source,
      requireAuth
    });
    return;
  }

  if(url.pathname==='/api/progress'){
    if(!identity.authenticated){
      sendJson(res,401,{error:'Authentication required. Progress is stored per user.'});
      return;
    }
    if(req.method==='GET'){
      const data=await store.read(identity.id);
      sendJson(res,200,data);
      return;
    }
    if(req.method==='PUT'||req.method==='POST'){
      const raw=await readBody(req);
      let body={};
      try{ body=raw?JSON.parse(raw):{}; }catch{ sendJson(res,400,{error:'Invalid JSON'}); return; }
      const saved=await store.write(identity.id, Object.assign({}, body, { userName:identity.name||body.userName||'' }));
      sendJson(res,200,saved);
      return;
    }
    sendJson(res,405,{error:'Method not allowed'});
    return;
  }

  if(requireAuth && !identity.authenticated && (url.pathname==='/' || url.pathname.endsWith('.html'))){
    sendJson(res,401,{error:'Authentication required'});
    return;
  }

  const path=resolve(root,'.'+decodeURIComponent(url.pathname.replace(/\/$/,'/index.html')));
  if(!path.startsWith(root+'/')){res.writeHead(403).end();return;}
  if(path===resolve(root,'__axe.js')){res.writeHead(200,{'Content-Type':'text/javascript'}).end(await readFile('node_modules/axe-core/axe.min.js'));return;}
  if(path===resolve(root,'__audit.js')){res.writeHead(200,{'Content-Type':'text/javascript'}).end(await readFile('scripts/audit.js'));return;}
  let body;
  try{
    body=await readFile(path);
  }catch(err){
    if(err&&err.code==='ENOENT'){
      res.writeHead(404,{'Content-Type':'text/plain','Cache-Control':'no-store'}).end('Not found');
      return;
    }
    throw err;
  }
  if(path.endsWith('/index.html')&&url.searchParams.has('audit'))body=body.toString().replace('</body>','<script src="/__axe.js"></script><script src="/__audit.js"></script></body>');
  res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-store'}).end(body);
 }catch(err){
  console.error(err);
  sendJson(res,500,{error:'Server error'});
 }
});
server.listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log(`Local app: http://127.0.0.1:${server.address().port}`));
