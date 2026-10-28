# Suikora AdShield & Permanent Chapter Unlocker

Herramienta diseñada para ver dramas en Suikora sin ventanas emergentes agresivas ni bloqueos de publicidad.

---

## Opción 1: Bookmarklet (1 Clic, sin instalar extensiones)

Puedes usarlo en cualquier navegador (Chrome, Edge, Brave, Firefox, etc.) simplemente creando un marcador:

1. Muestra tu barra de marcadores en el navegador (`Ctrl + Shift + B`).
2. Haz clic derecho en la barra de marcadores y selecciona **"Añadir página"** o **"Añadir marcador"**.
3. Ponle de nombre: `⚡ Desbloquear Suikora`.
4. En el campo **URL**, pega el siguiente código:

```javascript
javascript:(function(){const o=window.open;window.open=function(u){if(typeof u=='string'&&(u.includes('/api/go')||u.includes('abscloud')||u.includes('mamshirt')||u.includes('bauval')||u.includes('hai8g')||u.includes('pleased-report')||u.includes('nresystems')))return null;return o?o.apply(this,arguments):null};function u(){if(!window.TURBOPACK)return!1;let s=!1,m=98e4+Math.floor(1e4*Math.random());window.TURBOPACK.push([{getAttribute:()=>'/_next/b.js'},m,function(c){let mod=null,id=null;try{mod=c.i(33235);id=33235}catch(e){}if((!mod||!mod.z)&&c.M)for(let k of c.M.keys())try{let x=c.i(k);if(x&&x.z&&x.L){mod=x;id=k;break}}catch(e){}if(mod&&mod.z){let z=mod.z;z(!0);if(c.c&&id&&c.c.has(id)){let e=c.c.get(id),f={z:()=>z(!0),L:()=>({known:!0,premium:!0})};e.exports=f;e.namespaceObject=f}setInterval(()=>z(!0),800);window.dispatchEvent(new Event('resize'));document.dispatchEvent(new Event('visibilitychange'));s=!0;let t=document.createElement('div');t.style.cssText='position:fixed;bottom:24px;right:24px;z-index:999999;background:#10b981;color:#fff;padding:12px 20px;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.5);font-family:sans-serif;font-weight:bold;font-size:14px;';t.innerText='⚡ ¡Capítulos desbloqueados sin anuncios!';document.body.appendChild(t);setTimeout(()=>t.remove(),3500)}}]);window.TURBOPACK.push({otherChunks:[],runtimeModuleIds:[m]});return s}let a=0,i=setInterval(()=>{a++;if(u()||a>20)clearInterval(i)},200);})();
```

5. Guarda el marcador.
6. Entra a Suikora y haz clic en el marcador. Si estabas en la pantalla de "espera 3 segundos", recarga la página (`F5`) y pulsa el marcador.

---

## Opción 2: Extensión completa de Navegador (Automática)

Esta carpeta ya contiene la extensión lista para usar en modo desarrollador:

1. Abre tu navegador basado en Chromium (Google Chrome, Microsoft Edge, Brave, Opera).
2. Ve a la página de extensiones:
   - En Chrome / Brave: escribe `chrome://extensions/` en la barra de direcciones.
   - En Edge: escribe `edge://extensions/`.
3. Activa la casilla **"Modo de desarrollador"** (Developer mode) en la esquina superior derecha.
4. Si ya la tenías cargada, haz clic en el botón de recargar (el icono de la flecha circular) de la extensión. Si no, haz clic en **"Cargar descomprimida"** y selecciona:
   `c:\Users\samab\OneDrive\Documentos\Series\suikora-adshield`
5. Recarga la página del drama en Suikora (`F5`) y verás cómo todos los capítulos se reproducen solos.
