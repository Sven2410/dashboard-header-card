/**
 * dashboard-header-card  v1.4.1
 * Compacte transparante header — Sven2410
 */

const VERSION = '1.4.1';
console.info(
  `%c DASHBOARD-HEADER-CARD %c v${VERSION} `,
  'background:#026FA1;color:#fff;font-weight:bold;border-radius:3px 0 0 3px;padding:2px 6px;',
  'background:#000;color:#fff;font-weight:bold;border-radius:0 3px 3px 0;padding:2px 6px;'
);

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const DAYS_FULL_NL = ['Zondag','Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag'];
const MONTHS_NL    = ['januari','februari','maart','april','mei','juni',
                       'juli','augustus','september','oktober','november','december'];

const STATE_LABELS_NL = {
  sunny:'Zonnig','clear-night':'Helder',partlycloudy:'Gedeeltelijk bewolkt',
  cloudy:'Bewolkt',rainy:'Regenachtig',pouring:'Zware regen',
  snowy:'Sneeuw','snowy-rainy':'Sneeuwregen',windy:'Winderig',
  'windy-variant':'Winderig',fog:'Mist',hail:'Hagel',
  lightning:'Onweer','lightning-rainy':'Onweer met regen',exceptional:'Uitzonderlijk'
};

const EXTREME   = new Set(['lightning','lightning-rainy','hail','pouring','snowy','exceptional']);
const WIND_DIRS = ['N','NO','O','ZO','Z','ZW','W','NW'];

function getGreeting(h, name) {
  const g = h>=6&&h<12?'Goedemorgen':h>=12&&h<18?'Goedemiddag':h>=18?'Goedenavond':'Goedenacht';
  return name ? `${g}, ${name}!` : `${g}!`;
}
function formatDate(d) {
  return `${DAYS_FULL_NL[d.getDay()]} ${d.getDate()} ${MONTHS_NL[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtHM(iso) {
  if (!iso) return '--:--';
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function windDir(deg) {
  if (deg === undefined || deg === null) return '';
  return ' ' + WIND_DIRS[Math.round(deg / 45) % 8];
}
function nextSunEvent(attr) {
  const r = attr.next_rising  ? new Date(attr.next_rising).getTime()  : null;
  const s = attr.next_setting ? new Date(attr.next_setting).getTime() : null;
  if (!r && !s) return { icon:'🌅', time:'--:--' };
  if (!s || (r && r < s)) return { icon:'🌅', time: fmtHM(attr.next_rising)  };
  return                         { icon:'🌇', time: fmtHM(attr.next_setting) };
}

// ─── WEATHER SVG ─────────────────────────────────────────────────────────────

const SVG = {
  sunny:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <style>.sc{animation:sp 3s ease-in-out infinite;transform-origin:30px 30px}.sr{animation:rr 12s linear infinite;transform-origin:30px 30px}@keyframes sp{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}@keyframes rr{to{transform:rotate(360deg)}}</style>
    <g class="sr">${[0,45,90,135,180,225,270,315].map(a=>{const r=a*Math.PI/180,x1=(30+16*Math.sin(r)).toFixed(1),y1=(30-16*Math.cos(r)).toFixed(1),x2=(30+23*Math.sin(r)).toFixed(1),y2=(30-23*Math.cos(r)).toFixed(1);return`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--primary-text-color)" stroke-width="2.5" stroke-linecap="round" opacity=".65"/>`;}).join('')}</g>
    <circle class="sc" cx="30" cy="30" r="11" fill="var(--primary-text-color)" opacity=".8"/>
  </svg>`,

  'clear-night':`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <style>.mn{animation:mg 4s ease-in-out infinite}.st{animation:tw 2s ease-in-out infinite}.s2{animation-delay:.7s}.s3{animation-delay:1.4s}.s4{animation-delay:.3s}@keyframes mg{0%,100%{opacity:.85}50%{opacity:.5}}@keyframes tw{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.1;transform:scale(.3)}}</style>
    <path class="mn" d="M35 10 A17 17 0 1 0 35 50 A12 12 0 1 1 35 10Z" fill="var(--primary-text-color)" opacity=".75"/>
    <circle class="st s2" cx="12" cy="14" r="2"   fill="var(--primary-text-color)" opacity=".5"/>
    <circle class="st s3" cx="48" cy="18" r="1.5" fill="var(--primary-text-color)" opacity=".5"/>
    <circle class="st s4" cx="50" cy="40" r="1.8" fill="var(--primary-text-color)" opacity=".5"/>
  </svg>`,

  partlycloudy:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <style>.ps{animation:sp 3s ease-in-out infinite;transform-origin:20px 24px}.pc{animation:cf 4s ease-in-out infinite}@keyframes sp{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}@keyframes cf{0%,100%{transform:translateX(0)}50%{transform:translateX(2px)}}</style>
    <circle class="ps" cx="20" cy="24" r="11" fill="var(--primary-text-color)" opacity=".45"/>
    ${[0,45,90,135,180,225,270,315].map(a=>{const r=a*Math.PI/180,x1=(20+12*Math.sin(r)).toFixed(1),y1=(24-12*Math.cos(r)).toFixed(1),x2=(20+17*Math.sin(r)).toFixed(1),y2=(24-17*Math.cos(r)).toFixed(1);return`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--primary-text-color)" stroke-width="2" stroke-linecap="round" opacity=".3"/>`;}).join('')}
    <g class="pc" opacity=".55"><ellipse cx="38" cy="40" rx="17" ry="9" fill="var(--secondary-text-color)"/><circle cx="26" cy="37" r="8" fill="var(--secondary-text-color)"/><circle cx="40" cy="34" r="11" fill="var(--secondary-text-color)"/></g>
  </svg>`,

  cloudy:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <style>.c1{animation:cf 4.5s ease-in-out infinite}.c2{animation:cf 5.5s ease-in-out infinite reverse}@keyframes cf{0%,100%{transform:translateX(0)}50%{transform:translateX(3px)}}</style>
    <g class="c2" opacity=".28"><ellipse cx="26" cy="35" rx="14" ry="8" fill="var(--secondary-text-color)"/><circle cx="16" cy="31" r="7" fill="var(--secondary-text-color)"/><circle cx="28" cy="28" r="9" fill="var(--secondary-text-color)"/></g>
    <g class="c1" opacity=".58"><ellipse cx="36" cy="41" rx="18" ry="10" fill="var(--secondary-text-color)"/><circle cx="24" cy="37" r="9" fill="var(--secondary-text-color)"/><circle cx="38" cy="34" r="12" fill="var(--secondary-text-color)"/></g>
  </svg>`,

  rainy:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <style>.rc{animation:cf 4s ease-in-out infinite}.dr{animation:rf 1.3s linear infinite}.dr:nth-child(3){animation-delay:.43s}.dr:nth-child(4){animation-delay:.86s}@keyframes cf{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}@keyframes rf{0%{opacity:.7}100%{transform:translateY(16px);opacity:0}}</style>
    <g class="rc" opacity=".55"><ellipse cx="32" cy="28" rx="18" ry="10" fill="var(--secondary-text-color)"/><circle cx="20" cy="24" r="9" fill="var(--secondary-text-color)"/><circle cx="33" cy="21" r="12" fill="var(--secondary-text-color)"/></g>
    <line class="dr" x1="20" y1="41" x2="17" y2="50" stroke="var(--primary-text-color)" stroke-width="2" stroke-linecap="round" opacity=".5"/>
    <line class="dr" x1="31" y1="41" x2="28" y2="50" stroke="var(--primary-text-color)" stroke-width="2" stroke-linecap="round" opacity=".5"/>
    <line class="dr" x1="42" y1="41" x2="39" y2="50" stroke="var(--primary-text-color)" stroke-width="2" stroke-linecap="round" opacity=".5"/>
  </svg>`,

  pouring:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <style>.pc2{animation:sk .5s ease-in-out infinite alternate}.pd{animation:ph .8s linear infinite}.pd:nth-child(3){animation-delay:.16s}.pd:nth-child(4){animation-delay:.32s}.pd:nth-child(5){animation-delay:.48s}.pd:nth-child(6){animation-delay:.64s}@keyframes sk{0%{transform:translateX(-.8px)}100%{transform:translateX(.8px)}}@keyframes ph{0%{opacity:.7}100%{transform:translateY(16px);opacity:0}}</style>
    <g class="pc2" opacity=".6"><ellipse cx="30" cy="25" rx="19" ry="11" fill="var(--secondary-text-color)"/><circle cx="17" cy="21" r="9" fill="var(--secondary-text-color)"/><circle cx="32" cy="18" r="12" fill="var(--secondary-text-color)"/></g>
    <line class="pd" x1="14" y1="39" x2="11" y2="49" stroke="var(--primary-text-color)" stroke-width="2" stroke-linecap="round" opacity=".5"/>
    <line class="pd" x1="23" y1="39" x2="20" y2="49" stroke="var(--primary-text-color)" stroke-width="2" stroke-linecap="round" opacity=".5"/>
    <line class="pd" x1="32" y1="39" x2="29" y2="49" stroke="var(--primary-text-color)" stroke-width="2" stroke-linecap="round" opacity=".5"/>
    <line class="pd" x1="41" y1="39" x2="38" y2="49" stroke="var(--primary-text-color)" stroke-width="2" stroke-linecap="round" opacity=".5"/>
    <line class="pd" x1="50" y1="39" x2="47" y2="49" stroke="var(--primary-text-color)" stroke-width="2" stroke-linecap="round" opacity=".5"/>
  </svg>`,

  snowy:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <style>.sc2{animation:cf 4s ease-in-out infinite}.sf{animation:sf 2s linear infinite}.sf:nth-child(3){animation-delay:.67s}.sf:nth-child(4){animation-delay:1.33s}@keyframes cf{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}@keyframes sf{0%{opacity:.75}100%{transform:translateY(16px) rotate(180deg);opacity:0}}</style>
    <g class="sc2" opacity=".5"><ellipse cx="30" cy="27" rx="18" ry="10" fill="var(--secondary-text-color)"/><circle cx="18" cy="23" r="9" fill="var(--secondary-text-color)"/><circle cx="32" cy="20" r="12" fill="var(--secondary-text-color)"/></g>
    <text class="sf" x="18" y="49" font-size="11" fill="var(--primary-text-color)" text-anchor="middle" opacity=".65">❄</text>
    <text class="sf" x="30" y="49" font-size="11" fill="var(--primary-text-color)" text-anchor="middle" opacity=".65">❄</text>
    <text class="sf" x="43" y="49" font-size="11" fill="var(--primary-text-color)" text-anchor="middle" opacity=".65">❄</text>
  </svg>`,

  'snowy-rainy':`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <style>.src{animation:cf 4s ease-in-out infinite}.srd{animation:rf 1.5s linear infinite}.srf{animation:sf 2s linear infinite}.srd:nth-child(3){animation-delay:.5s}.srf:nth-child(5){animation-delay:1s}@keyframes cf{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}@keyframes rf{0%{opacity:.65}100%{transform:translateY(15px);opacity:0}}@keyframes sf{0%{opacity:.65}100%{transform:translateY(15px) rotate(180deg);opacity:0}}</style>
    <g class="src" opacity=".5"><ellipse cx="30" cy="26" rx="18" ry="10" fill="var(--secondary-text-color)"/><circle cx="18" cy="22" r="9" fill="var(--secondary-text-color)"/><circle cx="32" cy="19" r="12" fill="var(--secondary-text-color)"/></g>
    <line class="srd" x1="19" y1="39" x2="16" y2="48" stroke="var(--primary-text-color)" stroke-width="2" stroke-linecap="round" opacity=".5"/>
    <line class="srd" x1="41" y1="39" x2="38" y2="48" stroke="var(--primary-text-color)" stroke-width="2" stroke-linecap="round" opacity=".5"/>
    <text class="srf" x="30" y="50" font-size="11" fill="var(--primary-text-color)" text-anchor="middle" opacity=".65">❄</text>
  </svg>`,

  windy:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <style>.wl{animation:wb 2.2s ease-in-out infinite}.wl2{animation:wb 2.8s ease-in-out infinite;animation-delay:.4s}.wl3{animation:wb 3.2s ease-in-out infinite;animation-delay:.8s}@keyframes wb{0%{transform:translateX(-3px);opacity:0}40%{opacity:.65}100%{transform:translateX(4px);opacity:0}}</style>
    <path class="wl"  d="M7 21 Q27 17 42 21 Q50 24 47 30 Q43 36 30 34" fill="none" stroke="var(--secondary-text-color)" stroke-width="2.8" stroke-linecap="round"/>
    <path class="wl2" d="M7 32 Q23 27 40 32 Q46 35 43 40" fill="none" stroke="var(--secondary-text-color)" stroke-width="2.3" stroke-linecap="round"/>
    <path class="wl3" d="M11 43 Q32 38 48 43" fill="none" stroke="var(--secondary-text-color)" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  fog:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <style>.fl{animation:fd 3s ease-in-out infinite}.fl2{animation:fd 3.5s ease-in-out infinite;animation-delay:1s}.fl3{animation:fd 4s ease-in-out infinite;animation-delay:2s}@keyframes fd{0%,100%{transform:translateX(0);opacity:.22}50%{transform:translateX(5px);opacity:.5}}</style>
    <rect class="fl"  x="5"  y="18" width="50" height="6" rx="3" fill="var(--secondary-text-color)"/>
    <rect class="fl2" x="10" y="29" width="42" height="6" rx="3" fill="var(--secondary-text-color)"/>
    <rect class="fl3" x="5"  y="40" width="46" height="6" rx="3" fill="var(--secondary-text-color)"/>
  </svg>`,

  hail:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <style>.hc{animation:cf 3s ease-in-out infinite}.hs{animation:hf 1s linear infinite}.hs:nth-child(3){animation-delay:.33s}.hs:nth-child(4){animation-delay:.66s}@keyframes cf{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}@keyframes hf{0%{opacity:.75}100%{transform:translateY(15px);opacity:0}}</style>
    <g class="hc" opacity=".5"><ellipse cx="30" cy="26" rx="18" ry="10" fill="var(--secondary-text-color)"/><circle cx="18" cy="22" r="9" fill="var(--secondary-text-color)"/><circle cx="32" cy="19" r="12" fill="var(--secondary-text-color)"/></g>
    <circle class="hs" cx="19" cy="41" r="4" fill="var(--secondary-text-color)" stroke="var(--primary-text-color)" stroke-width="1.2" opacity=".65"/>
    <circle class="hs" cx="30" cy="41" r="4" fill="var(--secondary-text-color)" stroke="var(--primary-text-color)" stroke-width="1.2" opacity=".65"/>
    <circle class="hs" cx="42" cy="41" r="4" fill="var(--secondary-text-color)" stroke="var(--primary-text-color)" stroke-width="1.2" opacity=".65"/>
  </svg>`,

  lightning:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <style>.lc{animation:ld .6s ease-in-out infinite alternate}.bolt{animation:lf 2s ease-in-out infinite}@keyframes ld{0%{opacity:.42}100%{opacity:.62}}@keyframes lf{0%,87%,100%{opacity:0}89%,93%{opacity:1}91%{opacity:.12}}</style>
    <g class="lc"><ellipse cx="30" cy="24" rx="20" ry="11" fill="var(--secondary-text-color)"/><circle cx="17" cy="20" r="10" fill="var(--secondary-text-color)"/><circle cx="33" cy="17" r="13" fill="var(--secondary-text-color)"/></g>
    <polygon class="bolt" points="34,36 28,36 31,46 25,46 33,57 30,47 37,47" fill="var(--primary-text-color)"/>
  </svg>`,

  'lightning-rainy':`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <style>.lrc{animation:ld .6s ease-in-out infinite alternate}.lrd{animation:rf 1.3s linear infinite}.lrd:nth-child(3){animation-delay:.43s}.lrbolt{animation:lf 2s ease-in-out infinite}@keyframes ld{0%{opacity:.42}100%{opacity:.62}}@keyframes rf{0%{opacity:.55}100%{transform:translateY(14px);opacity:0}}@keyframes lf{0%,87%,100%{opacity:0}89%,93%{opacity:1}91%{opacity:.12}}</style>
    <g class="lrc"><ellipse cx="30" cy="22" rx="20" ry="11" fill="var(--secondary-text-color)"/><circle cx="17" cy="18" r="10" fill="var(--secondary-text-color)"/><circle cx="33" cy="15" r="13" fill="var(--secondary-text-color)"/></g>
    <line class="lrd" x1="15" y1="36" x2="12" y2="45" stroke="var(--primary-text-color)" stroke-width="2" stroke-linecap="round" opacity=".45"/>
    <line class="lrd" x1="47" y1="36" x2="44" y2="45" stroke="var(--primary-text-color)" stroke-width="2" stroke-linecap="round" opacity=".45"/>
    <polygon class="lrbolt" points="33,34 27,34 30,43 24,43 32,54 29,44 36,44" fill="var(--primary-text-color)"/>
  </svg>`,

  exceptional:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <style>.exc{animation:ep 1.2s ease-in-out infinite;transform-origin:30px 30px}@keyframes ep{0%,100%{transform:scale(1);opacity:.75}50%{transform:scale(1.12);opacity:.35}}</style>
    <circle class="exc" cx="30" cy="30" r="22" fill="none" stroke="var(--primary-text-color)" stroke-width="2.5"/>
    <text x="30" y="40" font-size="24" text-anchor="middle" fill="var(--primary-text-color)" font-weight="bold" opacity=".75">!</text>
  </svg>`
};

function getWeatherSVG(state) {
  if (SVG[state]) return SVG[state];
  if (state && state.includes('wind')) return SVG.windy;
  return SVG.cloudy;
}

// ─── CSS ─────────────────────────────────────────────────────────────────────

const CARD_CSS = `
  :host { display: block; width: 100%; }

  ha-card {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  .card-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: 10px 18px;
  }

  .left-col {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex-shrink: 0;
  }

  .greeting {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--primary-text-color);
    line-height: 1.2;
    white-space: nowrap;
  }

  .time-date {
    display: flex;
    align-items: center;
    gap: 7px;
    line-height: 1;
  }

  .clock {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.2px;
    white-space: nowrap;
  }

  .td-sep {
    display: inline-block;
    width: 1px;
    height: 11px;
    background: var(--divider-color, rgba(128,128,128,0.4));
    flex-shrink: 0;
  }

  .date-str {
    font-size: 0.70rem;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }

  .right-col {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    min-width: 0;
    padding-left: 0;
  }

  .weather-block {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    min-height: 44px;
    padding: 0 6px 0 2px;
    border-radius: 8px;
    transition: background .18s;
    flex-shrink: 0;
  }
  .weather-block:active { background: rgba(128,128,128,0.08); }

  .weather-icon-wrap {
    position: relative;
    width: 34px;
    height: 34px;
    flex-shrink: 0;
  }

  .warn-badge {
    display: none;
    position: absolute;
    top: 0; right: 0;
    width: 8px; height: 8px;
    background: var(--error-color, #e53935);
    border-radius: 50%;
    animation: warn-pulse 1s ease-in-out infinite;
  }
  .warn-badge.show { display: block; }
  @keyframes warn-pulse {
    0%,100%{transform:scale(1);opacity:1}
    50%{transform:scale(1.5);opacity:.3}
  }

  .temperature {
    font-size: 1.05rem;
    font-weight: 800;
    color: var(--primary-text-color);
    line-height: 1;
    white-space: nowrap;
  }
  .wdesc {
    font-size: 0.60rem;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }

  .vdiv {
    width: 1px;
    height: 22px;
    background: var(--divider-color, rgba(128,128,128,0.25));
    flex-shrink: 0;
  }

  .stats {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: nowrap;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 0.70rem;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }

  .si { font-size: 1.0rem; line-height: 1; }

  .sv {
    font-weight: 700;
    color: var(--primary-text-color);
  }

  @media (max-width: 480px) {
    .card-inner { padding: 8px 12px; gap: 10px; }
    .stats      { gap: 7px; }
    .wdesc      { display: none; }
  }
`;

// ─── EDITOR ──────────────────────────────────────────────────────────────────

class DashboardHeaderCardEditor extends HTMLElement {
  constructor() { super(); this._config = {}; this._hass = null; this._ready = false; }

  set hass(h) {
    this._hass = h;
    if (this._ready) { const f = this.querySelector('ha-form'); if (f) f.hass = h; }
    else this._init();
  }

  setConfig(c) {
    this._config = { weather:'', sun:'sun.sun', person:'', ...c };
    if (this._ready) { const f = this.querySelector('ha-form'); if (f) f.data = this._data(); }
    else this._init();
  }

  _data() {
    return { weather: this._config.weather||'', sun: this._config.sun||'sun.sun', person: this._config.person||'' };
  }

  _fire() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { ...this._config } }, bubbles: true, composed: true
    }));
  }

  _init() {
    if (!this._hass || this._ready) return;
    this._ready = true;
    this.innerHTML = `<ha-form></ha-form>`;
    const form = this.querySelector('ha-form');
    form.hass   = this._hass;
    form.schema = [
      { name:'weather', label:'Weerstatie entiteit',      selector:{ entity:{ domain:'weather' } } },
      { name:'sun',     label:'Zon entiteit (sun.sun)',    selector:{ entity:{ domain:'sun'     } } },
      { name:'person',  label:'Persoon (voor begroeting)', selector:{ entity:{ domain:'person'  } } },
    ];
    form.data = this._data();
    form.addEventListener('value-changed', e => {
      const v = e.detail.value || {};
      let changed = false;
      for (const k of ['weather','sun','person']) {
        if (v[k] !== undefined && v[k] !== this._config[k]) { this._config[k] = v[k]; changed = true; }
      }
      if (changed) this._fire();
    });
  }
}

// ─── MAIN CARD ────────────────────────────────────────────────────────────────

class DashboardHeaderCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode:'open' });
    this._config = {}; this._hass = null; this._domBuilt = false;
    this._tickInterval = null; this._forecastUnsub = null; this._forecast = [];
  }

  static getConfigElement() { return document.createElement('dashboard-header-card-editor'); }
  static getStubConfig()    { return { weather:'', sun:'sun.sun', person:'' }; }

  setConfig(config) {
    this._config = { sun:'sun.sun', ...config };
    if (this._hass) this._render();
  }

  set hass(hass) {
    const prev = this._hass;
    this._hass = hass;
    const we = this._config.weather;
    if (we && hass.states[we] && (!prev || !this._forecastUnsub)) this._subscribeForecast(we);
    this._render();
  }

  connectedCallback()    { this._startTick(); }
  disconnectedCallback() {
    this._stopTick();
    if (this._forecastUnsub) { try { this._forecastUnsub(); } catch(_){} this._forecastUnsub = null; }
  }

  _startTick() {
    if (this._tickInterval) return;
    this._tickInterval = setInterval(() => this._updateDOM(), 60000);
  }
  _stopTick() {
    if (this._tickInterval) { clearInterval(this._tickInterval); this._tickInterval = null; }
  }

  _subscribeForecast(entity) {
    if (!this._hass || !entity) return;
    if (this._forecastUnsub) { try { this._forecastUnsub(); } catch(_){} this._forecastUnsub = null; }
    this._hass.connection.subscribeMessage(
      msg => { if (msg?.forecast) this._forecast = msg.forecast; },
      { type:'weather/subscribe_forecast', forecast_type:'daily', entity_id:entity }
    ).then(u => { this._forecastUnsub = u; }).catch(() => {
      const st = this._hass?.states[entity];
      if (st?.attributes.forecast) this._forecast = st.attributes.forecast;
    });
  }

  _render() {
    if (!this._domBuilt) { this._buildDOM(); this._domBuilt = true; }
    this._updateDOM();
  }

  _buildDOM() {
    const sr = this.shadowRoot;
    sr.innerHTML = `
      <style>${CARD_CSS}</style>
      <ha-card>
        <div class="card-inner">

          <div class="left-col">
            <div class="greeting" id="greeting">Goedemorgen!</div>
            <div class="time-date">
              <span class="clock"    id="clock">00:00</span>
              <span class="td-sep"></span>
              <span class="date-str" id="date-str">...</span>
            </div>
          </div>

          <div class="right-col">

            <div class="weather-block" id="weather-block">
              <div class="weather-icon-wrap">
                <div id="wsvg" style="width:100%;height:100%"></div>
                <div class="warn-badge" id="warn"></div>
              </div>
              <div>
                <div class="temperature" id="temp">--°</div>
                <div class="wdesc"       id="wdesc">--</div>
              </div>
            </div>

            <div class="vdiv"></div>

            <div class="stats">
              <div class="stat"><span class="si">💧</span><span class="sv" id="humidity">--%</span></div>
              <div class="stat"><span class="si">💨</span><span class="sv" id="wind">--</span><span id="wdir"></span></div>
              <div class="stat"><span class="si">🔆</span>UV&nbsp;<span class="sv" id="uv">--</span></div>
              <div class="stat"><span class="si">🌧️</span><span class="sv" id="precip-mm">--</span></div>
              <div class="stat"><span class="si" id="sun-icon">🌅</span><span class="sv" id="sun-time">--:--</span></div>
            </div>

          </div>
        </div>
      </ha-card>
    `;

    const tap = (el, fn) => {
      if (!el) return;
      let sy=0, sx=0, fired=false;
      el.addEventListener('touchstart', e=>{sy=e.touches[0].clientY;sx=e.touches[0].clientX;fired=false;},{passive:true});
      el.addEventListener('touchend', e=>{
        if(Math.abs(e.changedTouches[0].clientY-sy)>8||Math.abs(e.changedTouches[0].clientX-sx)>8) return;
        e.preventDefault();fired=true;fn();
      },{passive:false});
      el.addEventListener('click',()=>{if(fired){fired=false;return;}fn();});
    };

    tap(sr.getElementById('weather-block'), () => {
      if (!this._config.weather || !this._hass) return;
      this.dispatchEvent(new CustomEvent('hass-more-info',{
        detail:{entityId:this._config.weather},bubbles:true,composed:true
      }));
    });
  }

  _updateDOM() {
    const sr = this.shadowRoot;
    if (!sr) return;
    const $ = id => sr.getElementById(id);

    const now  = new Date();
    const hour = now.getHours();

    const cl = $('clock');
    if (cl) cl.textContent = `${String(hour).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    const de = $('date-str');
    if (de) de.textContent = formatDate(now);

    const ge = $('greeting');
    if (ge) {
      let name = '';
      if (this._config.person && this._hass) {
        const ps = this._hass.states[this._config.person];
        if (ps) name = ps.attributes.friendly_name || '';
      }
      ge.textContent = getGreeting(hour, name);
    }

    const we = this._config.weather;
    if (!we || !this._hass) return;
    const ws = this._hass.states[we];
    if (!ws) return;

    const attr  = ws.attributes;
    const state = ws.state;

    const svgEl = $('wsvg');
    if (svgEl && svgEl.dataset.state !== state) {
      svgEl.dataset.state = state;
      svgEl.innerHTML = getWeatherSVG(state);
    }

    const badge = $('warn');
    if (badge) badge.classList.toggle('show', EXTREME.has(state));

    const te = $('temp');
    if (te) te.textContent = attr.temperature !== undefined ? `${Math.round(attr.temperature)}°` : '--°';
    const wd = $('wdesc');
    if (wd) wd.textContent = STATE_LABELS_NL[state] || state;

    const he = $('humidity');
    if (he) he.textContent = attr.humidity !== undefined ? `${Math.round(attr.humidity)}%` : '--%';

    const wie = $('wind');
    if (wie) {
      const sp = attr.wind_speed, ut = attr.wind_speed_unit || 'km/h';
      wie.textContent = sp !== undefined ? `${ut==='m/s'?Math.round(sp*3.6):Math.round(sp)} km/h` : '--';
    }
    const wde = $('wdir');
    if (wde) wde.textContent = windDir(attr.wind_bearing);

    const uve = $('uv');
    if (uve) uve.textContent = attr.uv_index !== undefined ? attr.uv_index : '--';

    const todayFc = this._forecast?.[0];
    const pme = $('precip-mm');
    if (pme) {
      const mm = todayFc?.precipitation ?? attr.precipitation;
      pme.textContent = mm !== undefined ? `${mm}mm` : '--';
    }

    const sunEnt = this._config.sun;
    if (sunEnt && this._hass) {
      const ss = this._hass.states[sunEnt];
      if (ss) {
        const ev = nextSunEvent(ss.attributes);
        const si = $('sun-icon'); if (si) si.textContent = ev.icon;
        const st = $('sun-time'); if (st) st.textContent = ev.time;
      }
    }
  }
}

// ─── REGISTRATIE ─────────────────────────────────────────────────────────────

if (!customElements.get('dashboard-header-card-editor'))
  customElements.define('dashboard-header-card-editor', DashboardHeaderCardEditor);

if (!customElements.get('dashboard-header-card'))
  customElements.define('dashboard-header-card', DashboardHeaderCard);

window.customCards = window.customCards || [];
if (!window.customCards.find(c => c.type === 'dashboard-header-card')) {
  window.customCards.push({
    type:        'dashboard-header-card',
    name:        'Dashboard Header Kaart',
    description: 'Compacte transparante header — klok · datum · weer · stats',
    preview:     false,
  });
}
