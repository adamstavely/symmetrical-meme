import {readFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
export function parseMarkdown(text, file='content') {
  const lines=text.replace(/\r/g,'').split('\n');
  const title=lines.shift()?.match(/^# (.+)$/)?.[1];
  if(!title) throw Error(`${file}: start with # Title`);
  const fields={}; let key;
  for(const line of lines){
    const m=line.match(/^## (.+)$/);
    if(m){key=m[1]; if(Object.hasOwn(fields,key)) throw Error(`${file}: repeated section ${key}`); fields[key]='';}
    else if(key) fields[key]+=line+'\n';
    else if(line.trim()) throw Error(`${file}: text needs a ## Section heading`);
  }
  for(const k in fields) fields[k]=fields[k].trim();
  return {title,fields,file};
}
function parseQuestionBlocks(lines, start, file){
  const questions=[]; let i=start;
  while(i<lines.length){
    const qm=lines[i].match(/^## Question: ([a-z0-9]+(?:-[a-z0-9]+)*)$/);
    if(!qm) throw Error(`${file}:${i+2}: expected ## Question: id`);
    const qid=qm[1]; i++;
    const fields={}; let key;
    while(i<lines.length && !lines[i].startsWith('## Question:')){
      const m=lines[i].match(/^### (.+)$/);
      if(m){key=m[1]; if(Object.hasOwn(fields,key)) throw Error(`${file} question ${qid}: repeated ### ${key}`); fields[key]='';}
      else if(key) fields[key]+=lines[i]+'\n';
      else if(lines[i].trim()) throw Error(`${file} question ${qid}: text needs a ### field heading`);
      i++;
    }
    for(const k in fields) fields[k]=fields[k].trim();
    questions.push({id:qid,fields,file:`${file}#${qid}`});
  }
  return questions;
}
/** Knowledge-check or exam bank: ## Question: id blocks only. */
export function parseQuestionBank(text, file='content') {
  const lines=text.replace(/\r/g,'').split('\n');
  const title=lines.shift()?.match(/^# (.+)$/)?.[1];
  if(!title) throw Error(`${file}: start with # Title`);
  let i=0;
  while(i<lines.length && !lines[i].startsWith('## Question:')){
    const m=lines[i].match(/^## (.+)$/);
    if(m) throw Error(`${file}: only ## Question: id blocks are allowed (found ## ${m[1]})`);
    if(lines[i].trim()) throw Error(`${file}: text needs a ## Question: id heading`);
    i++;
  }
  const questions=parseQuestionBlocks(lines,i,file);
  if(!questions.length) throw Error(`${file}: add at least one ## Question: id block`);
  return {title,questions,file};
}
const required=(d,k)=>{if(!d.fields[k])throw Error(`${d.file}: missing ${k}`);return d.fields[k];};
const number=(d,k,min,max)=>{const n=Number(required(d,k));if(!Number.isInteger(n)||n<min||n>max)throw Error(`${d.file}: ${k} must be a whole number from ${min} to ${max}`);return n;};
const id=(d,k)=>{const s=required(d,k);if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s))throw Error(`${d.file}: ${k} must use lowercase letters, numbers and hyphens`);return s;};
const unique=(list,key)=>{const seen=new Set;for(const x of list){if(seen.has(x[key]))throw Error(`Duplicate ${key}: ${x[key]}`);seen.add(x[key]);}};
function parseQuestionFields(d, TERMS){
  const options=required(d,'Options').split('\n').map(s=>{const m=s.match(/^- \[([ xX])\] (.+)$/);if(!m)throw Error(`${d.file}: each option must be - [ ] Answer or - [x] Answer`);return {text:m[2],ok:m[1].toLowerCase()==='x'};});
  if(options.length<2||options.length>5||options.filter(o=>o.ok).length!==1)throw Error(`${d.file}: use 2–5 options with exactly one correct answer`);
  unique(options,'text');const term=id(d,'Term');if(!TERMS.some(t=>t.id===term))throw Error(`${d.file}: unknown Term ${term}`);
  return {id:d.id,term,prompt:required(d,'Prompt'),options,explanation:required(d,'Explanation')};
}
async function loadJourney(root, slug){
 const base=join(root,'journeys',slug);
 const read=async p=>parseMarkdown(await readFile(join(base,p),'utf8'),join('journeys',slug,p));
 const group=async p=>Promise.all((await readdir(join(base,p))).filter(f=>f.endsWith('.md')).sort().map(f=>read(join(p,f))));
 const journey=await read('journey.md'), exam=await read('exam/metadata.md');
 const journeyId=id(journey,'ID');
 if(journeyId!==slug) throw Error(`journeys/${slug}/journey.md: ID must match folder name (${slug})`);

 const trackDirs=(await readdir(join(base,'tracks'),{withFileTypes:true})).filter(e=>e.isDirectory()).map(e=>e.name).sort((a,b)=>Number(a)-Number(b)||a.localeCompare(b));
 if(!trackDirs.length) throw Error(`journeys/${slug}: at least one track folder is required under tracks/`);
 const LINES=[];
 const checks=[];
 for(const dir of trackDirs){
  const trackPath=join('journeys',slug,'tracks',dir);
  const meta=await read(join('tracks',dir,'metadata.md'));
  const n=number(meta,'ID',1,5);
  if(String(n)!==dir) throw Error(`${meta.file}: ## ID (${n}) must match folder tracks/${dir}/`);
  const checkFile=join(trackPath,'knowledge-check.md');
  const bank=parseQuestionBank(await readFile(join(base,'tracks',dir,'knowledge-check.md'),'utf8'),checkFile);
  LINES.push({n,name:required(meta,'Name'),journey:meta.title,q:required(meta,'Question'),blurb:required(meta,'Description'),c:required(meta,'Color'),quizLength:number(meta,'Quiz length',1,100),questions:bank.questions,file:meta.file});
 }
 unique(LINES,'n');
 LINES.sort((a,b)=>a.n-b.n);
 for(const l of LINES)if(!/^#[0-9a-f]{6}$/i.test(l.c))throw Error(`journeys/${slug} track ${l.n}: Color must be a six-digit hex color`);

 const TERMS=(await group('terms')).map(d=>({id:id(d,'ID'),line:number(d,'Track',1,5),order:number(d,'Order',1,100000),t:d.title,pos:required(d,'Part of speech'),pr:required(d,'Pronunciation'),d:required(d,'Definition'),u:required(d,'Usage'),rel:(d.fields.Related||'').split(',').map(s=>s.trim()).filter(Boolean),apply:d.fields['Local note']||''})).sort((a,b)=>a.line-b.line||a.order-b.order);
 unique(TERMS,'id');
 for(const t of TERMS){if(!LINES.some(l=>l.n===t.line))throw Error(`${t.id}: unknown Track ${t.line}`);for(const r of t.rel)if(!TERMS.some(x=>x.id===r))throw Error(`${t.id}: unknown Related term ${r}`);}
 for(const l of LINES){const ts=TERMS.filter(t=>t.line===l.n);if(ts.length<2)throw Error(`journeys/${slug} track ${l.n}: at least two terms required for the transit map`);unique(ts,'order');}

 for(const l of LINES){
  for(const raw of l.questions){
   const q=parseQuestionFields({...raw,id:raw.id},TERMS);
   const term=TERMS.find(t=>t.id===q.term);
   if(term.line!==l.n) throw Error(`${raw.file}: term ${q.term} is on track ${term.line}, not ${l.n}`);
   checks.push(q);
  }
 }
 unique(checks,'id');

 const examBank=parseQuestionBank(await readFile(join(base,'exam/questions.md'),'utf8'),join('journeys',slug,'exam/questions.md'));
 const examQuestions=examBank.questions.map(raw=>parseQuestionFields({...raw,id:raw.id},TERMS));
 unique(examQuestions,'id');

 const byId=new Map();
 for(const q of checks) byId.set(q.id,{...q,use:['quiz']});
 for(const q of examQuestions){
  const existing=byId.get(q.id);
  if(existing){if(existing.term!==q.term) throw Error(`${q.id}: check and exam question must share the same Term`);existing.use.push('exam');}
  else byId.set(q.id,{...q,use:['exam']});
 }
 const QUESTIONS=[...byId.values()];
 for(const t of TERMS)if(!QUESTIONS.some(q=>q.term===t.id&&q.use.includes('quiz')))throw Error(`${t.id}: add at least one ## Question: block in tracks/${t.line}/knowledge-check.md for review drills`);
 for(const l of LINES)if(QUESTIONS.filter(q=>q.use.includes('quiz')&&TERMS.find(t=>t.id===q.term).line===l.n).length<l.quizLength)throw Error(`journeys/${slug} track ${l.n}: Quiz length exceeds available knowledge-check questions`);
 const EXAM={title:exam.title,count:number(exam,'Question count',1,1000),pass:number(exam,'Pass percentage',1,100),description:required(exam,'Description')};
 if(QUESTIONS.filter(q=>q.use.includes('exam')).length<EXAM.count)throw Error(`journeys/${slug}/exam/metadata.md: Question count exceeds available exam/questions.md items`);
 return {
  id:journeyId,
  COURSE:{title:journey.title,description:required(journey,'Description')},
  EXAM,
  LINES:LINES.map(({questions,file,...line})=>line),
  TERMS,QUESTIONS,
 };
}
export async function loadContent(root='content'){
 const journeyRoot=join(root,'journeys');
 const slugs=(await readdir(journeyRoot,{withFileTypes:true})).filter(e=>e.isDirectory()).map(e=>e.name).sort();
 if(!slugs.length) throw Error('At least one journey folder is required under content/journeys/');
 const journeys=await Promise.all(slugs.map(slug=>loadJourney(root,slug)));
 unique(journeys,'id');
 // Runtime still consumes one active journey; prefer ai-lingo when present.
 const active=journeys.find(j=>j.id==='ai-lingo')||journeys[0];
 return {
  JOURNEYS:journeys.map(j=>({
   id:j.id,
   title:j.COURSE.title,
   description:j.COURSE.description,
   tracks:j.LINES.length,
   terms:j.TERMS.length,
   lines:j.LINES.map(l=>l.name),
   count:j.TERMS.length,
  })),
  COURSE:active.COURSE,
  EXAM:active.EXAM,
  LINES:active.LINES,
  TERMS:active.TERMS,
  QUESTIONS:active.QUESTIONS,
  ACTIVE_JOURNEY:active.id,
 };
}
