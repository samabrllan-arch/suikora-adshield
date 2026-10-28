// Suikora AdShield & Permanent Chapter Unlocker
// Repositorio: https://github.com/samabrllan-arch/suikora-adshield

(function () {
  'use strict';

  console.log('[Suikora AdShield] Extensión activa - Iniciando protección...');

  // 1. Estilos CSS agresivos para destruir capas invisibles y overlays de popunders
  const injectKillerCSS = () => {
    if (document.getElementById('sk-killer-css')) return;
    const style = document.createElement('style');
    style.id = 'sk-killer-css';
    style.textContent = `
      div[style*="2147483650"],
      div[style*="--rdata"],
      div[style*="3000"],
      div[style*="opacity: .01"],
      div[style*="opacity: 0.01"],
      div[class^="pt"][style*="fixed"],
      a[id^="lk"],
      a[target="_blank"]:not([href*="whatsapp.com"]):not([href*="t.me"]),
      iframe[src*="abscloud"],
      iframe[src*="mamshirt"],
      iframe[src*="bauval"],
      iframe[src*="hai8g"],
      iframe[src*="pleased-report"],
      dialog:has(#sk-nota-title) {
        display: none !important;
        pointer-events: none !important;
        visibility: hidden !important;
        position: absolute !important;
        top: -99999px !important;
        left: -99999px !important;
        width: 0 !important;
        height: 0 !important;
        opacity: 0 !important;
        z-index: -999999 !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  };
  injectKillerCSS();

  // 2. Dummy Window para neutralizar window.open contra popups publicitarios
  const dummyWindow = {
    document: { write: () => {} },
    location: { href: '', replace: () => {} },
    close: () => {},
    focus: () => {},
    blur: () => {}
  };

  const originalOpen = window.open;
  const safeOpen = function (url) {
    if (typeof url === 'string' && (url.includes('whatsapp.com') || url.includes('t.me'))) {
      return originalOpen ? originalOpen.apply(this, arguments) : dummyWindow;
    }
    console.warn('[Suikora AdShield] Ventana emergente publicitaria bloqueada:', url);
    return dummyWindow;
  };

  try {
    window.open = safeOpen;
    if (window.top && window.top !== window) window.top.open = safeOpen;
    if (window.parent && window.parent !== window) window.parent.open = safeOpen;
  } catch (e) {}

  // 3. Interceptar setter de a.href y setAttribute para desarmar URLs publicitarias
  try {
    const origHrefDesc = Object.getOwnPropertyDescriptor(HTMLAnchorElement.prototype, 'href');
    if (origHrefDesc && origHrefDesc.set) {
      Object.defineProperty(HTMLAnchorElement.prototype, 'href', {
        get: function () {
          return origHrefDesc.get.call(this);
        },
        set: function (val) {
          if (typeof val === 'string' && isAdUrl(val)) {
            console.warn('[Suikora AdShield] Enlace publicitario desarmado:', val);
            return origHrefDesc.set.call(this, 'javascript:void(0)');
          }
          return origHrefDesc.set.call(this, val);
        },
        configurable: true
      });
    }

    const origSetAttr = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (name, val) {
      if (name === 'href' && typeof val === 'string' && isAdUrl(val)) {
        console.warn('[Suikora AdShield] setAttribute publicitario desarmado:', val);
        return origSetAttr.call(this, 'href', 'javascript:void(0)');
      }
      return origSetAttr.apply(this, arguments);
    };
  } catch (e) {}

  // 4. Bloquear a.click() simulado por scripts de publicidad
  const originalAnchorClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    const href = this.href || this.getAttribute('href') || '';
    if (isAdUrl(href) || (this.target === '_blank' && !href.includes('whatsapp.com') && !href.includes('t.me'))) {
      console.warn('[Suikora AdShield] a.click() simulado bloqueado:', href);
      return;
    }
    return originalAnchorClick.apply(this, arguments);
  };

  function isAdUrl(url) {
    if (!url || typeof url !== 'string') return false;
    if (url.startsWith('/') || url.startsWith('#') || url.startsWith('javascript:')) return false;
    if (url.startsWith(window.location.origin)) return false;
    if (url.includes('whatsapp.com') || url.includes('t.me')) return false;
    if (
      url.includes('abscloud.org') ||
      url.includes('pleased-report.com') ||
      url.includes('hai8g.com') ||
      url.includes('mamshirt.com') ||
      url.includes('bauval.org') ||
      url.includes('nresystems.com') ||
      url.includes('araplhn.org') ||
      url.includes('/api/go')
    ) {
      return true;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return true;
    }
    return false;
  }

  // 5. Inutilizar document.body.onclick
  const neutralizeBodyClick = () => {
    if (document.body) {
      document.body.onclick = null;
      try {
        Object.defineProperty(document.body, 'onclick', {
          get: () => null,
          set: () => {},
          configurable: true
        });
      } catch (e) {}
    }
  };
  neutralizeBodyClick();

  // 6. Detección y eliminación de elementos publicitarios del DOM
  function isAdNode(node) {
    if (!node || node.nodeType !== 1) return false;
    if (node.id === 'suikora-adshield-toast' || node.id === 'sk-killer-css') return false;

    if (node.tagName === 'SCRIPT' || node.tagName === 'IFRAME') {
      const src = node.src || node.getAttribute('src') || '';
      if (
        src.includes('abscloud') ||
        src.includes('mamshirt') ||
        src.includes('bauval') ||
        src.includes('hai8g') ||
        src.includes('pleased-report') ||
        src.includes('araplhn')
      ) {
        return true;
      }
    }

    const styleAttr = node.getAttribute ? (node.getAttribute('style') || '') : '';
    if (
      styleAttr.includes('2147483650') ||
      styleAttr.includes('--rdata') ||
      styleAttr.includes('3000') ||
      (node.id && node.id.startsWith('lk')) ||
      (typeof node.className === 'string' && node.className.startsWith('pt') && styleAttr.includes('fixed'))
    ) {
      return true;
    }

    const s = node.style;
    if (s && (s.position === 'fixed' || styleAttr.includes('fixed'))) {
      const z = parseInt(s.zIndex, 10);
      const op = parseFloat(s.opacity);
      if ((op <= 0.05 || s.visibility === 'hidden') && (z >= 100 || isNaN(z))) {
        return true;
      }
    }

    if (node.tagName === 'A') {
      const href = node.href || node.getAttribute('href') || '';
      if (isAdUrl(href)) return true;
      if (node.target === '_blank' && !href.includes('whatsapp.com') && !href.includes('t.me')) return true;
    }

    return false;
  }

  try {
    const origAppendChild = Node.prototype.appendChild;
    Node.prototype.appendChild = function (child) {
      if (child && child.nodeType === 1 && isAdNode(child)) {
        console.warn('[Suikora AdShield] appendChild bloqueado:', child);
        return child;
      }
      return origAppendChild.apply(this, arguments);
    };

    const origInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function (newNode, refNode) {
      if (newNode && newNode.nodeType === 1 && isAdNode(newNode)) {
        console.warn('[Suikora AdShield] insertBefore bloqueado:', newNode);
        return newNode;
      }
      return origInsertBefore.apply(this, arguments);
    };
  } catch (e) {}

  const purgeExistingAds = () => {
    document.querySelectorAll('div, a, iframe, script').forEach((el) => {
      if (isAdNode(el)) {
        el.remove();
      }
    });

    document.querySelectorAll('dialog').forEach((d) => {
      if (d.querySelector('#sk-nota-title') || d.innerText.includes('bloqueador de anuncios')) {
        d.close();
        d.remove();
        document.body.style.overflow = '';
      }
    });
  };

  purgeExistingAds();
  setInterval(purgeExistingAds, 400);

  // 7. Interceptar eventos táctiles y clics en fase de captura
  const blockTouchHijack = function (e) {
    const target = e.target;
    if (!target) return;

    if (isAdNode(target)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      target.remove();
      console.warn('[Suikora AdShield] Toque en capa publicitaria interceptado y bloqueado');
      return false;
    }

    const link = target.closest ? target.closest('a') : null;
    if (link) {
      const href = link.href || link.getAttribute('href') || '';
      if (
        isAdUrl(href) ||
        (link.target === '_blank' && !href.includes('whatsapp.com') && !href.includes('t.me'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        link.remove();
        console.warn('[Suikora AdShield] Clic en enlace publicitario interceptado:', href);
        return false;
      }
    }
  };

  ['click', 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown'].forEach((evt) => {
    window.addEventListener(evt, blockTouchHijack, true);
    document.addEventListener(evt, blockTouchHijack, true);
  });

  // 8. Inyección nativa en Turbopack para activar y fijar permanentemente el estado Premium
  let hijacked = false;

  function injectPremiumUnlock() {
    if (hijacked || !window.TURBOPACK) return false;

    try {
      const moduleId = 987650 + Math.floor(Math.random() * 10000);

      window.TURBOPACK.push([
        { getAttribute: () => '/_next/adshield.js' },
        moduleId,
        function (ctx) {
          let mod = null;
          let modId = null;

          try {
            mod = ctx.i(33235);
            modId = 33235;
          } catch (e) {}

          if ((!mod || typeof mod.z !== 'function') && ctx.M) {
            for (const id of ctx.M.keys()) {
              try {
                const candidate = ctx.i(id);
                if (
                  candidate &&
                  typeof candidate.z === 'function' &&
                  typeof candidate.L === 'function'
                ) {
                  mod = candidate;
                  modId = id;
                  break;
                }
              } catch (e) {}
            }
          }

          if (mod && typeof mod.z === 'function') {
            const origZ = mod.z;

            origZ(true);

            if (ctx.c && modId && ctx.c.has(modId)) {
              const entry = ctx.c.get(modId);
              const fakeExports = {
                z: function () {
                  origZ(true);
                },
                L: function () {
                  return { known: true, premium: true };
                }
              };
              entry.exports = fakeExports;
              entry.namespaceObject = fakeExports;
            }

            setInterval(() => {
              origZ(true);
            }, 800);

            window.dispatchEvent(new Event('resize'));
            document.dispatchEvent(new Event('visibilitychange'));

            hijacked = true;
            console.log('[Suikora AdShield] ¡Desbloqueo de capítulos y blindaje aplicado con éxito!');
            showToast('⚡ ¡Capítulos desbloqueados sin anuncios!');
          }
        }
      ]);

      window.TURBOPACK.push({
        otherChunks: [],
        runtimeModuleIds: [moduleId]
      });

      return hijacked;
    } catch (err) {
      console.error('[Suikora AdShield] Error en injectPremiumUnlock:', err);
      return false;
    }
  }

  function showToast(text) {
    if (document.getElementById('suikora-adshield-toast')) return;
    const toast = document.createElement('div');
    toast.id = 'suikora-adshield-toast';
    toast.style.cssText =
      'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:9999999;background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;padding:10px 20px;border-radius:24px;box-shadow:0 10px 25px rgba(0,0,0,0.5);font-family:system-ui,-apple-system,sans-serif;font-weight:700;font-size:13px;display:flex;align-items:center;gap:8px;pointer-events:none;transition:opacity 0.4s ease;width:max-content;max-width:90vw;text-align:center;';
    toast.textContent = text;
    (document.body || document.documentElement).appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  injectPremiumUnlock();
  const checkTimer = setInterval(() => {
    if (injectPremiumUnlock()) {
      clearInterval(checkTimer);
    }
  }, 200);

  setTimeout(() => clearInterval(checkTimer), 20000);
})();
