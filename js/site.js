
(function () {
  'use strict';
  var doc = document.documentElement;
  var EN = doc.lang === 'en';
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  if (!location.hash) window.scrollTo(0, 0);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var hasG = !!(window.gsap && window.ScrollTrigger);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    if (hasG) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function loop(t) { lenis.raf(t); requestAnimationFrame(loop); })(0);
    }
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1); var t = id && document.getElementById(id);
      if (!t) return; e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: -10 }); else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  
  var nav = $('[data-nav]'), orbitSec = $('[data-orbit]');
  function onScroll() {
    if (!nav) return;
    var hero = $('.hero');
    var soglia = hero ? hero.offsetHeight * 0.55 : 24;
    nav.classList.toggle('is-glass', window.scrollY > soglia);
    var foot = $('.foot');
    nav.classList.toggle('is-foot', !!foot && foot.getBoundingClientRect().top <= nav.offsetHeight);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  
  var menu = $('[data-menu]'), opener = $('[data-menu-open]');
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    if (opener) opener.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (lenis) { open ? lenis.stop() : lenis.start(); }
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { var c = $('[data-menu-close]'); c && c.focus({ preventScroll: true }); } else if (opener) opener.focus({ preventScroll: true });
  }
  opener && opener.addEventListener('click', function () { setMenu(true); });
  $$('[data-menu-close]').forEach(function (b) { b.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) {
    if (!menu || !menu.classList.contains('is-open')) return;
    if (e.key === 'Escape') { setMenu(false); return; }
    if (e.key === 'Tab') {
      var f = $$('a[href], button', menu).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  
  var form = $('[data-form]');
  if (form) {
    $$('.field input, .field textarea', form).forEach(function (el) {
      var f = function () { el.parentNode.classList.toggle('has-val', !!el.value); if (el.value.trim()) { el.parentNode.classList.remove('is-err'); el.removeAttribute('aria-invalid'); } };
      el.addEventListener('input', f); el.addEventListener('blur', f); f();
    });
    var pv = $('#privacy', form); if (pv) pv.addEventListener('change', function () { if (pv.checked) { pv.closest('.consent').classList.remove('is-err'); pv.removeAttribute('aria-invalid'); } });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = $('[data-form-msg]', form); var bad = $$('[required]', form).filter(function (el) { return el.type === 'checkbox' ? !el.checked : !el.value.trim(); });
      $$('[required]', form).forEach(function (el) { var on = bad.indexOf(el) > -1; el.setAttribute('aria-invalid', on ? 'true' : 'false'); el.closest('.field, .consent').classList.toggle('is-err', on); });
      msg.classList.toggle('is-err', !!bad.length);
      if (bad.length) { msg.textContent = EN ? 'Please fill in the fields marked with an asterisk and give your privacy consent.' : 'Completa i campi con l’asterisco e il consenso privacy.'; msg.scrollIntoView({ block: 'center', behavior: 'smooth' }); setTimeout(function () { bad[0].focus({ preventScroll: true }); }, 500); return; }
      msg.textContent = EN ? 'Thank you. This is a preview: on the live site your request will be sent to info@ellevibrokers.it.' : 'Grazie. Questa è un’anteprima: nel sito definitivo la richiesta arriverà a info@ellevibrokers.it.';
      form.reset(); $$('.field', form).forEach(function (f) { f.classList.remove('has-val'); });
    });
  }
  function setRollOn(li) {
    var lis = $$('li', li.parentNode), k = lis.indexOf(li);
    lis.forEach(function (x, i) { x.classList.toggle('is-on', x === li); x.setAttribute('data-d', Math.abs(i - k)); x.style.removeProperty('--a'); });
  }
  $$('[data-roll] li').forEach(function (li) {
    var b = $('button', li);
    b.addEventListener('click', function () { setRollOn(li); });
    b.addEventListener('focus', function () { setRollOn(li); });

  });

  
  document.body.classList.add('stile-piatto');

  
  $$('[data-stack]').forEach(function (st) {
    var cards = $$('[data-card]', st);
    function on(c) {
      var k = cards.indexOf(c);
      cards.forEach(function (x, i) { x.classList.toggle('is-on', x === c); x.setAttribute('data-d', Math.abs(i - k)); });
    }
    on(cards.filter(function (x) { return x.classList.contains('is-on'); })[0] || cards[cards.length - 1]);
    cards.forEach(function (c) {
      c.addEventListener('mouseenter', function () { if (!coarse) on(c); });
      c.addEventListener('click', function () { on(c); });
    });
    st._on = on; st._cards = cards;
  });

  if (!hasG || reduce) { doc.classList.add('no-motion'); return; }

  
  gsap.registerPlugin(ScrollTrigger);
  var E = 'expo.out';
  $$('[data-split]').forEach(function (el) {
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            var o = document.createElement('span'); o.className = 'w';
            var i = document.createElement('span'); i.textContent = w; o.appendChild(i); frag.appendChild(o);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
    gsap.from($$('.w > span', el), {
      yPercent: 110, duration: 1.1, ease: E, stagger: 0.018,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });
  $$('[data-rise]').forEach(function (el) {
    gsap.from(el, { y: 24, opacity: 0, duration: 1.1, ease: E, delay: 0.15, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });
  $$('.gridlines').forEach(function (g) {
    gsap.from($$('span', g), { scaleY: 0, duration: 1.6, ease: 'power3.inOut', stagger: 0.07, scrollTrigger: { trigger: g.parentNode, start: 'top 85%', once: true } });
  });
  var mark = $('[data-mark] .clip');
  if (mark) {
    gsap.fromTo(mark, { clipPath: 'inset(100% 0% 0% 0%)', yPercent: 18 }, { clipPath: 'inset(0% 0% 0% 0%)', yPercent: 0, duration: 1.6, ease: 'expo.inOut', delay: 0.25 });
    gsap.to('.hero .cols', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }
  var orbit = $('[data-orbit]');
  if (orbit) {
    var oq = function (s) { return $$(s, orbit); };
    var L = function (el) { return el.getTotalLength ? el.getTotalLength() + 2 : 3000; };
    var draw = function (els) { els.forEach(function (el) { el.removeAttribute('pathLength'); }); return els; };
    var grow = function (els, vars, at) {
      otl.fromTo(els, { strokeDasharray: function (i, el) { return L(el); }, strokeDashoffset: function (i, el) { return L(el); } },
        Object.assign({ strokeDashoffset: 0, immediateRender: true }, vars), at);
    };
    var svg = $('.orbit__svg', orbit), C = 960, XS = [48, 352, 656, 1264, 1568, 1872];
    var geo = function () {
      var s = svg.getBoundingClientRect().width / 1920 || 1;
      svg.style.setProperty('--sw', (1 / s).toFixed(3));
      var half = innerHeight / 2 / s;
      var E = 540, ry = Math.min(460, half - 90 / s), T = E - ry, B = E + ry, top = E - half - 40 / s;
      oq('[data-gv]').forEach(function (l, i) { l.setAttribute('x1', XS[i]); l.setAttribute('x2', XS[i]); l.setAttribute('y1', top); l.setAttribute('y2', E); });
      oq('[data-gaxt]').forEach(function (l) { l.setAttribute('y1', top); l.setAttribute('y2', E); });
      oq('[data-geq]').forEach(function (l) { l.setAttribute('y1', E); l.setAttribute('y2', E); });
      oq('[data-gax]').forEach(function (l) { l.setAttribute('y1', E); l.setAttribute('y2', B + 40); });
      oq('[data-gaxu]').forEach(function (l) { l.setAttribute('y1', E); l.setAttribute('y2', T - 40); });
      oq('[data-glo]').forEach(function (p, i) { var x = XS[i], L = x < C; p.setAttribute('d', 'M' + x + ' ' + E + ' A' + Math.abs(C - x) + ' ' + ry + ' 0 0 ' + (L ? 0 : 1) + ' ' + C + ' ' + B); });
      oq('[data-gup]').forEach(function (p, i) { var x = XS[i], L = x < C; p.setAttribute('d', 'M' + x + ' ' + E + ' A' + Math.abs(C - x) + ' ' + ry + ' 0 0 ' + (L ? 1 : 0) + ' ' + C + ' ' + T); });
      oq('[data-gdg]').forEach(function (l, i) { l.setAttribute('y1', E); l.setAttribute('y2', i < 2 ? T : B); });
    };
    geo();
    var gv = draw(oq('[data-gv], [data-gaxt]')), eqs = draw(oq('[data-geq]')), axd = draw(oq('[data-gax]')), axu = draw(oq('[data-gaxu]')),
      lo = draw(oq('[data-glo]')), up = draw(oq('[data-gup]')), dg = draw(oq('[data-gdg]'));
    var logoW = $('[data-logo]', orbit), tags = $$('.orbit__tag', orbit), pinEl = $('[data-orbit-pin]', orbit);
    gsap.set(gv, { opacity: 0 });
    var fall = document.createElement('div');
    fall.className = 'fall-lines'; fall.setAttribute('aria-hidden', 'true');
    fall.innerHTML = '<div class="gridlines">' + '<span></span>'.repeat(6) + '</div>';
    document.body.appendChild(fall);
    var otl = gsap.timeline({ defaults: { ease: 'none' },
      scrollTrigger: { trigger: pinEl, start: 'top top', end: '+=240%', pin: true, scrub: 0.5, invalidateOnRefresh: true, onRefreshInit: geo } });
    otl.to({}, { duration: 0.2 }, 0)
      .set({}, {}, 2.5)
      .fromTo(logoW, { opacity: 0, y: 80, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 1.2 }, 0)
      .fromTo(tags, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.2 }, 0.8);
    grow(lo.concat(eqs, axd), { duration: 1 }, 0.2);
    grow(up.concat(axu, dg), { duration: 1 }, 1.2);
    var fallUpd = function () {
      var st = otl.scrollTrigger; if (!st) return;
      var y = window.scrollY, d = st.end - st.start, reach = st.start * 0.6; // più veloci: all'equatore prima del fermo
      var r = svg.getBoundingClientRect(), eqY = (st.progress > 0 && st.progress < 1 ? r.top : (innerHeight - r.height) / 2) + 540 * r.width / 1920;
      var h = Math.max(0, Math.min(1, y / reach)) * eqY;
      var o = 1 - Math.max(0, Math.min(1, (y - (st.start + d * 1.2 / 2.5)) / (d / 2.5)));
      fall.style.clipPath = 'inset(0 0 ' + Math.max(0, innerHeight - h) + 'px 0)';
      fall.style.opacity = y > st.end ? 0 : o;
    };
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: fallUpd, onRefresh: fallUpd }); fallUpd();
    var logo = $('img', logoW);
    if (!coarse) {
      var rx = gsap.quickTo(logo, 'rotateY', { duration: 1.2, ease: 'power3' });
      var ry = gsap.quickTo(logo, 'rotateX', { duration: 1.2, ease: 'power3' });
      orbit.addEventListener('mousemove', function (e) {
        var r = orbit.getBoundingClientRect();
        rx(((e.clientX - r.left) / r.width - 0.5) * 24); ry(-((e.clientY - r.top) / r.height - 0.5) * 14);
      });
      orbit.addEventListener('mouseleave', function () { rx(0); ry(0); });
    }
  }
  $$('[data-band]').forEach(function (b) {
    var img = $('img', b);
    gsap.fromTo(img, { yPercent: -9 }, { yPercent: 9, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from(b, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: { trigger: b, start: 'top 92%', once: true } });
    if (!coarse) {
      var sx = gsap.quickTo(img, 'x', { duration: 1, ease: 'power3' }), sc = gsap.quickTo(img, 'scale', { duration: 1, ease: 'power3' });
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); sx(((e.clientX - r.left) / r.width - 0.5) * -40); sc(1.07); });
      b.addEventListener('mouseleave', function () { sx(0); sc(1); });
    }
  });
  $$('[data-speed]').forEach(function (f) {
    var sp = parseFloat(f.getAttribute('data-speed')) || 1;
    gsap.fromTo(f, { y: 120 * sp }, { y: -160 * sp, ease: 'none', scrollTrigger: { trigger: f.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from($('img', f), { scale: 1.35, duration: 1.8, ease: E, scrollTrigger: { trigger: f, start: 'top 95%', once: true } });
  });
  $$('[data-par-img] img').forEach(function (img) {
    gsap.fromTo(img, { yPercent: -8 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  $$('[data-casc]').forEach(function (sec) {
    var pinEl = $('[data-casc-pin]', sec), stage = $('.casc__stage', sec), phs = $$('[data-ph]', sec);
    var flat = document.body.classList.contains('stile-piatto'), tilt = flat ? 0 : 1;
    var cx = function (f) { return (parseFloat(f.style.getPropertyValue('--x')) || 0) + (parseFloat(f.style.getPropertyValue('--w')) || 0) / 2; };
    gsap.matchMedia().add('(min-width: 901px) and (min-aspect-ratio: 4/5)', function () {
      var tl = gsap.timeline({ scrollTrigger: { trigger: pinEl, start: 'top top', end: '+=230%', pin: true, scrub: 0.9, refreshPriority: 2, invalidateOnRefresh: true } });
      tl.set({}, {}, 1);
      var after = false; // dal 14/10 la schermata testo dell'About ha la sua foto che scorre: la cascata parte come nelle aree
      phs.forEach(function (f, i) {
        var side = cx(f) < 960 ? 1 : -1, t0 = after ? i * 0.13 : 0.2 + i * 0.13, d = 0.4;
        if (after && i === 0) {
          gsap.fromTo(f, { y: function () { return innerHeight * 0.9; }, rotationX: 24 * tilt, rotationY: 16 * side * tilt, scale: flat ? 1 : 0.94 },
            { y: 0, rotationX: 6 * tilt, rotationY: 6 * side * tilt, scale: 1, ease: 'power2.out', immediateRender: true,
              scrollTrigger: { trigger: pinEl, start: 'top 85%', end: 'top top', scrub: 0.9, invalidateOnRefresh: true } });
          tl.to(f, { rotationX: 6 * tilt, rotationY: 12 * side * tilt, rotation: 3 * side * tilt, ease: 'none', duration: 1 }, 0);
          return;
        }
        tl.fromTo(f, { y: function () { return pinEl.clientHeight - (stage.offsetTop + f.offsetTop) + 60; }, rotationX: 24 * tilt, rotationY: 16 * side * tilt, scale: flat ? 1 : 0.94 },
          { y: 0, rotationX: 6 * tilt, rotationY: 6 * side * tilt, scale: 1, ease: 'power3.out', duration: d, immediateRender: true }, t0)
          .to(f, { rotationX: 6 * tilt, rotationY: 12 * side * tilt, rotation: 3 * side * tilt, ease: 'none', duration: 1 - t0 - d }, t0 + d);
      });
      var lead = $('[data-lead-ph]', sec);
      if (lead) {
        gsap.from(lead, { y: 80, opacity: 0, duration: 1.4, ease: E, scrollTrigger: { trigger: sec, start: 'top 70%', once: true } });
        tl.to(lead, { y: function () { return -(stage.offsetTop + lead.offsetTop + lead.offsetHeight + 80); }, ease: 'power2.in', duration: 0.32 }, 0.04);
      }
      phs.forEach(function (f) {
        var sp = parseFloat(f.getAttribute('data-casc-speed')) || 1;
        gsap.to(f, { yPercent: -12 * sp, ease: 'none', scrollTrigger: { trigger: sec, start: 'bottom bottom', end: 'bottom top', scrub: true } });
      });
      if (coarse || flat) return;
      var EASE_P = 'cubic-bezier(.22,1,.36,1)';
      var qs = phs.map(function (f, i) {
        var g = $('.casc__glass', f), side = cx(f) < 960 ? 1 : -1;
        var o = { duration: 0.9, ease: EASE_P };
        return { f: f, g: g, side: side, k: 0.7 + i * 0.25, hover: false,
          rx: gsap.quickTo(g, 'rotationX', o), ry: gsap.quickTo(g, 'rotationY', o), rz: gsap.quickTo(g, 'rotation', o), z: gsap.quickTo(g, 'z', o) };
      });
      var mx = 0, my = 0;
      var apply = function () {
        qs.forEach(function (q) {
          if (q.hover) {
            q.rx(-6); q.ry(-12 * q.side + 3 * q.side); q.rz(-3 * q.side); q.z(40);
          } else { q.rx(-my * 9 * q.k); q.ry(mx * 12 * q.k); q.rz(0); q.z(0); }
        });
      };
      var move = function (e) {
        var r = pinEl.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5;
        qs.forEach(function (q) { q.g.style.setProperty('--sheen', (50 - mx * 70).toFixed(1) + '%'); });
        apply();
      };
      var leave = function () { mx = 0; my = 0; qs.forEach(function (q) { q.hover = false; q.f.classList.remove('is-hover'); q.g.style.removeProperty('--sheen'); }); apply(); };
      var ons = qs.map(function (q) {
        var en = function () { q.hover = true; q.f.classList.add('is-hover'); apply(); };
        var ex = function () { q.hover = false; q.f.classList.remove('is-hover'); apply(); };
        q.f.addEventListener('mouseenter', en); q.f.addEventListener('mouseleave', ex);
        return function () { q.f.removeEventListener('mouseenter', en); q.f.removeEventListener('mouseleave', ex); };
      });
      pinEl.addEventListener('mousemove', move); pinEl.addEventListener('mouseleave', leave);
      return function () { pinEl.removeEventListener('mousemove', move); pinEl.removeEventListener('mouseleave', leave); ons.forEach(function (f) { f(); }); };
    });
    gsap.matchMedia().add('(max-width: 900px), (max-aspect-ratio: 4/5)', function () {
      phs.forEach(function (f) {
        var sp = parseFloat(f.getAttribute('data-casc-speed')) || 1;
        gsap.fromTo(f, { y: 70 * sp }, { y: -50 * sp, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    });
  });
  $$('[data-tb]').forEach(function (sec) {
    var ph = $('[data-tb-ph]', sec), pinEl = $('.casc__pin', sec);
    if (!ph) return;
    gsap.matchMedia().add('(min-width: 901px) and (min-aspect-ratio: 4/5)', function () {
      gsap.fromTo(ph, { y: function () { return innerHeight * 1.05; } }, { y: function () { return -innerHeight * 0.12; }, ease: 'none', immediateRender: true,
        scrollTrigger: { trigger: pinEl, start: 'top top', end: '+=110%', pin: true, scrub: 0.8, invalidateOnRefresh: true } });
    });
  });
  var fog = $('[data-fog]');
  if (fog) {
    gsap.to(fog, { yPercent: 14, scale: 1.08, ease: 'none', scrollTrigger: { trigger: fog.parentNode, start: 'top top', end: 'bottom top', scrub: true } });
  }
  $$('[data-stack]').forEach(function (st) {
    var sec = st.closest('[data-stacksec]') || st.parentNode;
    gsap.from(st._cards, { x: function (i) { return -(70 + i * 20); }, opacity: 0, ease: "power2.out", stagger: { each: 0.22, from: 'end' },
      scrollTrigger: { trigger: st, start: 'top 95%', end: 'top 30%', scrub: 0.7 } });
    var pick = function (p) { st._on(st._cards[Math.min(st._cards.length - 1, Math.floor(p * st._cards.length * 0.999))]); };
    gsap.matchMedia().add('(min-width: 901px) and (min-aspect-ratio: 4/5)', function () {
      ScrollTrigger.create({ trigger: sec, start: 'top top', end: '+=140%', pin: true, onUpdate: function (s) { pick(s.progress); } });
    });
    gsap.matchMedia().add('(max-width: 900px), (max-aspect-ratio: 4/5)', function () {
      ScrollTrigger.create({ trigger: st, start: 'top 70%', end: 'bottom 30%', onUpdate: function (s) { pick(s.progress); } });
    });
  });
  var ROLL_A = [1, 0.75, 0.37, 0.17, 0.1, 0.07];
  var rollAlpha = function (d) { d = Math.min(5, Math.abs(d)); var i = Math.floor(d); return i >= 5 ? ROLL_A[5] : ROLL_A[i] + (ROLL_A[i + 1] - ROLL_A[i]) * (d - i); };
  $$('[data-rollsec]').forEach(function (sec) {
    var pinEl = $('[data-roll-pin]', sec), ul = $('[data-roll]', sec), lis = $$('li', ul), n = lis.length, rest = 0;
    if (!pinEl || !n) return;
    gsap.matchMedia().add('(min-width: 901px) and (min-aspect-ratio: 4/5)', function () {
      var cur = -1, pitch = 0;
      var measure = function () { pitch = lis[0].offsetHeight; };
      var draw = function (pos) {
        gsap.set(ul, { y: (rest - pos) * pitch });
        lis.forEach(function (li, i) { li.style.setProperty('--a', rollAlpha(i - pos).toFixed(3)); });
        var k = Math.round(pos);
        if (k !== cur) { cur = k; lis.forEach(function (li, i) { li.classList.toggle('is-on', i === k); li.setAttribute('data-d', Math.abs(i - k)); }); }
      };
      var detent = function (p, k) {
        var x = p * k, i = Math.floor(x), f = x - i;
        if (i >= k) return k;
        return i + (f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2);
      };
      var pinST = ScrollTrigger.create({ trigger: pinEl, start: 'top top', end: '+=' + (n - 1 - rest) * 45 + '%', pin: true, refreshPriority: 1,
        onRefresh: function () { measure(); upd(); }, onUpdate: function () { upd(); } });
      var inST = ScrollTrigger.create({ trigger: pinEl, start: 'top bottom', end: 'top top', refreshPriority: 1, onUpdate: function () { upd(); } });
      function upd() { draw(detent(inST ? inST.progress : 0, rest) + detent(pinST ? pinST.progress : 0, n - 1 - rest)); }
      measure(); upd();
      return function () { gsap.set(ul, { clearProps: 'transform' }); lis.forEach(function (li) { li.style.removeProperty('--a'); }); };
    });
    gsap.matchMedia().add('(max-width: 900px), (max-aspect-ratio: 4/5)', function () {
      lis.forEach(function (li) {
        ScrollTrigger.create({ trigger: li, start: 'top 58%', end: 'bottom 42%', onToggle: function (s) { if (s.isActive) setRollOn(li); } });
      });
    });
  });
  var planSec = $('[data-plan]');
  if (planSec) {
    var wheel = $('[data-wheel]', planSec), steps = $$('[data-step]', planSec), curStep = 0;
    var setStep = function (i) {
      if (i === curStep) return; curStep = i;
      steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
      gsap.to(wheel, { rotation: -120 * i, duration: 1.4, ease: 'power3.inOut', overwrite: true });
    };
    var mm = gsap.matchMedia();
    mm.add('(min-width: 901px) and (min-aspect-ratio: 4/5)', function () {
      ScrollTrigger.create({ trigger: planSec, start: 'top top', end: '+=160%', pin: true,
        onUpdate: function (s) { setStep(Math.min(2, Math.floor(s.progress * 3 * 0.999))); } });
    });
    mm.add('(max-width: 900px), (max-aspect-ratio: 4/5)', function () {
      gsap.to(wheel, { rotation: -240, ease: 'none', scrollTrigger: { trigger: '[data-disc]', start: 'top 80%', end: 'bottom 20%', scrub: 0.8 } });
    });
    gsap.from('[data-disc]', { scale: 0.85, opacity: 0, duration: 1.6, ease: E, scrollTrigger: { trigger: planSec, start: 'top 75%', once: true } });
  }
  $$('[data-zoomin]').forEach(function (m) {
    gsap.from(m, { clipPath: 'inset(12% 12% 12% 12%)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: m, start: 'top 88%', once: true } });
  });
  var fl = $('[data-foot-links]');
  if (fl) {
    gsap.from($$('a', fl), { yPercent: 105, duration: 1.1, ease: E, stagger: 0.08, scrollTrigger: { trigger: fl, start: 'top 90%', once: true } });
    gsap.from($$('.foot__info > div, .foot__base'), { y: 20, opacity: 0, duration: 1, ease: E, stagger: 0.06, delay: 0.3, scrollTrigger: { trigger: fl, start: 'top 90%', once: true } });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  setTimeout(function () {
    $$('[data-rise], .w > span, .foot__links a, .foot__info > div, .foot__base').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0 && getComputedStyle(el).opacity === '0') gsap.set(el, { clearProps: 'all' });
    });
  }, 4000);
})();


(function () {
  'use strict';
  Array.prototype.slice.call(document.querySelectorAll('.hero__text br')).forEach(function (br) {
    var p = br.previousSibling;
    if (!(p && p.nodeType === 3 && /\s$/.test(p.textContent))) br.parentNode.insertBefore(document.createTextNode(' '), br);
  });
  if (!(window.gsap && window.ScrollTrigger) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var heroCols = document.querySelector('.hero .cols');
  if (heroCols) {
    gsap.matchMedia().add('(max-width: 900px), (max-aspect-ratio: 4/5)', function () {
      gsap.to(heroCols, { opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '12% top', end: '30% top', scrub: true } });
    });
  }
})();
