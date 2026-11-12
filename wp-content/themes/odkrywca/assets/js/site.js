(function(){
  'use strict';
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var fmt=function(n){return (Math.round(n*100)/100).toLocaleString('pl-PL',{minimumFractionDigits:n%1?2:0,maximumFractionDigits:2}).replace(/ /g,' ')+' zł'};

  /* menu mobilne */
  var burger=$('#burger');
  if(burger){
    burger.addEventListener('click',function(){var o=document.body.classList.toggle('menu-open');burger.setAttribute('aria-expanded',o?'true':'false')});
    $$('#nav a').forEach(function(a){a.addEventListener('click',function(){document.body.classList.remove('menu-open');burger.setAttribute('aria-expanded','false')})});
  }

  function fv(el){var c=el.firstElementChild;while(c&&c.hidden)c=c.nextElementSibling;return c}
  /* przesuwane rzędy: palec natywnie, mysz przeciąganiem, strzałki */
  function rail(el,onMove){
    var down=false,sx=0,sl=0,moved=false;
    el.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('[data-kar] .kb'))return;down=true;moved=false;sx=e.clientX;sl=el.scrollLeft});
    window.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(!moved&&Math.abs(dx)>5){moved=true;el.classList.add('drag')}if(moved){el.scrollLeft=sl-dx;e.preventDefault()}});
    window.addEventListener('pointerup',function(){
      if(!down)return;down=false;
      if(moved){var f0=fv(el);var w=f0?f0.getBoundingClientRect().width+parseFloat(getComputedStyle(el).columnGap||0):el.clientWidth;var i=Math.round(el.scrollLeft/w);el.classList.remove('drag');el.scrollTo({left:i*w,behavior:'smooth'});setTimeout(function(){moved=false},50)}
    });
    el.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation()}},true);
    el.addEventListener('dragstart',function(e){e.preventDefault()});
    if(onMove)el.addEventListener('scroll',onMove,{passive:true});
  }
  function step(el,dir){var c=fv(el);if(!c)return;var w=c.getBoundingClientRect().width+parseFloat(getComputedStyle(el).columnGap||0);el.scrollBy({left:dir*w,behavior:'smooth'})}
  $$('.arr').forEach(function(box){
    var el=document.getElementById(box.getAttribute('data-for'));if(!el)return;
    var p=$('.prev',box),n=$('.next',box);
    function upd(){p.disabled=el.scrollLeft<4;n.disabled=el.scrollLeft+el.clientWidth>=el.scrollWidth-4;box.hidden=el.scrollWidth<=el.clientWidth+4}
    p.addEventListener('click',function(){step(el,-1)});n.addEventListener('click',function(){step(el,1)});
    rail(el,upd);upd();window.addEventListener('resize',upd);
  });
  $$('.grid4').forEach(function(g){g.addEventListener('dragstart',function(e){if(e.target.tagName==='IMG')e.preventDefault()})});

  /* zdjęcia w karcie: przesuwane palcem, myszą i strzałkami, bez wchodzenia w ofertę */
  $$('[data-kar]').forEach(function(f){
    var t=$('.kt',f),l=$('.kl',f),n=t.children.length,down=false,sx=0,sl=0,moved=false;
    var idx=function(){return Math.round(t.scrollLeft/t.clientWidth)};
    var upd=function(){l.textContent=(idx()+1)+' / '+n};
    t.addEventListener('scroll',upd,{passive:true});
    $('.kb.p',f).addEventListener('click',function(e){e.preventDefault();e.stopPropagation();t.scrollBy({left:-t.clientWidth,behavior:'smooth'})});
    $('.kb.n',f).addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(idx()>=n-1)t.scrollTo({left:0,behavior:'smooth'});else t.scrollBy({left:t.clientWidth,behavior:'smooth'})});
    t.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;moved=false;sx=e.clientX;sl=t.scrollLeft;e.stopPropagation()});
    window.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(Math.abs(dx)>5)moved=true;if(moved){t.scrollLeft=sl-dx;t.classList.add('drag')}});
    window.addEventListener('pointerup',function(){if(!down)return;down=false;t.classList.remove('drag');if(moved){t.scrollTo({left:Math.round(t.scrollLeft/t.clientWidth)*t.clientWidth,behavior:'smooth'});setTimeout(function(){moved=false},60)}});
    f.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation()}},true);
  });

  /* galeria na karcie wyjazdu: dowolna liczba zdjęć, licznik i miniatury budowane automatycznie */
  var gal=$('#gal');
  if(gal){
    var cnt=$('#galc'),figs=Array.prototype.slice.call(gal.children),tot=figs.length,th=$('#thumbs');
    var gi=function(){return Math.round(gal.scrollLeft/gal.clientWidth)};
    var gu=function(){var i=gi();cnt.textContent=(i+1)+' / '+tot;if(th)$$('button',th).forEach(function(b,k){b.classList.toggle('on',k===i)})};
    if(th){
      if(tot<2)th.remove();
      else figs.forEach(function(f,k){var im=$('img',f),b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Zdjęcie '+(k+1));b.innerHTML='<img src="'+(im.currentSrc||im.getAttribute('src'))+'" alt="" loading="lazy">';b.addEventListener('click',function(){gal.scrollTo({left:k*gal.clientWidth,behavior:'smooth'})});th.appendChild(b)});
    }
    if(tot<2){$$('.gal .ga').forEach(function(b){b.hidden=true});cnt.hidden=true}
    rail(gal,gu);gu();
    $('.gal .ga.p').addEventListener('click',function(){gal.scrollBy({left:-gal.clientWidth,behavior:'smooth'})});
    $('.gal .ga.n').addEventListener('click',function(){gal.scrollBy({left:gal.clientWidth,behavior:'smooth'})});
  }

  /* zakładki podkategorii + filtr Polska / zagranica */
  $$('.tabs-row[data-filter]').forEach(function(row){
    var box=document.getElementById(row.getAttribute('data-filter'));if(!box)return;
    var empty=$('[data-empty="'+box.id+'"]'),tabs=$$('.tabs button',row);
    var kind=tabs.length?tabs[0].getAttribute('data-kind'):'',kraj='all';
    var h=location.hash.replace('#','');tabs.forEach(function(b){if(b.getAttribute('data-kind')===h)kind=h});
    function apply(){
      var n=0;
      Array.prototype.forEach.call(box.children,function(c){var ok=(!kind||c.getAttribute('data-kind')===kind)&&(kraj==='all'||c.getAttribute('data-kraj')===kraj);c.hidden=!ok;if(ok)n++});
      tabs.forEach(function(b){b.setAttribute('aria-selected',b.getAttribute('data-kind')===kind?'true':'false')});
      $$('.flt button',row).forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-kraj')===kraj?'true':'false')});
      if(empty)empty.classList.toggle('on',n===0);
      box.style.display=n===0?'none':'';box.scrollLeft=0;box.dispatchEvent(new Event('scroll'));
    }
    tabs.forEach(function(b){b.addEventListener('click',function(){kind=b.getAttribute('data-kind');apply()})});
    $$('.flt button',row).forEach(function(b){b.addEventListener('click',function(){kraj=b.getAttribute('data-kraj');apply()})});
    apply();
  });

  /* proste sprawdzenie pól przed wysłaniem */
  function sprawdz(scope){
    var ok=true,first=null;
    $$('[required]',scope).forEach(function(i){
      if(i.closest('[hidden]')||i.closest('template'))return;
      var v=i.type==='checkbox'?i.checked:i.value.trim(),bad=!v||(i.type==='email'&&v&&!/^\S+@\S+\.\S+$/.test(i.value))||(i.type==='tel'&&i.value.replace(/\D/g,'').length<9);
      var w=i.closest('.fl,.chk');if(w)w.classList.toggle('err',!!bad);
      if(bad){ok=false;first=first||i}
    });
    $$('input[type=email]:not([required])',scope).forEach(function(i){var bad=i.value.trim()&&!/^\S+@\S+\.\S+$/.test(i.value);var w=i.closest('.fl');if(w)w.classList.toggle('err',!!bad);if(bad){ok=false;first=first||i}});
    if(first){first.focus({preventScroll:true});first.scrollIntoView({block:'center',behavior:'smooth'})}
    return ok;
  }
  document.addEventListener('input',function(e){var w=e.target.closest&&e.target.closest('.fl,.chk');if(w)w.classList.remove('err')});
  document.addEventListener('change',function(e){var w=e.target.closest&&e.target.closest('.chk');if(w)w.classList.remove('err')});

  /* okno "Zapytaj o wyjazd" */
  var ask=$('#ask'),htmlEl=document.documentElement;
  function zamknijMenu(){document.body.classList.remove('menu-open');if(burger)burger.setAttribute('aria-expanded','false')}
  if(ask){
    $$('[data-ask]').forEach(function(b){b.addEventListener('click',function(e){
      e.preventDefault();zamknijMenu();
      $('#ask-trip').value=b.getAttribute('data-ask')||'';
      if(typeof ask.showModal==='function')ask.showModal();else ask.setAttribute('open','');
      htmlEl.style.overflow='hidden';
    })});
    $$('[data-close]',ask).forEach(function(b){b.addEventListener('click',function(){ask.close?ask.close():ask.removeAttribute('open')})});
    ask.addEventListener('close',function(){htmlEl.style.overflow=''});
    ask.addEventListener('click',function(e){if(e.target===ask)ask.close()});
    $('#askf').addEventListener('submit',function(e){if(!sprawdz(this))e.preventDefault()});
  }
  var cf=$('#cform');if(cf)cf.addEventListener('submit',function(e){if(!sprawdz(cf))e.preventDefault()});
  var toast=$('#toast');if(toast){$('[data-toast-x]',toast).addEventListener('click',function(){toast.remove()});setTimeout(function(){if(toast)toast.classList.add('off')},12000)}

  /* katalog PDF: PDF.js z motywu, wczytywany dopiero gdy przeglądarka zbliża się do ekranu */
  var viewers=$$('.viewer[data-pdf]');
  if(viewers.length){
    var PDFJS=(window.ODK&&ODK.pdfjs)||'',loading=null;
    var lib=function(){if(loading)return loading;loading=new Promise(function(res,rej){var s=document.createElement('script');s.src=PDFJS+'pdf.min.js';s.onload=function(){window.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS+'pdf.worker.min.js';res(window.pdfjsLib)};s.onerror=rej;document.head.appendChild(s)});return loading};
    var init=function(v){
      var stage=$('.v-stage',v),cv=$('canvas',v),ld=$('.v-load',v),pg=$('.v-pg',v),tt=$('.v-tot',v),bp=$('.ga.p',v),bn=$('.ga.n',v);
      var doc=null,cur=1,busy=false,want=0;
      var draw=function(n){
        if(!doc)return;if(busy){want=n;return}
        busy=true;cur=n;pg.textContent=n;bp.disabled=n<=1;bn.disabled=n>=doc.numPages;
        doc.getPage(n).then(function(p){
          var cs=getComputedStyle(stage),W=stage.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),H=stage.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
          var v1=p.getViewport({scale:1}),sc=Math.min(W/v1.width,H/v1.height),dpr=Math.min(window.devicePixelRatio||1,2),vp=p.getViewport({scale:sc*dpr});
          cv.width=vp.width;cv.height=vp.height;cv.style.width=Math.floor(vp.width/dpr)+'px';cv.style.height=Math.floor(vp.height/dpr)+'px';
          return p.render({canvasContext:cv.getContext('2d'),viewport:vp}).promise;
        }).then(function(){ld.hidden=true;busy=false;if(want){var w=want;want=0;draw(w)}},function(){busy=false});
      };
      lib().then(function(pdfjs){return pdfjs.getDocument(v.getAttribute('data-pdf')).promise}).then(function(d){doc=d;tt.textContent=d.numPages;draw(1)}).catch(function(){ld.textContent='Nie udało się wczytać podglądu. Skorzystaj z przycisku „Pobierz katalog”.'});
      bp.addEventListener('click',function(){if(cur>1)draw(cur-1)});
      bn.addEventListener('click',function(){if(doc&&cur<doc.numPages)draw(cur+1)});
      var sx=null;
      stage.addEventListener('pointerdown',function(e){if(e.target.closest('.ga'))return;sx=e.clientX});
      stage.addEventListener('pointerup',function(e){if(sx===null)return;var dx=e.clientX-sx;sx=null;if(Math.abs(dx)>40){if(dx<0)bn.click();else bp.click()}});
      stage.addEventListener('pointercancel',function(){sx=null});
      var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){draw(cur)},200)});
    };
    if('IntersectionObserver' in window){var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){io.unobserve(x.target);init(x.target)}})},{rootMargin:'400px 0px'});viewers.forEach(function(v){io.observe(v)})}
    else viewers.forEach(init);
  }

  /* zgody cookies: niezbędne / statystyki / media zewnętrzne; wybór na 12 miesięcy */
  var KEY='odk-zgody',ck=$('#cookie');
  var getC=function(){try{var v=JSON.parse(localStorage.getItem(KEY)||'null');if(v&&Date.now()-v.t<31536e6)return v}catch(e){}return null};
  var setC=function(s,m){var v={s:s?1:0,m:m?1:0,t:Date.now()};try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}return v};
  var fbLoad=function(){
    var fr=$('#fb-frame');if(!fr||$('iframe',fr))return;
    var w=Math.max(180,Math.min(500,Math.floor(fr.clientWidth))),h=Math.floor(fr.clientHeight);
    var ifr=document.createElement('iframe');
    ifr.src='https://www.facebook.com/plugins/page.php?href='+encodeURIComponent(fr.getAttribute('data-fb'))+'&tabs=timeline&width='+w+'&height='+h+'&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false';
    ifr.title='Profil Biura Turystycznego Odkrywca na Facebooku';ifr.loading='lazy';ifr.setAttribute('allow','encrypted-media');ifr.setAttribute('scrolling','no');
    fr.innerHTML='';fr.appendChild(ifr);
  };
  var mapy=function(on){
    $$('.map').forEach(function(m){
      var f=$('iframe',m);
      if(!on&&f){var a=m.getAttribute('data-adres')||'';m.innerHTML='<div class="map-zast"><b>'+a.replace(/[<>&]/g,'')+'</b><p>Mapa Google jest wyłączona zgodnie z wyborem plików cookies.</p><a class="btn line" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(a)+'">Wyznacz trasę w Google Maps</a></div>'}
    });
  };
  var applyC=function(v){
    if(ck)ck.classList.toggle('on',!v);
    if(!v)return;
    if(v.m)fbLoad();
    mapy(!!v.m);
    if(v.s&&window.odkGa)window.odkGa();
  };
  $$('[data-consent]').forEach(function(b){b.addEventListener('click',function(){
    var t=b.getAttribute('data-consent'),u=$('#ck-ust'),cs=$('#ck-s'),cm=$('#ck-m'),cur=getC();
    if(t==='ust'){if(ck)ck.classList.add('on','ust');if(u)u.hidden=false;if(cs)cs.checked=!!(cur&&cur.s);if(cm)cm.checked=!!(cur&&cur.m);b.hidden=true;$('[data-consent="save"]').hidden=false;return}
    var v=t==='all'?setC(1,1):t==='min'?setC(0,0):t==='media'?setC(cur&&cur.s,1):setC(cs&&cs.checked,cm&&cm.checked);
    if(t!=='media'&&cur&&cur.s&&!v.s&&window.odkGaOn)location.reload();
    applyC(v);
  })});
  $$('[data-cookies]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();if(ck)ck.classList.add('on');var u=$('[data-consent="ust"]');if(u)u.click()})});
  applyC(getC());

  /* drukuj / zapisz jako PDF */
  $$('[data-drukuj]').forEach(function(b){b.addEventListener('click',function(){
    $$('img[loading="lazy"]').forEach(function(i){i.loading='eager'});
    setTimeout(function(){window.print()},250);
  })});

  /* dolny pasek na telefonie: dopiero po przewinięciu za główny przycisk */
  var mob=$('#mob'),top=window.innerWidth<=760&&$('#rez-m')?$('#rez-m'):$('#rez-top');
  if(mob&&top&&'IntersectionObserver' in window){
    var seenTop=true;
    new IntersectionObserver(function(en){en.forEach(function(x){seenTop=x.isIntersecting;mob.classList.toggle('widac',!x.isIntersecting&&x.boundingClientRect.top<0)})}).observe(top);
    window.addEventListener('scroll',function(){mob.classList.toggle('widac',!seenTop&&top.getBoundingClientRect().top<0)},{passive:true});
  }

  /* ---------- rezerwacja: 4 etapy (impreza, uczestnicy, ubezpieczenie i płatność, umowa) ---------- */
  var bk=$('#bk'),f=$('#bkf');
  if(!bk||!f)return;
  var MAX=+f.getAttribute('data-max')||10,ZT=f.getAttribute('data-zaltyp'),ZAL=+f.getAttribute('data-zal')||0,ZTERM=f.getAttribute('data-zalterm')||'',DTERM=f.getAttribute('data-dopterm')||'';
  var KURS=+f.getAttribute('data-kurs')||0,SKLR=+f.getAttribute('data-sklr')||0;
  var fmtE=function(n){return fmt(n).replace(/ zł$/,' €')};
  var cur=1,ile=1,LAST=4;
  var stations=[{x:12.5,y:50},{x:37.5,y:40},{x:62.5,y:28},{x:87.5,y:12}],pathX=[0,37.5,112.5,187.5,262.5],pathY=[54,50,40,28,12];
  var sel=function(n){return $('input[name="'+n+'"]:checked',f)};
  var esc=function(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML};
  var wolne=function(){var t=sel('termin');return t?Math.min(MAX,+t.getAttribute('data-wolne')||MAX):MAX};
  var r2=function(n){return Math.round(n*100)/100};
  function imie(box,nr){
    if(!box)return 'uczestnik '+nr;
    var i=box.querySelector('input[name$="[imie]"]'),n=box.querySelector('input[name$="[nazwisko]"]');
    var t=((i?i.value:'')+' '+(n?n.value:'')).trim();return t||('uczestnik '+nr);
  }
  function osoby(){var a=[imie($('.pers.p1',f),1)];$$('#pers .pers',f).forEach(function(p,i){a.push(imie(p,i+2))});return a}
  function renderPers(){
    var box=$('#pers'),tpl=$('#pers-t'),trzeba=ile-1,have=$$('.pers',box).length;
    for(var i=have;i<trzeba;i++){var d=document.createElement('div');d.innerHTML=tpl.innerHTML.replace(/__i__/g,i);box.appendChild(d.firstElementChild)}
    $$('.pers',box).forEach(function(p,i){if(i>=trzeba)p.remove();else $('.nr',p).textContent=i+2});
  }
  /* dodatkowe ubezpieczenie: wybór przy każdym uczestniku, składka = % ceny imprezy za osobę */
  function renderUbz(){
    var os=osoby(),c=cenaOs();
    $$('[data-proc-opt]',f).forEach(function(box){
      var k=box.getAttribute('data-proc-opt'),pr=+box.getAttribute('data-proc'),skl=sklOs(pr);
      var was={};$$('input',box).forEach(function(x){was[x.value]=x.checked});
      var h='';
      os.forEach(function(n,i){h+='<label><input type="checkbox" name="opcje['+esc(k)+'][]" value="'+i+'"'+(was[i]?' checked':'')+'><span class="d"><b>'+esc(n)+'</b><small>uczestnik '+(i+1)+'</small></span><span class="pr">'+fmt(skl)+'</span></label>'});
      box.innerHTML=h;
      var s=$('[data-skl="'+k+'"]',f);if(s)s.textContent=fmt(skl);
      var se=$('[data-skl-eur]',box.parentNode),e=eurOs();
      if(se)se.textContent=e>0&&KURS>0?' Cena do wyliczenia: '+fmt(c)+' + '+fmtE(e)+' × '+KURS.toLocaleString('pl-PL',{minimumFractionDigits:2,maximumFractionDigits:4})+' zł (kurs euro) = '+fmt(r2(c+e*KURS))+'.':'';
    });
  }
  function eurOs(){var t=sel('termin');return t?(+t.getAttribute('data-eur')||0):0}
  /* składka za osobę: wpisana ręcznie przy wyjeździe albo % od ceny w zł + części w euro po kursie */
  function sklOs(pr){return SKLR>0?SKLR:r2((cenaOs()+eurOs()*KURS)*pr/100)}
  function cenaOs(){var t=sel('termin'),m=sel('miejsce');return (t?+t.getAttribute('data-cena'):0)+(m?+m.getAttribute('data-doplata'):0)}
  function suma(){
    var c=cenaOs(),imp=c*ile,opc=0,eur=[],lin=[],ce=eurOs();
    if(ce>0)eur.push(fmtE(r2(ce*ile)));
    $$('[data-proc-opt]',f).forEach(function(box){
      var pr=+box.getAttribute('data-proc'),skl=sklOs(pr),n=$$('input:checked',box).length;
      if(n){opc+=r2(skl*n);lin.push(box.getAttribute('data-txt')+': '+n+' × '+fmt(skl)+' = '+fmt(r2(skl*n)))}
    });
    $$('input[name^="opcje["][value="all"]:checked',f).forEach(function(o){var v=+o.getAttribute('data-cena')*(o.getAttribute('data-za')==='osoba'?ile:1);if(o.getAttribute('data-waluta')==='eur')eur.push(v+' €');else{opc+=v;lin.push(o.getAttribute('data-txt')+': '+fmt(v))}});
    opc=r2(opc);
    var zal=imp;if(ZT==='proc')zal=r2(imp*ZAL/100);else if(ZT==='zl')zal=Math.min(imp,ZAL*ile);
    return {cena:c,ce:ce,imp:imp,opc:opc,suma:r2(imp+opc),pierwsza:r2(zal+opc),eur:eur,lin:lin,zal:ZT!=='calosc'&&zal<imp};
  }
  function refresh(){
    if(ile>wolne())ile=wolne();
    $('#ile-o').textContent=ile;$('#ile').value=ile;
    $('#minus').disabled=ile<=1;$('#plus').disabled=ile>=wolne();
    var s=suma(),t=sel('termin'),m=sel('miejsce'),dod=t?t.getAttribute('data-dod'):'';
    var cTxt=fmt(s.cena)+(s.ce>0?' + '+fmtE(s.ce):(dod?' '+dod:''));
    $('#cena-p').textContent=cTxt+' za osobę';
    $('#sum').textContent=fmt(s.pierwsza)+(s.eur.length?' + '+s.eur.join(' + '):'');
    $('#sum-l').textContent=s.zal?'Zaliczka (całość '+fmt(s.suma)+(s.ce>0?' + '+fmtE(r2(s.ce*ile)):'')+')':'Do zapłaty';
    $('#bk-sub').textContent=(t?t.getAttribute('data-txt'):'')+' · '+cTxt+' za osobę';
    $('#u-term').textContent=(t?t.getAttribute('data-txt'):'')+(m?', wyjazd: '+m.getAttribute('data-txt'):'');
    var os=osoby();$('#u-os').innerHTML=os.map(function(n,i){return (i+1)+'. '+esc(n)}).join('<br>');
    var eurRaz=s.ce>0?' + '+fmtE(r2(s.ce*ile)):'';
    $('#u-cena').innerHTML=(s.ce>0?esc(ile+' × ('+fmt(s.cena)+' + '+fmtE(s.ce)+') = '+fmt(s.imp)+eurRaz):esc(ile+' × '+fmt(s.cena)+' = '+fmt(s.imp))+(dod?esc(' (+ '+dod.replace(/^\+\s*/,'')+' za osobę)'):''))+s.lin.map(function(l){return '<br>'+esc(l)}).join('')+(s.lin.length?'<br><b>Razem: '+esc(fmt(s.suma)+eurRaz)+'</b>':'');
    var pl=sel('platnosc'),plTxt=pl&&pl.value==='online'?'online (Przelewy24)':'przelew tradycyjny';
    $('#u-plat').innerHTML=s.zal?esc('Zaliczka'+(s.opc?' ze składką ubezpieczenia':'')+' '+fmt(s.pierwsza)+', '+ZTERM+'; dopłata '+fmt(s.suma-s.pierwsza)+', '+DTERM+'.')+'<br>'+esc(plTxt):esc('Całość '+fmt(s.suma)+', '+ZTERM+'. ')+'<br>'+esc(plTxt);
    $('#b-kw').textContent=fmt(s.pierwsza);
    var zi=$('#zal-info');if(zi)zi.textContent=s.zal?'Teraz płacisz zaliczkę'+(s.opc?' ze składką ubezpieczenia':'')+': '+fmt(s.pierwsza)+', '+ZTERM+'. Pozostałe '+fmt(s.suma-s.pierwsza)+' '+DTERM+'.':'';
    $('#p-przelew').classList.toggle('on',!pl||pl.value==='przelew');$('#p-online').classList.toggle('on',!!pl&&pl.value==='online');
    var c2=$('input[name="umowa"]',f),pod=$('#podpis');
    pod.classList.toggle('on',c2.checked);
    if(c2.checked){var d=new Date();pod.textContent='Akceptacja elektroniczna: '+os[0]+', '+d.toLocaleDateString('pl-PL')+', godz. '+d.toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit'})}
  }
  function trasa(){
    var s=stations[cur-1],pk=$('#pk');pk.style.left=s.x+'%';pk.style.top=(s.y-31)+'px';
    var d='M'+pathX[0]+' '+pathY[0];for(var i=1;i<=cur;i++)d+=' L'+pathX[i]+' '+pathY[i];$('#tr-done').setAttribute('d',d);
    $$('.trasa .dot',bk).forEach(function(el,i){el.classList.toggle('ok',i<cur)});
    $$('.trasa .st',bk).forEach(function(el,i){el.classList.toggle('on',i===cur-1);el.classList.toggle('ok',i<cur-1)});
  }
  function show(n){
    cur=n;
    if(n===3)renderUbz();
    $$('.bk-step',bk).forEach(function(s){s.classList.toggle('on',+s.getAttribute('data-step')===n)});
    $('#back').hidden=n===1;$('#next').hidden=n===LAST;$('#wyslij').hidden=n!==LAST;
    $('#bk-body').scrollTop=0;trasa();refresh();
  }
  var restored=false;
  function open(uid){
    if(uid){var r=$('input[name="termin"][value="'+uid+'"]',f);if(r)r.checked=true}
    if(typeof bk.showModal==='function')bk.showModal();else bk.setAttribute('open','');
    htmlEl.style.overflow='hidden';
    if(!restored)show(1);
  }
  bk.addEventListener('close',function(){htmlEl.style.overflow=''});
  bk.addEventListener('click',function(e){if(e.target===bk)bk.close()});
  $$('[data-rezerwuj]').forEach(function(b){b.addEventListener('click',function(){open(b.getAttribute('data-rezerwuj'))})});
  $$('[data-close]',bk).forEach(function(b){b.addEventListener('click',function(){bk.close?bk.close():bk.removeAttribute('open')})});
  $('#minus').addEventListener('click',function(){if(ile>1){ile--;renderPers();refresh()}});
  $('#plus').addEventListener('click',function(){if(ile<wolne()){ile++;renderPers();refresh()}});
  f.addEventListener('input',refresh);f.addEventListener('change',function(e){if(e.target.name==='termin'||e.target.name==='miejsce')renderUbz();refresh()});
  $('#back').addEventListener('click',function(){if(cur>1)show(cur-1)});
  $('#next').addEventListener('click',function(){
    if(cur===1){if(!sel('termin'))return;show(2)}
    else if(cur===2){if(sprawdz($('[data-step="2"]',f)))show(3)}
    else if(cur===3){show(4)}
  });
  f.addEventListener('submit',function(e){
    if(!sprawdz($('[data-step="2"]',f))){e.preventDefault();show(2);sprawdz($('[data-step="2"]',f));return}
    if(!sprawdz($('[data-step="4"]',f))){e.preventDefault();return}
    if(f.hasAttribute('data-demo')){
      e.preventDefault();var mm=$('#bk-msg');mm.hidden=false;
      mm.textContent='To podgląd strony: rezerwacja nie została wysłana. Na stronie docelowej zgłoszenie trafi do biura, a uczestnik dostanie mailem potwierdzenie umowy z numerem rezerwacji i danymi do przelewu.';
      mm.scrollIntoView({block:'nearest'});return;
    }
    /* do przywrócenia po błędzie: bez danych dokumentów i zgód */
    try{var pf={};$$('.pf [name]',f).forEach(function(x){pf[x.name]=1});var o={};new FormData(f).forEach(function(v,k){if(!/^(dok|umowa|rodo|zn|token|strona_www)/.test(k)&&!pf[k])o[k]=v});o._ile=ile;sessionStorage.setItem('odk-zapis-'+f.wyjazd.value,JSON.stringify(o))}catch(x){}
    $('#wyslij').disabled=true;$('#wyslij').textContent='Wysyłanie...';
  });
  /* po błędzie serwera: przywrócenie wpisanych danych */
  if($('[data-blad-zapisu]')){
    try{
      var o=JSON.parse(sessionStorage.getItem('odk-zapis-'+f.wyjazd.value)||'null');
      if(o){
        ile=Math.max(1,Math.min(MAX,+o._ile||1));
        Object.keys(o).forEach(function(k){if(/^(termin|miejsce|platnosc)$/.test(k)){var r=$('input[name="'+k+'"][value="'+o[k]+'"]',f);if(r)r.checked=true}});
        renderPers();
        Object.keys(o).forEach(function(k){var el=f.querySelector('[name="'+k.replace(/"/g,'')+'"]');if(el&&el.type!=='radio'&&el.type!=='checkbox'&&el.type!=='hidden')el.value=o[k]});
        restored=true;open();show(2);
      }
    }catch(x){}
  }
  if($('#zap-ok')){try{sessionStorage.removeItem('odk-zapis-'+f.wyjazd.value)}catch(x){}}
  renderPers();refresh();
})();
