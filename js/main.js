/* ========================================
   Chalachitra — Main JavaScript
   ======================================== */

(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var loader = document.getElementById('loader');
  var count = document.getElementById('load-count');
  var bar = document.getElementById('load-bar');

  function setProgress(v){
    if (count) count.textContent = Math.round(v) + '%';
    if (bar) bar.style.width = v + '%';
  }

  var seen = null;
  try { seen = sessionStorage.getItem('ch_loader_done'); } catch(e){}

  function revealContent(instant){
    var all = Array.prototype.slice.call(document.querySelectorAll('[data-reveal-hero]'));
    var lines = all.filter(function(el){ return el.closest('.hero-statement'); });
    var rest = all.filter(function(el){ return !el.closest('.hero-statement'); });
    if (reduced || instant === true && !window.gsap) {
      return;
    }
    if (!window.gsap) return;
    gsap.fromTo(lines, {yPercent:115, opacity:0, filter:'blur(6px)'}, {yPercent:0, opacity:1, filter:'blur(0px)', duration:1.1, ease:'cubic-bezier(0.22,1,0.36,1)', stagger:0.09});
    gsap.fromTo(rest, {y:24, opacity:0}, {y:0, opacity:1, duration:0.9, ease:'cubic-bezier(0.22,1,0.36,1)', stagger:0.07, delay:0.15});
    var heroVid = document.querySelector('.hero-media video');
    if (heroVid) gsap.fromTo(heroVid, {scale:1.06}, {scale:1, duration:1.4, ease:'cubic-bezier(0.22,1,0.36,1)', delay:0.3});
  }

  function hideLoader(instant){
    if (!loader || loader.classList.contains('done')) return;
    loader.classList.add('done');
    if (reduced || instant || !window.gsap) {
      loader.style.display = 'none';
      return;
    }
    gsap.to(loader, {opacity:0, duration:0.7, ease:'power2.out', onComplete:function(){ loader.style.display='none'; }});
  }

  if (seen) {
    setProgress(100);
    hideLoader(true);
  } else if (reduced || !window.gsap) {
    setProgress(100);
    hideLoader(true);
    try { sessionStorage.setItem('ch_loader_done','1'); } catch(e){}
  } else {
    document.body.style.overflow = 'hidden';
    var o = {v:0};
    gsap.to(o, {v:100, duration:2.4, ease:'power2.inOut',
      onUpdate:function(){ setProgress(o.v); },
      onComplete:function(){
        try { sessionStorage.setItem('ch_loader_done','1'); } catch(e){}
        document.body.style.overflow = '';
        hideLoader(false);
        revealContent(false);
      }});
    gsap.set('[data-reveal-hero]', {opacity:0});
  }

  /* header */
  var header = document.getElementById('site-header');
  function onScroll(){ header.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* clock — Asia/Kathmandu */
  var clock = document.getElementById('clock');
  var fmt;
  try { fmt = new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Kathmandu',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true}); }
  catch(e){ fmt = null; }
  function tick(){
    var s;
    if (fmt) { s = fmt.format(new Date()).toLowerCase().replace(/\s+/g,' '); }
    else {
      var now = new Date();
      var d = new Date(now.getTime() + (now.getTimezoneOffset()*60000) + (5.75*60*60*1000));
      var h = d.getHours(), m = d.getMinutes(), sec = d.getSeconds(), ap = h >= 12 ? 'pm' : 'am';
      h = h % 12 || 12;
      s = ('0'+h).slice(-2)+':'+('0'+m).slice(-2)+':'+('0'+sec).slice(-2)+' '+ap;
    }
    clock.textContent = s + ' Kathmandu, NP';
  }
  tick(); setInterval(tick, 1000);

  /* menu */
  var overlay = document.getElementById('menu-overlay');
  var openBtn = document.getElementById('menu-btn');
  var closeBtn = document.getElementById('menu-close');
  var links = overlay.querySelectorAll('.menu-links a');
  var menuOpen = false, tl = null;

  function lockScroll(on){ document.body.style.overflow = on ? 'hidden' : ''; }

  function openMenu(){
    menuOpen = true;
    openBtn.setAttribute('aria-expanded','true');
    overlay.classList.add('open');
    lockScroll(true);
    if (reduced || !window.gsap) { closeBtn.focus(); return; }
    if (tl) tl.kill();
    tl = gsap.timeline();
    tl.set(overlay, {visibility:'visible'})
      .fromTo(overlay, {yPercent:-100}, {yPercent:0, duration:0.8, ease:'power3.inOut'})
      .fromTo(links, {y:40, opacity:0}, {y:0, opacity:1, duration:0.6, ease:'power3.out', stagger:0.08}, '-=0.35');
    closeBtn.focus();
  }

  function closeMenu(){
    if (!menuOpen) return;
    menuOpen = false;
    openBtn.setAttribute('aria-expanded','false');
    if (reduced || !window.gsap) {
      overlay.classList.remove('open');
      overlay.style.visibility = 'hidden';
      lockScroll(false); openBtn.focus(); return;
    }
    if (tl) tl.kill();
    tl = gsap.timeline({onComplete:function(){ overlay.classList.remove('open'); lockScroll(false); }});
    tl.to(links, {y:20, opacity:0, duration:0.3, ease:'power3.in', stagger:0.04})
      .to(overlay, {yPercent:-100, duration:0.8, ease:'power3.inOut'}, '-=0.1')
      .set(overlay, {visibility:'hidden'});
    openBtn.focus();
  }

  if (window.gsap) gsap.set(overlay, {yPercent:-100, visibility:'hidden'});
  openBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeMenu(); });
  links.forEach(function(a){ a.addEventListener('click', function(){ overlay.classList.contains('open') && closeMenu(); }); });

  /* scroll reveals */
  if (!reduced && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('[data-reveal]').forEach(function(el){
      gsap.fromTo(el, {opacity:0, y:30}, {opacity:1, y:0, duration:0.9, ease:'power3.out',
        scrollTrigger:{trigger:el, start:'top 88%', once:true}});
    });
    gsap.utils.toArray('[data-number]').forEach(function(el){
      gsap.fromTo(el, {opacity:0, scale:0.92, transformOrigin:'left top'}, {opacity:1, scale:1, duration:1, ease:'power3.out',
        scrollTrigger:{trigger:el, start:'top 88%', once:true}});
    });
    gsap.utils.toArray('.vlabel').forEach(function(label){
      var chars = label.querySelectorAll('span');
      gsap.fromTo(chars, {opacity:0, y:12}, {opacity:1, y:0, duration:0.5, ease:'power3.out', stagger:0.05,
        scrollTrigger:{trigger:label, start:'top 88%', once:true}});
    });
    var intro = document.getElementById('intro-img');
    if (intro) gsap.fromTo(intro, {scale:1.12, yPercent:-3}, {scale:1.12, yPercent:3, ease:'none',
      scrollTrigger:{trigger:'.portrait', start:'top bottom', end:'bottom top', scrub:true}});
    var heroImg = document.querySelector('.hero-media img, .hero-media video');
    if (heroImg) gsap.fromTo(heroImg, {scale:1.15, yPercent:-4}, {scale:1.15, yPercent:4, ease:'none',
      scrollTrigger:{trigger:'.hero-media', start:'top bottom', end:'bottom top', scrub:true}});
    gsap.utils.toArray('.film-media, .pillar figure, .portrait .ph').forEach(function(media){
      gsap.fromTo(media, {clipPath:'inset(8% 8% 8% 8%)'}, {clipPath:'inset(0% 0% 0% 0%)', duration:1.2, ease:'power3.out',
        scrollTrigger:{trigger:media, start:'top 85%', once:true}});
    });
  }

  /* newsletter */
  var form = document.getElementById('news-form');
  var news = document.getElementById('news');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var v = document.getElementById('email').value.trim();
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    news.classList.toggle('invalid', !ok);
    if (ok) { news.classList.remove('invalid'); news.classList.add('done'); }
  });

  /* back to top */
  document.getElementById('to-top').addEventListener('click', function(){
    window.scrollTo({top:0, behavior: reduced ? 'auto' : 'smooth'});
  });
})();
