/* X Architecture — motion layer ("kinetic" theme). Pairs with motion.css.
   Self-contained: it only adds elements/attributes marked data-fxe / data-fxt and removes them all when switched off.
   The header button toggles it (remembered in localStorage "xm"); prefers-reduced-motion keeps it off. */
(function(){
'use strict';
var D=document.documentElement,
    RM=window.matchMedia('(prefers-reduced-motion:reduce)'),
    FP=window.matchMedia('(hover:hover) and (pointer:fine)'),
    KEY='xm',live=false,offs=[],raf=0,
    sy=0,lastY=0,vel=0,dir=0,dirty=true,
    ptr={x:-1e4,y:-1e4,a:false},cur={x:-1e4,y:-1e4},
    el={},net=null;

function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function on(t,e,f,o){t.addEventListener(e,f,o);offs.push(function(){t.removeEventListener(e,f,o)})}
function mk(tag,id){var n=document.createElement(tag);if(id)n.id=id;n.setAttribute('data-fxe','');n.setAttribute('aria-hidden','true');return n}
function tt(ar,en){try{return typeof T==='function'?T(ar,en):en}catch(e){return en}}

/* ---------- toggle ---------- */
function stored(){var v=null;try{v=localStorage.getItem(KEY)}catch(e){}return v}
function remember(v){try{localStorage.setItem(KEY,v?'1':'0')}catch(e){}}
function label(){
  var b=$('#fxb');if(!b)return;
  var s=live?tt('تأثيرات الحركة: مفعّلة','Motion effects: on'):tt('تأثيرات الحركة: متوقفة','Motion effects: off');
  b.setAttribute('aria-label',s);b.title=s;b.setAttribute('aria-pressed',live?'true':'false');
}
function button(){
  if($('#fxb'))return;
  var hr=$('header .hr'),th=$('#thb');if(!hr)return;
  var b=document.createElement('button');
  b.id='fxb';b.type='button';b.className='lgb thb';
  b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12.5h3.4l2.3-6.3 4 12.1 2.9-8.2 1.6 2.4h4.8"/><path class="sl" d="M4 20L20 4"/></svg>';
  if(th&&th.nextSibling)hr.insertBefore(b,th.nextSibling);else hr.appendChild(b);
  b.addEventListener('click',function(){live?stop(true):start(true)});
  label();
}

/* ---------- start / stop ---------- */
function start(save){
  if(live)return;
  if(RM.matches)return;
  live=true;D.setAttribute('data-fx','1');if(save)remember(true);
  sy=lastY=window.pageYOffset||0;vel=0;dirty=true;
  progress();pointer();lines();counts();
  if(FP.matches)hover();
  on(window,'scroll',function(){dirty=true;wake()},{passive:true});
  on(window,'resize',resize);on(window,'hashchange',function(){dirty=true;wake();setTimeout(function(){dirty=true;wake()},400)});
  if(window.MutationObserver){var mo=new MutationObserver(function(){if(net)net.touch();wake()});mo.observe(D,{attributes:true,attributeFilter:['data-theme']});offs.push(function(){mo.disconnect()})}
  on(document.documentElement,'mouseleave',function(){ptr.a=false;if(el.cur)el.cur.classList.remove('on')});
  label();wake();
}
function stop(save){
  if(!live)return;
  live=false;D.removeAttribute('data-fx');if(save)remember(false);
  cancelAnimationFrame(raf);
  offs.forEach(function(f){try{f()}catch(e){}});offs=[];
  $$('[data-fxe]').forEach(function(n){if(n.parentNode)n.parentNode.removeChild(n)});
  $$('[data-fxt]').forEach(function(n){n.removeAttribute('data-fxt');n.classList.remove('fxh');n.style.transform='';n.style.removeProperty('--mx');n.style.removeProperty('--my')});
  $$('.b').forEach(function(n){n.style.transform=''});
  $$('.ex img').forEach(function(n){n.style.removeProperty('--py')});
  $$('.pv i[data-v]').forEach(function(n){n.textContent=n.dataset.v;n.removeAttribute('data-v')});
  var h=$('header');if(h)h.classList.remove('fxu');
  el={};net=null;ptr={x:-1e4,y:-1e4,a:false};cur={x:-1e4,y:-1e4};
  label();
}

/* ---------- main loop ---------- */
/* The loop only runs while something moves (scroll, pointer, hairlines easing out) and goes to sleep ~0.5s after it stops,
   so an idle page costs no CPU/GPU at all (matters on weak machines, power saving, and browsers without hardware acceleration). wake() restarts it. */
var calm=0;
function wake(){calm=0;if(live&&!raf)raf=requestAnimationFrame(loop)}
function loop(){
  raf=0;
  if(!live)return;
  var q=el.q,busy=dirty||Math.abs(vel)>.02;
  if(dirty){dirty=false;scrolled()}
  vel*=.9;
  cur.x+=(ptr.x-cur.x)*.16;cur.y+=(ptr.y-cur.y)*.16;
  if(el.cur)cursorStep();
  if(net){net.draw();if(net.busy())busy=true}
  if(Math.abs(ptr.x-cur.x)>.3||Math.abs(ptr.y-cur.y)>.3)busy=true;
  if(q&&(Math.abs(ptr.x-q.x)>.3||Math.abs(ptr.y-q.y)>.3||Math.abs(q.r)>.1))busy=true;
  calm=busy?0:calm+1;
  if(calm<30)raf=requestAnimationFrame(loop);
}
function scrolled(){
  sy=window.pageYOffset||0;
  var d=sy-lastY;lastY=sy;
  if(Math.abs(d)>0.5)vel=d;
  if(Math.abs(d)>4)dir=d>0?1:-1;
  var H=D.scrollHeight-window.innerHeight;
  if(el.bar)el.bar.firstChild.style.transform='scaleX('+(H>0?Math.min(1,Math.max(0,sy/H)):0).toFixed(4)+')';
  header(d);
  figs();
}
function resize(){if(net)net.size();dirty=true;wake()}

/* ---------- scroll progress + pointer tracking ---------- */
function progress(){var b=mk('div','fxp');b.appendChild(document.createElement('i'));document.body.appendChild(b);el.bar=b}
function pointer(){
  on(window,'pointermove',function(e){
    if(e.pointerType==='touch')return;
    ptr.x=e.clientX;ptr.y=e.clientY;ptr.a=true;ptr.t=Date.now();
    if(cur.x<-1e3){cur.x=ptr.x;cur.y=ptr.y}
    wake();
  },{passive:true});
  if(FP.matches)logoCursor();
}

/* ---------- the pointer is the X Architecture mark: it grows + turns over links, squeezes and rings out on click ---------- */
function logoCursor(){
  var c=mk('div','fxl'),q={x:-1e4,y:-1e4,r:0,px:0,first:true},
      HV='a,button,[role=button],summary,label,select,.pb,.lk,.nbtn,.c.cl,.ex figure,.pmg,.tabs button',
      TX='input,textarea,[contenteditable=""],[contenteditable=true],#mnb';
  c.innerHTML='<svg viewBox="-20 -20 587 743" aria-hidden="true"><polygon points="0,0 547,0 274,352"/><polygon points="274,352 0,703 547,703"/></svg>';
  document.body.appendChild(c);el.cur=c;el.q=q;
  on(window,'pointermove',function(e){
    if(e.pointerType==='touch')return;
    if(!D.hasAttribute('data-fxcur'))D.setAttribute('data-fxcur','');
    var t=e.target&&e.target.closest?e.target:null;
    c.classList.add('on');
    c.classList.toggle('tx',!!(t&&t.closest(TX)));
    c.classList.toggle('hv',!!(t&&t.closest(HV)));
  },{passive:true});
  on(window,'pointerdown',function(e){
    if(e.pointerType==='touch'||e.button>0)return;
    c.classList.add('dn');
    var k=document.createElement('i');k.className='fxk';k.setAttribute('data-fxe','');
    k.style.setProperty('--x',e.clientX+'px');k.style.setProperty('--y',e.clientY+'px');
    k.addEventListener('animationend',function(){if(k.parentNode)k.parentNode.removeChild(k)});
    document.body.appendChild(k);
  });
  on(window,'pointerup',function(){c.classList.remove('dn')});
  on(window,'blur',function(){c.classList.remove('dn','on')});
  offs.push(function(){D.removeAttribute('data-fxcur')});
}
function cursorStep(){
  var c=el.cur,q=el.q;if(!c||!q)return;
  if(q.first&&ptr.a){q.x=ptr.x;q.y=ptr.y;q.first=false}
  q.x+=(ptr.x-q.x)*.42;q.y+=(ptr.y-q.y)*.42;
  var dx=ptr.x-q.x;q.r+=(Math.max(-24,Math.min(24,dx*.9))-q.r)*.2;
  c.style.transform='translate3d('+q.x.toFixed(1)+'px,'+q.y.toFixed(1)+'px,0) rotate('+q.r.toFixed(1)+'deg)';
}

/* ---------- header: hide on scroll down ---------- */
function header(d){
  var h=$('header');if(!h)return;
  var lgm=document.getElementById('lgm'),
      keep=sy<90||h.contains(document.activeElement)&&document.activeElement!==document.body||(lgm&&!lgm.hidden)||document.documentElement.classList.contains('mno');
  if(keep)h.classList.remove('fxu');
  else if(dir>0&&Math.abs(d)>0.5)h.classList.add('fxu');
  else if(dir<0)h.classList.remove('fxu');
}

/* ---------- hero: parametric line ribbons. Still and faint; they ripple and turn gold only where the pointer passes ---------- */
function lines(){
  var h=$('.hero');if(!h||window.matchMedia('(max-width:700px)').matches)return;
  var c=mk('canvas','fxn');h.insertBefore(c,h.firstChild);
  var x=c.getContext('2d'),W=0,H=0,dpr=1,vis=true,ink='255,255,255',gold='173,145,84',fr=0,M=80,TAU=Math.PI*2,
      E=0,ph=0,last=0,need=true,lx=-1e4,ly=-1e4,key='',rest=false,T0=2.4,
      R=[{n:30,cy:.46,a1:.13,f1:1.05,p1:.6,a2:.05,f2:2.3,p2:1.9,sp:.17,f3:1.35,p3:.9,al:.075},
         {n:18,cy:.62,a1:.10,f1:.8,p1:2.4,a2:.06,f2:1.7,p2:.4,sp:.12,f3:1.05,p3:2.2,al:.05}];
  function size(){
    W=h.clientWidth;H=h.clientHeight;if(!W||!H)return;
    dpr=Math.min(window.devicePixelRatio||1,2);
    c.width=Math.round(W*dpr);c.height=Math.round(H*dpr);
    x.setTransform(dpr,0,0,dpr,0,0);
    M=Math.max(40,Math.min(120,Math.round(W/13)));need=true;
  }
  function path(r,px,py,A,ph){
    var p=new Path2D(),i,j,u,s,cy,sp,X,Y,dx,dy,d2;
    for(i=0;i<r.n;i++){
      u=i/(r.n-1)-.5;
      for(j=0;j<M;j++){
        s=j/(M-1);X=s*W;
        cy=H*(r.cy+r.a1*Math.sin(TAU*s*r.f1+r.p1)+r.a2*Math.sin(TAU*s*r.f2-r.p2));
        sp=r.sp*H*(.05+.95*Math.pow(Math.abs(Math.sin(Math.PI*s*r.f3+r.p3)),.85));
        Y=cy+u*sp*2+.012*H*u*Math.sin(TAU*s*3+T0);
        if(A>.3){dx=X-px;dy=Y-py;d2=dx*dx+dy*dy;if(d2<40000)Y+=A*Math.exp(-d2/(2*66*66))*Math.sin(Math.sqrt(d2)/12-ph)}
        if(j)p.lineTo(X,Y);else p.moveTo(X,Y);
      }
    }
    return p;
  }
  function draw(){
    if(!vis)return;
    if(h.clientWidth!==W||h.clientHeight!==H)size();
    if(!W||!H){rest=true;return}
    var now=performance.now(),dt=last?Math.min(50,now-last):16;last=now;
    if((fr++%90)===0){
      var cs=getComputedStyle(D),g=(cs.getPropertyValue('--ar')||cs.getPropertyValue('--gr')).trim(),k=cs.getPropertyValue('--inkr').trim();
      if((g&&g!==gold)||(k&&k!==ink)){gold=g||gold;ink=k||ink;need=true}
    }
    /* pointer energy: the lines only ripple while the pointer is moving over them */
    var sp=ptr.a&&lx>-1e3?Math.sqrt((ptr.x-lx)*(ptr.x-lx)+(ptr.y-ly)*(ptr.y-ly)):0;
    lx=ptr.a?ptr.x:-1e4;ly=ptr.y;
    E=Math.max(E*.955,Math.min(1.1,sp*.03));
    ph+=dt*.009;
    var r=h.getBoundingClientRect(),px=cur.x-r.left,py=cur.y-r.top,
        hl=ptr.a&&Date.now()-(ptr.t||0)<4000&&px>-200&&px<W+200&&py>-200&&py<H+200,
        k2=hl?px.toFixed(0)+','+py.toFixed(0):'-';
    if(!need&&E<.004&&k2===key){if(!rest){rest=true}return}
    rest=false;need=false;key=k2;
    x.clearRect(0,0,W,H);
    var A=E*15,ps=[],i;
    for(i=0;i<R.length;i++)ps.push(path(R[i],px,py,A,ph));
    x.lineWidth=1;
    for(i=0;i<R.length;i++){x.strokeStyle='rgba('+ink+','+R[i].al+')';x.stroke(ps[i])}
    if(hl){
      var rad=92,g2=x.createRadialGradient(px,py,0,px,py,rad);
      g2.addColorStop(0,'rgba('+gold+',.9)');
      g2.addColorStop(.45,'rgba('+gold+',.5)');
      g2.addColorStop(1,'rgba('+gold+',0)');
      x.strokeStyle=g2;x.lineWidth=1.4;
      for(i=0;i<R.length;i++)x.stroke(ps[i]);
    }
  }
  on(window,'pointerdown',function(e){
    if(e.pointerType!=='touch')return;
    ptr.x=cur.x=e.clientX;ptr.y=cur.y=e.clientY;ptr.a=true;ptr.t=Date.now();lx=ptr.x;ly=ptr.y;E=1.1;
    wake();
  },{passive:true});
  var io=null;
  if(window.IntersectionObserver){io=new IntersectionObserver(function(es){vis=es[es.length-1].isIntersecting;if(vis){need=true;wake()}});io.observe(h);offs.push(function(){io.disconnect()})}
  size();
  net={draw:draw,size:size,busy:function(){return vis&&!rest},touch:function(){need=true;fr=0}};
}
/* ---------- price count-up ---------- */
function counts(){
  if(!window.IntersectionObserver)return;
  var io=new IntersectionObserver(function(es){
    es.forEach(function(en){
      if(!en.isIntersecting)return;
      io.unobserve(en.target);run(en.target);
    });
  },{threshold:.7});
  offs.push(function(){io.disconnect()});
  $$('.cpt .pv i,.cof .pv i').forEach(function(i){
    var v=i.textContent.trim();
    if(!/^\d+$/.test(v))return;
    i.dataset.v=v;i.textContent='0';io.observe(i);
  });
  function run(i){
    var to=+i.dataset.v,t0=null,dur=1300;
    function f(t){
      if(!live||!i.dataset.v)return;
      if(t0===null)t0=t;
      var p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,4);
      i.textContent=p<1?String(Math.round(to*e)):i.dataset.v;
      if(p<1)requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }
}

/* ---------- student-work images drift inside their frames ---------- */
function figs(){
  var f=$$('.ex figure'),vh=window.innerHeight,i,r,img,c;
  for(i=0;i<f.length;i++){
    r=f[i].getBoundingClientRect();
    if(r.bottom<-80||r.top>vh+80)continue;
    img=f[i].firstElementChild;if(!img||img.tagName!=='IMG')continue;
    c=(r.top+r.height/2-vh/2)/vh;
    img.style.setProperty('--py',(-c*34).toFixed(1)+'px');
  }
}

/* ---------- cards tilt + spotlight, buttons are magnetic (mouse only) ---------- */
function hover(){
  var TS='.c,.cbx:not(.cc),.cof,.pc,.ex figure',hot=null,mag=null;
  function inflate(r,p,x,y){return x>r.left-p&&x<r.right+p&&y>r.top-p&&y<r.bottom+p}
  function cool(n){if(!n)return;n.classList.remove('fxh');n.style.transform='';n.style.removeProperty('--mx');n.style.removeProperty('--my')}
  on(document,'pointermove',function(e){
    if(e.pointerType==='touch')return;
    var t=e.target&&e.target.closest?e.target:null,n,r;
    if(hot){r=hot.getBoundingClientRect();if(!inflate(r,14,e.clientX,e.clientY)){cool(hot);hot=null}}
    if(!hot&&t){
      n=t.closest(TS);
      if(n&&!n.classList.contains('rv')&&!(n.closest('#pm')||n.closest('#rg'))){hot=n;n.setAttribute('data-fxt','')}
    }
    if(hot){
      r=hot.getBoundingClientRect();
      var px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height,k=r.width>560?1.6:4.2;
      px=Math.max(0,Math.min(1,px));py=Math.max(0,Math.min(1,py));
      hot.style.setProperty('--mx',(px*100).toFixed(1)+'%');hot.style.setProperty('--my',(py*100).toFixed(1)+'%');
      hot.style.transform='perspective(900px) rotateX('+((.5-py)*k).toFixed(2)+'deg) rotateY('+((px-.5)*k).toFixed(2)+'deg)';
      hot.classList.add('fxh');
    }
    var b=t&&t.closest?t.closest('.b'):null;
    if(mag&&mag!==b){mag.style.transform='';mag=null}
    if(b){
      mag=b;r=b.getBoundingClientRect();
      var mx=e.clientX-(r.left+r.width/2),my=e.clientY-(r.top+r.height/2);
      b.style.transform='translate('+(mx*.16).toFixed(1)+'px,'+(my*.26).toFixed(1)+'px)';
    }
  },{passive:true});
  on(D,'mouseleave',function(){cool(hot);hot=null;if(mag){mag.style.transform='';mag=null}});
  on(window,'blur',function(){cool(hot);hot=null});
}

/* ---------- boot ---------- */
function boot(){
  button();
  var s=stored(),want=s!=='0'&&!RM.matches;
  if(RM.matches){var b=$('#fxb');if(b)b.hidden=true}
  if(want)start(false);else label();
  if(window.MutationObserver)new MutationObserver(label).observe(D,{attributes:true,attributeFilter:['lang']});
  var rmh=function(){if(RM.matches){stop(false);var b=$('#fxb');if(b)b.hidden=true}else{var b2=$('#fxb');if(b2)b2.hidden=false}};
  if(RM.addEventListener)RM.addEventListener('change',rmh);else if(RM.addListener)RM.addListener(rmh);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
