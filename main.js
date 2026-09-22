/* ========================================
   Chalachitra — Interaction System
   ======================================== */

(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(pointer: coarse)').matches;
  var loader = document.getElementById('loader');
  var count = document.getElementById('load-count');

  function setProgress(v){
    if (count) count.textContent = Math.round(v);
  }

  var seen = null;
  try { seen = sessionStorage.getItem('ch_loader_done'); } catch(e){}

  function revealContent(instant){
    var all = Array.prototype.slice.call(document.querySelectorAll('[data-reveal-hero]'));
    var lines = all.filter(function(el){ return el.closest('.hero-statement'); });
    var rest = all.filter(function(el){ return !el.closest('.hero-statement'); });
    if (reduced || instant === true && !window.gsap) return;
    if (!window.gsap) return;
    var tl = gsap.timeline({defaults:{ease:'cubic-bezier(0.16,1,0.3,1)'}});
    tl.fromTo('#site-header', {y:-12, opacity:0}, {y:0, opacity:1, duration:0.7}, 0)
      .fromTo('.hero-meta', {y:16, opacity:0}, {y:0, opacity:1, duration:0.6}, 0.1)
      .fromTo(lines, {yPercent:120, opacity:0}, {yPercent:0, opacity:1, duration:1.0, stagger:0.1}, 0.15)
      .fromTo(rest, {y:20, opacity:0}, {y:0, opacity:1, duration:0.8, stagger:0.06}, 0.35);
    var heroImg = document.querySelector('.hero-media img');
    if (heroImg) gsap.fromTo(heroImg, {scale:1.06, opacity:0}, {scale:1, opacity:1, duration:1.3, ease:'cubic-bezier(0.16,1,0.3,1)', delay:0.4});
  }

  function hideLoader(instant){
    if (!loader || loader.classList.contains('done')) return;
    loader.classList.add('done');
    if (reduced || instant || !window.gsap) {
      loader.style.display = 'none';
      return;
    }
    gsap.to(loader, {clipPath:'inset(0 0 100% 0)', duration:0.9, ease:'power3.inOut', onComplete:function(){ loader.style.display='none'; }});
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
    gsap.to(o, {v:100, duration:2.0, ease:'power2.inOut',
      onUpdate:function(){ setProgress(o.v); },
      onComplete:function(){
        try { sessionStorage.setItem('ch_loader_done','1'); } catch(e){}
        document.body.style.overflow = '';
        hideLoader(false);
        revealContent(false);
      }});
    gsap.set('[data-reveal-hero]', {opacity:0});
  }

  /* Lenis smooth scroll */
  var lenis = null;
  try {
    if (!reduced && window.Lenis) {
      lenis = new window.Lenis({duration:1.0, smoothWheel:true});
      document.documentElement.style.scrollBehavior = 'auto';
      if (window.gsap && window.ScrollTrigger) {
        lenis.on('scroll', window.ScrollTrigger.update);
        window.gsap.ticker.add(function(t){ lenis.raf(t * 1000); });
        window.gsap.ticker.lagSmoothing(0);
      }
    }
  } catch(e){ lenis = null; }

  function smoothTo(target){
    var el = (typeof target === 'string') ? document.querySelector(target) : target;
    if (lenis) lenis.scrollTo(target === 0 ? 0 : el, {duration:1.2});
    else if (target === 0) window.scrollTo({top:0, behavior: reduced ? 'auto' : 'smooth'});
    else if (el) el.scrollIntoView({behavior: reduced ? 'auto' : 'smooth'});
  }

  /* Header */
  var header = document.getElementById('site-header');
  function onScroll(){ header.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* Clock — Asia/Kathmandu */
  var clock = document.getElementById('clock');
  var fmt;
  try { fmt = new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Kathmandu',hour:'2-digit',minute:'2-digit',hour12:true}); }
  catch(e){ fmt = null; }
  function tick(){
    var s;
    if (fmt) { s = fmt.format(new Date()).toLowerCase().replace(/\s+/g,' '); }
    else {
      var now = new Date();
      var d = new Date(now.getTime() + (now.getTimezoneOffset()*60000) + (5.75*60*60*1000));
      var h = d.getHours(), m = d.getMinutes(), ap = h >= 12 ? 'pm' : 'am';
      h = h % 12 || 12;
      s = ('0'+h).slice(-2)+':'+('0'+m).slice(-2)+' '+ap;
    }
    clock.textContent = s;
  }
  tick(); setInterval(tick, 1000);

  /* Menu */
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
      .fromTo(overlay, {yPercent:-100}, {yPercent:0, duration:0.85, ease:'power3.inOut'})
      .fromTo(links, {y:40, opacity:0}, {y:0, opacity:1, duration:0.5, ease:'power3.out', stagger:0.06}, '-=0.35')
      .fromTo('.menu-foot', {y:20, opacity:0}, {y:0, opacity:1, duration:0.4, ease:'power3.out'}, '-=0.3');
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
    tl.to('.menu-foot', {y:10, opacity:0, duration:0.2, ease:'power3.in'})
      .to(links, {y:16, opacity:0, duration:0.25, ease:'power3.in', stagger:0.03}, 0)
      .to(overlay, {yPercent:-100, duration:0.8, ease:'power3.inOut'}, '-=0.1')
      .set(overlay, {visibility:'hidden'});
    openBtn.focus();
  }

  if (window.gsap) gsap.set(overlay, {yPercent:-100, visibility:'hidden'});
  openBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeMenu(); });
  links.forEach(function(a){ a.addEventListener('click', function(e){
    var hash = a.getAttribute('href');
    if (hash && hash.charAt(0) === '#') {
      e.preventDefault();
      closeMenu();
      smoothTo(hash);
    } else if (overlay.classList.contains('open')) closeMenu();
  }); });

  /* Scroll reveals */
  if (!reduced && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('[data-reveal]').forEach(function(el){
      gsap.fromTo(el, {opacity:0, y:28}, {opacity:1, y:0, duration:0.9, ease:'power3.out',
        scrollTrigger:{trigger:el, start:'top 88%', once:true}});
    });

    /* Image reveals — clip-path inset */
    gsap.utils.toArray('.img-reveal').forEach(function(el){
      gsap.fromTo(el, {clipPath:'inset(8% 8% 8% 8%)'}, {clipPath:'inset(0% 0% 0% 0%)', duration:1.2, ease:'power3.out',
        scrollTrigger:{trigger:el, start:'top 85%', once:true}});
    });

    /* Parallax on hero image */
    var heroImg = document.querySelector('.hero-media img');
    if (heroImg) gsap.fromTo(heroImg, {scale:1.08, yPercent:-3}, {scale:1.08, yPercent:3, ease:'none',
      scrollTrigger:{trigger:'.hero-media', start:'top bottom', end:'bottom top', scrub:true}});

    /* Parallax on about image */
    var aboutImg = document.querySelector('.about-image img');
    if (aboutImg) gsap.fromTo(aboutImg, {scale:1.08, yPercent:-3}, {scale:1.08, yPercent:3, ease:'none',
      scrollTrigger:{trigger:'.about-image', start:'top bottom', end:'bottom top', scrub:true}});

    /* Dark scene — pinned film frame */
    var sceneFrame = document.querySelector('.scene-frame');
    if (sceneFrame) {
      gsap.fromTo(sceneFrame, {scale:0.72, clipPath:'inset(10% 10% 10% 10%)'}, {scale:1, clipPath:'inset(0% 0% 0% 0%)', ease:'none',
        scrollTrigger:{trigger:'.scene', start:'top top', end:'bottom bottom', scrub:1}});
      gsap.utils.toArray('[data-scene-fade]').forEach(function(el){
        gsap.fromTo(el, {opacity:0, y:20}, {opacity:1, y:0, ease:'none',
          scrollTrigger:{trigger:'.scene', start:'top top', end:'35% top', scrub:1}});
      });
      ScrollTrigger.create({trigger:'.scene', start:'top 80px', end:'bottom 80px',
        onToggle:function(self){
          header.classList.toggle('on-dark', self.isActive);
          document.documentElement.classList.toggle('viewing-dark', self.isActive);
        }});
    }

    /* Footer wordmark reveal */
    var footWord = document.querySelector('.foot-word span');
    if (footWord) gsap.fromTo(footWord, {yPercent:100}, {yPercent:0, duration:1.1, ease:'power3.out',
      scrollTrigger:{trigger:'.foot-word', start:'top 94%', once:true}});
  }

  /* Custom cursor — fine pointers only, no mobile, no reduced motion */
  if (!isMobile && !reduced && !window.matchMedia('(pointer: coarse)').matches) {
    var cursor = document.getElementById('cursor');
    var cursorLabel = document.getElementById('cursor-label');
    var filmPrev = document.getElementById('film-preview');
    if (cursor && filmPrev) {
      document.documentElement.classList.add('has-cursor');
      var mx = window.innerWidth / 2, my = window.innerHeight / 2;
      var cx = mx, cy = my, px = mx, py = my;
      var filmOn = false;
      var currentImg = null;

      document.addEventListener('mousemove', function(e){ mx = e.clientX; my = e.clientY; }, {passive:true});

      function positionPreview(){
        var pw = Math.min(280, window.innerWidth * 0.22);
        var ph = pw * 0.75;
        var fx = px + 24;
        if (fx + pw > window.innerWidth - 16) fx = px - 24 - pw;
        var fy = py - ph / 2;
        fy = Math.max(16, Math.min(window.innerHeight - ph - 16, fy));
        filmPrev.style.transform = 'translate(' + fx + 'px,' + fy + 'px)';
      }

      document.addEventListener('mouseover', function(e){
        if (!e.target.closest) return;
        var filmRow = e.target.closest('.film-row, .a-row');
        var nav = e.target.closest('.nav-center a, .contact-link, #menu-btn, .menu-links a');
        var ext = e.target.closest('a[target="_blank"]');

        if (filmRow && window.innerWidth > 768) {
          var src = filmRow.getAttribute('data-img');
          if (src && currentImg !== src) {
            currentImg = src;
            filmPrev.querySelector('img').src = src;
          }
          if (!filmOn) { filmOn = true; filmPrev.classList.add('show'); }
        } else if (filmOn) {
          filmOn = false; currentImg = null; filmPrev.classList.remove('show');
        }

        if (filmRow || ext) { cursorLabel.textContent = 'View'; cursor.classList.add('big'); }
        else if (nav) { cursorLabel.textContent = ''; cursor.classList.remove('big'); cursor.classList.add('nav'); }
        else { cursor.classList.remove('big', 'nav'); }
      });

      (function follow(){
        cx += (mx - cx) * 0.18;
        cy += (my - cy) * 0.18;
        px += (mx - px) * 0.1;
        py += (my - py) * 0.1;
        cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
        if (filmOn) positionPreview();
        requestAnimationFrame(follow);
      })();
    }
  }

  /* Archive filters */
  (function(){
    var yearSel = document.getElementById('f-year');
    var dirSel = document.getElementById('f-dir');
    var countEl = document.getElementById('f-count');
    if (!yearSel || !dirSel) return;
    var rows = Array.prototype.slice.call(document.querySelectorAll('.a-row'));
    var seen = {};
    rows.forEach(function(r){
      var d = r.querySelector('.a-d');
      var name = d ? d.textContent.trim() : '';
      if (name && !seen[name]) {
        seen[name] = 1;
        var o = document.createElement('option');
        o.textContent = name;
        dirSel.appendChild(o);
      }
    });
    function apply(){
      var y = yearSel.value, d = dirSel.value, n = 0;
      rows.forEach(function(r){
        var ry = r.querySelector('.a-y').textContent.trim();
        var rd = r.querySelector('.a-d').textContent.trim();
        var ok = (!y || ry === y) && (!d || rd === d);
        r.style.display = ok ? '' : 'none';
        if (ok) n++;
      });
      if (countEl) countEl.textContent = n + (n === 1 ? ' title' : ' titles');
    }
    yearSel.addEventListener('change', apply);
    dirSel.addEventListener('change', apply);
    apply();
  })();

  /* Newsletter */
  var form = document.getElementById('news-form');
  var news = document.getElementById('news');
  if (form) form.addEventListener('submit', function(e){
    e.preventDefault();
    var v = document.getElementById('email').value.trim();
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    news.classList.toggle('invalid', !ok);
    if (ok) { news.classList.remove('invalid'); news.classList.add('done'); }
  });

  /* Back to top */
  var toTop = document.getElementById('to-top');
  if (toTop) toTop.addEventListener('click', function(){ smoothTo(0); });

})();
