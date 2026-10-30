/* X Architecture — Community: projects, boards, search. Loaded on demand by index.html (needs SITE, RU, T, esc, rgo). */
(function(){
'use strict';
var API=(window.SITE&&SITE.api)||'';
var SW=['Revit','AutoCAD','Rhino','SketchUp','3ds Max','Blender','Lumion','Enscape','D5 Render','Twinmotion','V-Ray','Corona','Grasshopper','Photoshop','Illustrator','InDesign','ArchiCAD','Hand'];
var TG=[['سكني','Residential'],['تجاري','Commercial'],['ثقافي','Cultural'],['تعليمي','Educational'],['داخلي','Interior'],['حضري','Urban'],['مفهومي','Conceptual'],['ترميم','Restoration'],['استدامة','Sustainable']];
var NOTEC=4,MAXIMG=6;
var S={srv:null,feed:[],mine:[],liked:{},ak:'',tab:'all',who:'',q:'',loading:false,mineLoaded:false,sb:null,modal:null,board:null,boardDirty:false,pushed:false,pend:0};
var $=function(i){return document.getElementById(i)};
function tt(a,e){return T(a,e)}
function authed(){return !!(window.RU&&RU.tok&&RU.email)}
function toast(m){var t=$('cmtoast');if(!t)return;t.textContent=m;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(function(){t.classList.remove('on')},3200)}
function need(){if(authed())return true;toast(tt('سجّل ببريد مؤكَّد أولاً','Register with a confirmed e-mail first'));if(typeof rgo==='function')rgo();return false}
function uid(){return Math.random().toString(36).slice(2,10)}
function ago(t){var d=(Date.now()-t)/1000;if(d<90)return tt('الآن','now');if(d<3600)return Math.round(d/60)+tt(' د',' min');if(d<86400)return Math.round(d/3600)+tt(' س',' h');if(d<86400*30)return Math.round(d/86400)+tt(' يوم',' d');try{return new Date(t).toLocaleDateString(L==='ar'?'ar-IQ-u-nu-latn':'en',{day:'numeric',month:'short'})}catch(e){return''}}
function norm(s){return String(s||'').toLowerCase().replace(/[ً-ٰٟـ]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/[^a-z0-9؀-ۿÀ-ɏ ]+/g,' ').replace(/\s+/g,' ').trim()}
function imgUrl(id,w){if(!id)return'';if(id.indexOf('data:')===0||id.indexOf('blob:')===0)return id;return'https://lh3.googleusercontent.com/d/'+encodeURIComponent(id)+'=w'+(w||800)}
function imgFb(id,w){return'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w'+(w||800)}
function ico(n){var P={heart:'M12 20.5s-7.5-4.6-7.5-10.3A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.6c0 5.7-7.5 10.3-7.5 10.3z',plus:'M12 5v14M5 12h14',x:'M6 6l12 12M18 6L6 18',trash:'M5 7h14M10 7V4.5h4V7M7 7l1 12.5h8L17 7',link:'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',flag:'M6 21V4h11l-2 4 2 4H6',search:'M10.5 4a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM16 16l5 5',img:'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 9.5v.01',note:'M5 4h14v11l-5 5H5zM14 20v-5h5',fit:'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',min:'M5 12h14',up:'M12 19V6M6 11l6-6 6 6',left:'M15 5l-7 7 7 7',right:'M9 5l7 7-7 7',front:'M8 8h11v11H8zM5 15V5h10',share:'M12 4v11M7 9l5-5 5 5M5 20h14',check:'M5 12.5l4.5 4.5L19 7.5',board:'M4 5h7v7H4zM13 5h7v4h-7zM13 11h7v8h-7zM4 14h7v5H4z'};return'<svg class="cmic" viewBox="0 0 24 24" aria-hidden="true"><path d="'+(P[n]||'')+'"/></svg>'}

/* ---------- network ---------- */
function tmo(p,ms){return new Promise(function(ok,no){var t=setTimeout(function(){no(new Error('timeout'))},ms||25000);p.then(function(v){clearTimeout(t);ok(v)},function(e){clearTimeout(t);no(e)})})}
function jget(q){return tmo(fetch(API+'?'+q).then(function(r){return r.json()}),20000)}
function jpost(o,ms){return tmo(fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(o)}).then(function(r){return r.json()}),ms||30000)}
function ap(o,ms){o.email=RU.email;o.tok=RU.tok;return jpost(o,ms)}
function emsg(c){var m={auth:tt('انتهت صلاحية الدخول. افتح ملفك وأكّد بريدك مجدداً','Your session expired. Open your profile and confirm your e-mail again'),title:tt('اكتب عنواناً','Add a title'),links:tt('الروابط ممنوعة في العنوان وثلاثة كحد أقصى في الوصف','No links in the title, three at most in the text'),wait:tt('انتظر دقيقة قبل النشر مجدداً','Wait a minute before posting again'),limit:tt('وصلت إلى الحد اليومي. جرّب غداً','You reached today\'s limit. Try tomorrow'),big:tt('الصورة كبيرة جداً','The picture is too big'),type:tt('صيغة الصورة غير مدعومة','This picture format is not supported'),noimg:tt('أضف صورة واحدة على الأقل','Add at least one picture'),consent:tt('وافق على الشرط أولاً','Accept the condition first'),empty:tt('اللوحة فارغة','The board is empty'),bigboard:tt('اللوحة كبيرة. احذف بعض العناصر','The board is too big. Remove a few items'),gone:tt('المنشور غير موجود','This post no longer exists')};return m[c]||tt('تعذّر التنفيذ. حاول لاحقاً','Could not do it. Try again later')}

/* ---------- images ---------- */
function shrink(file,max,q){
  return new Promise(function(ok,no){
    if(!file||(!/^image\//.test(file.type||'')&&!/\.(jpe?g|png|webp|gif|avif|bmp)$/i.test(file.name||'')))return no('type');
    if(file.size>30e6)return no('big');
    var u=URL.createObjectURL(file),im=new Image();
    im.onload=function(){URL.revokeObjectURL(u);var w0=im.naturalWidth||im.width,h0=im.naturalHeight||im.height,m=max,qq=q,out;
      for(var i=0;i<5;i++){
        var k=Math.min(1,m/Math.max(w0,h0)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(w0*k));c.height=Math.max(1,Math.round(h0*k));
        var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);
        out={url:c.toDataURL('image/jpeg',qq),w:c.width,h:c.height};if(out.url.length<1300000)break;m*=.8;qq*=.9}
      if(out.url.length>=1400000)return no('big');ok(out)};
    im.onerror=function(){URL.revokeObjectURL(u);no('type')};im.src=u})}
function upImg(data,kind){return ap({a:'cimg',data:data,k:kind||'p'},45000)}

/* ---------- local storage of the board (IndexedDB, memory as a fallback) ---------- */
var IDB={mem:{},db:null,p:null,open:function(){if(this.p)return this.p;var self=this;this.p=new Promise(function(ok){try{var r=indexedDB.open('xcm',1);r.onupgradeneeded=function(){r.result.createObjectStore('kv')};r.onsuccess=function(){self.db=r.result;ok(self.db)};r.onerror=function(){ok(null)};r.onblocked=function(){ok(null)}}catch(e){ok(null)}});return this.p},
  get:function(k){var self=this;return this.open().then(function(db){if(!db)return self.mem[k]||null;return new Promise(function(ok){try{var q=db.transaction('kv').objectStore('kv').get(k);q.onsuccess=function(){ok(q.result||null)};q.onerror=function(){ok(self.mem[k]||null)}}catch(e){ok(self.mem[k]||null)}})})},
  set:function(k,v){var self=this;self.mem[k]=v;return this.open().then(function(db){if(!db)return;return new Promise(function(ok){try{var t=db.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=function(){ok()};t.onerror=function(){ok()}}catch(e){ok()}})})}};
function bkey(){return 'board:'+(authed()?RU.email.toLowerCase():'guest')}

/* ---------- the board: a canvas you can pan and zoom, with picture, note and project cards ---------- */
function mkBoard(host,o){
  o=o||{};
  var ro=!!o.ro,st={cards:[],view:{x:60,y:60,k:1}},selId=null,undo=[],ptrs={},mode=null,pinch=null,W,KMIN=.12,KMAX=3,onPaste=null,destroyed=false;
  host.classList.add('cbv');host.classList.toggle('ro',ro);host.setAttribute('tabindex','0');
  host.setAttribute('aria-label',tt('لوحة: اسحب للتحريك، العجلة للتكبير','Board: drag to pan, wheel to zoom'));
  host.innerHTML='<div class="cbw"></div><div class="cbz" role="group" aria-label="'+esc(tt('تكبير','Zoom'))+'"><button type="button" data-z="in" aria-label="'+esc(tt('تكبير','Zoom in'))+'">'+ico('plus')+'</button><button type="button" data-z="out" aria-label="'+esc(tt('تصغير','Zoom out'))+'">'+ico('min')+'</button><button type="button" data-z="fit" aria-label="'+esc(tt('اعرض الكل','Fit all'))+'">'+ico('fit')+'</button></div>'+(ro?'':'<p class="cbe">'+esc(tt('أسقط صورة هنا، أو الصقها (Ctrl+V)، أو انقر مرتين لإضافة ملاحظة','Drop a picture here, paste it (Ctrl+V), or double-click to add a note'))+'</p>');
  W=host.querySelector('.cbw');
  var empt=host.querySelector('.cbe');
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
  function apply(){var v=st.view;W.style.transform='translate('+v.x+'px,'+v.y+'px) scale('+v.k+')';host.style.setProperty('--k',v.k);host.style.backgroundPosition=v.x+'px '+v.y+'px';host.style.backgroundSize=(32*v.k)+'px '+(32*v.k)+'px'}
  function byId(id){for(var i=0;i<st.cards.length;i++)if(st.cards[i].id===id)return st.cards[i];return null}
  function elOf(id){return W.querySelector('.cbc[data-id="'+id+'"]')}
  function chg(){if(o.onChange)o.onChange(api)}
  function snap(){undo.push(st.cards.map(function(c){return Object.assign({},c)}));if(undo.length>40)undo.shift()}
  function zmax(){var m=0;st.cards.forEach(function(c){if((c.z||0)>m)m=c.z||0});return m}
  function place(c){var el=elOf(c.id);if(!el)return;el.style.transform='translate('+c.x+'px,'+c.y+'px)';el.style.width=c.w+'px';el.style.height=c.h+'px';el.style.zIndex=c.z||1}
  function label(c){return c.t==='i'?tt('صورة','Picture'):c.t==='n'?(c.tx||tt('ملاحظة','Note')).slice(0,40):(c.ti||tt('مشروع','Project'))}
  function build(c){
    var el=document.createElement('div');el.className='cbc t'+c.t+(c.pend?' pend':'')+(c.fail?' fail':'');el.dataset.id=c.id;el.tabIndex=0;el.setAttribute('role','group');el.setAttribute('aria-label',label(c));
    var h='';
    if(c.t==='i')h='<img alt="" draggable="false" data-id="'+esc(c.src)+'" src="'+esc(imgUrl(c.src,900))+'"><i class="cbs" aria-hidden="true"></i>';
    else if(c.t==='n')h='<div class="cbn n'+(c.c||0)+'"'+(ro?' dir="auto"></div>':'><textarea dir="auto" maxlength="600" aria-label="'+esc(tt('نص الملاحظة','Note text'))+'"></textarea></div>');
    else h='<div class="cbp"><span class="cbpi">'+(c.im?'<img alt="" draggable="false" data-id="'+esc(c.im)+'" src="'+esc(imgUrl(c.im,400))+'">':'')+'</span><b dir="auto"></b><small dir="auto"></small></div>';
    if(!ro){h+='<span class="cbh" data-h></span><div class="cbk">'+(c.t==='n'?[0,1,2,3].map(function(i){return'<button type="button" class="cbd n'+i+'" data-a="col" data-v="'+i+'" aria-label="'+esc(tt('لون','Colour'))+' '+(i+1)+'"></button>'}).join(''):'')+'<button type="button" data-a="front" aria-label="'+esc(tt('إلى الأمام','Bring to front'))+'">'+ico('front')+'</button><button type="button" data-a="del" aria-label="'+esc(tt('حذف','Delete'))+'">'+ico('trash')+'</button></div>'}
    el.innerHTML=h;
    if(c.t==='n'){var ta=el.querySelector('textarea'),dv=el.querySelector('.cbn');if(ta)ta.value=c.tx||'';else dv.textContent=c.tx||''}
    if(c.t==='p'){el.querySelector('b').textContent=c.ti||'';el.querySelector('small').textContent=c.n||''}
    return el}
  function renderAll(){W.innerHTML='';st.cards.slice().sort(function(a,b){return(a.z||0)-(b.z||0)}).forEach(function(c){var el=build(c);W.appendChild(el);place(c)});if(selId&&!byId(selId))selId=null;mark();if(empt)empt.hidden=st.cards.length>0}
  function mark(){var els=W.querySelectorAll('.cbc');for(var i=0;i<els.length;i++)els[i].classList.toggle('sel',els[i].dataset.id===selId)}
  function select(id){if(selId===id)return;selId=id;mark()}
  function front(c){var m=zmax();if((c.z||0)<m||!c.z){c.z=m+1;place(c)}}
  function view(){return{w:host.clientWidth||600,h:host.clientHeight||400}}
  function toWorld(px,py){var v=st.view;return{x:(px-v.x)/v.k,y:(py-v.y)/v.k}}
  function rel(e){var r=host.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
  function center(){var s=view();return toWorld(s.w/2,s.h/2)}
  function zoomAt(px,py,k2){var v=st.view;k2=clamp(k2,KMIN,KMAX);v.x=px-(px-v.x)*(k2/v.k);v.y=py-(py-v.y)*(k2/v.k);v.k=k2;apply()}
  function fit(){
    if(!st.cards.length){st.view={x:60,y:60,k:1};apply();return}
    var x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;st.cards.forEach(function(c){x0=Math.min(x0,c.x);y0=Math.min(y0,c.y);x1=Math.max(x1,c.x+c.w);y1=Math.max(y1,c.y+c.h)});
    var s=view(),bw=Math.max(1,x1-x0),bh=Math.max(1,y1-y0),k=clamp(Math.min((s.w-80)/bw,(s.h-80)/bh),KMIN,1.6);
    st.view={k:k,x:(s.w-bw*k)/2-x0*k,y:(s.h-bh*k)/2-y0*k};apply()}
  function addCard(c,pos){
    var at=pos||center(),n=st.cards.length%6;c.id=uid();c.x=Math.round((at.x-c.w/2)+(pos?0:n*18));c.y=Math.round((at.y-c.h/2)+(pos?0:n*18));c.z=zmax()+1;
    snap();st.cards.push(c);var el=build(c);W.appendChild(el);place(c);select(c.id);if(empt)empt.hidden=true;chg();return c}
  function remove(id){var c=byId(id);if(!c)return;snap();st.cards=st.cards.filter(function(x){return x.id!==id});if(selId===id)selId=null;var el=elOf(id);if(el)el.remove();if(empt)empt.hidden=st.cards.length>0;chg()}
  function doUndo(){var s=undo.pop();if(!s)return;st.cards=s;renderAll();chg()}
  function addNote(pos){var c=addCard({t:'n',w:200,h:140,tx:'',c:0},pos),el=elOf(c.id),ta=el&&el.querySelector('textarea');if(ta)setTimeout(function(){ta.focus()},30);return c}
  function addImgs(files,pos){
    files=[].slice.call(files||[]).filter(function(f){return f&&(/^image\//.test(f.type||'')||/\.(jpe?g|png|webp|gif|avif|bmp)$/i.test(f.name||''))}).slice(0,12);
    var bad=0,i=0,made=[];
    function next(){if(i>=files.length){if(bad)toast(tt('تعذّر فتح '+bad+' ملف (صيغة غير مدعومة)','Could not open '+bad+' file(s) (unsupported format)'));return Promise.resolve(made)}
      var f=files[i++];return shrink(f,1400,.8).then(function(r){var w=320,h=Math.round(w*r.h/r.w);if(h>420){h=420;w=Math.round(h*r.w/r.h)}
        var p=pos?{x:pos.x+(i-1)*24,y:pos.y+(i-1)*24}:null,c=addCard({t:'i',w:w,h:h,src:r.url,pend:1},p);made.push(c);if(o.onAdd)o.onAdd(c)},function(){bad++}).then(next)}
    return next()}
  function addProj(p){
    var ex=st.cards.filter(function(c){return c.t==='p'&&c.pid===p.id})[0];if(ex){focus(ex.id);return{dup:true,c:ex}}
    return{c:addCard({t:'p',w:230,h:200,pid:p.id,ti:p.ti,n:p.n,im:(p.im&&p.im[0])||''})}}
  function focus(id){var c=byId(id);if(!c)return;var s=view(),k=Math.max(st.view.k,.6);st.view={k:k,x:s.w/2-(c.x+c.w/2)*k,y:s.h/2-(c.y+c.h/2)*k};apply();select(id);var el=elOf(id);if(el){el.classList.remove('pulse');void el.offsetWidth;el.classList.add('pulse')}}
  function patch(id,f){var c=byId(id);if(c){f(c);chg()}}
  /* --- pointer: move / resize / pan / pinch --- */
  host.addEventListener('pointerdown',function(e){
    if(e.button>0&&e.pointerType==='mouse')return;
    if(e.target.closest('.cbk,.cbz'))return;
    var p=rel(e);ptrs[e.pointerId]={x:p.x,y:p.y};
    var n=Object.keys(ptrs).length;
    if(n===2){var ks=Object.keys(ptrs),a=ptrs[ks[0]],b=ptrs[ks[1]];pinch={d:Math.hypot(a.x-b.x,a.y-b.y)||1,k:st.view.k,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2,vx:st.view.x,vy:st.view.y};mode=null;return}
    if(n>2)return;
    var ce=e.target.closest('.cbc'),c=ce&&byId(ce.dataset.id);
    if(c&&!ro){
      if(e.target.closest('textarea')){select(c.id);return}
      select(c.id);front(c);
      if(e.target.hasAttribute&&e.target.hasAttribute('data-h')){snap();mode={t:'rs',c:c,sx:p.x,sy:p.y,w0:c.w,h0:c.h,moved:0}}
      else{snap();mode={t:'mv',c:c,sx:p.x,sy:p.y,x0:c.x,y0:c.y,moved:0}}
      try{host.setPointerCapture(e.pointerId)}catch(x){}
    }else if(c&&ro){mode={t:'tap',c:c,sx:p.x,sy:p.y,moved:0};try{host.setPointerCapture(e.pointerId)}catch(x){}}
    else{if(!ro)select(null);mode={t:'pan',sx:p.x,sy:p.y,vx:st.view.x,vy:st.view.y};try{host.setPointerCapture(e.pointerId)}catch(x){}host.classList.add('pan')}
  });
  host.addEventListener('pointermove',function(e){
    if(!ptrs[e.pointerId])return;var p=rel(e);ptrs[e.pointerId]={x:p.x,y:p.y};
    if(pinch){var ks=Object.keys(ptrs);if(ks.length<2)return;var a=ptrs[ks[0]],b=ptrs[ks[1]],d=Math.hypot(a.x-b.x,a.y-b.y)||1,cx=(a.x+b.x)/2,cy=(a.y+b.y)/2,k2=clamp(pinch.k*d/pinch.d,KMIN,KMAX),wx=(pinch.cx-pinch.vx)/pinch.k,wy=(pinch.cy-pinch.vy)/pinch.k;st.view={k:k2,x:cx-wx*k2,y:cy-wy*k2};apply();return}
    if(!mode)return;var dx=p.x-mode.sx,dy=p.y-mode.sy;mode.moved=Math.max(mode.moved||0,Math.abs(dx)+Math.abs(dy));
    if(mode.t==='pan'){st.view.x=mode.vx+dx;st.view.y=mode.vy+dy;apply()}
    else if(mode.t==='mv'){mode.c.x=Math.round(mode.x0+dx/st.view.k);mode.c.y=Math.round(mode.y0+dy/st.view.k);place(mode.c)}
    else if(mode.t==='rs'){var c=mode.c,nw=Math.max(70,Math.round(mode.w0+dx/st.view.k));if(c.t==='n'){c.w=Math.max(110,nw);c.h=Math.max(70,Math.round(mode.h0+dy/st.view.k))}else{c.h=Math.round(nw*mode.h0/mode.w0);c.w=nw}place(c)}
  });
  function up(e){
    delete ptrs[e.pointerId];if(pinch){if(Object.keys(ptrs).length<2)pinch=null;return}
    host.classList.remove('pan');
    if(mode){var m=mode;mode=null;
      if((m.t==='mv'||m.t==='rs')){if(m.moved>2)chg();else{undo.pop();if(m.c.t==='p'&&o.onProj)o.onProj(m.c.pid)}}
      else if(m.t==='tap'&&m.moved<6&&m.c.t==='p'&&o.onProj)o.onProj(m.c.pid)}
  }
  host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up);
  host.addEventListener('wheel',function(e){
    e.preventDefault();var p=rel(e);
    if(e.ctrlKey||e.metaKey||(e.deltaMode===0&&Math.abs(e.deltaY)>=50&&!e.deltaX))zoomAt(p.x,p.y,st.view.k*Math.exp(-e.deltaY*(e.ctrlKey?.01:.0016)));
    else{st.view.x-=e.deltaX;st.view.y-=e.deltaY;apply()}
  },{passive:false});
  host.addEventListener('dblclick',function(e){if(ro||e.target.closest('.cbc,.cbz'))return;var p=rel(e);addNote(toWorld(p.x,p.y))});
  host.addEventListener('click',function(e){
    var z=e.target.closest('[data-z]');
    if(z){var s=view();if(z.dataset.z==='fit')fit();else zoomAt(s.w/2,s.h/2,st.view.k*(z.dataset.z==='in'?1.25:.8));return}
    var b=e.target.closest('.cbk button');if(!b)return;var ce=b.closest('.cbc'),c=ce&&byId(ce.dataset.id);if(!c)return;
    var a=b.dataset.a;
    if(a==='del')remove(c.id);
    else if(a==='front'){snap();c.z=zmax()+1;place(c);chg()}
    else if(a==='col'){snap();c.c=+b.dataset.v;var nn=ce.querySelector('.cbn');nn.className='cbn n'+c.c;chg()}
  });
  host.addEventListener('input',function(e){var ta=e.target.closest&&e.target.closest('textarea');if(!ta)return;var ce=ta.closest('.cbc'),c=ce&&byId(ce.dataset.id);if(c){c.tx=ta.value;chg()}});
  host.addEventListener('focusin',function(e){var ce=e.target.closest&&e.target.closest('.cbc');if(ce&&!ro)select(ce.dataset.id)});
  host.addEventListener('keydown',function(e){
    var inTa=e.target&&e.target.tagName==='TEXTAREA';
    if(inTa){if(e.key==='Escape')e.target.blur();return}
    var c=selId&&byId(selId),step=e.shiftKey?24:4;
    if((e.ctrlKey||e.metaKey)&&(e.key==='z'||e.key==='Z')&&!ro){e.preventDefault();doUndo();return}
    if(e.key==='+'||e.key==='='){var s=view();zoomAt(s.w/2,s.h/2,st.view.k*1.2);return}
    if(e.key==='-'){var s2=view();zoomAt(s2.w/2,s2.h/2,st.view.k/1.2);return}
    if(e.key==='0'){fit();return}
    if(c&&!ro){
      if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();remove(c.id);host.focus();return}
      var d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
      if(d){e.preventDefault();snap();c.x+=d[0]*step;c.y+=d[1]*step;place(c);chg();return}
      if(e.key==='Escape'){select(null);host.focus()}
    }else{var d2={ArrowLeft:[1,0],ArrowRight:[-1,0],ArrowUp:[0,1],ArrowDown:[0,-1]}[e.key];if(d2){e.preventDefault();st.view.x+=d2[0]*40;st.view.y+=d2[1]*40;apply()}}
  });
  /* drop a picture from the computer, or paste one */
  if(!ro){
    host.addEventListener('dragover',function(e){if(e.dataTransfer&&[].indexOf.call(e.dataTransfer.types||[],'Files')>=0){e.preventDefault();host.classList.add('drop')}});
    host.addEventListener('dragleave',function(e){if(!host.contains(e.relatedTarget))host.classList.remove('drop')});
    host.addEventListener('drop',function(e){host.classList.remove('drop');var f=e.dataTransfer&&e.dataTransfer.files;if(!f||!f.length)return;e.preventDefault();var p=rel(e);addImgs(f,toWorld(p.x,p.y))});
    onPaste=function(e){
      if(destroyed||!host.isConnected||host.offsetParent===null)return;var a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))return;
      if($('cmm')&&!$('cmm').hidden)return;
      var cd=e.clipboardData;if(!cd)return;var fs=[];[].forEach.call(cd.items||[],function(it){if(it.kind==='file'&&/^image\//.test(it.type)){var f=it.getAsFile();if(f)fs.push(f)}});
      if(fs.length){e.preventDefault();addImgs(fs)}
      else{var tx=cd.getData('text/plain');if(tx&&tx.trim()){e.preventDefault();var c=addNote();c.tx=tx.trim().slice(0,600);var el=elOf(c.id),ta=el&&el.querySelector('textarea');if(ta)ta.value=c.tx;chg()}}};
    document.addEventListener('paste',onPaste);
  }
  host.addEventListener('error',function(e){var im=e.target;if(im&&im.tagName==='IMG'&&im.dataset.id&&!im.dataset.fb&&im.dataset.id.indexOf('data:')!==0){im.dataset.fb='1';im.src=imgFb(im.dataset.id,900)}},true);
  var api={
    state:function(){return st},
    load:function(s,noFit){st.cards=(s&&s.cards||[]).map(function(c){return Object.assign({},c)});if(s&&s.view)st.view=s.view;undo=[];selId=null;renderAll();if(noFit&&s&&s.view)apply();else fit()},
    addNote:addNote,addImgs:addImgs,addProj:addProj,remove:remove,fit:fit,focus:focus,patch:patch,byId:byId,
    redraw:function(id){var c=byId(id),el=elOf(id);if(!c||!el)return;var n=build(c);el.replaceWith(n);place(c);mark()},
    count:function(){return st.cards.length},
    destroy:function(){destroyed=true;if(onPaste)document.removeEventListener('paste',onPaste)}};
  apply();return api}

/* ---------- my board: local first, saved to the account when signed in ---------- */
var BD=null,BS={u:0,dirty:false,t:null,syncing:false,again:false},UPQ=[],UPIN={},UPB=false;
function stripCard(c){var o={};Object.keys(c).forEach(function(k){if(k!=='pend'&&k!=='fail')o[k]=c[k]});return o}
function isLocalSrc(c){return c.t==='i'&&String(c.src||'').indexOf('data:')===0}
function bdPersist(){
  if(!BD)return;var st=BD.state();
  IDB.set(bkey(),{u:BS.u,cards:st.cards.map(function(c){var o=Object.assign({},c);delete o.pend;return o}),view:st.view,d:BS.dirty?1:0})}
function bdChanged(){
  BS.dirty=true;BS.u=Date.now();clearTimeout(BS.t);BS.t=setTimeout(bdSave,900)}
function bdSave(){bdPersist();bdSync()}
function bdSync(){
  if(!BD||!authed()||!S.srv)return;
  if(BS.syncing){BS.again=true;return}
  var cards=BD.state().cards.filter(function(c){return!isLocalSrc(c)}).map(stripCard);
  var allUp=BD.state().cards.every(function(c){return!isLocalSrc(c)});
  BS.syncing=true;
  ap({a:'cbsave',b:{cards:cards}},30000).then(function(j){
    BS.syncing=false;
    if(j&&j.ok){BS.u=j.u;if(allUp&&!BS.again){BS.dirty=false}bdPersist()}
    else if(j&&j.err==='bigboard')toast(emsg('bigboard'));
    else if(j&&j.err==='auth'){}
  },function(){BS.syncing=false}).then(function(){if(BS.again){BS.again=false;bdSync()}})}
function queueUp(id){if(UPIN[id])return;UPIN[id]=1;UPQ.push(id);pump()}
function pump(){
  if(UPB||!UPQ.length)return;var id=UPQ.shift(),c=BD&&BD.byId(id);
  if(!c||!isLocalSrc(c)){delete UPIN[id];pump();return}
  UPB=true;
  function fail(m){UPB=false;delete UPIN[id];var cc=BD&&BD.byId(id);if(cc){cc.pend=0;cc.fail=1;BD.redraw(id)}if(m)toast(m);pump()}
  upImg(c.src,'b').then(function(j){
    if(j&&j.ok){UPB=false;delete UPIN[id];var cc=BD&&BD.byId(id);if(cc){cc.src=j.id;cc.pend=0;cc.fail=0;BD.redraw(id);bdChanged()}pump()}
    else fail(j&&j.err==='limit'?emsg('limit'):'')},function(){fail('')})}
function resumeUploads(){if(!BD||!authed()||!S.srv)return;BD.state().cards.forEach(function(c){if(isLocalSrc(c)){c.pend=1;BD.redraw(c.id);queueUp(c.id)}})}
function bdAdded(c){if(authed()&&S.srv){queueUp(c.id)}else{c.pend=0;BD.redraw(c.id)}}
function bdLoadInto(host){
  var old=BD&&BD.state();
  if(BD)BD.destroy();
  BD=mkBoard(host,{onChange:bdChanged,onAdd:bdAdded,onProj:function(id){location.hash='#community/p/'+id}});
  if(old){BD.load({cards:old.cards,view:old.view},true);return Promise.resolve()}
  return bdFetch()}
function bdFetch(){
  return IDB.get(bkey()).then(function(loc){
    if(!loc&&authed())return IDB.get('board:guest').then(function(g){return g&&g.cards&&g.cards.length?{u:0,cards:g.cards,view:g.view,d:1,adopted:1}:null});
    return loc}).then(function(loc){
    BS.u=(loc&&loc.u)||0;BS.dirty=!!(loc&&loc.d);
    if(BD)BD.load({cards:(loc&&loc.cards)||[],view:loc&&loc.view},!!(loc&&loc.view));
    resumeUploads();
    if(authed()&&S.srv)return ap({a:'cmine'}).then(function(j){
      if(!j||!j.ok||!BD)return;fillMine(j);
      var sb=j.board;
      if(sb&&!BS.dirty&&sb.u>BS.u){var cur=BD.state();BD.load({cards:sb.b.cards,view:cur.view},false);BS.u=sb.u;bdPersist()}
      else if(BS.dirty){bdSync()}
    },function(){})})}
function ensureBoard(){            // a board to add to, even when the board tab is not open
  if(BD)return Promise.resolve(BD);
  BD=mkBoard(document.createElement('div'),{onChange:bdChanged,onAdd:bdAdded,onProj:function(id){location.hash='#community/p/'+id}});
  return bdFetch().then(function(){return BD})}
function addToBoard(p){
  ensureBoard().then(function(b){var r=b.addProj(p);if(r.dup)toast(tt('موجود في لوحتك','Already on your board'));else toast(tt('أُضيف إلى لوحتك','Added to your board'));bdSave()})}

/* ---------- feed ---------- */
function fillMine(j){S.mine=j.posts||[];S.ak=j.ak||'';S.liked={};(j.liked||[]).forEach(function(i){S.liked[i]=1});S.mineLoaded=true}
function loadFeed(force){
  if(S.loading)return Promise.resolve();
  var c=null;try{c=JSON.parse(sessionStorage.getItem('xcf')||'null')}catch(e){}
  if(!force&&c&&Date.now()-c.t<90000&&c.posts){S.feed=c.posts;S.srv=true;return Promise.resolve()}
  if(!API){S.srv=false;return Promise.resolve()}
  S.loading=true;
  return jget('a=cfeed&t='+Math.floor(Date.now()/60000)).then(function(j){
    S.loading=false;
    if(j&&Array.isArray(j.posts)){S.srv=true;S.feed=j.posts;try{sessionStorage.setItem('xcf',JSON.stringify({t:Date.now(),posts:j.posts}))}catch(e){}}
    else S.srv=false;
  },function(){S.loading=false;if(S.srv===null)S.srv='err'})}
function loadMine(){if(!authed()||!S.srv||S.srv==='err')return Promise.resolve();return ap({a:'cmine'}).then(function(j){if(j&&j.ok)fillMine(j)},function(){})}
function findPost(id){var a=S.feed.concat(S.mine);for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i];return null}
function imgTag(id,w){return id?'<img loading="lazy" decoding="async" alt="" data-id="'+esc(id)+'" src="'+esc(imgUrl(id,w||600))+'">':''}
function chips(p,n){var a=(p.sw||[]).concat(p.tg||[]).slice(0,n||3);return a.map(function(x){return'<span class="cmch">'+esc(x==='Hand'?tt('يدوي','Hand'):x)+'</span>'}).join('')}
function card(p){
  var isb=p.k==='b',im=p.im||[],cov=isb?'<span class="cmi bd n'+Math.min(4,im.length)+'">'+(im.length?im.slice(0,4).map(function(i){return imgTag(i,400)}).join(''):'<span class="cmbi">'+ico('board')+'</span>')+'</span>':'<span class="cmi">'+imgTag(im[0],600)+'</span>';
  return'<a class="cmc" href="#community/p/'+esc(p.id)+'" data-id="'+esc(p.id)+'">'+cov+'<span class="cmm2"><b class="cmt" dir="auto">'+esc(p.ti)+'</b><span class="cma"><span dir="auto">'+esc(p.n)+'</span> · '+esc(ago(p.t))+'</span><span class="cmx">'+(isb?'<span class="cmch cmbd">'+esc(tt('لوحة','Board'))+(p.nc?' · '+p.nc:'')+'</span>':'')+chips(p,isb?1:2)+'<span class="cmh'+(S.liked[p.id]?' on':'')+'" data-h="'+esc(p.id)+'">'+ico('heart')+'<em>'+(p.lk||0)+'</em></span></span></span></a>'}
function empty(icon,h,p,btn){return'<div class="cme">'+ico(icon)+'<h3>'+esc(h)+'</h3>'+(p?'<p>'+esc(p)+'</p>':'')+(btn||'')+'</div>'}
function newBtn(){return'<button type="button" class="b s" data-cm="new">'+esc(tt('انشر مشروعك','Post your project'))+'</button>'}
function bodyFeed(){
  var a=S.feed;
  if(S.tab==='boards')a=a.filter(function(p){return p.k==='b'});
  if(S.who)a=a.filter(function(p){return p.a===S.who});
  if(S.srv===false)return empty('board',tt('النشر العام يفتح قريباً','Public posting opens soon'),tt('لوحتك تعمل من الآن، وتُحفظ على جهازك.','Your board works now and is saved on your device.'),'<a class="b s" href="#community/board">'+esc(tt('افتح لوحتي','Open my board'))+'</a>');
  if(S.srv==='err')return empty('x',tt('تعذّر الاتصال بالخادم','Could not reach the server'),tt('تحقق من الإنترنت وحاول مجدداً.','Check your connection and try again.'),'<button type="button" class="b s" data-cm="retry">'+esc(tt('أعد المحاولة','Retry'))+'</button>');
  if(S.srv===null)return'<p class="cmld">'+esc(tt('جارٍ التحميل…','Loading…'))+'</p>';
  if(!a.length)return S.who?empty('search',tt('لا منشورات لهذا الشخص','No posts from this person'),'',''):empty('img',S.tab==='boards'?tt('لا لوحات منشورة بعد','No published boards yet'):tt('لا مشاريع بعد','No projects yet'),tt('كن أول من ينشر.','Be the first to post.'),newBtn());
  return'<div class="cmgd">'+a.map(card).join('')+'</div>'}
var PST={pending:['قيد المراجعة','In review'],live:['منشور','Live'],hidden:['مخفي','Hidden']};
function bodyMine(){
  if(!authed())return empty('plus',tt('سجّل لتنشر مشاريعك','Register to post your projects'),tt('ببريد مؤكَّد.','With a confirmed e-mail.'),'<button type="button" class="b s" data-cm="join">'+esc(tt('سجّل','Register'))+'</button>');
  if(S.srv===false)return empty('board',tt('النشر العام يفتح قريباً','Public posting opens soon'),'','');
  if(!S.mineLoaded)return'<p class="cmld">'+esc(tt('جارٍ التحميل…','Loading…'))+'</p>';
  if(!S.mine.length)return empty('img',tt('لم تنشر شيئاً بعد','You have not posted yet'),'',newBtn());
  return'<div class="cmls">'+S.mine.map(function(p){var st=PST[p.s]||[p.s,p.s];return'<div class="cmrw" data-id="'+esc(p.id)+'"><a class="cmrt" href="#community/p/'+esc(p.id)+'"><span class="cmi sm">'+(p.k==='b'?'<span class="cmbi">'+ico('board')+'</span>':imgTag((p.im||[])[0],200))+'</span><b dir="auto">'+esc(p.ti)+'</b></a><span class="cmst s-'+esc(p.s)+'">'+esc(tt(st[0],st[1]))+'</span><span class="cmh">'+ico('heart')+'<em>'+(p.lk||0)+'</em></span><button type="button" class="cmdl" data-del="'+esc(p.id)+'" aria-label="'+esc(tt('حذف','Delete'))+'">'+ico('trash')+'</button></div>'}).join('')+'</div>'}
function bodyBoard(){
  return'<div class="cbt"><button type="button" class="b" data-bd="img">'+ico('img')+'<span>'+esc(tt('صورة','Picture'))+'</span></button><button type="button" class="b" data-bd="note">'+ico('note')+'<span>'+esc(tt('ملاحظة','Note'))+'</span></button><button type="button" class="b" data-bd="fit">'+ico('fit')+'<span>'+esc(tt('اعرض الكل','Fit all'))+'</span></button><button type="button" class="b s" data-bd="pub">'+ico('share')+'<span>'+esc(tt('انشر اللوحة','Publish board'))+'</span></button><input type="file" id="cmfi" accept="image/*" multiple hidden></div>'
  +(authed()?'':'<p class="cmnt">'+esc(tt('لوحتك محفوظة على هذا الجهاز. سجّل لتُحفظ على حسابك.','Your board is saved on this device. Register to keep it on your account.'))+'</p>')
  +'<div id="cmbd" class="cbhost"></div>'}

/* ---------- modal ---------- */
var LASTF=null;
function ensureModal(){
  if($('cmm'))return;
  var m=document.createElement('div');m.id='cmm';m.className='pm cmm';m.hidden=true;m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label',tt('المجتمع','Community'));
  m.innerHTML='<div class="pms cmms" tabindex="-1"><div class="pmbar"><button type="button" class="pmb pmx" data-cmx aria-label="'+esc(tt('إغلاق','Close'))+'"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div id="cmmc" class="pmco"></div></div>';
  document.body.appendChild(m);
  m.addEventListener('click',function(e){if(e.target===m||e.target.closest('[data-cmx]')){closeReq();return}modalClick(e)});
  m.addEventListener('keydown',function(e){
    if(e.key==='Escape'){e.stopPropagation();closeReq();return}
    if(e.key==='Tab'){var f=[].slice.call(m.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),textarea,select,[tabindex="0"]')).filter(function(x){return x.offsetParent!==null||x===document.activeElement});if(!f.length)return;var i=f.indexOf(document.activeElement);if(e.shiftKey&&(i<=0)){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}}
    if(S.modal==='p'&&(e.key==='ArrowLeft'||e.key==='ArrowRight')&&!/INPUT|TEXTAREA/.test(e.target.tagName))gal(e.key==='ArrowRight'?1:-1)});
  m.addEventListener('change',modalChange);m.addEventListener('input',modalInput);
  m.addEventListener('dragover',function(e){if(S.modal==='new'&&e.dataTransfer&&[].indexOf.call(e.dataTransfer.types||[],'Files')>=0)e.preventDefault()});
  m.addEventListener('drop',function(e){if(S.modal!=='new'||!CP||CP.mode!=='p')return;var f=e.dataTransfer&&e.dataTransfer.files;if(f&&f.length){e.preventDefault();cpAdd(f)}});
  document.addEventListener('paste',function(e){if(S.modal!=='new'||!CP||CP.mode!=='p')return;var fs=[];[].forEach.call((e.clipboardData&&e.clipboardData.items)||[],function(it){if(it.kind==='file'&&/^image\//.test(it.type)){var f=it.getAsFile();if(f)fs.push(f)}});if(fs.length){e.preventDefault();cpAdd(fs)}});
  m.addEventListener('error',function(e){var im=e.target;if(im&&im.tagName==='IMG'&&im.dataset.id&&!im.dataset.fb&&im.dataset.id.indexOf('data:')!==0){im.dataset.fb='1';im.src=imgFb(im.dataset.id,1000)}},true)}
function mopen(html,kind){
  ensureModal();var m=$('cmm');
  if(m.hidden)LASTF=document.activeElement;
  S.modal=kind;$('cmmc').innerHTML=html;m.hidden=false;document.body.style.overflow='hidden';m.querySelector('.cmms').scrollTop=0;
  var f=m.querySelector('[autofocus],.cmms');if(f)try{f.focus({preventScroll:true})}catch(e){}}
function mclose(){
  var m=$('cmm');if(!m||m.hidden)return;m.hidden=true;S.modal=null;$('cmmc').innerHTML='';document.body.style.overflow='';CP=null;
  if(PV&&PV.bd){PV.bd.destroy();PV.bd=null}PV=null;
  if(LASTF&&LASTF.focus&&LASTF.isConnected)try{LASTF.focus({preventScroll:true})}catch(e){}}
function baseHash(){return'#community'+(S.tab==='all'?'':'/'+S.tab)}
function closeReq(){
  if(S.modal==='new'&&CP&&CP.busy)return;
  if(S.modal==='p'&&/^#community\/p\//.test(location.hash)){try{history.replaceState(null,'',baseHash())}catch(e){location.hash=baseHash()}}
  mclose()}

/* ---------- a project (or a published board) in full ---------- */
var PV=null,CP=null;
function dateStr(t){try{return new Date(t).toLocaleDateString(L==='ar'?'ar-IQ-u-nu-latn':'en',{day:'numeric',month:'long',year:'numeric'})}catch(e){return''}}
function isOwn(p){return!!(S.ak&&p.a===S.ak)||S.mine.some(function(m){return m.id===p.id})}
function pview(p){
  var isb=p.k==='b',own=isOwn(p),im=p.im||[];
  PV={p:p,i:0,bd:null};
  var gl=isb?'<div id="cmvb" class="cbhost ro"></div>':'<div class="cmgl" dir="ltr"><div class="cmgm"><img id="cmgi" alt="" data-id="'+esc(im[0]||'')+'" src="'+esc(imgUrl(im[0],1400))+'">'+(im.length>1?'<button type="button" class="cmgb p" data-g="-1" aria-label="'+esc(tt('السابق','Previous'))+'">'+ico('left')+'</button><button type="button" class="cmgb n" data-g="1" aria-label="'+esc(tt('التالي','Next'))+'">'+ico('right')+'</button>':'')+'</div>'+(im.length>1?'<div class="cmgt">'+im.map(function(id,i){return'<button type="button" class="'+(i?'':'on')+'" data-gi="'+i+'" aria-label="'+(i+1)+'"><img alt="" loading="lazy" data-id="'+esc(id)+'" src="'+esc(imgUrl(id,200))+'"></button>'}).join('')+'</div>':'')+'</div>';
  var h='<div class="cmv">'+gl+'<div class="cmd"><h2 id="cmmt" dir="auto">'+esc(p.ti)+'</h2><p class="cmm1"><a href="#community/u/'+esc(p.a)+'" dir="auto">'+esc(p.n)+'</a>'+(p.u?' · <span dir="auto">'+esc(p.u)+'</span>':'')+' · '+esc(dateStr(p.t))+'</p>'+(p.tx?'<p class="cmtx" dir="auto">'+esc(p.tx)+'</p>':'')+'<div class="cmcs">'+chips(p,12)+'</div>'
   +'<div class="cmac"><button type="button" class="b cmlk'+(S.liked[p.id]?' on':'')+'" data-like="'+esc(p.id)+'" data-cm="like">'+ico('heart')+'<em>'+(p.lk||0)+'</em></button>'
   +(isb?'':'<button type="button" class="b" data-cm="save">'+ico('board')+'<span>'+esc(tt('إلى لوحتي','To my board'))+'</span></button>')
   +'<button type="button" class="b" data-cm="share">'+ico('link')+'<span>'+esc(tt('انسخ الرابط','Copy link'))+'</span></button>'
   +(own?'<button type="button" class="b" data-cm="del">'+ico('trash')+'<span>'+esc(tt('حذف','Delete'))+'</span></button>':'<button type="button" class="b" data-cm="rep">'+ico('flag')+'<span>'+esc(tt('إبلاغ','Report'))+'</span></button>')+'</div></div></div>';
  mopen(h,'p');$('cmm').setAttribute('aria-label',p.ti);
  if(isb){var host=$('cmvb');PV.bd=mkBoard(host,{ro:true,onProj:function(id){location.hash='#community/p/'+id}});PV.bd.load({cards:(p.bd&&p.bd.cards)||[]});requestAnimationFrame(function(){if(PV&&PV.bd)PV.bd.fit()})}}
function gal(d){
  if(!PV||PV.p.k==='b')return;var im=PV.p.im||[];if(im.length<2)return;PV.i=(PV.i+d+im.length)%im.length;galTo(PV.i)}
function galTo(i){
  var im=PV.p.im,el=$('cmgi');if(!el)return;PV.i=i;el.dataset.fb='';el.dataset.id=im[i];el.src=imgUrl(im[i],1400);
  [].forEach.call($('cmm').querySelectorAll('.cmgt button'),function(b,k){b.classList.toggle('on',k===i)})}
function openProj(id){
  var p=findPost(id);
  if(p&&(p.k!=='b'||p.bd)){pview(p);return}
  if(!API||!S.srv||S.srv==='err'){if(p){pview(p);return}toast(emsg('gone'));try{history.replaceState(null,'',baseHash())}catch(e){}return}
  jget('a=cget&id='+encodeURIComponent(id)).then(function(j){
    if(j&&j.ok&&j.post){var q=findPost(id);if(q)q.bd=j.post.bd;else S.feed.push(j.post);if(!/^#community\/p\//.test(location.hash)||location.hash.split('/')[2]!==id)return;pview(q||j.post)}
    else if(p){pview(p)}
    else{toast(emsg('gone'));try{history.replaceState(null,'',baseHash())}catch(e){}}},function(){if(p)pview(p);else toast(emsg(''))})}
function updHearts(id){
  var p=findPost(id),on=!!S.liked[id];
  [].forEach.call(document.querySelectorAll('[data-h="'+id+'"],[data-like="'+id+'"]'),function(el){el.classList.toggle('on',on);var em=el.querySelector('em');if(em)em.textContent=(p&&p.lk)||0})}
function toggleLike(id){
  if(!need())return;var p=findPost(id),on=!S.liked[id];
  if(S.srv!==true){toast(tt('النشر العام يفتح قريباً','Public posting opens soon'));return}
  S.liked[id]=on?1:0;if(p)p.lk=Math.max(0,(p.lk||0)+(on?1:-1));updHearts(id);
  function back(){S.liked[id]=on?0:1;if(p)p.lk=Math.max(0,(p.lk||0)+(on?-1:1));updHearts(id)}
  ap({a:'clike',id:id}).then(function(j){if(j&&j.ok){S.liked[id]=j.on?1:0;if(p)p.lk=j.n;updHearts(id)}else{back();if(j&&j.err)toast(emsg(j.err))}},back)}
function copyLink(id){
  var u=location.origin+location.pathname+'#community/p/'+id;
  function ok(){toast(tt('نُسخ الرابط','Link copied'))}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u).then(ok,function(){prompt('',u)});else{try{var t=document.createElement('textarea');t.value=u;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();ok()}catch(e){prompt('',u)}}}
function twoStep(b,txt,fn){
  if(!b.dataset.sure){b.dataset.sure='1';var s=b.querySelector('span')||b,o=s.textContent;s.textContent=txt;setTimeout(function(){if(b.isConnected){delete b.dataset.sure;s.textContent=o}},3500);return}
  fn()}
function doDelete(id,after){
  ap({a:'cdel',id:id}).then(function(j){
    if(j&&j.ok){S.feed=S.feed.filter(function(p){return p.id!==id});S.mine=S.mine.filter(function(p){return p.id!==id});try{sessionStorage.removeItem('xcf')}catch(e){}toast(tt('حُذف','Deleted'));if(after)after();refresh()}else toast(emsg(j&&j.err))},function(){toast(emsg(''))})}
function modalClick(e){
  var t=e.target,g=t.closest('[data-g]');if(g){gal(+g.dataset.g);return}
  var gi=t.closest('[data-gi]');if(gi){galTo(+gi.dataset.gi);return}
  var a=t.closest('a[href^="#community"]');if(a&&S.modal==='p'){if(a.getAttribute('href').indexOf('#community/p/')!==0)mclose();return}
  var c=t.closest('[data-cm]');if(!c)return;var k=c.dataset.cm;
  if(S.modal==='p'&&PV){var p=PV.p;
    if(k==='like')toggleLike(p.id);
    else if(k==='save')addToBoard(p);
    else if(k==='share')copyLink(p.id);
    else if(k==='rep')twoStep(c,tt('تأكيد الإبلاغ','Confirm report'),function(){if(!need())return;ap({a:'crep',id:p.id,why:'user'}).then(function(j){toast(j&&j.ok?tt('شكراً، سنراجعه','Thanks, we will review it'):emsg(j&&j.err))},function(){toast(emsg(''))})});
    else if(k==='del')twoStep(c,tt('تأكيد الحذف','Confirm delete'),function(){doDelete(p.id,closeReq)})}
  else if(S.modal==='new'){
    if(k==='pick'){$('cmpf').click()}
    else if(k==='rm'){var i=+c.dataset.i;CP.imgs.splice(i,1);cpDraw()}
    else if(k==='cover'){var i2=+c.dataset.i,x=CP.imgs.splice(i2,1)[0];CP.imgs.unshift(x);cpDraw()}
    else if(k==='sw'||k==='tg'){var v=c.dataset.v;CP[k][v]=!CP[k][v];c.classList.toggle('on',!!CP[k][v]);c.setAttribute('aria-pressed',CP[k][v]?'true':'false')}
    else if(k==='ok'){mclose();refresh()}
    else if(k==='view'){mclose();location.hash='#community/mine'}}}
function modalChange(e){if(S.modal==='new'&&e.target.id==='cmpf'){cpAdd(e.target.files);e.target.value=''}}
function modalInput(e){if(S.modal==='new'&&e.target.id==='cmtx'){var n=$('cmtc');if(n)n.textContent=e.target.value.length+'/1500'}}

/* ---------- composer: a project, or the board published as a post ---------- */
function cpAdd(files){
  if(!CP||CP.busy)return;files=[].slice.call(files||[]);var room=MAXIMG-CP.imgs.length;
  if(room<=0){toast(tt('الحد الأقصى '+MAXIMG+' صور','At most '+MAXIMG+' pictures'));return}
  var bad=0,i=0;files=files.slice(0,room);
  (function next(){if(i>=files.length){if(bad)toast(tt('تعذّر فتح '+bad+' ملف','Could not open '+bad+' file(s)'));cpDraw();return}
    shrink(files[i++],1600,.82).then(function(r){if(CP)CP.imgs.push({url:r.url,id:''})},function(){bad++}).then(next)})()}
function cpDraw(){
  var z=$('cmpl');if(!z||!CP)return;
  z.innerHTML=CP.imgs.map(function(x,i){return'<div class="cmpt"><img alt="" src="'+x.url+'">'+(i?'<button type="button" class="cmpc" data-cm="cover" data-i="'+i+'" aria-label="'+esc(tt('اجعلها الغلاف','Make cover'))+'">'+ico('up')+'</button>':'<span class="cmpg">'+esc(tt('الغلاف','Cover'))+'</span>')+'<button type="button" class="cmpx" data-cm="rm" data-i="'+i+'" aria-label="'+esc(tt('إزالة','Remove'))+'">'+ico('x')+'</button></div>'}).join('')+(CP.imgs.length<MAXIMG?'<button type="button" class="cmpa" data-cm="pick">'+ico('plus')+'<span>'+esc(tt('أضف صورة','Add picture'))+'</span></button>':'')}
function openComposer(mode){
  if(!need())return;
  if(S.srv!==true){toast(tt('النشر العام يفتح قريباً','Public posting opens soon'));return}
  var isb=mode==='b',nm=(RU.name||'').trim().split(/\s+/).slice(0,2).join(' ');
  var bcards=isb?BD.state().cards:[];
  if(isb&&!bcards.length){toast(emsg('empty'));return}
  CP={mode:mode,imgs:[],sw:{},tg:{},busy:false};
  var h='<form id="cmf" class="cmfm" novalidate><h2 id="cmmt">'+esc(isb?tt('انشر لوحتك','Publish your board'):tt('انشر مشروعك','Post your project'))+'</h2>'
   +(isb?'<p class="cmnt">'+esc(tt('تُنشر نسخة من اللوحة بعد مراجعتها: '+bcards.length+' عنصر.','A copy of the board is published after review: '+bcards.length+' items.'))+'</p>'
        :'<div class="fd w2"><label>'+esc(tt('الصور (حتى '+MAXIMG+')','Pictures (up to '+MAXIMG+')'))+'</label><div id="cmpl" class="cmpl"></div><input type="file" id="cmpf" accept="image/*" multiple hidden><p class="rge" id="cmpe" role="alert"></p></div>')
   +'<div class="fd"><label for="cmti">'+esc(tt('العنوان','Title'))+'</label><input id="cmti" type="text" maxlength="90" autocomplete="off" required autofocus></div>'
   +'<div class="fd"><label for="cmtx">'+esc(tt('وصف قصير','Short description'))+' <em id="cmtc" class="cmtc">0/1500</em></label><textarea id="cmtx" maxlength="1500" rows="4"></textarea></div>'
   +(isb?'':'<div class="fd"><span class="fq">'+esc(tt('البرامج','Software'))+'</span><div class="cmpk">'+SW.map(function(s){return'<button type="button" class="cmch" data-cm="sw" data-v="'+esc(s)+'" aria-pressed="false">'+esc(s==='Hand'?tt('يدوي','Hand'):s)+'</button>'}).join('')+'</div></div>')
   +'<div class="fd"><span class="fq">'+esc(tt('النوع','Type'))+'</span><div class="cmpk">'+TG.map(function(g){var v=tt(g[0],g[1]);return'<button type="button" class="cmch" data-cm="tg" data-v="'+esc(v)+'" aria-pressed="false">'+esc(v)+'</button>'}).join('')+'</div></div>'
   +'<div class="fd"><label for="cmnm">'+esc(tt('الاسم الذي يظهر','Name shown'))+'</label><input id="cmnm" type="text" maxlength="60" value="'+esc(nm)+'" autocomplete="off"></div>'
   +'<div class="fd w2"><label class="rgk2 cmok"><input type="checkbox" id="cmok"><span>'+esc(tt('أؤكد أن العمل لي أو أملك حق نشره، وأوافق على عرضه هنا. يحق لـ X Architecture إخفاء أي منشور.','I confirm this work is mine or I may publish it, and I agree to show it here. X Architecture may hide any post.'))+'</span></label></div>'
   +'<p class="rge" id="cmfe" role="alert"></p><p class="cmst2" id="cmfs" role="status"></p>'
   +'<div class="cmfb"><button type="submit" class="b s" id="cmsb">'+esc(tt('انشر','Publish'))+'</button><button type="button" class="b" data-cmx>'+esc(tt('إلغاء','Cancel'))+'</button></div></form>';
  mopen(h,'new');cpDraw();$('cmf').addEventListener('submit',cpSubmit)}
function cpErr(t){var e=$('cmfe');if(e)e.textContent=t||''}
function cpBusy(on,msg){CP.busy=on;var b=$('cmsb');if(b)b.disabled=on;var s=$('cmfs');if(s)s.textContent=msg||''}
function waitUploads(){return new Promise(function(ok){var n=0;(function chk(){var left=BD&&BD.state().cards.some(isLocalSrc);if(!left||n++>90)return ok(!left);resumeUploads();setTimeout(chk,700)})()})}
function cpSubmit(e){
  e.preventDefault();if(!CP||CP.busy)return;cpErr('');
  var isb=CP.mode==='b',ti=$('cmti').value.trim(),tx=$('cmtx').value.trim();
  if(!ti){cpErr(emsg('title'));$('cmti').focus();return}
  if(!isb&&!CP.imgs.length){cpErr(emsg('noimg'));return}
  if(!$('cmok').checked){cpErr(emsg('consent'));return}
  var sw=Object.keys(CP.sw).filter(function(k){return CP.sw[k]}),tg=Object.keys(CP.tg).filter(function(k){return CP.tg[k]});
  var body={a:'cpost',k:CP.mode,ti:ti,tx:tx,sw:sw,tg:tg,nm:$('cmnm').value.trim(),ok:1};
  cpBusy(true,tt('جارٍ الإرسال…','Sending…'));
  var chain;
  if(isb)chain=waitUploads().then(function(done){if(!done)throw'busy';var cards=BD.state().cards.map(stripCard);body.bd={cards:cards}});
  else{var i=0;chain=(function next(){if(i>=CP.imgs.length){body.im=CP.imgs.map(function(x){return x.id});return Promise.resolve()}
    var x=CP.imgs[i++];if(x.id)return next();cpBusy(true,tt('رفع الصور ','Uploading pictures ')+i+'/'+CP.imgs.length);
    return upImg(x.url,'p').then(function(j){if(!j||!j.ok)throw(j&&j.err)||'x';x.id=j.id}).then(next)})()}
  chain.then(function(){cpBusy(true,tt('جارٍ النشر…','Publishing…'));return ap(body,30000)}).then(function(j){
    if(!j||!j.ok)throw(j&&j.err)||'x';
    var live=j.status==='live';
    $('cmmc').innerHTML='<div class="cmdn"><span class="rgk" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><h2 id="cmmt">'+esc(live?tt('تم النشر','Published'):tt('تم الإرسال','Sent'))+'</h2><p>'+esc(live?tt('مشروعك الآن في المجتمع.','Your post is now in the community.'):tt('سيظهر للجميع بعد مراجعته. تجده في «مشاريعي» وحالته «قيد المراجعة».','It will show to everyone after review. You can find it in "My posts" as "In review".'))+'</p><div class="cmfb"><button type="button" class="b s" data-cm="'+(live?'ok':'view')+'">'+esc(live?tt('حسناً','OK'):tt('مشاريعي','My posts'))+'</button></div></div>';
    CP.busy=false;try{sessionStorage.removeItem('xcf')}catch(x){}
    loadMine().then(refresh);if(live)loadFeed(true).then(refresh)
  }).catch(function(er){cpBusy(false,'');cpErr(er==='busy'?tt('ما زالت صور اللوحة قيد الرفع. حاول بعد قليل.','Board pictures are still uploading. Try again shortly.'):typeof er==='string'?emsg(er):emsg(''));if(er==='auth'&&typeof rgo==='function')setTimeout(rgo,400)})}

/* ---------- search inside the section: a result opens its item right here ---------- */
var SR={items:[],i:-1};
function hay(p){if(!p._h)p._h={t:norm(p.ti),a:norm(p.n),g:norm((p.tg||[]).concat(p.sw||[]).join(' ')),x:norm(p.tx),u:norm(p.u)};return p._h}
function sc(h,toks){var s=0;for(var i=0;i<toks.length;i++){var t=toks[i],m=0;
  if(h.t.indexOf(t)===0||h.t.indexOf(' '+t)>=0)m+=7;else if(h.t.indexOf(t)>=0)m+=4;
  if(h.g.indexOf(t)>=0)m+=4;if(h.a.indexOf(t)>=0)m+=4;if(h.u.indexOf(t)>=0)m+=2;if(h.x&&h.x.indexOf(t)>=0)m+=1;
  if(!m)return 0;s+=m}return s}
function searchAll(q){
  var toks=norm(q).split(' ').filter(Boolean);if(!toks.length)return[];
  var seen={},pool=S.feed.concat(S.mine.filter(function(m){return m.s&&m.s!=='live'})),ps=[],ppl={};
  pool.forEach(function(p){if(seen[p.id])return;seen[p.id]=1;var s=sc(hay(p),toks);if(s)ps.push({s:s,p:p});
    var an=norm(p.n),ok=toks.every(function(t){return an.indexOf(t)>=0});if(ok&&p.a){ppl[p.a]=ppl[p.a]||{ak:p.a,n:p.n,c:0};ppl[p.a].c++}});
  ps.sort(function(a,b){return b.s-a.s||b.p.t-a.p.t});
  var out=[];
  ps.slice(0,6).forEach(function(x){out.push({k:'p',id:x.p.id,ti:x.p.ti,sub:x.p.n+(x.p.k==='b'?' · '+tt('لوحة','Board'):''),im:(x.p.im||[])[0]||''})});
  Object.keys(ppl).slice(0,3).forEach(function(a){var q2=ppl[a];out.push({k:'u',ak:q2.ak,ti:q2.n,sub:q2.c+' '+tt('منشور','posts')})});
  var cs=(BD?BD.state().cards:S.bcards)||[];
  cs.filter(function(c){return c.t!=='i'&&toks.every(function(t){return norm(c.t==='n'?c.tx:c.ti).indexOf(t)>=0})}).slice(0,4).forEach(function(c){out.push({k:'c',id:c.id,ti:(c.t==='n'?c.tx:c.ti)||'',sub:tt('في لوحتي','On my board'),im:c.im||''})});
  return out}
function sDraw(){
  var ul=$('cmsr'),inp=$('cmi');if(!ul||!inp)return;var q=inp.value.trim();
  if(!q){ul.hidden=true;inp.setAttribute('aria-expanded','false');return}
  SR.items=searchAll(q);SR.i=SR.items.length?0:-1;
  var G={p:tt('مشاريع ولوحات','Projects and boards'),u:tt('أشخاص','People'),c:tt('في لوحتي','On my board')},last='',h='';
  SR.items.forEach(function(it,i){
    if(it.k!==last){h+='<li class="cmsg" role="presentation">'+esc(G[it.k])+'</li>';last=it.k}
    h+='<li role="option" id="cmso'+i+'" data-i="'+i+'" aria-selected="'+(i===SR.i?'true':'false')+'" class="cmso'+(i===SR.i?' on':'')+'">'+(it.k==='u'?'<span class="cmsi pe">'+esc((it.ti||'?').charAt(0).toUpperCase())+'</span>':'<span class="cmsi">'+(it.im?imgTag(it.im,120):it.k==='c'?ico('note'):ico('img'))+'</span>')+'<span class="cmsx"><b dir="auto">'+esc(it.ti)+'</b><small dir="auto">'+esc(it.sub)+'</small></span></li>'});
  if(!SR.items.length)h='<li class="cmsn" role="presentation">'+esc(tt('لا نتائج','No results'))+'</li>';
  ul.innerHTML=h;ul.hidden=false;inp.setAttribute('aria-expanded','true');inp.setAttribute('aria-activedescendant',SR.i>=0?'cmso'+SR.i:'')}
function sMove(d){
  if(!SR.items.length)return;SR.i=(SR.i+d+SR.items.length)%SR.items.length;
  [].forEach.call($('cmsr').querySelectorAll('.cmso'),function(li){var on=+li.dataset.i===SR.i;li.classList.toggle('on',on);li.setAttribute('aria-selected',on?'true':'false');if(on)li.scrollIntoView({block:'nearest'})});
  $('cmi').setAttribute('aria-activedescendant','cmso'+SR.i)}
function sOpen(i){
  var it=SR.items[i];if(!it)return;$('cmsr').hidden=true;
  if(it.k==='p')location.hash='#community/p/'+it.id;
  else if(it.k==='u')location.hash='#community/u/'+it.ak;
  else{S.focusCard=it.id;if(S.tab==='board'&&BD){BD.focus(it.id);S.focusCard=null;var host=$('cmbd');if(host)host.scrollIntoView({block:'nearest'})}else location.hash='#community/board'}}
function sBind(){
  var inp=$('cmi'),ul=$('cmsr');if(!inp)return;
  inp.addEventListener('input',function(){if(!S.bcards&&!BD)IDB.get(bkey()).then(function(l){S.bcards=(l&&l.cards)||[]});sDraw()});
  inp.addEventListener('focus',function(){if(inp.value.trim())sDraw()});
  inp.addEventListener('keydown',function(e){
    if(e.key==='ArrowDown'){e.preventDefault();if(ul.hidden)sDraw();else sMove(1)}
    else if(e.key==='ArrowUp'){e.preventDefault();sMove(-1)}
    else if(e.key==='Enter'){e.preventDefault();if(SR.i>=0)sOpen(SR.i)}
    else if(e.key==='Escape'){if(!ul.hidden){ul.hidden=true;e.stopPropagation()}else if(inp.value){inp.value=''}}});
  ul.addEventListener('mousedown',function(e){e.preventDefault()});
  ul.addEventListener('click',function(e){var li=e.target.closest('.cmso');if(li)sOpen(+li.dataset.i)});
  document.addEventListener('click',function(e){if(ul.isConnected&&!e.target.closest('.cmq'))ul.hidden=true})}

/* ---------- the section ---------- */
function hh(){var h=document.querySelector('header');if(root&&h)root.style.setProperty('--hh',Math.round(h.getBoundingClientRect().height)+'px')}
addEventListener('resize',function(){hh()});
var root=null,rendered=false,pendingOpen='';
var TABS=[['all','','الكل','All'],['boards','boards','اللوحات','Boards'],['mine','mine','مشاريعي','My posts'],['board','board','لوحتي','My board']];
function shell(){
  root=$('cm');if(!root)return;rendered=false;
  root.innerHTML='<div class="hd"><small>COMMUNITY</small><h2>'+esc(tt('المجتمع','Community'))+'</h2><div class="nct"><button type="button" class="b s cmnw" data-cm="new">'+ico('plus')+'<span>'+esc(tt('انشر','Post'))+'</span></button></div></div>'
   +'<p class="note">'+esc(tt('انشر مشروعك، شاهد مشاريع غيرك، ورتّب إلهامك على لوحة.','Post your project, see other work, and arrange your inspiration on a board.'))+'</p>'
   +'<div class="cmbar"><div class="cmq"><span class="cmqi">'+ico('search')+'</span><input id="cmi" type="search" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="cmsr" aria-autocomplete="list" placeholder="'+esc(tt('ابحث: مشروع، شخص، برنامج، ملاحظة…','Search: project, person, software, note…'))+'" aria-label="'+esc(tt('ابحث في المجتمع','Search the community'))+'"><ul id="cmsr" class="cmsr" role="listbox" hidden></ul></div><nav class="cmtabs" id="cmtabs" aria-label="'+esc(tt('أقسام المجتمع','Community sections'))+'"></nav></div>'
   +'<div id="cmwho"></div><div id="cmbody"></div><div id="cmtoast" class="cmtoast" role="status" aria-live="polite"></div>';
  root._lang=L;sBind();hh();
  if(!root._cm){root._cm=1;
    root.addEventListener('click',rootClick);
    root.addEventListener('change',function(e){if(e.target.id==='cmfi'){if(BD)BD.addImgs(e.target.files);e.target.value=''}});
    root.addEventListener('error',function(e){var im=e.target;if(im&&im.tagName==='IMG'&&im.dataset.id&&!im.dataset.fb&&im.dataset.id.indexOf('data:')!==0){im.dataset.fb='1';im.src=imgFb(im.dataset.id,800)}},true)}}
function tabsDraw(){
  var n=$('cmtabs');if(!n)return;
  n.innerHTML=TABS.map(function(t){return'<a href="#community'+(t[1]?'/'+t[1]:'')+'"'+(S.tab===t[0]&&!S.who?' aria-current="page" class="on"':'')+'>'+esc(tt(t[2],t[3]))+'</a>'}).join('');
  var w=$('cmwho');if(w){var nm='';if(S.who){var a=S.feed.concat(S.mine).filter(function(p){return p.a===S.who})[0];nm=a?a.n:'…'}w.innerHTML=S.who?'<a class="cmwh" href="#community">'+esc(tt('منشورات: ','Posts by: '))+'<b dir="auto">'+esc(nm)+'</b> '+ico('x')+'</a>':''}}
function renderBody(go){
  var b=$('cmbody');if(!b)return;
  if(S.tab==='board'){b.innerHTML=bodyBoard();
    if(go){var bar=document.querySelector('.cmbar'),off=(parseFloat(getComputedStyle(root).getPropertyValue('--hh'))||68)+(bar?bar.offsetHeight:60)+8;window.scrollTo(0,Math.max(0,b.getBoundingClientRect().top+(window.pageYOffset||0)-off))}
    bdLoadInto($('cmbd')).then(function(){if(S.focusCard&&BD){BD.focus(S.focusCard);S.focusCard=null}})}
  else{if(BD&&S.tab!=='board'){bdPersist()}b.innerHTML=S.tab==='mine'?bodyMine():bodyFeed()}}
function refresh(){if(!root||!$('cmbody'))return;tabsDraw();if(S.tab!=='board')renderBody()}
function rootClick(e){
  var t=e.target,h=t.closest('[data-h]');
  if(h&&h.tagName!=='A'){e.preventDefault();e.stopPropagation();toggleLike(h.dataset.h);return}
  var d=t.closest('[data-del]');if(d){if(!d.classList.contains('sure')){d.classList.add('sure');toast(tt('اضغط مرة ثانية للتأكيد','Press again to confirm'));setTimeout(function(){d.classList.remove('sure')},3500);return}doDelete(d.dataset.del);return}
  var b=t.closest('[data-bd]');
  if(b&&BD){var k=b.dataset.bd;if(k==='img')$('cmfi').click();else if(k==='note')BD.addNote();else if(k==='fit')BD.fit();else if(k==='pub')openComposer('b');return}
  var c=t.closest('[data-cm]');if(!c)return;var k2=c.dataset.cm;
  if(k2==='new')openComposer('p');
  else if(k2==='join'){if(typeof rgo==='function')rgo()}
  else if(k2==='retry'){S.srv=null;renderBody();loadFeed(true).then(function(){refresh();loadMine().then(refresh)})}}
function route(was){
  if(!root||!root.isConnected||root._lang!==L)shell();
  if(!root)return;
  var h=location.hash.replace(/^#/,'').split('/'),sub=h[1]||'',arg=h[2]||'',tab=S.tab,who=S.who;
  if(sub==='boards')tab='boards';else if(sub==='mine')tab='mine';else if(sub==='board')tab='board';
  else if(sub==='u'){tab='all';who=arg}else if(sub!=='p'){tab='all';who=''}
  if(!rendered||tab!==S.tab||who!==S.who){S.tab=tab;S.who=who;rendered=true;tabsDraw();renderBody(true)}
  if(!was&&S.tab!=='board')window.scrollTo(0,0);
  if(sub==='p'){
    if(PV&&PV.p.id===arg&&S.modal==='p'){}
    else if(S.srv===null&&API)pendingOpen=arg;else openProj(arg)}
  else if(S.modal==='p')mclose();
  if(S.srv===null||!was){
    loadFeed().then(function(){refresh();if(pendingOpen){var id=pendingOpen;pendingOpen='';if(/^#community\/p\//.test(location.hash))openProj(id)}return loadMine()}).then(refresh)}}
window.CMOK={route:route,
  relang:function(){if(document.body.classList.contains('rc')){mclose();shell();rendered=false;route(true)}else if(root)root._lang=null},
  auth:function(){if(!root)return;S.mineLoaded=false;loadMine().then(function(){refresh();resumeUploads()});if(S.tab==='board')renderBody()}};
})();
