import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {build} from './build.mjs';
await build();
const root=resolve('dist');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
const server=createServer(async(req,res)=>{
 try{
  const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html')));
  if(!path.startsWith(root+'/')){res.writeHead(403).end();return;}
  if(path===resolve(root,'__axe.js')){res.writeHead(200,{'Content-Type':'text/javascript'}).end(await readFile('node_modules/axe-core/axe.min.js'));return;}
  if(path===resolve(root,'__audit.js')){res.writeHead(200,{'Content-Type':'text/javascript'}).end(await readFile('scripts/audit.js'));return;}
  let body=await readFile(path);
  if(path.endsWith('/index.html')&&new URL(req.url,'http://localhost').searchParams.has('audit'))body=body.toString().replace('</body>','<script src="/__axe.js"></script><script src="/__audit.js"></script></body>');res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-store'}).end(body);
 }catch{res.writeHead(404).end('Not found');}
});
server.listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log(`Local app: http://127.0.0.1:${server.address().port}`));
