import {mkdir,copyFile,writeFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {loadContent} from './content.mjs';

async function copyDir(src, dest){
 await mkdir(dest,{recursive:true});
 for(const entry of await readdir(src,{withFileTypes:true})){
  const from=join(src,entry.name), to=join(dest,entry.name);
  if(entry.isDirectory()) await copyDir(from,to);
  else if(entry.isFile() && entry.name!=='.gitkeep') await copyFile(from,to);
 }
}

export async function build(){
 const content=await loadContent();
 await mkdir('dist/vendor',{recursive:true});
 await copyDir('assets','dist/assets');
 for(const f of ['index.html','app.css','accessibility.js'])await copyFile(f,`dist/${f}`);
 await copyFile('original/support.js','dist/support.js');
 await copyFile('node_modules/react/umd/react.production.min.js','dist/vendor/react.js');
 await copyFile('node_modules/react-dom/umd/react-dom.production.min.js','dist/vendor/react-dom.js');
 await writeFile('dist/content.js',Object.entries(content).map(([k,v])=>`export const ${k} = ${JSON.stringify(v)};`).join('\n'));
 console.log(`Built journey ${content.ACTIVE_JOURNEY}: ${content.TERMS.length} terms, ${content.LINES.length} tracks, ${content.QUESTIONS.length} questions (${content.JOURNEYS.length} journey(s) total).`);
 return content;
}
if(process.argv[1]?.endsWith('/build.mjs'))await build();
