import {existsSync,readFileSync} from 'node:fs';
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
function parseQuestionBlocks(lines, start, file, heading='Question'){
  const re=new RegExp(`^## ${heading}: ([a-z0-9]+(?:-[a-z0-9]+)*)$`);
  const questions=[]; let i=start;
  while(i<lines.length){
    const qm=lines[i].match(re);
    if(!qm) throw Error(`${file}:${i+2}: expected ## ${heading}: id`);
    const qid=qm[1]; i++;
    const fields={}; let key;
    while(i<lines.length && !lines[i].startsWith(`## ${heading}:`)){
      const m=lines[i].match(/^### (.+)$/);
      if(m){key=m[1]; if(Object.hasOwn(fields,key)) throw Error(`${file} ${heading.toLowerCase()} ${qid}: repeated ### ${key}`); fields[key]='';}
      else if(key) fields[key]+=lines[i]+'\n';
      else if(lines[i].trim()) throw Error(`${file} ${heading.toLowerCase()} ${qid}: text needs a ### field heading`);
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
  const questions=parseQuestionBlocks(lines,i,file,'Question');
  if(!questions.length) throw Error(`${file}: add at least one ## Question: id block`);
  return {title,questions,file};
}
/** Activity file: metadata fields, then ## Step: id blocks. */
export function parseActivityFile(text, file='content') {
  const lines=text.replace(/\r/g,'').split('\n');
  const title=lines.shift()?.match(/^# (.+)$/)?.[1];
  if(!title) throw Error(`${file}: start with # Title`);
  const fields={}; let key; let i=0;
  while(i<lines.length && !lines[i].startsWith('## Step:')){
    const m=lines[i].match(/^## (.+)$/);
    if(m){
      if(m[1].startsWith('Step:')) break;
      key=m[1]; if(Object.hasOwn(fields,key)) throw Error(`${file}: repeated section ${key}`); fields[key]='';
    }else if(key) fields[key]+=lines[i]+'\n';
    else if(lines[i].trim()) throw Error(`${file}: text needs a ## Section heading`);
    i++;
  }
  for(const k in fields) fields[k]=fields[k].trim();
  const steps=i<lines.length?parseQuestionBlocks(lines,i,file,'Step'):[];
  if(!steps.length) throw Error(`${file}: add at least one ## Step: id block`);
  return {title,fields,steps,file};
}
const required=(d,k)=>{if(!d.fields[k])throw Error(`${d.file}: missing ${k}`);return d.fields[k];};
const number=(d,k,min,max)=>{const n=Number(required(d,k));if(!Number.isInteger(n)||n<min||n>max)throw Error(`${d.file}: ${k} must be a whole number from ${min} to ${max}`);return n;};
const id=(d,k)=>{const s=required(d,k);if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s))throw Error(`${d.file}: ${k} must use lowercase letters, numbers and hyphens`);return s;};
const unique=(list,key)=>{const seen=new Set;for(const x of list){if(seen.has(x[key]))throw Error(`Duplicate ${key}: ${x[key]}`);seen.add(x[key]);}};
function parseOptionsList(d, {requireCorrect=false}={}){
  const options=required(d,'Options').split('\n').map(s=>{const m=s.match(/^- \[([ xX])\] (.+)$/);if(!m)throw Error(`${d.file}: each option must be - [ ] Answer or - [x] Answer`);return {text:m[2],ok:m[1].toLowerCase()==='x'};});
  if(options.length<2||options.length>8)throw Error(`${d.file}: use 2–8 options`);
  unique(options,'text');
  if(requireCorrect && options.filter(o=>o.ok).length!==1) throw Error(`${d.file}: use exactly one correct [x] answer`);
  return options;
}
function parseQuestionFields(d, TERMS){
  const options=parseOptionsList(d,{requireCorrect:true});
  const term=id(d,'Term');if(!TERMS.some(t=>t.id===term))throw Error(`${d.file}: unknown Term ${term}`);
  return {id:d.id,term,prompt:required(d,'Prompt'),options,explanation:required(d,'Explanation')};
}
function localAssetPath(raw, field, {pattern, example, label}){
  const value=required(raw,field).trim();
  if(/^https?:\/\//i.test(value)) throw Error(`${raw.file}: ${field} must be a local asset path, not a URL`);
  const normalized=value.replace(/^\.\//,'');
  if(!pattern.test(normalized)) throw Error(`${raw.file}: ${field} must look like ${example} (${label})`);
  if(!existsSync(normalized)) throw Error(`${raw.file}: missing ${normalized} — add the file under assets/ before building`);
  return './'+normalized;
}
function readableTranscript(text, ext){
  const raw=String(text||'').replace(/^\uFEFF/,'').trim();
  if(!raw) return '';
  if(ext==='txt'||ext==='md') return raw;
  const blocks=raw.split(/\n\s*\n/).map(b=>b.trim()).filter(Boolean);
  return blocks.map(block=>{
    const lines=block.split('\n').map(l=>l.trim()).filter(Boolean);
    return lines.filter(l=>!/^\d+$/.test(l) && !/-->/.test(l) && !/^WEBVTT\b/i.test(l) && !/^NOTE\b/i.test(l) && !/^STYLE\b/i.test(l)).join(' ').trim();
  }).filter(Boolean).join('\n\n');
}
export function parseActivityStep(raw){
  const type=required(raw,'Type');
  if(!['read','prompt','checklist','quiz','video'].includes(type)) throw Error(`${raw.file}: Type must be read, prompt, checklist, quiz, or video`);
  const step={id:raw.id,type};
  if(type==='read'){ step.body=required(raw,'Body'); }
  else if(type==='prompt'){ step.prompt=required(raw,'Prompt'); step.hint=raw.fields.Hint||''; step.example=raw.fields.Example||''; }
  else if(type==='checklist'){ step.prompt=required(raw,'Prompt'); step.options=parseOptionsList(raw).map(o=>({text:o.text})); }
  else if(type==='video'){
    step.src=localAssetPath(raw,'Src',{
      pattern:/^assets\/videos\/[a-zA-Z0-9][a-zA-Z0-9._-]*\.(mp4|webm|ogg)$/,
      example:'assets/videos/name.mp4',
      label:'mp4, webm, or ogg under assets/videos/',
    });
    step.caption=raw.fields.Caption||'';
    step.poster=raw.fields.Poster
      ? localAssetPath({file:raw.file,fields:{Poster:raw.fields.Poster}},'Poster',{
          pattern:/^assets\/(?:videos\/)?[a-zA-Z0-9][a-zA-Z0-9._-]*\.(png|jpg|jpeg|webp)$/,
          example:'assets/videos/name.jpg or assets/name.png',
          label:'png, jpg, jpeg, or webp under assets/',
        })
      : '';
    step.transcript='';
    step.transcriptFile='';
    step.trackSrc='';
    if(raw.fields.Transcript){
      const transcriptValue=raw.fields.Transcript.trim();
      if(/^assets\/videos\//.test(transcriptValue.replace(/^\.\//,'')) || /^https?:\/\//i.test(transcriptValue)){
        step.transcriptFile=localAssetPath({file:raw.file,fields:{Transcript:transcriptValue}},'Transcript',{
          pattern:/^assets\/videos\/[a-zA-Z0-9][a-zA-Z0-9._-]*\.(txt|vtt|srt|md)$/,
          example:'assets/videos/name.vtt or assets/videos/name.txt',
          label:'txt, vtt, srt, or md under assets/videos/',
        });
        const abs=step.transcriptFile.slice(2);
        const ext=abs.split('.').pop().toLowerCase();
        const text=readFileSync(abs,'utf8');
        step.transcript=readableTranscript(text,ext);
        if(!step.transcript) throw Error(`${raw.file}: Transcript file ${abs} is empty`);
        if(ext==='vtt') step.trackSrc=step.transcriptFile;
      }else{
        step.transcript=transcriptValue;
      }
    }
  }
  else { step.prompt=required(raw,'Prompt'); step.options=parseOptionsList(raw,{requireCorrect:true}); step.explanation=required(raw,'Explanation'); }
  return step;
}
async function loadJourney(root, slug){
 const base=join(root,'journeys',slug);
 const read=async p=>parseMarkdown(await readFile(join(base,p),'utf8'),join('journeys',slug,p));
 const listMd=async p=>{try{return (await readdir(join(base,p))).filter(f=>f.endsWith('.md')).sort();}catch(e){if(e.code==='ENOENT')return [];throw e;}};
 const journey=await read('journey.md'), exam=await read('exam/metadata.md');
 const journeyId=id(journey,'ID');
 if(journeyId!==slug) throw Error(`journeys/${slug}/journey.md: ID must match folder name (${slug})`);

 const trackDirs=(await readdir(join(base,'tracks'),{withFileTypes:true})).filter(e=>e.isDirectory()).map(e=>e.name).sort((a,b)=>Number(a)-Number(b)||a.localeCompare(b));
 if(!trackDirs.length) throw Error(`journeys/${slug}: at least one track folder is required under tracks/`);
 const LINES=[];
 const checks=[];
 const TERMS=[];
 const ACTIVITIES=[];
 for(const dir of trackDirs){
  const trackPath=join('journeys',slug,'tracks',dir);
  const meta=await read(join('tracks',dir,'metadata.md'));
  const n=number(meta,'ID',1,5);
  if(String(n)!==dir) throw Error(`${meta.file}: ## ID (${n}) must match folder tracks/${dir}/`);
  const checkFile=join(trackPath,'knowledge-check.md');
  const bank=parseQuestionBank(await readFile(join(base,'tracks',dir,'knowledge-check.md'),'utf8'),checkFile);
  if(meta.fields.Color) throw Error(`${meta.file}: ## Color is no longer used — remove it (tracks share Crucible brand accents)`);
  LINES.push({n,name:required(meta,'Name'),journey:meta.title,q:required(meta,'Question'),blurb:required(meta,'Description'),c:'#FF5722',quizLength:number(meta,'Quiz length',1,100),questions:bank.questions,file:meta.file});

  for(const f of await listMd(join('tracks',dir,'terms'))){
   const d=await read(join('tracks',dir,'terms',f));
   const line=number(d,'Track',1,5);
   if(line!==n) throw Error(`${d.file}: ## Track (${line}) must match folder tracks/${dir}/`);
   TERMS.push({id:id(d,'ID'),line,order:number(d,'Order',1,100000),kind:'term',t:d.title,pos:required(d,'Part of speech'),pr:required(d,'Pronunciation'),d:required(d,'Definition'),u:required(d,'Usage'),rel:(d.fields.Related||'').split(',').map(s=>s.trim()).filter(Boolean),apply:d.fields['Local note']||''});
  }
  for(const f of await listMd(join('tracks',dir,'activities'))){
   const file=join(trackPath,'activities',f);
   const doc=parseActivityFile(await readFile(join(base,'tracks',dir,'activities',f),'utf8'),file);
   const line=number(doc,'Track',1,5);
   if(line!==n) throw Error(`${file}: ## Track (${line}) must match folder tracks/${dir}/`);
   const kind=required(doc,'Kind');
   if(!['tutorial','practice','scenario'].includes(kind)) throw Error(`${file}: Kind must be tutorial, practice, or scenario`);
   const steps=doc.steps.map(parseActivityStep);
   unique(steps,'id');
   ACTIVITIES.push({
    id:id(doc,'ID'),line,order:number(doc,'Order',1,100000),kind:'activity',activityKind:kind,
    t:doc.title,pos:kind,pr:kind,d:required(doc,'Goal'),u:'',rel:(doc.fields.Related||'').split(',').map(s=>s.trim()).filter(Boolean),apply:doc.fields['Local note']||'',steps
   });
  }
 }
 unique(LINES,'n');
 LINES.sort((a,b)=>a.n-b.n);

 TERMS.sort((a,b)=>a.line-b.line||a.order-b.order);
 ACTIVITIES.sort((a,b)=>a.line-b.line||a.order-b.order);
 unique(TERMS,'id');
 unique(ACTIVITIES,'id');
 for(const t of TERMS){for(const r of t.rel)if(!TERMS.some(x=>x.id===r))throw Error(`${t.id}: unknown Related term ${r}`);}
 for(const a of ACTIVITIES){for(const r of a.rel)if(!TERMS.some(t=>t.id===r)) throw Error(`${a.id}: unknown Related term ${r}`);}
 for(const l of LINES){
  const ts=TERMS.filter(t=>t.line===l.n);
  if(ts.length<2)throw Error(`journeys/${slug} track ${l.n}: at least two terms required for the transit map`);
  unique([...ts,...ACTIVITIES.filter(a=>a.line===l.n)],'order');
 }

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
  TERMS,ACTIVITIES,QUESTIONS,
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
   activities:j.ACTIVITIES.length,
   lines:j.LINES.map(l=>l.name),
   count:j.TERMS.length+j.ACTIVITIES.length,
  })),
  COURSE:active.COURSE,
  EXAM:active.EXAM,
  LINES:active.LINES,
  TERMS:active.TERMS,
  ACTIVITIES:active.ACTIVITIES,
  QUESTIONS:active.QUESTIONS,
  ACTIVE_JOURNEY:active.id,
 };
}
