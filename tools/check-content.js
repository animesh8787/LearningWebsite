const fs=require('fs'),path=require('path');
global.window=global; global.LESSONS={};global.registerLesson=(id,d)=>{LESSONS[id]=d};
let bad=0;
for(const dir of ['../content/cpp','../content/stl']){ if(!fs.existsSync(dir))continue;
 for(const f of fs.readdirSync(dir)){ try{ new Function(fs.readFileSync(path.join(dir,f),'utf8'))(); const id=f.replace('.js',''); if(!LESSONS[id]) throw new Error('did not register '+id);
   const d=LESSONS[id]; if(!d.title||!d.lead||!Array.isArray(d.blocks)) throw new Error('bad shape');
   const known=['h2','h3','p','ul','callout','levels','code','viz','table','quiz','recap'];
   d.blocks.forEach((b,i)=>{ if(!known.includes(b.t)) throw new Error('unknown block '+b.t+' #'+i); if(b.t==='quiz'&&(b.ans==null||!b.opts[b.ans])) throw new Error('quiz ans #'+i); });
   if(!d.blocks.some(b=>b.t==='recap')) throw new Error('no recap');
   }catch(e){bad++;console.log('FAIL',dir,f,e.message)} } }
console.log(Object.keys(LESSONS).length+' lessons ok, '+bad+' failed');
