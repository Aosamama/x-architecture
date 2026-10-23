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
    el={},net=null,tick=null;

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
  progress();grid();if(FP.matches)glow();
  hero();ticker();counts();
  if(FP.matches)hover();
  on(window,'scroll',function(){dirty=true},{passive:true});
  on(window,'resize',resize);on(window,'hashchange',function(){dirty=true;setTimeout(function(){dirty=true;if(tick)tick.measure()},400)});
  on(document.documentElement,'mouseleave',function(){ptr.a=false;if(el.glow)el.glow.classList.remove('on')});
  label();loop();
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
  var m=$('.mk');if(m)m.style.transform='';
  var h=$('header');if(h)h.classList.remove('fxu');
  el={};net=null;tick=null;ptr={x:-1e4,y:-1e4,a:false};cur={x:-1e4,y:-1e4};
  label();
}

/* ---------- main loop ---------- */
function loop(){
  if(!live)return;
  raf=requestAnimationFrame(loop);
  if(dirty){dirty=false;scrolled()}
  vel*=.9;
  if(el.glow){
    cur.x+=(ptr.x-cur.x)*.14;cur.y+=(ptr.y-cur.y)*.14;
    el.glow.style.transform='translate3d('+(cur.x-280).toFixed(1)+'px,'+(cur.y-280).toFixed(1)+'px,0)';
  }
  if(net)net.draw();
  if(tick)tick.step();
  mark();
}
function scrolled(){
  sy=window.pageYOffset||0;
  var d=sy-lastY;lastY=sy;
  if(Math.abs(d)>0.5)vel=d;
  if(Math.abs(d)>4)dir=d>0?1:-1;
  var H=D.scrollHeight-window.innerHeight;
  if(el.bar)el.bar.firstChild.style.transform='scaleX('+(H>0?Math.min(1,Math.max(0,sy/H)):0).toFixed(4)+')';
  if(el.grid)el.grid.style.backgroundPosition='0 '+(-sy*.28).toFixed(1)+'px';
  header(d);
  figs();
}
function resize(){if(net)net.size();if(tick)tick.measure();dirty=true}

/* ---------- scroll progress / grid / glow ---------- */
function progress(){var b=mk('div','fxp');b.appendChild(document.createElement('i'));document.body.appendChild(b);el.bar=b}
function grid(){var g=mk('div','fxg');document.body.insertBefore(g,document.body.firstChild);el.grid=g}
function glow(){
  var g=mk('div','fxc');document.body.appendChild(g);el.glow=g;
  on(window,'pointermove',function(e){
    if(e.pointerType==='touch')return;
    ptr.x=e.clientX;ptr.y=e.clientY;ptr.a=true;
    if(cur.x<-1e3){cur.x=ptr.x;cur.y=ptr.y}
    g.classList.add('on');
  },{passive:true});
}

/* ---------- header: hide on scroll down ---------- */
function header(d){
  var h=$('header');if(!h)return;
  var lgm=document.getElementById('lgm'),
      keep=sy<90||h.contains(document.activeElement)&&document.activeElement!==document.body||(lgm&&!lgm.hidden);
  if(keep)h.classList.remove('fxu');
  else if(dir>0&&Math.abs(d)>0.5)h.classList.add('fxu');
  else if(dir<0)h.classList.remove('fxu');
}

/* ---------- hero: live node mesh, tilt + parallax of the mark ---------- */
function hero(){
  var h=$('.hero');if(!h)return;
  var c=mk('canvas','fxn');h.insertBefore(c,h.firstChild);
  var x=c.getContext('2d'),W=0,H=0,dpr=1,N=[],vis=true,col='173,145,84',fr=0;
  function seed(n){
    N=[];
    for(var i=0;i<n;i++)N.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.34,vy:(Math.random()-.5)*.34,r:Math.random()*1.3+.7});
  }
  function size(){
    W=h.clientWidth;H=h.clientHeight;if(!W||!H)return;
    dpr=Math.min(window.devicePixelRatio||1,2);
    c.width=Math.round(W*dpr);c.height=Math.round(H*dpr);
    x.setTransform(dpr,0,0,dpr,0,0);
    var n=Math.max(18,Math.min(FP.matches?66:30,Math.round(W*H/20000)));
    seed(n);
  }
  function draw(){
    if(!vis)return;
    if(h.clientWidth!==W||h.clientHeight!==H){size()}
    if(!W||!H)return;
    if((fr++%90)===0){var g=getComputedStyle(D).getPropertyValue('--gr').trim();if(g)col=g}
    var r=h.getBoundingClientRect(),px=ptr.x-r.left,py=ptr.y-r.top,pin=ptr.a&&px>-60&&px<W+60&&py>-60&&py<H+60,i,j,n,m,dx,dy,d,f;
    x.clearRect(0,0,W,H);
    for(i=0;i<N.length;i++){
      n=N[i];n.x+=n.vx;n.y+=n.vy;
      if(n.x<0){n.x=0;n.vx=Math.abs(n.vx)}else if(n.x>W){n.x=W;n.vx=-Math.abs(n.vx)}
      if(n.y<0){n.y=0;n.vy=Math.abs(n.vy)}else if(n.y>H){n.y=H;n.vy=-Math.abs(n.vy)}
      if(pin){
        dx=n.x-px;dy=n.y-py;d=Math.sqrt(dx*dx+dy*dy);
        if(d<150&&d>.1){f=(1-d/150)*.9;n.x+=dx/d*f;n.y+=dy/d*f}
      }
    }
    x.lineWidth=1;
    for(i=0;i<N.length;i++){
      n=N[i];
      for(j=i+1;j<N.length;j++){
        m=N[j];dx=n.x-m.x;dy=n.y-m.y;d=dx*dx+dy*dy;
        if(d<16900){
          x.strokeStyle='rgba('+col+','+((1-Math.sqrt(d)/130)*.24).toFixed(3)+')';
          x.beginPath();x.moveTo(n.x,n.y);x.lineTo(m.x,m.y);x.stroke();
        }
      }
      if(pin){
        dx=n.x-px;dy=n.y-py;d=Math.sqrt(dx*dx+dy*dy);
        if(d<190){
          x.strokeStyle='rgba('+col+','+((1-d/190)*.55).toFixed(3)+')';
          x.beginPath();x.moveTo(n.x,n.y);x.lineTo(px,py);x.stroke();
        }
      }
    }
    x.fillStyle='rgba('+col+',.6)';
    for(i=0;i<N.length;i++){n=N[i];x.beginPath();x.arc(n.x,n.y,n.r,0,6.2832);x.fill()}
  }
  var io=null;
  if(window.IntersectionObserver){io=new IntersectionObserver(function(es){vis=es[es.length-1].isIntersecting});io.observe(h);offs.push(function(){io.disconnect()})}
  size();
  net={draw:draw,size:size};
}
var tilt={rx:0,ry:0};
function mark(){
  var m=el.mk||(el.mk=$('.mk')),h=el.hero||(el.hero=$('.hero'));
  if(!m||!h||h.offsetParent===null)return;
  var tx=0,ty=0;
  if(FP.matches&&ptr.a){
    var r=h.getBoundingClientRect();
    if(r.width){tx=((ptr.x-r.left)/r.width-.5);ty=((ptr.y-r.top)/r.height-.5)}
    tx=Math.max(-.7,Math.min(.7,tx));ty=Math.max(-.7,Math.min(.7,ty));
  }
  tilt.ry+=(tx*14-tilt.ry)*.08;tilt.rx+=(-ty*10-tilt.rx)*.08;
  var py=Math.min(sy*.16,90);
  m.style.transform='perspective(1100px) translate3d(0,'+py.toFixed(1)+'px,0) rotateX('+tilt.rx.toFixed(2)+'deg) rotateY('+tilt.ry.toFixed(2)+'deg)';
}

/* ---------- ticker of program names, speeds up while scrolling ---------- */
function ticker(){
  var h=$('.hero');if(!h)return;
  var names=['AutoCAD','Revit','3ds Max','SketchUp','Rhino','Grasshopper','Blender','Maya','Unreal Engine','Corona','Lumion','D5 Render','V-Ray','Enscape','Twinmotion','Photoshop','Illustrator'];
  var row=names.map(function(n){return '<span>'+n+'</span>'}).join('');
  var w=mk('div','fxm'),r=document.createElement('div'),pos=0,half=0;
  r.className='fxr';r.innerHTML=row+row;w.appendChild(r);h.appendChild(w);
  function measure(){half=r.scrollWidth/2}
  measure();
  tick={measure:measure,step:function(){
    if(!half){measure();if(!half)return}
    pos+=.55+Math.min(Math.abs(vel),60)*.22;
    if(pos>=half)pos-=half;
    r.style.transform='translate3d('+(-pos).toFixed(2)+'px,0,0)';
  }};
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
