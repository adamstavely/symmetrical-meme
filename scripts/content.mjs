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
const required=(d,k)=>{if(!d.fields[k])throw Error(`${d.file}: missing ${k}`);return d.fields[k];};
const number=(d,k,min,max)=>{const n=Number(required(d,k));if(!Number.isInteger(n)||n<min||n>max)throw Error(`${d.file}: ${k} must be a whole number from ${min} to ${max}`);return n;};
const id=(d,k)=>{const s=required(d,k);if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s))throw Error(`${d.file}: ${k} must use lowercase letters, numbers and hyphens`);return s;};
const unique=(list,key)=>{const seen=new Set;for(const x of list){if(seen.has(x[key]))throw Error(`Duplicate ${key}: ${x[key]}`);seen.add(x[key]);}};
export async function loadContent(root='content'){
 const read=async p=>parseMarkdown(await readFile(join(root,p),'utf8'),p);
 const group=async p=>Promise.all((await readdir(join(root,p))).filter(f=>f.endsWith('.md')).sort().map(f=>read(join(p,f))));
 const course=await read('course.md'), exam=await read('exam.md');
 const LINES=(await group('journeys')).map(d=>({n:number(d,'ID',1,5),name:required(d,'Name'),journey:d.title,q:required(d,'Question'),blurb:required(d,'Description'),c:required(d,'Color'),quizLength:number(d,'Quiz length',1,100)})).sort((a,b)=>a.n-b.n);
 unique(LINES,'n');if(!LINES.length)throw Error('At least one journey is required');
 for(const l of LINES)if(!/^#[0-9a-f]{6}$/i.test(l.c))throw Error(`Journey ${l.n}: Color must be a six-digit hex color`);
 const TERMS=(await group('terms')).map(d=>({id:id(d,'ID'),line:number(d,'Journey',1,5),order:number(d,'Order',1,100000),t:d.title,pos:required(d,'Part of speech'),pr:required(d,'Pronunciation'),d:required(d,'Definition'),u:required(d,'Usage'),rel:(d.fields.Related||'').split(',').map(s=>s.trim()).filter(Boolean),apply:d.fields['Local note']||''})).sort((a,b)=>a.line-b.line||a.order-b.order);
 unique(TERMS,'id');
 for(const t of TERMS){if(!LINES.some(l=>l.n===t.line))throw Error(`${t.id}: unknown Journey ${t.line}`);for(const r of t.rel)if(!TERMS.some(x=>x.id===r))throw Error(`${t.id}: unknown Related term ${r}`);}
 for(const l of LINES){const ts=TERMS.filter(t=>t.line===l.n);if(ts.length<2)throw Error(`Journey ${l.n}: at least two terms required for the transit map`);unique(ts,'order');}
 const QUESTIONS=(await group('questions')).map(d=>{
  const options=required(d,'Options').split('\n').map(s=>{const m=s.match(/^- \[([ xX])\] (.+)$/);if(!m)throw Error(`${d.file}: each option must be - [ ] Answer or - [x] Answer`);return {text:m[2],ok:m[1].toLowerCase()==='x'};});
  if(options.length<2||options.length>5||options.filter(o=>o.ok).length!==1)throw Error(`${d.file}: use 2–5 options with exactly one correct answer`);
  unique(options,'text');const term=id(d,'Term');if(!TERMS.some(t=>t.id===term))throw Error(`${d.file}: unknown Term ${term}`);
  const use=required(d,'Use').split(',').map(s=>s.trim());if(use.some(x=>!['quiz','exam'].includes(x)))throw Error(`${d.file}: Use must be quiz, exam, or quiz, exam`);
  return {id:id(d,'ID'),term,use,prompt:required(d,'Prompt'),options,explanation:required(d,'Explanation')};
 });unique(QUESTIONS,'id');
 for(const t of TERMS)if(!QUESTIONS.some(q=>q.term===t.id&&q.use.includes('quiz')))throw Error(`${t.id}: add at least one quiz question for review drills`);
 for(const l of LINES)if(QUESTIONS.filter(q=>q.use.includes('quiz')&&TERMS.find(t=>t.id===q.term).line===l.n).length<l.quizLength)throw Error(`Journey ${l.n}: Quiz length exceeds available quiz questions`);
 const EXAM={title:exam.title,count:number(exam,'Question count',1,1000),pass:number(exam,'Pass percentage',1,100),description:required(exam,'Description')};
 if(QUESTIONS.filter(q=>q.use.includes('exam')).length<EXAM.count)throw Error('exam.md: Question count exceeds available exam questions');
 return {TERMS,LINES,QUESTIONS,EXAM,COURSE:{title:course.title,description:required(course,'Description')}};
}
