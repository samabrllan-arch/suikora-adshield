// Suikora AdShield & Permanent Chapter Unlocker
// Repositorio: https://github.com/samabrllan-arch/suikora-adshield

(function () {
  'use strict';

  console.log('[Suikora AdShield] Extensión iniciada.');

  // 1. Blindaje total de window.open contra popunders y nuevas pestañas publicitarias
  const originalOpen = window.open;
  window.open = function (url) {
    // Permitir únicamente enlaces explícitos a WhatsApp o Telegram
    if (typeof url === 'string' && (url.includes('whatsapp.com') || url.includes('t.me'))) {
      return originalOpen.apply(this, arguments);
    }
    console.warn('[Suikora AdShield] Pestaña/Popunder publicitario neutralizado:', url);
    // Devolver objeto ventana simulado para evitar que el script publicitario falle si accede a .location
    return {
      document: { write: () => {} },
      location: { href: '', replace: () => {} },
      close: () => {},
      focus: () => {},
      blur: () => {}
    };
  };

  // 2. Bloquear enlaces dinámicos invisibles que los anuncios crean para simular clics
  const originalAnchorClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    const href = this.href || '';
    if (
      href &&
      !href.startsWith(window.location.origin) &&
      !href.includes('whatsapp.com') &&
      !href.includes('t.me')
    ) {
      console.warn('[Suikora AdShield] Intento de clic simulado bloqueado:', href);
      return;
    }
    return originalAnchorClick.apply(this, arguments);
  };

  // 3. Interceptar cualquier clic o toque en banners y enlaces externos _blank
  document.addEventListener(
    'click',
    function (e) {
      const link = e.target?.closest?.('a');
      if (link && link.href) {
        if (
          link.target === '_blank' &&
          !link.href.includes('whatsapp.com') &&
          !link.href.includes('t.me')
        ) {
          e.preventDefault();
          e.stopPropagation();
          console.warn('[Suikora AdShield] Clic en enlace emergente bloqueado:', link.href);
          return false;
        }
        if (
          link.href.includes('mamshirt.com') ||
          link.href.includes('bauval.org') ||
          link.href.includes('pleased-report.com') ||
          link.href.includes('abscloud.org') ||
          link.href.includes('hai8g.com')
        ) {
          e.preventDefault();
          e.stopPropagation();
          console.warn('[Suikora AdShield] Clic publicitario bloqueado:', link.href);
          return false;
        }
      }
    },
    true
  );

  // 4. Ocultar y cerrar automáticamente cualquier diálogo de detección de adblock
  const hideAdblockDialog = () => {
    const dialogs = document.querySelectorAll('dialog');
    dialogs.forEach((d) => {
      if (d.querySelector('#sk-nota-title') || d.innerText.includes('bloqueador de anuncios')) {
        d.close();
        d.remove();
        document.body.style.overflow = '';
      }
    });
  };
  setInterval(hideAdblockDialog, 600);

  // 5. Inyección nativa en Turbopack para activar y fijar permanentemente el estado Premium
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

          // Intentar ID conocido (33235)
          try {
            mod = ctx.i(33235);
            modId = 33235;
          } catch (e) {}

          // Si el ID cambió en una actualización, buscarlo dinámicamente
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

            // Activar premium inmediatamente
            origZ(true);

            // Secuestrar la caché del módulo para que NINGÚN componente (como SiteNav) lo regrese a false
            if (ctx.c && modId && ctx.c.has(modId)) {
              const entry = ctx.c.get(modId);
              const fakeExports = {
                z: function () {
                  origZ(true); // Siempre forzar true
                },
                L: function () {
                  return { known: true, premium: true };
                }
              };
              entry.exports = fakeExports;
              entry.namespaceObject = fakeExports;
            }

            // Refuerzo periódico por si React monta nuevos árboles
            setInterval(() => {
              origZ(true);
            }, 800);

            // Forzar actualización de React en la interfaz
            window.dispatchEvent(new Event('resize'));
            document.dispatchEvent(new Event('visibilitychange'));

            hijacked = true;
            console.log('[Suikora AdShield] ¡Desbloqueo permanente aplicado con éxito!');
            showToast('⚡ Capítulos desbloqueados sin anuncios');
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
      'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:9999999;background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;padding:10px 18px;border-radius:24px;box-shadow:0 10px 25px rgba(0,0,0,0.5);font-family:system-ui,-apple-system,sans-serif;font-weight:700;font-size:13px;display:flex;align-items:center;gap:8px;pointer-events:none;transition:opacity 0.4s ease;width:max-content;max-width:90vw;text-align:center;';
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // Intentar aplicar hasta que cargue Turbopack
  const checkTimer = setInterval(() => {
    if (injectPremiumUnlock()) {
      clearInterval(checkTimer);
    }
  }, 200);

  setTimeout(() => clearInterval(checkTimer), 20000);
})();
