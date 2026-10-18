const fs=require('fs'),path=require('path');
global.window=global; global.LESSONS={};global.registerLesson=(id,d)=>{LESSONS[id]=d};
let bad=0;
for(const dir of ['cpp','stl'].map(d=>path.join(__dirname,'..','content',d))){ if(!fs.existsSync(dir))continue;
 for(const f of fs.readdirSync(dir)){ try{ new Function(fs.readFileSync(path.join(dir,f),'utf8'))(); const id=f.replace('.js',''); if(!LESSONS[id]) throw new Error('did not register '+id);
   const d=LESSONS[id]; if(!d.title||!d.lead||!Array.isArray(d.blocks)) throw new Error('bad shape');
   const known=['h2','h3','p','ul','callout','levels','code','viz','table','quiz','recap'];
   d.blocks.forEach((b,i)=>{ if(!known.includes(b.t)) throw new Error('unknown block '+b.t+' #'+i); if(b.t==='quiz'&&(b.ans==null||!b.opts[b.ans])) throw new Error('quiz ans #'+i); });
   if(!d.blocks.some(b=>b.t==='recap')) throw new Error('no recap');
   const kinds=['memory','typebox','array','callstack','heapview','pipeline','bits','bigo','exprlab','ascii','grid2d','stamp','vecgrow','heaptree','bst','hashtab','deqblocks','listviz','decision'];
   d.blocks.forEach((b,i)=>{ if(b.t==='viz'&&!kinds.includes(b.kind)) throw new Error('unknown viz kind '+b.kind+' #'+i); });
   // the landing page promises these for every lesson
   if(!d.blocks.some(b=>b.t==='viz')) throw new Error('no visualizer');
   const lv=d.blocks.find(b=>b.t==='levels'); if(!lv||!lv.eli5||!lv.plain||!lv.tech) throw new Error('missing eli5/plain/tech levels block');
   }catch(e){bad++;console.log('FAIL',dir,f,e.message)} } }
const n=Object.keys(LESSONS).length;
console.log(n+' lessons ok, '+bad+' failed');
if(!n||bad)process.exit(1); // 0 lessons means the paths are wrong, not that everything passed
