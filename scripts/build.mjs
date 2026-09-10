import {mkdir,copyFile,writeFile} from 'node:fs/promises';
import {loadContent} from './content.mjs';
export async function build(){
 const content=await loadContent();
 await mkdir('dist/vendor',{recursive:true});
 for(const f of ['index.html','app.css','accessibility.js'])await copyFile(f,`dist/${f}`);
 await copyFile('original/support.js','dist/support.js');
 await copyFile('node_modules/react/umd/react.production.min.js','dist/vendor/react.js');
 await copyFile('node_modules/react-dom/umd/react-dom.production.min.js','dist/vendor/react-dom.js');
 await writeFile('dist/content.js',Object.entries(content).map(([k,v])=>`export const ${k} = ${JSON.stringify(v)};`).join('\n'));
 console.log(`Built ${content.TERMS.length} terms, ${content.LINES.length} journeys and ${content.QUESTIONS.length} questions.`);
 return content;
}
if(process.argv[1]?.endsWith('/build.mjs'))await build();
