// Local-only QA controls, injected by the local server when ?audit is present.
const panel=document.createElement('aside');panel.setAttribute('aria-label','Local accessibility testing');panel.style.cssText='padding:20px;background:white;color:black';
const run=document.createElement('button');run.textContent='Run accessibility audit';panel.append(run);
const spacing=document.createElement('button');spacing.textContent='Toggle text spacing test';panel.append(spacing);
const style=document.createElement('style');style.textContent='';document.head.append(style);
spacing.onclick=()=>{style.textContent=style.textContent?'':'*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}';};
const result=document.createElement('pre');result.id='audit-results';result.hidden=true;panel.append(result);document.body.append(panel);
run.onclick=async()=>{run.disabled=true;result.textContent='Running';try{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}});result.textContent=JSON.stringify({view:document.querySelector('[role="main"]')?.dataset.view,width:innerWidth,height:innerHeight,version:r.testEngine.version,violations:r.violations,incomplete:r.incomplete,passes:r.passes.map(x=>x.id)},null,2);}catch(e){result.textContent=JSON.stringify({error:e.message});}finally{run.disabled=false;}};
