/* ===========================================================
   T-Car Final — Interactive Orthographic Globe (slide 01)
   d3-geo orthographic projection + drag rotation + auto-spin
   =========================================================== */
(function () {
  const W = 880, H = 880;
  const CX = W / 2, CY = H / 2;
  const R = 360;
  const NS = 'http://www.w3.org/2000/svg';

  // Major markets — 2025E new passenger vehicle sales
  const MARKETS = {
    '156': { name: 'Китай',  lon: 104, lat: 35,  label: 'CN' },
    '840': { name: 'США',    lon: -98, lat: 39,  label: 'US' },
    '392': { name: 'Япония', lon: 138, lat: 36,  label: 'JP' },
    '643': { name: 'Россия', lon: 100, lat: 60,  label: 'RU', primary: true },
  };

  // EU + UK + EFTA cluster (ISO numeric)
  const EU_IDS = new Set([
    '040','056','100','191','196','203','208','233','246','250','276','300',
    '348','352','372','380','428','440','442','470','492','528','578','616',
    '620','642','688','703','705','724','752','756','826'
  ]);
  const EU_CENTER = { lon: 10, lat: 50, label: 'EU', name: 'Европа' };

  let rotation = [-80, -30, 0];
  let autoSpin = true;
  let lastFrame = null;
  let resumeTimer = null;
  let focusCountry = null;
  let focusTarget = null;

  const svg = document.getElementById('world-globe');
  if (!svg) return;

  // ----- d3 / topojson availability check -----
  if (typeof d3 === 'undefined' || typeof topojson === 'undefined') {
    console.warn('[globe] d3 / topojson not yet loaded');
    return;
  }

  const projection = d3.geoOrthographic()
    .scale(R)
    .translate([CX, CY])
    .clipAngle(90)
    .rotate(rotation);
  const path = d3.geoPath(projection);
  const graticule = d3.geoGraticule10();

  // ----- helpers -----
  function el(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  // ----- defs (gradients) -----
  const defs = el('defs');
  defs.innerHTML = `
    <radialGradient id="oceanGrad" cx="38%" cy="32%" r="80%">
      <stop offset="0%"  stop-color="#1d1913"/>
      <stop offset="55%" stop-color="#13110d"/>
      <stop offset="100%" stop-color="#080706"/>
    </radialGradient>
    <radialGradient id="rimGlow" cx="50%" cy="50%" r="50%">
      <stop offset="88%"  stop-color="oklch(0.80 0.13 68 / 0)"/>
      <stop offset="100%" stop-color="oklch(0.80 0.13 68 / 0.30)"/>
    </radialGradient>
    <radialGradient id="lightShade" cx="35%" cy="28%" r="78%">
      <stop offset="0%"   stop-color="rgba(255,255,255,0.08)"/>
      <stop offset="55%"  stop-color="rgba(255,255,255,0.00)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.55)"/>
    </radialGradient>
  `;
  svg.appendChild(defs);

  // ----- decorative outer rings -----
  const deco = el('g');
  deco.innerHTML = `
    <circle cx="${CX}" cy="${CY}" r="${R+28}" fill="none" stroke="#2a2620" stroke-width="1"/>
    <circle cx="${CX}" cy="${CY}" r="${R+50}" fill="none" stroke="#2a2620" stroke-width="1" stroke-dasharray="1 6"/>
    <circle cx="${CX}" cy="${CY}" r="${R+72}" fill="none" stroke="#1f1c17" stroke-width="1" stroke-dasharray="1 10"/>
  `;
  svg.appendChild(deco);

  // tick marks at cardinal points
  const ticks = el('g');
  ticks.innerHTML = `
    <line x1="${CX}" y1="${CY-R-78}" x2="${CX}" y2="${CY-R-66}" stroke="#7a7264" stroke-width="1"/>
    <line x1="${CX}" y1="${CY+R+66}" x2="${CX}" y2="${CY+R+78}" stroke="#7a7264" stroke-width="1"/>
    <line x1="${CX-R-78}" y1="${CY}" x2="${CX-R-66}" y2="${CY}" stroke="#7a7264" stroke-width="1"/>
    <line x1="${CX+R+66}" y1="${CY}" x2="${CX+R+78}" y2="${CY}" stroke="#7a7264" stroke-width="1"/>
    <text x="${CX}" y="${CY-R-90}" text-anchor="middle" fill="#7a7264"
      font-family="JetBrains Mono, monospace" font-size="12" letter-spacing="3">N</text>
    <text x="${CX}" y="${CY+R+98}" text-anchor="middle" fill="#7a7264"
      font-family="JetBrains Mono, monospace" font-size="12" letter-spacing="3">S</text>
    <text x="${CX-R-88}" y="${CY+4}" text-anchor="end" fill="#7a7264"
      font-family="JetBrains Mono, monospace" font-size="12" letter-spacing="3">W</text>
    <text x="${CX+R+88}" y="${CY+4}" fill="#7a7264"
      font-family="JetBrains Mono, monospace" font-size="12" letter-spacing="3">E</text>
  `;
  svg.appendChild(ticks);

  // ocean disk
  svg.appendChild(el('circle', {
    cx: CX, cy: CY, r: R, fill: 'url(#oceanGrad)',
    stroke: '#3a342b', 'stroke-width': 1
  }));

  // graticule path
  const gratiPath = el('path', {
    fill: 'none', stroke: '#26221c', 'stroke-width': 0.7
  });
  svg.appendChild(gratiPath);

  const countriesG = el('g');
  svg.appendChild(countriesG);

  // sphere lighting (above land, below pins)
  svg.appendChild(el('circle', {
    cx: CX, cy: CY, r: R, fill: 'url(#lightShade)', 'pointer-events': 'none'
  }));
  // amber rim
  svg.appendChild(el('circle', {
    cx: CX, cy: CY, r: R, fill: 'url(#rimGlow)', 'pointer-events': 'none'
  }));

  const markersG = el('g', { 'pointer-events': 'none' });
  svg.appendChild(markersG);

  let countriesData = null;

  // ----- render -----
  function render() {
    projection.rotate(rotation);
    gratiPath.setAttribute('d', path(graticule) || '');

    countriesG.innerHTML = '';
    markersG.innerHTML  = '';
    if (!countriesData) return;

    for (const feat of countriesData) {
      const d = path(feat);
      if (!d) continue;
      const id = String(feat.id);

      let fill = '#2a2620';
      let stroke = '#3a342b';
      let strokeWidth = 0.5;

      if (id === '643') {
        fill = 'oklch(0.55 0.14 58)';
        stroke = 'oklch(0.80 0.13 68)';
        strokeWidth = 1;
      } else if (id in MARKETS) {
        fill = 'oklch(0.40 0.09 55)';
        stroke = 'oklch(0.62 0.12 60)';
        strokeWidth = 0.7;
      } else if (EU_IDS.has(id)) {
        fill = 'oklch(0.40 0.09 55)';
        stroke = 'oklch(0.62 0.12 60)';
        strokeWidth = 0.6;
      }

      if (focusCountry === id || (focusCountry === 'eu' && EU_IDS.has(id))) {
        fill = 'oklch(0.78 0.16 65)';
        stroke = '#fff7e6';
        strokeWidth = 1.2;
      }

      const p = el('path', { d: d, fill: fill, stroke: stroke, 'stroke-width': strokeWidth });
      countriesG.appendChild(p);
    }

    // pins for major markets (only render if on visible side)
    const allPins = [
      ...Object.entries(MARKETS).map(([id, m]) => ({ id, ...m })),
      { id: 'eu', ...EU_CENTER }
    ];

    for (const pin of allPins) {
      const c = projection([pin.lon, pin.lat]);
      if (!c || Number.isNaN(c[0])) continue;
      // verify front side
      const dist = d3.geoDistance([pin.lon, pin.lat], [-rotation[0], -rotation[1]]);
      if (dist > Math.PI / 2 - 0.02) continue;

      const isPrimary = pin.primary;
      const isFocus = focusCountry === pin.id;
      const r = isPrimary ? 6.5 : (isFocus ? 6 : 3.5);
      const fill = (isPrimary || isFocus)
        ? 'oklch(0.82 0.14 68)'
        : 'oklch(0.65 0.10 60)';

      // outer ring
      markersG.appendChild(el('circle', {
        cx: c[0], cy: c[1], r: r + 6,
        fill: 'none', stroke: fill, 'stroke-width': 0.7, opacity: 0.45
      }));
      // dot
      markersG.appendChild(el('circle', {
        cx: c[0], cy: c[1], r: r, fill: fill
      }));

      // label if primary or focused
      if (isPrimary || isFocus) {
        // connector line out to label
        const lx = c[0] + 26;
        const ly = c[1] - 22;
        markersG.appendChild(el('line', {
          x1: c[0], y1: c[1], x2: lx - 4, y2: ly + 4,
          stroke: 'oklch(0.80 0.13 68)', 'stroke-width': 0.7,
          'stroke-dasharray': '2 3', opacity: 0.7
        }));
        const t = el('text', {
          x: lx, y: ly, fill: '#f0ebe1',
          'font-family': 'JetBrains Mono, monospace',
          'font-size': 13, 'letter-spacing': '2', 'font-weight': 500
        });
        t.textContent = pin.label;
        markersG.appendChild(t);

        const sub = el('text', {
          x: lx, y: ly + 14, fill: '#b8b0a0',
          'font-family': 'JetBrains Mono, monospace',
          'font-size': 10, 'letter-spacing': '1.5'
        });
        sub.textContent = pin.name.toUpperCase();
        markersG.appendChild(sub);
      }
    }
  }

  // ----- animation loop -----
  function tick(now) {
    if (lastFrame == null) lastFrame = now;
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;

    if (focusTarget) {
      const tlon = -focusTarget[0];
      const tlat = -focusTarget[1];
      // shortest angular path for longitude
      let dlon = tlon - rotation[0];
      while (dlon > 180) dlon -= 360;
      while (dlon < -180) dlon += 360;

      const lerp = 1 - Math.exp(-dt * 4);
      rotation[0] += dlon * lerp;
      rotation[1] += (tlat - rotation[1]) * lerp;
      render();

      if (Math.abs(dlon) < 0.3 && Math.abs(tlat - rotation[1]) < 0.3) {
        focusTarget = null;
      }
    } else if (autoSpin) {
      rotation[0] += dt * 5; // 5°/sec
      if (rotation[0] > 180) rotation[0] -= 360;
      render();
    }
    requestAnimationFrame(tick);
  }

  // ----- drag interaction -----
  let dragStart = null;
  svg.style.touchAction = 'none';
  svg.addEventListener('pointerdown', (e) => {
    dragStart = { x: e.clientX, y: e.clientY, rot: rotation.slice() };
    try { svg.setPointerCapture(e.pointerId); } catch (_) {}
    autoSpin = false;
    focusTarget = null;
    if (resumeTimer) { clearTimeout(resumeTimer); resumeTimer = null; }
  });
  svg.addEventListener('pointermove', (e) => {
    if (!dragStart) return;
    const rect = svg.getBoundingClientRect();
    const scale = rect.width / W;
    const dx = (e.clientX - dragStart.x) / scale;
    const dy = (e.clientY - dragStart.y) / scale;
    rotation[0] = dragStart.rot[0] + dx * 0.35;
    rotation[1] = Math.max(-80, Math.min(80, dragStart.rot[1] - dy * 0.35));
    render();
  });
  function endDrag(e) {
    if (!dragStart) return;
    dragStart = null;
    try { svg.releasePointerCapture(e.pointerId); } catch (_) {}
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { autoSpin = true; }, 5000);
  }
  svg.addEventListener('pointerup', endDrag);
  svg.addEventListener('pointercancel', endDrag);
  svg.addEventListener('pointerleave', endDrag);

  // ----- public API for hover sync -----
  window.__focusGlobe = function (cid, lon, lat) {
    focusCountry = cid;
    focusTarget = [lon, lat];
    autoSpin = false;
    if (resumeTimer) { clearTimeout(resumeTimer); resumeTimer = null; }
  };
  window.__unfocusGlobe = function () {
    focusCountry = null;
    focusTarget = null;
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { autoSpin = true; }, 1200);
    render();
  };

  // ----- load world atlas -----
  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    .then(r => r.json())
    .then(world => {
      countriesData = topojson.feature(world, world.objects.countries).features;
      render();
      requestAnimationFrame(tick);
    })
    .catch(err => {
      console.error('[globe] failed to load world atlas', err);
      // fallback — at least show the spinning empty sphere
      requestAnimationFrame(tick);
    });

  // ----- wire up market list hover -----
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.market').forEach(m => {
      const cid = m.dataset.cid;
      const lon = parseFloat(m.dataset.lon);
      const lat = parseFloat(m.dataset.lat);
      m.addEventListener('mouseenter', () => window.__focusGlobe(cid, lon, lat));
      m.addEventListener('mouseleave', () => window.__unfocusGlobe());
    });
  });
})();
