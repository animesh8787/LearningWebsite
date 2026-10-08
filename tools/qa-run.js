const fs=require('fs'),path=require('path'),cp=require('child_process'),os=require('os');
global.window=global; global.LESSONS={}; global.registerLesson=(id,d)=>{LESSONS[id]=d};
for(const d of ['cpp','stl']) for(const f of fs.readdirSync('../content/'+d)) new Function(fs.readFileSync('../content/'+d+'/'+f,'utf8'))();
const want=process.argv.slice(2); const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'qr-'));
for(const [id,d] of Object.entries(LESSONS)) d.blocks.forEach((b,i)=>{
  if(b.t!=='code'||!/\bmain\s*\(/.test(b.code)||!want.includes(b.file)) return;
  const src=path.join(tmp,'a.cpp'),exe=path.join(tmp,'a.exe'); fs.writeFileSync(src,b.code);
  const c=cp.spawnSync('g++',['-std=c++14','-w','-o',exe,src],{encoding:'utf8'});
  if(c.status){console.log('== '+b.file+' COMPILE ERR\n'+c.stderr.slice(0,400));return;}
  const r=cp.spawnSync(exe,[],{encoding:'utf8',timeout:5000,input:''});
  console.log('== '+id+'/'+b.file+'\n'+(r.stdout||'').trim().split('\n').slice(0,14).join('\n')+(r.status?('\n[exit '+r.status+']'):''));
});
