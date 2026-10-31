/* X Architecture — Community: projects, boards, search. Loaded on demand by index.html (needs SITE, RU, T, esc, rgo). */
(function(){
'use strict';
var API=(window.SITE&&SITE.api)||'';
var SW=['Revit','AutoCAD','Rhino','SketchUp','3ds Max','Blender','Lumion','Enscape','D5 Render','Twinmotion','V-Ray','Corona','Grasshopper','Photoshop','Illustrator','InDesign','ArchiCAD','Hand'];
var TG=[['سكني','Residential'],['تجاري','Commercial'],['ثقافي','Cultural'],['تعليمي','Educational'],['داخلي','Interior'],['حضري','Urban'],['مفهومي','Conceptual'],['ترميم','Restoration'],['استدامة','Sustainable']];
var NOTEC=4,MAXIMG=6;
var S={srv:null,feed:[],mine:[],liked:{},ak:'',dr:'',flt:'all',src:'all',who:'',q:'',loading:false,mineLoaded:false,modal:null,nAdd:0};
var $=function(i){return document.getElementById(i)};
function tt(a,e){return T(a,e)}
function authed(){return !!(window.RU&&RU.tok&&RU.email)}
function toast(m){var t=$('cmtoast');if(!t)return;t.textContent=m;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(function(){t.classList.remove('on')},3200)}
function need(){if(authed())return true;toast(tt('سجّل ببريد مؤكَّد أولاً','Register with a confirmed e-mail first'));if(typeof rgo==='function')rgo();return false}
function uid(){return Math.random().toString(36).slice(2,10)}
function ago(t){var d=(Date.now()-t)/1000;if(d<90)return tt('الآن','now');if(d<3600)return Math.round(d/60)+tt(' د',' min');if(d<86400)return Math.round(d/3600)+tt(' س',' h');if(d<86400*30)return Math.round(d/86400)+tt(' يوم',' d');try{return new Date(t).toLocaleDateString(L==='ar'?'ar-IQ-u-nu-latn':'en',{day:'numeric',month:'short'})}catch(e){return''}}
function norm(s){return String(s||'').toLowerCase().replace(/[ً-ٰٟـ]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/[^a-z0-9؀-ۿÀ-ɏ ]+/g,' ').replace(/\s+/g,' ').trim()}
var EXTRE=/^https:\/\/(upload\.wikimedia\.org\/|commons\.wikimedia\.org\/|[a-z]{2,3}\.wikipedia\.org\/|www\.artic\.edu\/(iiif|artworks)\/|images\.metmuseum\.org\/)[^\s"'<>]{1,400}$/;
function extOk(u){return typeof u==='string'&&EXTRE.test(u)}
function imgUrl(id,w){if(!id)return'';if(id.indexOf('data:')===0||id.indexOf('blob:')===0)return id;if(id.indexOf('https://')===0)return extOk(id)?id:'';return'https://lh3.googleusercontent.com/d/'+encodeURIComponent(id)+'=w'+(w||800)}
function imgFb(id,w){return'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w'+(w||800)}
function ico(n){var P={heart:'M12 20.5s-7.5-4.6-7.5-10.3A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.6c0 5.7-7.5 10.3-7.5 10.3z',plus:'M12 5v14M5 12h14',x:'M6 6l12 12M18 6L6 18',trash:'M5 7h14M10 7V4.5h4V7M7 7l1 12.5h8L17 7',undo:'M9 7L4 12l5 5M4 12h11a5 5 0 010 10h-3',conn:'M6 20a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM7.8 15.2l8.4-5.4',grid:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',book:'M5 4h10a3 3 0 013 3v13H8a3 3 0 01-3-3zM8 4v13h10',person:'M12 11a4 4 0 100-8 4 4 0 000 8zM4 21c1-4 4-6 8-6s7 2 8 6',out:'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',info:'M12 8v.01M11 12h1v5h1M12 3a9 9 0 100 18 9 9 0 000-18z',link:'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',flag:'M6 21V4h11l-2 4 2 4H6',search:'M10.5 4a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM16 16l5 5',img:'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 9.5v.01',note:'M5 4h14v11l-5 5H5zM14 20v-5h5',fit:'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',min:'M5 12h14',up:'M12 19V6M6 11l6-6 6 6',left:'M15 5l-7 7 7 7',right:'M9 5l7 7-7 7',front:'M8 8h11v11H8zM5 15V5h10',share:'M12 4v11M7 9l5-5 5 5M5 20h14',check:'M5 12.5l4.5 4.5L19 7.5',board:'M4 5h7v7H4zM13 5h7v4h-7zM13 11h7v8h-7zM4 14h7v5H4z'};return'<svg class="cmic" viewBox="0 0 24 24" aria-hidden="true"><path d="'+(P[n]||'')+'"/></svg>'}

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
  var ro=!!o.ro,st={cards:[],links:[],view:{x:60,y:60,k:1}},selId=null,selLink=null,linkOn=false,linkFrom=null,LS=null,LL=null,MID='cbar'+uid(),undo=[],ptrs={},mode=null,pinch=null,W,KMIN=.12,KMAX=3,onPaste=null,destroyed=false;
  host.classList.add('cbv');host.classList.toggle('ro',ro);host.setAttribute('tabindex','0');
  host.setAttribute('aria-label',tt('لوحة: اسحب للتحريك، العجلة للتكبير','Board: drag to pan, wheel to zoom'));
  host.innerHTML='<div class="cbw"></div><div class="cbz" role="group" aria-label="'+esc(tt('تكبير','Zoom'))+'"><button type="button" data-z="in" aria-label="'+esc(tt('تكبير','Zoom in'))+'">'+ico('plus')+'</button><button type="button" data-z="out" aria-label="'+esc(tt('تصغير','Zoom out'))+'">'+ico('min')+'</button><button type="button" data-z="fit" aria-label="'+esc(tt('اعرض الكل','Fit all'))+'">'+ico('fit')+'</button></div>'+((ro||o.noHint)?'':'<p class="cbe">'+esc(tt('أسقط صورة هنا، أو الصقها (Ctrl+V)، أو انقر مرتين لإضافة ملاحظة','Drop a picture here, paste it (Ctrl+V), or double-click to add a note'))+'</p>');
  W=host.querySelector('.cbw');
  var empt=host.querySelector('.cbe');
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
  function apply(){var v=st.view;W.style.transform='translate('+v.x+'px,'+v.y+'px) scale('+v.k+')';host.style.setProperty('--k',v.k);host.style.backgroundPosition=v.x+'px '+v.y+'px';host.style.backgroundSize=(32*v.k)+'px '+(32*v.k)+'px'}
  function byId(id){for(var i=0;i<st.cards.length;i++)if(st.cards[i].id===id)return st.cards[i];return null}
  function elOf(id){return W.querySelector('.cbc[data-id="'+id+'"]')}
  function chg(){cnt();if(o.onChange)o.onChange(api)}
  function cnt(){if(empt)empt.hidden=st.cards.length>0;if(o.onCount)o.onCount(st.cards.length)}
  function snap(){undo.push({c:st.cards.map(function(c){return Object.assign({},c)}),l:st.links.map(function(l){return Object.assign({},l)})});if(undo.length>40)undo.shift();if(o.onUndo)o.onUndo(undo.length)}
  function zmax(){var m=0;st.cards.forEach(function(c){if((c.z||0)>m)m=c.z||0});return m}
  function place(c){var el=elOf(c.id);if(!el)return;el.style.transform='translate('+c.x+'px,'+c.y+'px)';el.style.width=c.w+'px';el.style.height=c.h+'px';el.style.zIndex=c.z||1}
  function label(c){return c.t==='i'?(c.cp||tt('صورة','Picture')):c.t==='n'?(c.tx||tt('ملاحظة','Note')).slice(0,40):(c.ti||(c.t==='a'?tt('مقال','Article'):tt('مشروع','Project')))}
  function build(c){
    var el=document.createElement('div');el.className='cbc t'+c.t+(c.pend?' pend':'')+(c.fail?' fail':'');el.dataset.id=c.id;el.tabIndex=0;el.setAttribute('role','group');el.setAttribute('aria-label',label(c));
    var h='';
    if(c.t==='i'){var ex=c.src&&c.src.indexOf('https://')===0;h='<img alt="" draggable="false"'+(ex?' referrerpolicy="no-referrer"':'')+' data-id="'+esc(c.src)+'" src="'+esc(imgUrl(c.src,900))+'"><i class="cbs" aria-hidden="true"></i>'
      +(ro?(c.cp?'<span class="cbcp ro" dir="auto"></span>':''):'<input class="cbcp" type="text" maxlength="80" dir="auto" placeholder="'+esc(tt('اكتب اسماً','Add a name'))+'" aria-label="'+esc(tt('اسم الصورة','Picture name'))+'">')
      +(c.cr?'<a class="cbi" href="'+esc(extOk(c.lk)?c.lk:'#')+'" target="_blank" rel="noopener noreferrer" aria-label="'+esc(tt('المصدر: ','Source: ')+c.cr)+'" title="'+esc(c.cr)+'">'+ico('info')+'</a>':'')}
    else if(c.t==='n')h='<div class="cbn n'+(c.c||0)+'"'+(ro?' dir="auto"></div>':'><textarea dir="auto" maxlength="600" aria-label="'+esc(tt('نص الملاحظة','Note text'))+'"></textarea></div>');
    else if(c.t==='a')h='<div class="cba">'+(c.im&&extOk(c.im)?'<span class="cbai"><img alt="" referrerpolicy="no-referrer" draggable="false" src="'+esc(c.im)+'"></span>':'')+'<span class="cbat"><b dir="auto"></b><small dir="auto"></small></span>'+(extOk(c.lk)?'<a class="cbo" href="'+esc(c.lk)+'" target="_blank" rel="noopener noreferrer" aria-label="'+esc(tt('افتح المصدر','Open the source'))+'">'+ico('out')+'</a>':'')+'</div>';
    else h='<div class="cbp"><span class="cbpi">'+(c.im?'<img alt="" draggable="false" data-id="'+esc(c.im)+'" src="'+esc(imgUrl(c.im,400))+'">':'')+'</span><b dir="auto"></b><small dir="auto"></small></div>';
    if(!ro){h+='<span class="cbh" data-h></span><div class="cbk">'+(c.t==='n'?[0,1,2,3].map(function(i){return'<button type="button" class="cbd n'+i+'" data-a="col" data-v="'+i+'" aria-label="'+esc(tt('لون','Colour'))+' '+(i+1)+'"></button>'}).join(''):'')+(c.t==='p'?'<button type="button" data-a="open" aria-label="'+esc(tt('افتح المشروع','Open the project'))+'">'+ico('out')+'</button>':'')+'<button type="button" data-a="link" aria-label="'+esc(tt('اربط بعنصر آخر','Connect to another item'))+'">'+ico('conn')+'</button><button type="button" data-a="front" aria-label="'+esc(tt('إلى الأمام','Bring to front'))+'">'+ico('front')+'</button><button type="button" data-a="del" aria-label="'+esc(tt('حذف','Delete'))+'">'+ico('trash')+'</button></div>'}
    el.innerHTML=h;
    if(c.t==='n'){var ta=el.querySelector('textarea'),dv=el.querySelector('.cbn');if(ta)ta.value=c.tx||'';else dv.textContent=c.tx||''}
    if(c.t==='p'){el.querySelector('b').textContent=c.ti||'';el.querySelector('small').textContent=c.n||''}
    if(c.t==='a'){el.querySelector('b').textContent=c.ti||'';el.querySelector('small').textContent=c.tx||''}
    if(c.t==='i'){var cp=el.querySelector('.cbcp');if(cp){if(cp.tagName==='INPUT')cp.value=c.cp||'';else cp.textContent=c.cp||''}if(c.cp)el.classList.add('hascp')}
    return el}
  function mkLayers(){W.innerHTML='<svg class="cbl" aria-hidden="false" focusable="false"><defs><marker id="'+MID+'" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M1 1.2L9 5 1 8.8z"/></marker></defs><g></g></svg><div class="cbls"></div>';LS=W.querySelector('.cbl g');LL=W.querySelector('.cbls')}
  function renderAll(){mkLayers();st.cards.slice().sort(function(a,b){return(a.z||0)-(b.z||0)}).forEach(function(c){var el=build(c);LL.parentNode.insertBefore(el,LL);place(c)});if(selId&&!byId(selId))selId=null;if(selLink&&!lkById(selLink))selLink=null;drawLinks();mark();cnt()}
  function mark(){var els=W.querySelectorAll('.cbc');for(var i=0;i<els.length;i++){els[i].classList.toggle('sel',els[i].dataset.id===selId);els[i].classList.toggle('lkf',els[i].dataset.id===linkFrom)}}
  function select(id){if(selId===id&&!selLink)return;selId=id;if(selLink){selLink=null;drawLinks()}mark()}
  function lkById(id){for(var i=0;i<st.links.length;i++)if(st.links[i].id===id)return st.links[i];return null}
  function edgePt(c,tx,ty){var cx=c.x+c.w/2,cy=c.y+c.h/2,dx=tx-cx,dy=ty-cy;if(!dx&&!dy)return{x:cx,y:cy};var sx=dx?(c.w/2)/Math.abs(dx):1e9,sy=dy?(c.h/2)/Math.abs(dy):1e9,q=Math.min(sx,sy);return{x:cx+dx*q,y:cy+dy*q}}
  function drawLinks(){
    if(!LS)return;var g='',lh='';
    st.links.forEach(function(l){var a=byId(l.a),b=byId(l.b);if(!a||!b)return;
      var s=edgePt(a,b.x+b.w/2,b.y+b.h/2),e=edgePt(b,a.x+a.w/2,a.y+a.h/2),dx=e.x-s.x,dy=e.y-s.y,len=Math.hypot(dx,dy)||1,bd=Math.min(70,len*.14),
          qx=(s.x+e.x)/2-dy/len*bd,qy=(s.y+e.y)/2+dx/len*bd,px=Math.round(.25*s.x+.5*qx+.25*e.x),py=Math.round(.25*s.y+.5*qy+.25*e.y),
          d='M'+Math.round(s.x)+' '+Math.round(s.y)+'Q'+Math.round(qx)+' '+Math.round(qy)+' '+Math.round(e.x)+' '+Math.round(e.y),on=l.id===selLink;
      g+='<g class="cbg'+(on?' sel':'')+'" data-l="'+l.id+'"><path class="cbhit" d="'+d+'"/><path class="cbln" marker-end="url(#'+MID+')" d="'+d+'"/></g>';
      if(ro){if(l.tx)lh+='<span class="cbll ro" dir="auto" style="left:'+px+'px;top:'+py+'px">'+esc(l.tx)+'</span>'}
      else if(l.tx||on)lh+='<span class="cbll'+(on?' sel':'')+'" data-l="'+l.id+'" style="left:'+px+'px;top:'+py+'px"><input type="text" maxlength="40" dir="auto" value="'+esc(l.tx||'')+'" placeholder="'+esc(tt('اسم الرابط','Name'))+'" aria-label="'+esc(tt('اسم الرابط','Link name'))+'">'+(on?'<button type="button" data-a="ldel" aria-label="'+esc(tt('احذف الرابط','Remove link'))+'">'+ico('x')+'</button>':'')+'</span>'});
    LS.innerHTML=g;LL.innerHTML=lh}
  function selectLink(id){selLink=id;selId=null;mark();drawLinks();var inp=LL.querySelector('.cbll.sel input');if(inp){inp.focus({preventScroll:true})}}
  function addLink(a,b){if(!a||!b||a===b)return null;if(st.links.some(function(l){return(l.a===a&&l.b===b)||(l.a===b&&l.b===a)})){toast(tt('مربوطان فعلاً','Already connected'));return null}
    snap();var l={id:uid(),a:a,b:b,tx:''};st.links.push(l);selLink=l.id;selId=null;mark();drawLinks();chg();var inp=LL.querySelector('.cbll.sel input');if(inp)setTimeout(function(){inp.focus({preventScroll:true})},30);return l}
  function removeLink(id){if(!lkById(id))return;snap();st.links=st.links.filter(function(l){return l.id!==id});if(selLink===id)selLink=null;drawLinks();chg()}
  function setLinkMode(on,from){linkOn=!!on;linkFrom=on?(from||null):null;host.classList.toggle('lkm',linkOn);mark();if(on&&from)selId=null,mark();if(o.onMode)o.onMode(linkOn,linkFrom)}
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
    snap();st.cards.push(c);var el=build(c);LL.parentNode.insertBefore(el,LL);place(c);select(c.id);chg();return c}
  function remove(id){var c=byId(id);if(!c)return;snap();st.cards=st.cards.filter(function(x){return x.id!==id});st.links=st.links.filter(function(l){return l.a!==id&&l.b!==id});if(selId===id)selId=null;if(linkFrom===id)setLinkMode(false);var el=elOf(id);if(el)el.remove();drawLinks();chg()}
  function doUndo(){var s=undo.pop();if(!s)return;st.cards=s.c;st.links=s.l;selLink=null;renderAll();chg();if(o.onUndo)o.onUndo(undo.length)}
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
  function addExt(it,pos){
    if(!it)return null;var ex=st.cards.filter(function(c){return(it.t==='i'&&c.t==='i'&&c.src===it.src)||(it.t==='a'&&c.t==='a'&&c.lk===it.lk&&c.ti===it.ti)})[0];if(ex){focus(ex.id);return ex}
    if(it.t==='i'){if(!extOk(it.src))return null;var r=(it.w&&it.h)?it.h/it.w:.72,w=300,h=Math.round(w*r);if(h>400){h=400;w=Math.round(h/r)}if(h<110){h=110;w=Math.round(h/r)}
      return addCard({t:'i',w:w,h:h,src:it.src,cr:String(it.cr||'').slice(0,160),lk:extOk(it.lk)?it.lk:'',cp:String(it.cp||'').slice(0,80)},pos)}
    if(it.t==='a')return addCard({t:'a',w:270,h:150,ti:String(it.ti||'').slice(0,120),tx:String(it.tx||'').slice(0,260),im:extOk(it.im)?it.im:'',lk:extOk(it.lk)?it.lk:''},pos);
    return null}
  function focus(id){var c=byId(id);if(!c)return;var s=view(),k=Math.max(st.view.k,.6);st.view={k:k,x:s.w/2-(c.x+c.w/2)*k,y:s.h/2-(c.y+c.h/2)*k};apply();select(id);var el=elOf(id);if(el){el.classList.remove('pulse');void el.offsetWidth;el.classList.add('pulse')}}
  function patch(id,f){var c=byId(id);if(c){f(c);chg()}}
  /* --- pointer: move / resize / pan / pinch --- */
  host.addEventListener('pointerdown',function(e){
    if(e.button>0&&e.pointerType==='mouse')return;
    if(e.target.closest('.cbk,.cbz,.cbll'))return;
    var an=!linkOn&&e.target.closest&&e.target.closest('a');if(an){var ac=an.closest('.cbc');if(ac&&!ro)select(ac.dataset.id);return}
    var lg=e.target.closest&&e.target.closest('.cbg');if(lg&&!ro){selectLink(lg.dataset.l);return}
    var p=rel(e);ptrs[e.pointerId]={x:p.x,y:p.y};
    var n=Object.keys(ptrs).length;
    if(n===2){var ks=Object.keys(ptrs),a=ptrs[ks[0]],b=ptrs[ks[1]];pinch={d:Math.hypot(a.x-b.x,a.y-b.y)||1,k:st.view.k,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2,vx:st.view.x,vy:st.view.y};mode=null;return}
    if(n>2)return;
    var ce=e.target.closest('.cbc'),c=ce&&byId(ce.dataset.id);
    if(linkOn&&!ro){e.preventDefault();if(c){if(!linkFrom){linkFrom=c.id;mark();if(o.onMode)o.onMode(true,c.id)}else if(c.id!==linkFrom){var a0=linkFrom;setLinkMode(false);addLink(a0,c.id)}else{linkFrom=null;mark();if(o.onMode)o.onMode(true,null)}}else setLinkMode(false);return}
    if(c&&!ro){
      if(e.target.closest('textarea,input')){select(c.id);return}
      select(c.id);front(c);
      if(e.target.hasAttribute&&e.target.hasAttribute('data-h')){snap();mode={t:'rs',c:c,sx:p.x,sy:p.y,w0:c.w,h0:c.h,moved:0}}
      else{snap();mode={t:'mv',c:c,sx:p.x,sy:p.y,x0:c.x,y0:c.y,moved:0}}
      try{host.setPointerCapture(e.pointerId)}catch(x){}
    }else if(c&&ro){mode={t:'tap',c:c,sx:p.x,sy:p.y,moved:0};try{host.setPointerCapture(e.pointerId)}catch(x){}}
    else{if(!ro){select(null);if(selLink){selLink=null;drawLinks()}}mode={t:'pan',sx:p.x,sy:p.y,vx:st.view.x,vy:st.view.y};try{host.setPointerCapture(e.pointerId)}catch(x){}host.classList.add('pan')}
  });
  host.addEventListener('pointermove',function(e){
    if(!ptrs[e.pointerId])return;var p=rel(e);ptrs[e.pointerId]={x:p.x,y:p.y};
    if(pinch){var ks=Object.keys(ptrs);if(ks.length<2)return;var a=ptrs[ks[0]],b=ptrs[ks[1]],d=Math.hypot(a.x-b.x,a.y-b.y)||1,cx=(a.x+b.x)/2,cy=(a.y+b.y)/2,k2=clamp(pinch.k*d/pinch.d,KMIN,KMAX),wx=(pinch.cx-pinch.vx)/pinch.k,wy=(pinch.cy-pinch.vy)/pinch.k;st.view={k:k2,x:cx-wx*k2,y:cy-wy*k2};apply();return}
    if(!mode)return;var dx=p.x-mode.sx,dy=p.y-mode.sy;mode.moved=Math.max(mode.moved||0,Math.abs(dx)+Math.abs(dy));
    if(mode.t==='pan'){st.view.x=mode.vx+dx;st.view.y=mode.vy+dy;apply()}
    else if(mode.t==='mv'){mode.c.x=Math.round(mode.x0+dx/st.view.k);mode.c.y=Math.round(mode.y0+dy/st.view.k);place(mode.c);drawLinks()}
    else if(mode.t==='rs'){var c=mode.c,nw=Math.max(70,Math.round(mode.w0+dx/st.view.k));if(c.t==='n'){c.w=Math.max(110,nw);c.h=Math.max(70,Math.round(mode.h0+dy/st.view.k))}else{c.h=Math.round(nw*mode.h0/mode.w0);c.w=nw}place(c);drawLinks()}
  });
  function up(e){
    delete ptrs[e.pointerId];if(pinch){if(Object.keys(ptrs).length<2)pinch=null;return}
    host.classList.remove('pan');
    if(mode){var m=mode;mode=null;
      if((m.t==='mv'||m.t==='rs')){if(m.moved>2)chg();else{undo.pop();if(o.onUndo)o.onUndo(undo.length)}}
      else if(m.t==='tap'&&m.moved<6&&m.c.t==='p'&&o.onProj)o.onProj(m.c.pid)}
  }
  host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up);
  host.addEventListener('wheel',function(e){
    e.preventDefault();var p=rel(e);
    if(e.ctrlKey||e.metaKey||(e.deltaMode===0&&Math.abs(e.deltaY)>=50&&!e.deltaX))zoomAt(p.x,p.y,st.view.k*Math.exp(-e.deltaY*(e.ctrlKey?.01:.0016)));
    else{st.view.x-=e.deltaX;st.view.y-=e.deltaY;apply()}
  },{passive:false});
  host.addEventListener('dblclick',function(e){var pc=e.target.closest('.cbc.tp');if(pc&&!ro){var cc=byId(pc.dataset.id);if(cc&&o.onProj)o.onProj(cc.pid);return}if(ro||e.target.closest('.cbc,.cbz,.cbll'))return;var p=rel(e);addNote(toWorld(p.x,p.y))});
  host.addEventListener('click',function(e){
    var z=e.target.closest('[data-z]');
    if(z){var s=view();if(z.dataset.z==='fit')fit();else zoomAt(s.w/2,s.h/2,st.view.k*(z.dataset.z==='in'?1.25:.8));return}
    var ld=e.target.closest('[data-a=ldel]');if(ld){var lo=ld.closest('.cbll');if(lo)removeLink(lo.dataset.l);return}
    var b=e.target.closest('.cbk button');if(!b)return;var ce=b.closest('.cbc'),c=ce&&byId(ce.dataset.id);if(!c)return;
    var a=b.dataset.a;
    if(a==='del')remove(c.id);
    else if(a==='front'){snap();c.z=zmax()+1;place(c);chg()}
    else if(a==='open'){if(o.onProj)o.onProj(c.pid);return}
    else if(a==='link'){setLinkMode(true,c.id);return}
    else if(a==='col'){snap();c.c=+b.dataset.v;var nn=ce.querySelector('.cbn');nn.className='cbn n'+c.c;chg()}
  });
  host.addEventListener('input',function(e){var lbl=e.target.closest&&e.target.closest('.cbll');if(lbl){var lk=lkById(lbl.dataset.l);if(lk){lk.tx=e.target.value;chg()}return}var cpi=e.target.closest&&e.target.closest('.cbcp');if(cpi){var cc=cpi.closest('.cbc'),cd=cc&&byId(cc.dataset.id);if(cd){cd.cp=cpi.value;cc.classList.toggle('hascp',!!cd.cp);chg()}return}var ta=e.target.closest&&e.target.closest('textarea');if(!ta)return;var ce=ta.closest('.cbc'),c=ce&&byId(ce.dataset.id);if(c){c.tx=ta.value;chg()}});
  host.addEventListener('focusin',function(e){var ce=e.target.closest&&e.target.closest('.cbc');if(ce&&!ro)select(ce.dataset.id)});
  host.addEventListener('keydown',function(e){
    var inTa=e.target&&(e.target.tagName==='TEXTAREA'||e.target.tagName==='INPUT');
    if(inTa){if(e.key==='Escape'||(e.key==='Enter'&&e.target.tagName==='INPUT')){e.preventDefault();e.target.blur();host.focus()}return}
    if(e.key==='Escape'&&linkOn){setLinkMode(false);return}
    if(selLink&&!ro&&(e.key==='Delete'||e.key==='Backspace')){e.preventDefault();removeLink(selLink);host.focus();return}
    if((e.key==='l'||e.key==='L')&&!ro&&selId&&!e.ctrlKey&&!e.metaKey){setLinkMode(true,selId);return}
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
    host.addEventListener('dragover',function(e){var ty=e.dataTransfer&&[].slice.call(e.dataTransfer.types||[]);if(ty&&(ty.indexOf('Files')>=0||ty.indexOf('application/x-xarch')>=0)){e.preventDefault();host.classList.add('drop')}});
    host.addEventListener('dragleave',function(e){if(!host.contains(e.relatedTarget))host.classList.remove('drop')});
    host.addEventListener('drop',function(e){host.classList.remove('drop');var xj=e.dataTransfer&&e.dataTransfer.getData&&e.dataTransfer.getData('application/x-xarch');if(xj){e.preventDefault();var pp=rel(e),it=null;try{it=JSON.parse(xj)}catch(x){}if(it&&o.onDropExt)o.onDropExt(it,toWorld(pp.x,pp.y));return}var f=e.dataTransfer&&e.dataTransfer.files;if(!f||!f.length)return;e.preventDefault();var p=rel(e);addImgs(f,toWorld(p.x,p.y))});
    onPaste=function(e){
      if(destroyed||!host.isConnected||host.offsetParent===null)return;var a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))return;
      if($('cmm')&&!$('cmm').hidden)return;
      var cd=e.clipboardData;if(!cd)return;var fs=[];[].forEach.call(cd.items||[],function(it){if(it.kind==='file'&&/^image\//.test(it.type)){var f=it.getAsFile();if(f)fs.push(f)}});
      if(fs.length){e.preventDefault();addImgs(fs)}
      else{var tx=cd.getData('text/plain');if(tx&&tx.trim()){e.preventDefault();var c=addNote();c.tx=tx.trim().slice(0,600);var el=elOf(c.id),ta=el&&el.querySelector('textarea');if(ta)ta.value=c.tx;chg()}}};
    document.addEventListener('paste',onPaste);
  }
  host.addEventListener('error',function(e){var im=e.target;if(im&&im.tagName==='IMG'&&im.dataset.id&&!im.dataset.fb&&im.dataset.id.indexOf('data:')!==0&&im.dataset.id.indexOf('https://')!==0){im.dataset.fb='1';im.src=imgFb(im.dataset.id,900)}},true);
  var api={
    state:function(){return st},
    load:function(s,noFit){st.cards=(s&&s.cards||[]).map(function(c){return Object.assign({},c)});var ids={};st.cards.forEach(function(c){ids[c.id]=1});st.links=(s&&s.links||[]).filter(function(l){return l&&ids[l.a]&&ids[l.b]&&l.a!==l.b}).map(function(l){return Object.assign({},l)});if(s&&s.view)st.view=s.view;undo=[];selId=null;selLink=null;linkOn=false;linkFrom=null;host.classList.remove('lkm');renderAll();if(o.onUndo)o.onUndo(0);if(noFit&&s&&s.view)apply();else fit()},
    toWorld:toWorld,size:view,selected:function(){return selId},addNote:addNote,addImgs:addImgs,addProj:addProj,addExt:addExt,addLink:addLink,undo:doUndo,linkMode:setLinkMode,isLinking:function(){return linkOn},canUndo:function(){return undo.length>0},center:center,remove:remove,fit:fit,focus:focus,patch:patch,byId:byId,
    redraw:function(id){var c=byId(id),el=elOf(id);if(!c||!el)return;var n=build(c);el.replaceWith(n);place(c);mark();drawLinks()},
    count:function(){return st.cards.length},
    destroy:function(){destroyed=true;if(onPaste)document.removeEventListener('paste',onPaste)}};
  apply();return api}


/* ---------- my board: local first, saved to the account when signed in ---------- */
var BD=null,BDO={},BS={u:0,dirty:false,t:null,syncing:false,again:false},UPQ=[],UPIN={},UPB=false;
function stripCard(c){var o={};Object.keys(c).forEach(function(k){if(k!=='pend'&&k!=='fail')o[k]=c[k]});return o}
function isLocalSrc(c){return c.t==='i'&&String(c.src||'').indexOf('data:')===0}
function bdPersist(){
  if(!BD)return;var st=BD.state();
  IDB.set(bkey(),{u:BS.u,cards:st.cards.map(function(c){var o=Object.assign({},c);delete o.pend;return o}),links:st.links||[],view:st.view,d:BS.dirty?1:0})}
function bdChanged(){
  BS.dirty=true;BS.u=Date.now();clearTimeout(BS.t);BS.t=setTimeout(bdSave,900)}
function bdSave(){bdPersist();bdSync()}
function bdSync(){
  if(!BD||!authed()||!S.srv)return;
  if(BS.syncing){BS.again=true;return}
  var cards=BD.state().cards.filter(function(c){return!isLocalSrc(c)}).map(stripCard),okid={};cards.forEach(function(c){okid[c.id]=1});
  var links=(BD.state().links||[]).filter(function(l){return okid[l.a]&&okid[l.b]});
  var allUp=BD.state().cards.every(function(c){return!isLocalSrc(c)});
  BS.syncing=true;
  ap({a:'cbsave',b:{cards:cards,links:links}},30000).then(function(j){
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
  BD=mkBoard(host,Object.assign({onChange:bdChanged,onAdd:bdAdded,onProj:function(id){location.hash='#community/p/'+id}},BDO));
  if(old){BD.load({cards:old.cards,links:old.links,view:old.view},true);return Promise.resolve()}
  return bdFetch()}
function bdFetch(){
  return IDB.get(bkey()).then(function(loc){
    if(!loc&&authed())return IDB.get('board:guest').then(function(g){return g&&g.cards&&g.cards.length?{u:0,cards:g.cards,links:g.links||[],view:g.view,d:1,adopted:1}:null});
    return loc}).then(function(loc){
    BS.u=(loc&&loc.u)||0;BS.dirty=!!(loc&&loc.d);
    if(BD)BD.load({cards:(loc&&loc.cards)||[],links:(loc&&loc.links)||[],view:loc&&loc.view},!!(loc&&loc.view));
    resumeUploads();
    if(authed()&&S.srv)return ap({a:'cmine'}).then(function(j){
      if(!j||!j.ok||!BD)return;fillMine(j);
      var sb=j.board;
      if(sb&&!BS.dirty&&sb.u>BS.u){var cur=BD.state();BD.load({cards:sb.b.cards,links:sb.b.links||[],view:cur.view},false);BS.u=sb.u;bdPersist()}
      else if(BS.dirty){bdSync()}
    },function(){})})}
function ensureBoard(){            // a board to add to, even when the board tab is not open
  if(BD)return Promise.resolve(BD);
  BD=mkBoard(document.createElement('div'),Object.assign({onChange:bdChanged,onAdd:bdAdded,onProj:function(id){location.hash='#community/p/'+id}},BDO));
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
function baseHash(){return S.dr==='mine'?'#community/mine':'#community'}
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
  if(isb){var host=$('cmvb');PV.bd=mkBoard(host,{ro:true,onProj:function(id){location.hash='#community/p/'+id}});PV.bd.load({cards:(p.bd&&p.bd.cards)||[],links:(p.bd&&p.bd.links)||[]});requestAnimationFrame(function(){if(PV&&PV.bd)PV.bd.fit()})}}
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
  if(isb)chain=waitUploads().then(function(done){if(!done)throw'busy';var st0=BD.state(),cards=st0.cards.map(stripCard);body.bd={cards:cards,links:(st0.links||[]).map(function(l){return{id:l.id,a:l.a,b:l.b,tx:l.tx||''}})}});
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

/* ---------- free sources: pictures and articles found from inside the board ---------- */
var AR2EN={'مسجد':'mosque','جامع':'mosque','قبة':'dome','مئذنة':'minaret','ملوية':'Samarra spiral minaret','قوس':'arch','أقواس':'arches','جسر':'bridge','بيت':'house','منزل':'house','دار':'house','فيلا':'villa','فناء':'courtyard','حوش':'courtyard','شناشيل':'shanasheel bay window','مشربية':'mashrabiya','سوق':'souk bazaar','خان':'caravanserai khan','قلعة':'fortress castle','قصر':'palace','برج':'tower','ناطحة سحاب':'skyscraper','متحف':'museum','مكتبة':'library','جامعة':'university','مدرسة':'school','مستشفى':'hospital','كنيسة':'church','معبد':'temple','زقورة':'ziggurat','ضريح':'mausoleum','مرقد':'shrine','مطار':'airport','محطة':'station','ملعب':'stadium','فندق':'hotel','مصنع':'factory','مسرح':'theatre',
 'عمارة':'architecture','معماري':'architecture','تصميم':'design','داخلي':'interior','حديقة':'garden','ساحة':'plaza','مدينة':'city','حضري':'urban','سكني':'housing','مجمع':'complex','ثقافي':'cultural center','طابوق':'brick','طوب':'brick','خرسانة':'concrete','زجاج':'glass','خشب':'timber','حجر':'stone','فولاذ':'steel','واجهة':'facade','سقف':'roof','سلم':'staircase','نافذة':'window','باب':'door','عمود':'column','جدار':'wall','مخطط':'floor plan','مقطع':'section drawing','مجسم':'architectural model','ماكيت':'architectural model','نهر':'river','نخيل':'palm','أهوار':'marshes','ضوء':'daylight','ظل':'shade',
 'بغداد':'Baghdad','البصرة':'Basra','الموصل':'Mosul','النجف':'Najaf','كربلاء':'Karbala','أربيل':'Erbil','سامراء':'Samarra','بابل':'Babylon','أور':'Ur','القاهرة':'Cairo','دبي':'Dubai','إسطنبول':'Istanbul','استانبول':'Istanbul','قديم':'ancient','حديث':'modern','معاصر':'contemporary','تراثي':'heritage','تقليدي':'vernacular','إسلامي':'Islamic','عباسي':'Abbasid','عثماني':'Ottoman','عراقي':'Iraqi','عربي':'Arab',
 'زها حديد':'Zaha Hadid','رفعت الجادرجي':'Rifat Chadirji','محمد مكية':'Mohamed Makiya','لو كوربوزييه':'Le Corbusier','فرانك لويد رايت':'Frank Lloyd Wright','ميس فان دير رو':'Mies van der Rohe','لويس كان':'Louis Kahn','تادو أندو':'Tadao Ando','نورمان فوستر':'Norman Foster','حسن فتحي':'Hassan Fathy','أوسكار نيماير':'Oscar Niemeyer','جان نوفيل':'Jean Nouvel','بيتر زومثور':'Peter Zumthor','رنزو بيانو':'Renzo Piano'};
var ARN=null;
function arMap(){if(ARN)return ARN;ARN=[];Object.keys(AR2EN).forEach(function(k){ARN.push([norm(k),AR2EN[k]])});ARN.sort(function(a,b){return b[0].length-a[0].length});return ARN}
function toEn(q){
  var s=' '+norm(q)+' ';arMap().forEach(function(p){var k=' '+p[0]+' ';while(s.indexOf(k)>=0)s=s.replace(k,' \u0001'+p[1].replace(/ /g,'\u0002')+' ')});
  return s.split(' ').filter(function(t){return t&&(t.charAt(0)==='\u0001'||/^[a-z0-9]+$/.test(t))}).map(function(t){return t.replace(/\u0001/g,'').replace(/\u0002/g,' ')}).join(' ').trim()}
var EXR={q:'',imgs:[],arts:[],busy:false,err:false,n:0};
function fj(u){return tmo(fetch(u).then(function(r){if(!r.ok)throw new Error('http');return r.json()}),10000)}
function plain(h){try{return(new DOMParser().parseFromString(String(h||''),'text/html').body.textContent||'').replace(/\s+/g,' ').trim()}catch(e){return''}}
function withArch(q){return/architect|building|house|design|plan|museum|mosque|tower|bridge|church|palace/i.test(q)?q:q+' architecture'}
function fetchCommons(q){
  var u='https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=16&gsrsearch='+encodeURIComponent(withArch(q)+' filetype:bitmap')+'&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=640&iiextmetadatafilter=LicenseShortName%7CArtist%7CObjectName';
  return fj(u).then(function(j){var ps=(j&&j.query&&j.query.pages)||{},a=(Array.isArray(ps)?ps:Object.keys(ps).map(function(k){return ps[k]})).sort(function(x,y){return(x.index||0)-(y.index||0)});
    return a.map(function(p){var ii=p.imageinfo&&p.imageinfo[0];if(!ii||!extOk(ii.thumburl))return null;
      var m=ii.extmetadata||{},lic=plain(m.LicenseShortName&&m.LicenseShortName.value),art=plain(m.Artist&&m.Artist.value),
          ttl=plain(m.ObjectName&&m.ObjectName.value)||String(p.title||'').replace(/^File:/,'').replace(/\.[a-z0-9]+$/i,'').replace(/_/g,' ');
      return{t:'i',src:ii.thumburl,w:ii.thumbwidth||4,h:ii.thumbheight||3,cp:ttl.slice(0,80),cr:((art?art.slice(0,60)+' · ':'')+(lic||'Wikimedia Commons')).slice(0,160),lk:extOk(ii.descriptionurl)?ii.descriptionurl:''}}).filter(Boolean)})}
function fetchAIC(q){
  var u='https://api.artic.edu/api/v1/artworks/search?q='+encodeURIComponent(withArch(q))+'&query[term][is_public_domain]=true&fields=id,title,artist_title,image_id,thumbnail&limit=10';
  return fj(u).then(function(j){var d=(j&&j.data)||[];
    return d.filter(function(x){return x&&x.image_id&&/^[A-Za-z0-9-]{8,64}$/.test(x.image_id)}).map(function(x){var th=x.thumbnail||{};
      return{t:'i',src:'https://www.artic.edu/iiif/2/'+x.image_id+'/full/600,/0/default.jpg',w:th.width||4,h:th.height||3,cp:String(x.title||'').slice(0,80),cr:((x.artist_title?String(x.artist_title).slice(0,60)+' · ':'')+'CC0 · Art Institute of Chicago').slice(0,160),lk:'https://www.artic.edu/artworks/'+(+x.id||0)}})})}
function fetchWiki(lang,q){
  var u='https://'+lang+'.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch='+encodeURIComponent(q)+'&gsrlimit=6&prop=pageimages%7Cextracts%7Cinfo&piprop=thumbnail&pithumbsize=320&exintro=1&explaintext=1&exchars=220&exlimit=max&inprop=url';
  return fj(u).then(function(j){var ps=(j&&j.query&&j.query.pages)||{},a=(Array.isArray(ps)?ps:Object.keys(ps).map(function(k){return ps[k]})).sort(function(x,y){return(x.index||0)-(y.index||0)});
    return a.filter(function(p){return extOk(p.fullurl)}).map(function(p){return{t:'a',ti:String(p.title||'').slice(0,120),tx:String(p.extract||'').slice(0,260),im:p.thumbnail&&extOk(p.thumbnail.source)?p.thumbnail.source:'',lk:p.fullurl,lg:lang}})})}
function mix(a,b){var o=[],n=Math.max(a.length,b.length);for(var i=0;i<n;i++){if(a[i])o.push(a[i]);if(b[i])o.push(b[i])}return o}
function runExt(){
  var q=S.q;if(!q||q.length<2){EXR={q:q,imgs:[],arts:[],busy:false,err:false,n:EXR.n+1};return Promise.resolve()}
  var my=++EXR.n,en=toEn(q),isAr=/[؀-ۿ]/.test(q);
  EXR.q=q;EXR.busy=true;EXR.err=false;if(typeof drDraw==='function')drDraw();
  var fails=0,att=0,wrap=function(p){att++;return p.then(function(x){return x||[]},function(){fails++;return[]})};
  var jobs=[en?wrap(fetchCommons(en)):Promise.resolve([]),en?wrap(fetchAIC(en)):Promise.resolve([]),
    wrap(fetchWiki(isAr?'ar':'en',isAr?q:withArch(q))),(isAr&&en)?wrap(fetchWiki('en',withArch(en))):Promise.resolve([])];
  return Promise.all(jobs).then(function(r){
    if(my!==EXR.n)return;EXR.busy=false;
    EXR.imgs=mix(r[0],r[1]).slice(0,24);EXR.arts=mix(r[2],r[3]).slice(0,8);EXR.err=att>0&&fails>=att;
    if(typeof drDraw==='function')drDraw()})}
function extItem(i){return EXR.items&&EXR.items[i]}

/* ---------- the workspace: a board that fills the page, a search that brings pictures and projects to it ---------- */
var SR={items:[]};
function hay(p){if(!p._h)p._h={t:norm(p.ti),a:norm(p.n),g:norm((p.tg||[]).concat(p.sw||[]).join(' ')),x:norm(p.tx),u:norm(p.u)};return p._h}
function sc(h,toks){var s=0;for(var i=0;i<toks.length;i++){var t=toks[i],m=0;
  if(h.t.indexOf(t)===0||h.t.indexOf(' '+t)>=0)m+=7;else if(h.t.indexOf(t)>=0)m+=4;
  if(h.g.indexOf(t)>=0)m+=4;if(h.a.indexOf(t)>=0)m+=4;if(h.u.indexOf(t)>=0)m+=2;if(h.x&&h.x.indexOf(t)>=0)m+=1;
  if(!m)return 0;s+=m}return s}
function localFind(q){
  var toks=norm(q).split(' ').filter(Boolean),out={ps:[],ppl:[],cs:[]};if(!toks.length)return out;
  var seen={},pool=S.feed.concat(S.mine.filter(function(m){return m.s&&m.s!=='live'})),ps=[],ppl={};
  pool.forEach(function(p){if(seen[p.id])return;seen[p.id]=1;var s=sc(hay(p),toks);if(s)ps.push({s:s,p:p});
    var an=norm(p.n),ok=toks.every(function(t){return an.indexOf(t)>=0});if(ok&&p.a){ppl[p.a]=ppl[p.a]||{ak:p.a,n:p.n,c:0};ppl[p.a].c++}});
  ps.sort(function(a,b){return b.s-a.s||b.p.t-a.p.t});out.ps=ps.slice(0,8).map(function(x){return x.p});
  out.ppl=Object.keys(ppl).slice(0,4).map(function(a){return ppl[a]});
  var cs=BD?BD.state().cards:[];
  out.cs=cs.filter(function(c){var tx=c.t==='n'?c.tx:c.t==='i'?c.cp:c.ti;return tx&&toks.every(function(t){return norm(tx).indexOf(t)>=0})}).slice(0,6);
  return out}
function hh(){var h=document.querySelector('header');if(root&&h)root.style.setProperty('--hh',Math.round(h.getBoundingClientRect().height)+'px')}
addEventListener('resize',function(){hh()});
var root=null,rendered=false,pendingOpen='';
function isWide(){return window.innerWidth>=1000}
var RAIL=[['img','img','صورة','Picture'],['note','note','ملاحظة','Note'],['conn','conn','ربط','Connect'],'-',['find','search','بحث','Search'],['feed','grid','المجتمع','Community'],'-',['undo','undo','تراجع','Undo'],['pub','share','انشر لوحتي','Publish my board']];
function shell(){
  root=$('cm');if(!root)return;rendered=false;
  var rail=RAIL.map(function(r){if(r==='-')return'<i class="wsp" aria-hidden="true"></i>';var l=tt(r[2],r[3]);
    return'<button type="button" class="wsb" data-ws="'+r[0]+'" aria-label="'+esc(l)+'" data-tip="'+esc(l)+'"'+(r[0]==='conn'?' aria-pressed="false"':'')+(r[0]==='undo'?' disabled':'')+'>'+ico(r[1])+'</button>'}).join('');
  var starts=[['img','img','صورة','Picture'],['note','note','ملاحظة','Note'],['find','search','ابحث','Search']].map(function(r){return'<button type="button" class="wsg" data-ws="'+r[0]+'"><span>'+ico(r[1])+'</span><em>'+esc(tt(r[2],r[3]))+'</em></button>'}).join('');
  root.innerHTML='<div class="ws" id="ws"><h1 class="wss">'+esc(tt('المجتمع','Community'))+'</h1><div class="wsc" id="cmbd"></div>'
   +'<div class="wse" id="wse" hidden>'+starts+'</div>'
   +'<div class="wst"><div class="cmq">'+ico('search')+'<input id="cmi" type="search" autocomplete="off" enterkeyhint="search" placeholder="'+esc(tt('ابحث: صور، مشاريع، مقالات، أشخاص','Search pictures, projects, articles, people'))+'" aria-label="'+esc(tt('ابحث في المجتمع وفي المصادر','Search the community and free sources'))+'"><button type="button" class="wsx" id="cmq0" aria-label="'+esc(tt('مسح','Clear'))+'" hidden>'+ico('x')+'</button></div><p class="wsh" id="wsh" role="status" hidden></p></div>'
   +'<nav class="wsr" role="toolbar" aria-orientation="vertical" aria-label="'+esc(tt('أدوات اللوحة','Board tools'))+'">'+rail+'</nav>'
   +'<aside class="wsd" id="wsd" aria-label="'+esc(tt('المجتمع والمصادر','Community and sources'))+'" hidden><div class="wsdh"><div class="wsdt" role="tablist">'
   +[['feed','grid','المجتمع','Community'],['find','search','نتائج البحث','Results'],['mine','person','مشاريعي','My posts']].map(function(t){return'<button type="button" role="tab" data-dr="'+t[0]+'" aria-label="'+esc(tt(t[2],t[3]))+'" data-tip="'+esc(tt(t[2],t[3]))+'">'+ico(t[1])+'</button>'}).join('')
   +'</div><button type="button" class="wsb sm" data-cm="new" aria-label="'+esc(tt('انشر مشروعاً','Post a project'))+'" data-tip="'+esc(tt('انشر مشروعاً','Post a project'))+'">'+ico('plus')+'</button><button type="button" class="wsb sm" data-dr="" aria-label="'+esc(tt('إغلاق','Close'))+'">'+ico('x')+'</button></div><div class="wsdb" id="wsdb"></div></aside>'
   +'<div id="cmtoast" class="cmtoast" role="status" aria-live="polite"></div><input type="file" id="cmfi" accept="image/*" multiple hidden></div>';
  root._lang=L;hh();
  BDO={noHint:true,
    onCount:function(n){var e=$('wse');if(e)e.hidden=n>0},
    onUndo:function(n){var u=root&&root.querySelector('[data-ws=undo]');if(u)u.disabled=!n},
    onMode:function(on,from){var b=root&&root.querySelector('[data-ws=conn]'),h=$('wsh');if(b){b.classList.toggle('on',!!on);b.setAttribute('aria-pressed',on?'true':'false')}
      if(h){h.hidden=!on;h.textContent=on?(from?tt('اختر العنصر الثاني','Pick the second item'):tt('اختر العنصر الأول','Pick the first item')):''}},
    onDropExt:function(it,pos){if(BD)BD.addExt(it,pos)}};
  if(!root._cm){root._cm=1;
    root.addEventListener('click',rootClick);
    root.addEventListener('change',function(e){if(e.target.id==='cmfi'){if(BD)BD.addImgs(e.target.files);e.target.value=''}});
    root.addEventListener('input',function(e){if(e.target.id==='cmi')onQuery()});
    root.addEventListener('keydown',rootKey);
    root.addEventListener('dragstart',function(e){var t=e.target.closest&&e.target.closest('[data-ext]');if(!t)return;var it=extGet(t.dataset.ext);if(!it){e.preventDefault();return}try{e.dataTransfer.setData('application/x-xarch',JSON.stringify(it));e.dataTransfer.effectAllowed='copy'}catch(x){}});
    root.addEventListener('error',function(e){var im=e.target;if(im&&im.tagName==='IMG'&&im.dataset.id&&!im.dataset.fb&&im.dataset.id.indexOf('data:')!==0&&im.dataset.id.indexOf('https://')!==0){im.dataset.fb='1';im.src=imgFb(im.dataset.id,800)}},true)}}
/* --- results and lists --- */
function extGet(k){var p=String(k).split(':'),a=p[0]==='i'?EXR.imgs:EXR.arts;return a&&a[+p[1]]}
function cover(p){var im=p.im||[];if(p.k==='b')return'<span class="wtv bd n'+Math.min(4,im.length)+'">'+(im.length?im.slice(0,4).map(function(i){return imgTag(i,300)}).join(''):'<span class="wbi">'+ico('board')+'</span>')+'</span>';return'<span class="wtv">'+imgTag(im[0],500)+'</span>'}
function ptile(p){return'<div class="wtl" data-id="'+esc(p.id)+'"><a class="wtc" href="#community/p/'+esc(p.id)+'" aria-label="'+esc(p.ti)+'">'+cover(p)+'<span class="wtt" dir="auto">'+esc(p.ti)+'</span></a><button type="button" class="wta" data-add="'+esc(p.id)+'" aria-label="'+esc(tt('أضف إلى لوحتي','Add to my board'))+'">'+ico('plus')+'</button><span class="cmh wth'+(S.liked[p.id]?' on':'')+'" data-h="'+esc(p.id)+'" role="button" tabindex="0" aria-label="'+esc(tt('إعجاب','Like'))+'">'+ico('heart')+'<em>'+(p.lk||0)+'</em></span></div>'}
function itile(it,i){return'<button type="button" class="wti" draggable="true" data-ext="i:'+i+'" aria-label="'+esc(tt('أضف إلى اللوحة: ','Add to board: ')+(it.cp||''))+'" title="'+esc((it.cp||'')+(it.cr?' — '+it.cr:''))+'"><img alt="" loading="lazy" referrerpolicy="no-referrer" draggable="false" src="'+esc(it.src)+'" style="aspect-ratio:'+Math.max(.6,Math.min(1.8,(it.w||4)/(it.h||3))).toFixed(2)+'"><span class="wad" aria-hidden="true">'+ico('plus')+'</span></button>'}
function arow(it,i){return'<button type="button" class="wtr" draggable="true" data-ext="a:'+i+'" aria-label="'+esc(tt('أضف إلى اللوحة: ','Add to board: ')+it.ti)+'"><span class="wrv">'+(it.im?'<img alt="" loading="lazy" referrerpolicy="no-referrer" draggable="false" src="'+esc(it.im)+'">':ico('book'))+'</span><span class="wrt"><b dir="auto">'+esc(it.ti)+'</b><small dir="auto">'+esc(it.tx)+'</small></span><span class="wad" aria-hidden="true">'+ico('plus')+'</span></button>'}
function skel(n){var h='';for(var i=0;i<n;i++)h+='<span class="wsk"></span>';return'<div class="wsks" aria-hidden="true">'+h+'</div>'}
function note(icon,txt,btn){return'<div class="wsn">'+ico(icon)+(txt?'<p>'+esc(txt)+'</p>':'')+(btn||'')+'</div>'}
var SRCF=[['all','grid','الكل','All'],['i','img','صور','Pictures'],['a','book','مقالات','Articles'],['p','board','مشاريع','Projects']];
function chipsRow(cur,attr,list){return'<div class="wsf" role="group">'+list.map(function(f){return'<button type="button" class="wsc2'+(cur===f[0]?' on':'')+'" '+attr+'="'+f[0]+'" aria-pressed="'+(cur===f[0])+'">'+ico(f[1])+'<span>'+esc(tt(f[2],f[3]))+'</span></button>'}).join('')+'</div>'}
function bodyFind(){
  var q=S.q;if(!q)return note('search',tt('اكتب ما تبحث عنه','Type what you look for'));
  var L2=localFind(q),f=S.src,h=chipsRow(f,'data-src',SRCF),any=false;
  if((f==='all'||f==='p')&&(L2.ps.length||L2.ppl.length||L2.cs.length)){any=true;
    h+=(L2.ps.length?'<div class="wsgd">'+L2.ps.map(ptile).join('')+'</div>':'')
     +(L2.ppl.length?'<div class="wpp">'+L2.ppl.map(function(x){return'<a class="wpe" href="#community/u/'+esc(x.ak)+'"><span>'+esc((x.n||'?').charAt(0).toUpperCase())+'</span><b dir="auto">'+esc(x.n)+'</b></a>'}).join('')+'</div>':'')
     +(L2.cs.length?'<div class="wcs">'+L2.cs.map(function(c){return'<button type="button" class="wcr" data-jump="'+esc(c.id)+'">'+ico(c.t==='i'?'img':c.t==='n'?'note':'board')+'<b dir="auto">'+esc((c.t==='n'?c.tx:c.t==='i'?c.cp:c.ti)||'')+'</b></button>'}).join('')+'</div>':'')}
  if(f==='all'||f==='i'){
    if(EXR.imgs.length){any=true;h+='<div class="wmas">'+EXR.imgs.map(itile).join('')+'</div>'}
    else if(EXR.busy)h+=skel(6)}
  if(f==='all'||f==='a'){
    if(EXR.arts.length){any=true;h+='<div class="wrs">'+EXR.arts.map(arow).join('')+'</div>'}
    else if(EXR.busy&&f==='a')h+=skel(4)}
  if(!any&&!EXR.busy)h+=EXR.err?note('x',tt('تعذّر الاتصال بالمصادر','Could not reach the sources'),'<button type="button" class="b" data-cm="again">'+esc(tt('أعد المحاولة','Retry'))+'</button>'):note('search',tt('لا نتائج','No results'));
  if(any&&(EXR.imgs.length||EXR.arts.length))h+='<p class="wsl">'+ico('info')+'<span>'+esc(tt('صور ومقالات حرّة الترخيص. المصدر محفوظ على كل بطاقة.','Free-licence pictures and articles. The source stays on each card.'))+'</span></p>';
  return h}
function bodyFeed2(){
  if(S.srv===false)return note('board',tt('النشر العام يفتح قريباً','Public posting opens soon'));
  if(S.srv==='err')return note('x',tt('تعذّر الاتصال','No connection'),'<button type="button" class="b" data-cm="retry">'+esc(tt('أعد المحاولة','Retry'))+'</button>');
  if(S.srv===null)return skel(6);
  var a=S.feed;if(S.flt==='b')a=a.filter(function(p){return p.k==='b'});else if(S.flt==='p')a=a.filter(function(p){return p.k!=='b'});if(S.who)a=a.filter(function(p){return p.a===S.who});
  var who='';if(S.who){var w=S.feed.concat(S.mine).filter(function(p){return p.a===S.who})[0];who='<a class="wsc2 on wwho" href="#community">'+ico('person')+'<span dir="auto">'+esc(w?w.n:'…')+'</span>'+ico('x')+'</a>'}
  var h=chipsRow(S.flt,'data-flt',[['all','grid','الكل','All'],['p','img','مشاريع','Projects'],['b','board','لوحات','Boards']])+who;
  return h+(a.length?'<div class="wsgd">'+a.map(ptile).join('')+'</div>':note('img',tt('لا شيء بعد','Nothing yet'),'<button type="button" class="b s" data-cm="new">'+ico('plus')+'<span>'+esc(tt('انشر','Post'))+'</span></button>'))}
var PST={pending:['قيد المراجعة','In review'],live:['منشور','Live'],hidden:['مخفي','Hidden']};
function bodyMine2(){
  if(!authed())return note('person',tt('سجّل لتنشر','Register to post'),'<button type="button" class="b s" data-cm="join">'+esc(tt('سجّل','Register'))+'</button>');
  if(S.srv===false)return note('board',tt('النشر العام يفتح قريباً','Public posting opens soon'));
  if(!S.mineLoaded)return skel(3);
  if(!S.mine.length)return note('img',tt('لم تنشر بعد','Nothing posted yet'),'<button type="button" class="b s" data-cm="new">'+ico('plus')+'<span>'+esc(tt('انشر','Post'))+'</span></button>');
  return'<div class="cmls">'+S.mine.map(function(p){var st=PST[p.s]||[p.s,p.s];return'<div class="cmrw" data-id="'+esc(p.id)+'"><a class="cmrt" href="#community/p/'+esc(p.id)+'"><span class="cmi sm">'+(p.k==='b'?'<span class="cmbi">'+ico('board')+'</span>':imgTag((p.im||[])[0],200))+'</span><b dir="auto">'+esc(p.ti)+'</b></a><span class="cmst s-'+esc(p.s)+'">'+esc(tt(st[0],st[1]))+'</span><span class="cmh">'+ico('heart')+'<em>'+(p.lk||0)+'</em></span><button type="button" class="cmdl" data-del="'+esc(p.id)+'" aria-label="'+esc(tt('حذف','Delete'))+'">'+ico('trash')+'</button></div>'}).join('')+'</div>'}
function drDraw(){
  var d=$('wsd'),b=$('wsdb'),ws=$('ws');if(!d||!b)return;
  var open=!!S.dr;d.hidden=!open;if(ws)ws.classList.toggle('dro',open);
  [].forEach.call(d.querySelectorAll('[data-dr]'),function(x){if(!x.dataset.dr)return;var on=x.dataset.dr===S.dr;x.classList.toggle('on',on);x.setAttribute('aria-selected',on?'true':'false')});
  var f=document.activeElement;
  if(!open)return;
  var top=b.scrollTop;b.innerHTML=S.dr==='find'?bodyFind():S.dr==='mine'?bodyMine2():bodyFeed2();
  if(!b._keep)b.scrollTop=top;b._keep=0}
function openDr(k){S.dr=k;drDraw()}
function refresh(){if(!root||!$('wsd'))return;drDraw()}
function onQuery(){
  var inp=$('cmi'),x=$('cmq0');if(!inp)return;S.q=inp.value.trim();if(x)x.hidden=!S.q;
  if(S.q){S.dr='find';drDraw();clearTimeout(S.qt);S.qt=setTimeout(runExt,450)}
  else{clearTimeout(S.qt);EXR.n++;EXR.busy=false;EXR.imgs=[];EXR.arts=[];if(S.dr==='find')S.dr=isWide()?'feed':'';drDraw()}}
function addExtItem(it){
  if(!BD||!it)return;var v=BD.size(),dw=(isWide()&&S.dr&&$('wsd'))?$('wsd').offsetWidth:0,rtl=getComputedStyle(root).direction==='rtl',
      cx=(rtl?dw+(v.w-dw)/2:(v.w-dw)/2),p=BD.toWorld(cx,v.h/2),n=(S.nAdd++)%6,c=BD.addExt(it,{x:p.x+n*26,y:p.y+n*26});
  if(c)toast(tt('أُضيف إلى اللوحة','Added to the board'));else toast(tt('تعذّرت الإضافة','Could not add'))}
function rootKey(e){
  if(e.key==='Escape'&&e.target.id==='cmi'){if($('cmi').value){$('cmi').value='';onQuery()}else $('cmi').blur();return}
  if(e.key==='Enter'&&e.target.id==='cmi'){e.preventDefault();clearTimeout(S.qt);S.q=$('cmi').value.trim();S.dr='find';drDraw();runExt();return}
  var h=e.target.closest&&e.target.closest('[data-h]');if(h&&h.tagName!=='A'&&(e.key==='Enter'||e.key===' ')){e.preventDefault();toggleLike(h.dataset.h)}}
document.addEventListener('keydown',function(e){
  if(!root||!document.body.classList.contains('rc')||e.ctrlKey||e.metaKey||e.altKey)return;var a=document.activeElement;
  if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))return;if($('cmm')&&!$('cmm').hidden)return;
  if(e.key==='/'){var i=$('cmi');if(i){e.preventDefault();i.focus()}}
  else if(e.key==='Escape'&&S.dr&&!(BD&&BD.isLinking()))openDr('')});
function rootClick(e){
  var t=e.target,h=t.closest('[data-h]');
  if(h&&h.tagName!=='A'){e.preventDefault();e.stopPropagation();toggleLike(h.dataset.h);return}
  var d=t.closest('[data-del]');if(d){if(!d.classList.contains('sure')){d.classList.add('sure');toast(tt('اضغط مرة ثانية للتأكيد','Press again to confirm'));setTimeout(function(){d.classList.remove('sure')},3500);return}doDelete(d.dataset.del);return}
  var w=t.closest('[data-ws]');
  if(w&&BD){var k=w.dataset.ws;
    if(k==='img')$('cmfi').click();
    else if(k==='note')BD.addNote();
    else if(k==='conn'){if(BD.isLinking())BD.linkMode(false);else BD.linkMode(true,BD.selected())}
    else if(k==='undo')BD.undo();
    else if(k==='pub')openComposer('b');
    else if(k==='find'){openDr('find');var i=$('cmi');if(i)i.focus()}
    else if(k==='feed')openDr(S.dr==='feed'?'':'feed');
    return}
  var dr=t.closest('[data-dr]');if(dr){openDr(dr.dataset.dr);if(dr.dataset.dr==='mine')loadMine().then(refresh);return}
  var ex=t.closest('[data-ext]');if(ex){addExtItem(extGet(ex.dataset.ext));return}
  var ad=t.closest('[data-add]');if(ad){var p=findPost(ad.dataset.add);if(p)addToBoard(p);return}
  var jp=t.closest('[data-jump]');if(jp&&BD){BD.focus(jp.dataset.jump);if(!isWide())openDr('');return}
  var sf=t.closest('[data-src]');if(sf){S.src=sf.dataset.src;drDraw();return}
  var ff=t.closest('[data-flt]');if(ff){S.flt=ff.dataset.flt;drDraw();return}
  var c=t.closest('[data-cm]');if(!c)return;var k2=c.dataset.cm;
  if(k2==='new')openComposer('p');
  else if(k2==='join'){if(typeof rgo==='function')rgo()}
  else if(k2==='again'){runExt()}
  else if(k2==='retry'){S.srv=null;drDraw();loadFeed(true).then(function(){refresh();loadMine().then(refresh)})}}
function route(was){
  if(!root||!root.isConnected||root._lang!==L)shell();
  if(!root)return;
  var h=location.hash.replace(/^#/,'').split('/'),sub=h[1]||'',arg=h[2]||'',first=!rendered;
  if(sub==='board'){try{history.replaceState(null,'','#community')}catch(x){}sub=''}
  var dr=S.dr,who=S.who;
  if(sub==='mine'){dr='mine';who=''}else if(sub==='u'){dr='feed';who=arg;S.flt='all'}else if(sub==='boards'){dr='feed';who='';S.flt='b'}else if(sub===''){who='';if(first)dr=isWide()?'feed':''}
  S.who=who;
  if(first){rendered=true;S.dr=dr;drDraw();bdLoadInto($('cmbd')).then(function(){if(S.focusCard&&BD){BD.focus(S.focusCard);S.focusCard=null}})}
  else if(sub!=='p'&&(dr!==S.dr||sub==='u')){S.dr=dr;drDraw()}
  if(!was)window.scrollTo(0,0);
  if(sub==='p'){
    if(PV&&PV.p.id===arg&&S.modal==='p'){}
    else if(S.srv===null&&API)pendingOpen=arg;else openProj(arg)}
  else if(S.modal==='p')mclose();
  if(S.srv===null||!was){
    loadFeed().then(function(){refresh();if(pendingOpen){var id=pendingOpen;pendingOpen='';if(/^#community\/p\//.test(location.hash))openProj(id)}return loadMine()}).then(refresh)}}
window.CMOK={route:route,
  relang:function(){if(document.body.classList.contains('rc')){mclose();shell();rendered=false;route(true)}else if(root)root._lang=null},
  auth:function(){if(!root)return;S.mineLoaded=false;loadMine().then(function(){refresh();resumeUploads()})}};

})();