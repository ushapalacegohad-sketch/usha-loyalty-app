// Hotel Usha Palace loyalty app. Zero dependencies, needs Node 18+.
const http=require('http'),fs=require('fs'),path=require('path');
const E=process.env,PORT=E.PORT||3000,PASS=E.OWNER_PASSWORD||'changeme';
const CFG={name:E.BIZ_NAME||'Hotel Usha Palace',total:+(E.TOTAL_STAMPS||5),reward:E.REWARD||'10% off on your bill',cooldown:+(E.COOLDOWN_MIN||30)};
const DIR=E.DATA_DIR||path.join(__dirname,'data'),FILE=path.join(DIR,'customers.json'),PUB=path.join(__dirname,'public');
fs.mkdirSync(DIR,{recursive:true});
let db={};try{db=JSON.parse(fs.readFileSync(FILE))}catch{}
const save=()=>fs.writeFileSync(FILE,JSON.stringify(db));
const MIME={'.html':'text/html','.js':'text/javascript','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
async function notify(t){if(!E.TELEGRAM_BOT_TOKEN||!E.TELEGRAM_CHAT_ID)return;
  try{await fetch(`https://api.telegram.org/bot${E.TELEGRAM_BOT_TOKEN}/sendMessage`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:E.TELEGRAM_CHAT_ID,text:t})})}catch(e){console.error('notify failed',e.message)}}
const send=(res,code,o)=>{res.writeHead(code,{'content-type':'application/json'});res.end(JSON.stringify(o))};
const body=req=>new Promise(ok=>{let b='';req.on('data',c=>{b+=c;if(b.length>3e5)req.destroy()});req.on('end',()=>{try{ok(JSON.parse(b||'{}'))}catch{ok({})}});req.on('error',()=>ok({}))});
const pub=c=>({name:c.name,stamps:c.stamps,rewards:c.rewards,total:CFG.total,reward:CFG.reward,business:CFG.name});
http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://x');
 try{
  if(u.pathname==='/api/config')return send(res,200,CFG);
  if(u.pathname==='/api/card'){const c=db[u.searchParams.get('phone')];return c?send(res,200,pub(c)):send(res,404,{error:'Card not found'})}
  if(u.pathname==='/api/stamp'&&req.method==='POST'){
   const b=await body(req),ph=String(b.phone||'').replace(/\D/g,'').slice(-10);
   if(ph.length!==10)return send(res,400,{error:'Enter a valid 10 digit mobile number'});
   let c=db[ph],isNew=false;
   if(!c){const name=String(b.name||'').trim().slice(0,60);
    if(name.length<2||!b.consent||!String(b.sig||'').startsWith('data:image/png'))return send(res,400,{error:'Name, signature and agreement are required'});
    c=db[ph]={name,phone:'91'+ph,sig:b.sig,stamps:0,rewards:0,last:0,joined:Date.now()};isNew=true}
   const now=Date.now();let msg;
   if(c.stamps>=CFG.total)msg='Card is full. Show it to staff to redeem your reward.';
   else if(!isNew&&now-c.last<CFG.cooldown*60000)msg='Already stamped recently. Come back later.';
   else{c.stamps++;c.last=now;save();msg='Stamp added!';
    notify(`${isNew?'🆕 New customer':'⭐ Stamp'} at ${CFG.name}\n${c.name}\n📞 ${ph}\nStamps: ${c.stamps}/${CFG.total}`+(c.stamps>=CFG.total?'\n🎁 Reward ready!':''))}
   return send(res,200,{...pub(c),phone:ph,message:msg});
  }
  if(u.pathname.startsWith('/api/owner/')){
   if(req.headers['x-owner-key']!==PASS)return send(res,401,{error:'Wrong password'});
   if(u.pathname==='/api/owner/customers')return send(res,200,{cfg:CFG,list:Object.values(db).sort((a,b)=>b.last-a.last)});
   if(u.pathname==='/api/owner/redeem'&&req.method==='POST'){
    const b=await body(req),c=db[String(b.phone||'').slice(-10)];
    if(!c||c.stamps<CFG.total)return send(res,400,{error:'Not eligible'});
    c.stamps=0;c.rewards++;save();return send(res,200,{ok:1})}
   return send(res,404,{error:'Not found'});
  }
  const p=u.pathname==='/'?'/index.html':u.pathname==='/owner'?'/owner.html':u.pathname;
  const f=path.join(PUB,path.normalize(p));
  if(!f.startsWith(PUB)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end('Not found')}
  res.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);
 }catch(e){console.error(e);send(res,500,{error:'Server error'})}
}).listen(PORT,()=>console.log('Running on port '+PORT));
