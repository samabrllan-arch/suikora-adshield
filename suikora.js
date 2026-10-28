// Suikora AdShield & Permanent Chapter Unlocker
// Repositorio: https://github.com/samabrllan-arch/suikora-adshield

(function () {
  'use strict';

  console.log('[Suikora AdShield] Bookmarklet activo - Modo Seguro.');

  // 1. Estilos CSS no invasivos para neutralizar capas invisibles de anuncios
  const injectKillerCSS = () => {
    try {
      if (document.getElementById('sk-killer-css')) return;
      const style = document.createElement('style');
      style.id = 'sk-killer-css';
      style.textContent = `
        div[style*="2147483650"],
        div[style*="--rdata"],
        iframe[src*="abscloud"],
        iframe[src*="mamshirt"],
        iframe[src*="bauval"],
        iframe[src*="hai8g"],
        iframe[src*="pleased-report"] {
          display: none !important;
          pointer-events: none !important;
          visibility: hidden !important;
          width: 0 !important;
          height: 0 !important;
          opacity: 0 !important;
          z-index: -999999 !important;
        }
      `;
      const target = document.head || document.documentElement;
      if (target) {
        target.appendChild(style);
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          (document.head || document.documentElement).appendChild(style);
        });
      }
    } catch (e) {}
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
  window.open = function (url) {
    if (typeof url === 'string' && (url.includes('whatsapp.com') || url.includes('t.me'))) {
      return originalOpen ? originalOpen.apply(this, arguments) : dummyWindow;
    }
    console.warn('[Suikora AdShield] Ventana emergente publicitaria bloqueada:', url);
    return dummyWindow;
  };

  try {
    if (window.top && window.top !== window) window.top.open = window.open;
    if (window.parent && window.parent !== window) window.parent.open = window.open;
  } catch (e) {}

  // 3. Bloquear clics simulados mediante etiquetas <a> de publicidad
  const originalAnchorClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    const href = this.href || '';
    if (
      href &&
      !href.startsWith(window.location.origin) &&
      !href.startsWith('/') &&
      !href.startsWith('#') &&
      !href.includes('whatsapp.com') &&
      !href.includes('t.me')
    ) {
      console.warn('[Suikora AdShield] a.click() simulado bloqueado:', href);
      return;
    }
    return originalAnchorClick.apply(this, arguments);
  };

  // 4. Interceptar clics y toques publicitarios en fase de captura (sin tocar prototipos)
  const blockAdClick = function (e) {
    const target = e.target;
    if (!target) return;

    // Si el usuario toca la capa de popunder transparente
    const style = target.getAttribute ? (target.getAttribute('style') || '') : '';
    if (style.includes('2147483650') || style.includes('--rdata')) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      target.remove();
      console.warn('[Suikora AdShield] Toque en capa publicitaria bloqueado');
      return false;
    }

    // Si el clic es en un enlace que lleva a redes publicitarias
    const link = target.closest ? target.closest('a') : null;
    if (link && link.href) {
      const h = link.href;
      if (
        h.includes('abscloud.org') ||
        h.includes('pleased-report.com') ||
        h.includes('hai8g.com') ||
        h.includes('mamshirt.com') ||
        h.includes('bauval.org') ||
        h.includes('araplhn.org') ||
        h.includes('/api/go')
      ) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        link.remove();
        console.warn('[Suikora AdShield] Clic en red publicitaria bloqueado:', h);
        return false;
      }
    }
  };

  ['click', 'touchstart', 'touchend', 'pointerdown', 'mousedown'].forEach((evt) => {
    window.addEventListener(evt, blockAdClick, true);
  });

  // 5. Purga periódica y observación limpia de elementos publicitarios
  const purgeAds = () => {
    document.querySelectorAll(
      'div[style*="2147483650"], div[style*="--rdata"], iframe[src*="abscloud"], iframe[src*="mamshirt"], iframe[src*="bauval"], iframe[src*="hai8g"], script[src*="abscloud"], script[src*="mamshirt"], script[src*="bauval"], script[src*="hai8g"]'
    ).forEach((el) => {
      el.remove();
    });

    document.querySelectorAll('dialog').forEach((d) => {
      if (d.querySelector('#sk-nota-title') || d.innerText.includes('bloqueador de anuncios')) {
        d.close();
        d.remove();
        document.body.style.overflow = '';
      }
    });
  };

  purgeAds();
  setInterval(purgeAds, 500);

  try {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1) {
            const s = node.getAttribute ? (node.getAttribute('style') || '') : '';
            if (s.includes('2147483650') || s.includes('--rdata')) {
              node.remove();
            }
          }
        }
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}

  // 6. Inyección nativa en Turbopack para activar el estado Premium sin romper los Hooks de React
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

            // Activar premium en el estado nativo de Suikora
            origZ(true);

            // Proteger mod.z para que cualquier llamada forzada con false siempre permanezca en true
            mod.z = function () {
              return origZ(true);
            };

            // Refuerzo periódico nativo
            setInterval(() => {
              origZ(true);
            }, 1000);

            // Forzar actualización de React en la interfaz
            window.dispatchEvent(new Event('resize'));
            document.dispatchEvent(new Event('visibilitychange'));

            hijacked = true;
            console.log('[Suikora AdShield] ¡Desbloqueo permanente aplicado con éxito!');
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

  // Notificación visual en pantalla
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
