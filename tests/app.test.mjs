import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile,mkdtemp,cp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {loadContent,parseMarkdown} from '../scripts/content.mjs';
const content=await loadContent();
const html=await readFile('index.html','utf8');
const code=html.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1];
function app(){
 const storage=new Map();
 class DCLogic {props={accent:'#ff3d7f'};setState(p,cb){this.state={...this.state,...p};cb?.();}}
 const context=vm.createContext({DCLogic,React:{createElement:(...args)=>args},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},window:{},setTimeout,console});
 const Component=vm.runInContext(code+'\nComponent',context);const a=new Component();
 Object.assign(a,content);a.ACTIVITIES=content.ACTIVITIES||[];a.STOPS=a.TERMS.concat(a.ACTIVITIES).sort((x,y)=>x.line-y.line||x.order-y.order);
 a.PROGRAMS=(content.JOURNEYS||[]).map(j=>({id:j.id,name:j.title,blurb:j.description,live:j.id===content.ACTIVE_JOURNEY,lines:j.lines,count:j.count}));
 a.byId=Object.fromEntries(a.STOPS.map(t=>[t.id,t]));a.byLine=Object.fromEntries(a.LINES.map(l=>[l.n,a.STOPS.filter(t=>t.line===l.n)]));
 a.termsByLine=Object.fromEntries(a.LINES.map(l=>[l.n,a.TERMS.filter(t=>t.line===l.n)]));a.state.ready=true;a.state.actStep=0;a.state.actDraft='';a.state.actChecks={};a.state.actPick=null;a.state.actRevealed=false;return a;
}
test('content migrates all original definitions and references',async()=>{
 const original=await import('../original/terms.js');assert.equal(content.TERMS.length,81);
 for(const term of original.TERMS){const t=content.TERMS.find(x=>x.id===term.id);assert.equal(t.d,term.d);assert.equal(t.u,term.u);assert.deepEqual(t.rel,term.rel);}
});
test('all main surfaces produce values and map geometry',()=>{
 const a=app();for(const view of ['hub','map','learn','decks','cards','glossary','locked']){a.state.view=view;assert.ok(a.renderVals());}
 assert.equal(a.renderVals().isLocked,true);
});
test('learning and flashcards update and persist progress',()=>{
 const a=app();a.startLine(1);const first=a.current();a.gotIt();assert.equal(a.state.learned[first.id],true);assert.equal(a.current().id,a.byLine[1][1].id);
 a.pickDeck('line',1);a.flip();assert.equal(a.state.flipped,true);a.stillFuzzy();assert.equal(a.state.flagged[first.id],true);assert.equal(a.load().flagged[first.id],true);assert.equal(a.state.sIdx,1);
 a.state.learned['removed-term']=true;assert.equal(a.travelled(),1);
});
function finish(a,correct){while(a.state.view==='quiz'){const q=a.state.quiz;const current=q.qs[q.i];a.pickOption(current.options.findIndex(o=>o.ok===correct));assert.ok(a.renderVals().isQuiz);a.quizPrimary();}return a.state.result;}
test('checkpoint locks answers, scores and supports missed review',()=>{
 const a=app();a.startQuiz('checkpoint',1);assert.equal(a.state.quiz.qs.length,10);assert.ok(a.state.quiz.qs.every(q=>q.term.line===1));
 a.pickOption(-1);assert.equal(a.state.quiz.answered,false);
 const index=a.state.quiz.qs[0].options.findIndex(o=>o.ok);a.pickOption(index);a.pickOption(index);assert.equal(a.state.quiz.correct,1);
 a.quizPrimary();const r=finish(a,false);assert.equal(r.correct,1);assert.equal(a.state.scores.line1,10);assert.ok(a.renderVals().isResult);a.startDrill();assert.ok(a.state.quiz.qs.length);assert.ok(a.state.quiz.qs.every(q=>a.state.miss[q.term.id]));
});
test('exam requires completion, practice awards no badge, completed exam does',()=>{
 const a=app();a.goExam();assert.equal(a.state.view,'locked');a.startQuiz('exam');assert.equal(a.state.view,'locked');
 a.forceExam();assert.equal(a.state.quiz.mode,'practice');assert.equal(a.state.quiz.qs.length,30);finish(a,true);assert.equal(a.state.badges.ai,undefined);assert.equal(a.state.scores.exam,undefined);
 a.state.learned=Object.fromEntries(a.TERMS.map(t=>[t.id,true]));a.goExam();finish(a,true);assert.equal(a.state.scores.exam,100);assert.equal(a.state.badges.ai.pct,100);assert.ok(a.renderVals().isResult);
});
test('activities sit on the line and complete through steps',()=>{
 assert.ok(content.ACTIVITIES.length>=3);
 const a=app();const act=a.ACTIVITIES.find(x=>x.id==='write-a-prompt');assert.ok(act);assert.equal(act.kind,'activity');
 a.jumpTo(act.id);assert.equal(a.state.view,'learn');assert.equal(a.current().id,act.id);
 const vals=a.renderVals();assert.equal(vals.isActivity,true);assert.equal(vals.actIsRead,true);
 a.activityContinue();assert.equal(a.state.actStep,1);assert.equal(a.renderVals().actIsPrompt,true);
 while(a.current()?.id===act.id){const step=a.activityStep();if(step?.type==='quiz'&&!a.state.actRevealed)a.pickActOption(step.options.findIndex(o=>o.ok));a.activityContinue();}
 assert.equal(a.state.learned[act.id],true);
});
test('malformed and duplicate Markdown headings fail clearly',()=>{
 assert.throws(()=>parseMarkdown('No heading','bad.md'),/bad.md/);assert.throws(()=>parseMarkdown('# Title\n## ID\na\n## ID\nb'),/repeated/);
});
test('editor mistakes fail validation with actionable messages',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'interchange-test-'));try{
 await cp('content',dir,{recursive:true});const p=join(dir,'journeys/ai-lingo/tracks/1/knowledge-check.md');const original=await readFile(p,'utf8');
 await writeFile(p,original.replace('- [x] Artificial Intelligence (AI)','- [ ] Artificial Intelligence (AI)'));await assert.rejects(()=>loadContent(dir),/exactly one correct/);
 await writeFile(p,original.replace('### Term\n\nai','### Term\n\nmissing'));await assert.rejects(()=>loadContent(dir),/unknown Term/);
 await writeFile(p,original);await writeFile(join(dir,'journeys/ai-lingo/exam/metadata.md'),'# Exam\n## Question count\n999\n## Pass percentage\n80\n## Description\nTest');await assert.rejects(()=>loadContent(dir),/exceeds/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
