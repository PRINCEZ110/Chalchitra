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
      .fromTo(lines, {yPercent:120, opacity:0}, {yPercent:0, opacity:1, duration:1.0, stagger:0.1}, 0.15)
      .fromTo(rest, {y:20, opacity:0}, {y:0, opacity:1, duration:0.8, stagger:0.06}, 0.35);
    var heroFig = document.querySelector('.hero-media');
    if (heroFig) gsap.fromTo(heroFig, {scale:1.06}, {scale:1, duration:1.4, ease:'cubic-bezier(0.16,1,0.3,1)', delay:0.4});
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
        initDynamicSections();
      }});
    gsap.set('[data-reveal-hero]', {opacity:0});
  }

  if (seen) { setTimeout(initDynamicSections, 50); }

  function initDynamicSections(){
    renderFilms();
    renderTimeline();
    renderPeople();
    renderMemoriam();
    initScrollReveals();
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

  /* ========== Dynamic Data Sections ========== */

  function renderFilms(){
    if (typeof CHALCHITRA === 'undefined' || !CHALCHITRA.films) return;
    var listEl = document.getElementById('film-list');
    var navEl = document.getElementById('decade-nav');
    if (!listEl) return;
    var films = CHALCHITRA.films;

    var decades = {};
    films.forEach(function(f){
      var decade = Math.floor(f.year / 10) * 10 + 's';
      if (!decades[decade]) decades[decade] = [];
      decades[decade].push(f);
    });

    if (navEl) {
      var allBtn = document.createElement('button');
      allBtn.className = 'decade-btn active';
      allBtn.textContent = 'All (' + films.length + ')';
      allBtn.addEventListener('click', function(){ filterDecade(null); });
      navEl.appendChild(allBtn);

      Object.keys(decades).sort().forEach(function(d){
        var btn = document.createElement('button');
        btn.className = 'decade-btn';
        btn.textContent = d + ' (' + decades[d].length + ')';
        btn.addEventListener('click', function(){ filterDecade(d); });
        navEl.appendChild(btn);
      });
    }

    function filterDecade(decade){
      navEl.querySelectorAll('.decade-btn').forEach(function(b, i){
        var matches = decade ? b.textContent.indexOf(decade) === 0 : i === 0;
        b.classList.toggle('active', matches);
      });
      renderFilmRows(decade ? decades[decade] : films);
    }

    renderFilmRows(films);

    function renderFilmRows(arr){
      listEl.innerHTML = '';
      arr.forEach(function(f, i){
        var row = document.createElement('article');
        row.className = 'film-row';
        row.setAttribute('data-reveal', '');
        row.setAttribute('data-img', f.img || '');
        row.innerHTML =
          '<span class="film-idx">' + String(i + 1).padStart(2, '0') + '</span>' +
          '<div class="film-main">' +
            '<h3 class="film-title">' + f.title + '</h3>' +
            '<div class="film-meta-row">' +
              '<span class="film-director">' + (f.director || '') + '</span>' +
              '<span class="film-year">' + f.year + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="film-tags"><span>' + (f.genre || '') + '</span><span>' + (f.country || 'Nepal') + '</span></div>' +
          '<span class="film-arrow">&rarr;</span>';
        listEl.appendChild(row);
      });
    }
  }

  function renderTimeline(){
    if (typeof CHALCHITRA === 'undefined' || !CHALCHITRA.events) return;
    var el = document.getElementById('timeline-list');
    if (!el) return;
    CHALCHITRA.events.forEach(function(ev){
      var item = document.createElement('article');
      item.className = 'tl-item';
      item.setAttribute('data-reveal', '');
      item.innerHTML =
        '<div class="tl-date">' + ev.year + '</div>' +
        '<div class="tl-content">' +
          '<h3 class="tl-title">' + ev.title + '</h3>' +
          '<p class="tl-desc">' + ev.desc + '</p>' +
        '</div>';
      el.appendChild(item);
    });
  }

  function renderPeople(){
    if (typeof CHALCHITRA === 'undefined' || !CHALCHITRA.people) return;
    var listEl = document.getElementById('people-list');
    var filterEl = document.getElementById('role-filter');
    var countEl = document.getElementById('people-count');
    if (!listEl) return;
    var people = CHALCHITRA.people;

    function renderList(filtered){
      listEl.innerHTML = '';
      filtered.forEach(function(p, i){
        var row = document.createElement('div');
        row.className = 'person-row';
        row.setAttribute('data-reveal', '');
        row.innerHTML =
          '<span class="p-idx">' + String(i + 1).padStart(2, '0') + '</span>' +
          '<span class="p-name">' + p.name + '</span>' +
          '<span class="p-role">' + p.role + '</span>' +
          (p.years ? '<span class="p-years">' + p.years + '</span>' : '');
        listEl.appendChild(row);
      });
      if (countEl) countEl.textContent = filtered.length + ' people';
    }

    if (filterEl) {
      filterEl.addEventListener('change', function(){
        var role = filterEl.value;
        renderList(role ? people.filter(function(p){ return p.role === role; }) : people);
        initScrollReveals();
      });
    }

    renderList(people);
  }

  function renderMemoriam(){
    if (typeof CHALCHITRA === 'undefined' || !CHALCHITRA.memoriam) return;
    var el = document.getElementById('memoriam-list');
    if (!el) return;
    CHALCHITRA.memoriam.forEach(function(p){
      var item = document.createElement('article');
      item.className = 'mem-item';
      item.setAttribute('data-reveal', '');
      item.innerHTML =
        '<h3 class="mem-name">' + p.name + '</h3>' +
        '<p class="mem-role">' + p.role + ' · ' + p.life + '</p>' +
        '<p class="mem-desc">' + p.desc + '</p>';
      el.appendChild(item);
    });
  }

  /* Scroll reveals */
  function initScrollReveals(){
    if (reduced || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('[data-reveal]').forEach(function(el){
      if (el._chRevealDone) return;
      el._chRevealDone = true;
      gsap.fromTo(el, {opacity:0, y:28}, {opacity:1, y:0, duration:0.9, ease:'power3.out',
        scrollTrigger:{trigger:el, start:'top 88%', once:true}});
    });

    /* Image reveals — clip-path inset */
    gsap.utils.toArray('.img-reveal').forEach(function(el){
      if (el._chImgDone) return;
      el._chImgDone = true;
      gsap.fromTo(el, {clipPath:'inset(8% 8% 8% 8%)'}, {clipPath:'inset(0% 0% 0% 0%)', duration:1.2, ease:'power3.out',
        scrollTrigger:{trigger:el, start:'top 85%', once:true}});
    });

    /* Parallax on hero video */
    var heroImg = document.querySelector('.hero-media video, .hero-media img');
    if (heroImg && !heroImg._chParallaxDone) {
      heroImg._chParallaxDone = true;
      gsap.fromTo(heroImg, {scale:1.08, yPercent:-3}, {scale:1.08, yPercent:3, ease:'none',
        scrollTrigger:{trigger:'.hero-media', start:'top bottom', end:'bottom top', scrub:true}});
    }

    /* Parallax on about image */
    var aboutImg = document.querySelector('.about-image img');
    if (aboutImg && !aboutImg._chParallaxDone) {
      aboutImg._chParallaxDone = true;
      gsap.fromTo(aboutImg, {scale:1.08, yPercent:-3}, {scale:1.08, yPercent:3, ease:'none',
        scrollTrigger:{trigger:'.about-image', start:'top bottom', end:'bottom top', scrub:true}});
    }

    /* Dark scene — pinned film frame */
    var sceneFrame = document.querySelector('.scene-frame');
    if (sceneFrame && !sceneFrame._chSceneDone) {
      sceneFrame._chSceneDone = true;
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
    if (footWord && !footWord._chWordDone) {
      footWord._chWordDone = true;
      gsap.fromTo(footWord, {yPercent:100}, {yPercent:0, duration:1.1, ease:'power3.out',
        scrollTrigger:{trigger:'.foot-word', start:'top 94%', once:true}});
    }
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

  /* Hero background — Pixabay video (Nepal Himalayas Trekking Snow 258656) */
  (function(){
    var video = document.getElementById('hero-video');
    if (!video) return;
    if (reduced) { video.pause(); return; }

    function tryPlay(){
      var p = video.play();
      if (p && p.catch) p.catch(function(){});
    }

    if (video.readyState >= 2) tryPlay();
    else video.addEventListener('canplay', tryPlay, {once:true});

    /* Pause offscreen to save bandwidth */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting) tryPlay();
          else video.pause();
        });
      }, {threshold: 0.05}).observe(video);
    }
  })();

  /* Back to top */
  var toTop = document.getElementById('to-top');
  if (toTop) toTop.addEventListener('click', function(){ smoothTo(0); });

})();
