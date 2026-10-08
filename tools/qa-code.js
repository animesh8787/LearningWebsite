const fs=require('fs'),path=require('path'),cp=require('child_process'),os=require('os');
global.window=global; global.LESSONS={}; global.registerLesson=(id,d)=>{LESSONS[id]=d};
for(const dir of ['../content/cpp','../content/stl']){ if(!fs.existsSync(dir))continue; for(const f of fs.readdirSync(dir)) new Function(fs.readFileSync(path.join(dir,f),'utf8'))(); }
const cxx=process.argv[2]; const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'qa-'));
let n=0,bad=0,frag=0;
for(const [id,d] of Object.entries(LESSONS)) d.blocks.forEach((b,i)=>{ if(b.t!=='code') return; n++;
  const hasMain=/\bmain\s*\(/.test(b.code);
  if(!hasMain && b.run!==false){ frag++; console.log('FRAGMENT-with-Run',id,'#'+i,b.file); return; }
  if(!hasMain) return; if(!cxx) return; if(b.std17&&!process.env.STD) return;
  const p=path.join(tmp,id+'_'+i+'.cpp'); fs.writeFileSync(p,b.code);
  const r=cp.spawnSync(cxx,[process.env.STD||'-std=c++14','-fsyntax-only','-w',p],{encoding:'utf8'});
  if(r.status!==0){bad++;console.log('COMPILE FAIL',id,'#'+i,b.file,'\n',(r.stderr||'').split('\n').slice(0,6).join('\n'))}
});
console.log({blocks:n,fragmentsWithRun:frag,compileFailures:bad});
