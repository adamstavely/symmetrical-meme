document.addEventListener('keydown',event=>{
 const target=event.target;
 if((event.key==='Enter'||event.key===' ')&&target.matches('[role="button"]')&&!target.matches('button,a,input')){
  event.preventDefault();event.stopImmediatePropagation();
  if(target.getAttribute('aria-disabled')!=='true')target.click();
 }
},true);
let previousStep;
let viewMoves=0;
const observer=new MutationObserver(()=>{
 const main=document.querySelector('[role="main"]');
 if(!main)return;
 const step=main.dataset.step;
 if(step!==previousStep){
  const wasReady=previousStep!==undefined;
  previousStep=step;
  // Skip the hydration transition (loading placeholder → restored hub/home).
  // Only move focus on later in-app navigations, and never force :focus-visible
  // so the clipped view-title does not flash for sighted users.
  if(wasReady){
   viewMoves+=1;
   if(viewMoves>1){
    const title=document.getElementById('view-title');
    if(title){
     try{ title.focus({preventScroll:true,focusVisible:false}); }
     catch(e){ title.focus(); }
    }
   }
  }
 }
});
observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-step']});
