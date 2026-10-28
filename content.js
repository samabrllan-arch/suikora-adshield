// Suikora AdShield & Permanent Chapter Unlocker
// Bloquea publicidad invasiva y desbloquea el reproductor en todos los capítulos de Suikora

(function () {
  'use strict';

  console.log('[Suikora AdShield] Cargado e inicializado.');

  // 1. Neutralizar popups y redirecciones agresivas
  const originalOpen = window.open;
  window.open = function (url) {
    if (
      typeof url === 'string' &&
      (url.includes('/api/go') ||
        url.includes('abscloud') ||
        url.includes('mamshirt') ||
        url.includes('bauval') ||
        url.includes('hai8g') ||
        url.includes('pleased-report') ||
        url.includes('nresystems'))
    ) {
      console.warn('[Suikora AdShield] Pestaña publicitaria bloqueada:', url);
      return null;
    }
    return originalOpen ? originalOpen.apply(this, arguments) : null;
  };

  // 2. Interceptar clicks para evitar secuestro de navegación por scripts publicitarios
  document.addEventListener(
    'click',
    function (e) {
      const target = e.target;
      if (!target) return;
      const link = target.closest('a');
      if (link && link.href) {
        if (
          link.href.includes('mamshirt.com') ||
          link.href.includes('bauval.org') ||
          link.href.includes('pleased-report.com') ||
          link.href.includes('abscloud.org')
        ) {
          e.preventDefault();
          e.stopPropagation();
          console.warn('[Suikora AdShield] Clic publicitario bloqueado:', link.href);
        }
      }
    },
    true
  );

  // 3. Ocultar y cerrar automáticamente cualquier diálogo de detección de adblock
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
  setInterval(hideAdblockDialog, 1000);

  // 4. Inyección en Turbopack para activar y fijar permanentemente el estado Premium
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
      'position:fixed;bottom:24px;right:24px;z-index:999999;background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;padding:12px 20px;border-radius:14px;box-shadow:0 12px 30px rgba(0,0,0,0.6);font-family:system-ui,-apple-system,sans-serif;font-weight:700;font-size:14px;display:flex;align-items:center;gap:10px;pointer-events:none;transition:opacity 0.4s ease;';
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
