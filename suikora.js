// Suikora AdShield & Universal Chapter Unlocker
// Repositorio: https://github.com/samabrllan-arch/suikora-adshield

(function () {
  'use strict';

  console.log('[Suikora AdShield] Iniciando desbloqueador universal...');

  // 1. Bloquear ventanas emergentes y publicidad agresiva
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
      console.warn('[Suikora AdShield] Ventana emergente bloqueada:', url);
      return null;
    }
    return originalOpen ? originalOpen.apply(this, arguments) : null;
  };

  // 2. Interceptar clics en banners publicitarios no deseados
  document.addEventListener(
    'click',
    function (e) {
      const link = e.target?.closest?.('a');
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

  // 3. Eliminar cualquier aviso de detección de adblock
  const removeAdblockWarning = () => {
    document.querySelectorAll('dialog').forEach((d) => {
      if (d.querySelector('#sk-nota-title') || d.innerText.includes('bloqueador de anuncios')) {
        d.close();
        d.remove();
        document.body.style.overflow = '';
      }
    });
  };
  setInterval(removeAdblockWarning, 800);

  // 4. Intentar también el desbloqueo nativo en Turbopack (por si la app lo acepta)
  try {
    if (window.TURBOPACK) {
      const mId = 987600 + Math.floor(Math.random() * 1000);
      window.TURBOPACK.push([
        { getAttribute: () => '/_next/adshield.js' },
        mId,
        function (c) {
          let mod = null, id = null;
          try { mod = c.i(33235); id = 33235; } catch (e) {}
          if ((!mod || !mod.z) && c.M) {
            for (const k of c.M.keys()) {
              try {
                const x = c.i(k);
                if (x && x.z && x.L) { mod = x; id = k; break; }
              } catch (e) {}
            }
          }
          if (mod && mod.z) {
            const z = mod.z;
            z(true);
            if (c.c && id && c.c.has(id)) {
              const entry = c.c.get(id);
              entry.exports = { z: () => z(true), L: () => ({ known: true, premium: true }) };
              entry.namespaceObject = entry.exports;
            }
          }
        }
      ]);
      window.TURBOPACK.push({ otherChunks: [], runtimeModuleIds: [mId] });
    }
  } catch (e) {}

  // 5. Extracción directa de los hashes de TODOS los capítulos (1 al 25)
  function getEpisodesMap() {
    const map = {};
    const html = document.documentElement.innerHTML;
    // Buscar pares de número de capítulo y hash del servidor
    const regex = /"number":(\d+)[^}]*?"hash":"([A-Za-z0-9_-]+)"/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      map[parseInt(match[1], 10)] = match[2];
    }
    return map;
  }

  // 6. Carga de HLS.js si el navegador no soporta HLS nativo
  let hlsScriptLoaded = false;
  function ensureHls(cb) {
    if (window.Hls || hlsScriptLoaded) {
      if (window.Hls) cb();
      else setTimeout(() => ensureHls(cb), 100);
      return;
    }
    hlsScriptLoaded = true;
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    s.onload = () => cb();
    document.head.appendChild(s);
  }

  // 7. Reemplazar cualquier cartel de bloqueo por el reproductor real
  let unlockedCount = 0;

  function unlockAllSections() {
    const epMap = getEpisodesMap();
    if (Object.keys(epMap).length === 0) return;

    // Buscar todas las secciones que tengan el formulario de bloqueo
    const unlockElements = document.querySelectorAll('section[aria-labelledby^="unlock-"]');
    unlockElements.forEach((box) => {
      const idAttr = box.getAttribute('aria-labelledby') || '';
      const match = idAttr.match(/unlock-\d+-(\d+)/);
      if (!match) return;

      const epNum = parseInt(match[1], 10);
      const epHash = epMap[epNum];
      if (!epHash) return;

      const streamUrl = `/s/${epHash}/index.m3u8?full=1`;

      // Encontrar el contenedor del capítulo (la sección principal)
      const container = box.closest('section[aria-label*="Capítulo"]') || box.parentElement;
      if (!container) return;

      console.log(`[Suikora AdShield] Desbloqueando Capítulo ${epNum} con stream: ${streamUrl}`);

      // Crear el reproductor de vídeo
      const playerWrapper = document.createElement('div');
      playerWrapper.className = 'relative size-full overflow-hidden bg-black flex flex-col items-center justify-center';
      playerWrapper.style.cssText = 'position:relative;width:100%;height:100%;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;';

      const video = document.createElement('video');
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.style.cssText = 'width:100%;height:100%;object-fit:contain;background:#000;';

      // Añadir etiqueta de capítulo en la esquina
      const badge = document.createElement('div');
      badge.style.cssText = 'position:absolute;top:12px;left:12px;z-index:20;background:rgba(0,0,0,0.7);color:#fff;padding:4px 10px;border-radius:12px;font-size:12px;font-weight:bold;backdrop-filter:blur(4px);';
      badge.textContent = `Capítulo ${epNum} (Desbloqueado)`;

      playerWrapper.appendChild(badge);
      playerWrapper.appendChild(video);

      // Reproducción según soporte del navegador
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // iOS Safari y navegadores con HLS nativo
        video.src = streamUrl;
        video.load();
        video.play().catch(() => {});
      } else {
        // Android / PC Desktop usando Hls.js
        ensureHls(() => {
          if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
              video.play().catch(() => {});
            });
          }
        });
      }

      // Reemplazar el contenedor bloqueado por el reproductor
      container.innerHTML = '';
      container.appendChild(playerWrapper);
      unlockedCount++;
    });

    if (unlockedCount > 0) {
      showToast('⚡ Capítulos desbloqueados sin anuncios');
    }
  }

  // Notificación visual flotante
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

  // Ejecución inmediata
  unlockAllSections();

  // Revisión periódica y al hacer scroll / swipe
  setInterval(unlockAllSections, 800);
  window.addEventListener('scroll', unlockAllSections, { passive: true });
})();
