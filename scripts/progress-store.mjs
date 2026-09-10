import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {sanitizeUserId} from './identity.mjs';

const EMPTY={
  learned:{}, flagged:{}, miss:{}, scores:{}, badges:{},
  streak:1, line:1, pos:0, view:'hub', userName:'', day:null
};

export function createProgressStore(rootDir){
  const root=resolve(rootDir);
  async function ensure(){ await mkdir(root,{recursive:true}); }
  function fileFor(userId){
    const id=sanitizeUserId(userId);
    if(!id) throw new Error('missing user id');
    const path=join(root,`${id}.json`);
    if(!path.startsWith(root+'/')) throw new Error('invalid user id');
    return path;
  }
  async function read(userId){
    await ensure();
    try{
      const raw=JSON.parse(await readFile(fileFor(userId),'utf8'));
      return normalize(raw);
    }catch(e){
      if(e && e.code==='ENOENT') return {...EMPTY};
      throw e;
    }
  }
  async function write(userId, data){
    await ensure();
    const path=fileFor(userId);
    const payload=Object.assign({}, normalize(data), {
      userId:sanitizeUserId(userId),
      updatedAt:new Date().toISOString()
    });
    const tmp=`${path}.${process.pid}.tmp`;
    await mkdir(dirname(path),{recursive:true});
    await writeFile(tmp, JSON.stringify(payload,null,2));
    await rename(tmp, path);
    return payload;
  }
  return { root, read, write, EMPTY };
}

function normalize(raw){
  const r=raw&&typeof raw==='object'?raw:{};
  return {
    learned:r.learned&&typeof r.learned==='object'?r.learned:{},
    flagged:r.flagged&&typeof r.flagged==='object'?r.flagged:{},
    miss:r.miss&&typeof r.miss==='object'?r.miss:{},
    scores:r.scores&&typeof r.scores==='object'?r.scores:{},
    badges:r.badges&&typeof r.badges==='object'?r.badges:{},
    streak:Number(r.streak)||1,
    line:Number(r.line)||1,
    pos:Number(r.pos)||0,
    view:typeof r.view==='string'?r.view:'hub',
    userName:typeof r.userName==='string'?r.userName:'',
    day:typeof r.day==='string'?r.day:null
  };
}
