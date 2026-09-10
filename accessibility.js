document.addEventListener('keydown',event=>{
 const target=event.target;
 if((event.key==='Enter'||event.key===' ')&&target.matches('[role="button"]')&&!target.matches('button,a,input')){
  event.preventDefault();event.stopImmediatePropagation();
  if(target.getAttribute('aria-disabled')!=='true')target.click();
 }
},true);
let previousStep;
const observer=new MutationObserver(()=>{
 const main=document.querySelector('[role="main"]');
 if(!main)return;
 const step=main.dataset.step;
 if(step!==previousStep){const wasReady=previousStep!==undefined;previousStep=step;if(wasReady)document.getElementById('view-title')?.focus();}
});
observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-step']});
