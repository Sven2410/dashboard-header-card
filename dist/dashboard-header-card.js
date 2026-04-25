/**
 * dashboard-header-card
 * A professional Home Assistant header card with clock, weather, greeting and forecast
 * Version: 1.0.0
 * Author: Sven2410
 */

const VERSION = '1.0.0';
console.info(
  `%c DASHBOARD-HEADER-CARD %c v${VERSION} `,
  'background:#026FA1;color:#fff;font-weight:bold;border-radius:3px 0 0 3px;padding:2px 6px;',
  'background:#000;color:#fff;font-weight:bold;border-radius:0 3px 3px 0;padding:2px 6px;'
);

// ─── CONSTANTS & HELPERS ─────────────────────────────────────────────────────

const DAYS_FULL_NL  = ['Zondag','Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag'];
const DAYS_SHORT_NL = ['Zo','Ma','Di','Wo','Do','Vr','Za'];
const MONTHS_NL     = ['januari','februari','maart','april','mei','juni',
                        'juli','augustus','september','oktober','november','december'];

const STATE_LABELS_NL = {
  sunny: 'Zonnig', 'clear-night': 'Helder', partlycloudy: 'Gedeeltelijk bewolkt',
  cloudy: 'Bewolkt', rainy: 'Regenachtig', pouring: 'Zware regen',
  snowy: 'Sneeuw', 'snowy-rainy': 'Sneeuwregen', windy: 'Winderig',
  'windy-variant': 'Winderig', fog: 'Mist', hail: 'Hagel',
  lightning: 'Onweer', 'lightning-rainy': 'Onweer met regen', exceptional: 'Uitzonderlijk'
};

const FORECAST_EMOJI = {
  sunny: '☀️', 'clear-night': '🌙', partlycloudy: '⛅', cloudy: '☁️',
  rainy: '🌧️', pouring: '🌧️', snowy: '❄️', 'snowy-rainy': '🌨️',
  windy: '💨', 'windy-variant': '💨', fog: '🌫️', hail: '🌨️',
  lightning: '⛈️', 'lightning-rainy': '⛈️', exceptional: '⚠️'
};

const EXTREME_CONDITIONS = new Set(['lightning','lightning-rainy','hail','pouring','snowy','exceptional']);

const WIND_DIRS = ['N','NO','O','ZO','Z','ZW','W','NW'];

function getGreeting(hour, name) {
  let g;
  if      (hour >= 6  && hour < 12) g = 'Goedemorgen';
  else if (hour >= 12 && hour < 18) g = 'Goedemiddag';
  else if (hour >= 18)               g = 'Goedenavond';
  else                               g = 'Goedenacht';
  return name ? `${g}, ${name}!` : `${g}!`;
}

function formatDate(d) {
  return `${DAYS_FULL_NL[d.getDay()]} ${d.getDate()} ${MONTHS_NL[d.getMonth()]} ${d.getFullYear()}`;
}

function formatHHMM(isoStr) {
  if (!isoStr) return '--:--';
  return new Date(isoStr).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
}

function windBearing(deg) {
  if (deg === undefined || deg === null) return '';
  return WIND_DIRS[Math.round(deg / 45) % 8];
}

function getTimeGradient(hour) {
  if (hour >= 5  && hour < 8)  return 'linear-gradient(135deg,rgba(255,140,60,.18) 0%,rgba(255,80,120,.10) 50%,rgba(80,130,255,.06) 100%)';
  if (hour >= 8  && hour < 12) return 'linear-gradient(135deg,rgba(80,180,255,.12) 0%,rgba(255,220,100,.08) 100%)';
  if (hour >= 12 && hour < 17) return 'linear-gradient(135deg,rgba(40,150,255,.10) 0%,rgba(100,210,255,.06) 100%)';
  if (hour >= 17 && hour < 20) return 'linear-gradient(135deg,rgba(255,100,50,.16) 0%,rgba(180,60,200,.12) 100%)';
  return 'linear-gradient(135deg,rgba(15,25,70,.22) 0%,rgba(50,15,90,.16) 100%)';
}

// ─── WEATHER SVG ANIMATIONS ──────────────────────────────────────────────────

const WEATHER_SVG = {

  sunny: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <style>
      .sun-c{animation:sp 3s ease-in-out infinite;transform-origin:40px 40px}
      .sun-r{animation:rr 12s linear infinite;transform-origin:40px 40px}
      @keyframes sp{0%,100%{transform:scale(1)}50%{transform:scale(1.10)}}
      @keyframes rr{to{transform:rotate(360deg)}}
    </style>
    <g class="sun-r">
      ${[0,45,90,135,180,225,270,315].map(a=>{
        const r=a*Math.PI/180,x1=40+22*Math.sin(r),y1=40-22*Math.cos(r),x2=40+31*Math.sin(r),y2=40-31*Math.cos(r);
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#FFD700" stroke-width="3.5" stroke-linecap="round"/>`;
      }).join('')}
    </g>
    <circle class="sun-c" cx="40" cy="40" r="16" fill="#FFD700"/>
  </svg>`,

  'clear-night': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <style>
      .moon{animation:mg 4s ease-in-out infinite}
      .star{animation:tw 2s ease-in-out infinite;transform-origin:center center}
      .s2{animation-delay:.7s}.s3{animation-delay:1.4s}.s4{animation-delay:.4s}
      @keyframes mg{0%,100%{opacity:1}50%{opacity:.75}}
      @keyframes tw{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.2;transform:scale(.4)}}
    </style>
    <path class="moon" d="M46 14 A22 22 0 1 0 46 66 A16 16 0 1 1 46 14Z" fill="#C8D8FF"/>
    <circle class="star s2" cx="16" cy="18" r="2.5" fill="white"/>
    <circle class="star s3" cx="62" cy="22" r="1.8" fill="white"/>
    <circle class="star s4" cx="67" cy="52" r="2"   fill="white"/>
    <circle class="star"    cx="58" cy="12" r="1.5" fill="white"/>
  </svg>`,

  partlycloudy: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <style>
      .pc-sun{animation:sp 3s ease-in-out infinite;transform-origin:27px 30px}
      .pc-cloud{animation:cf 4s ease-in-out infinite}
      @keyframes sp{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
      @keyframes cf{0%,100%{transform:translateX(0)}50%{transform:translateX(3px)}}
    </style>
    <circle class="pc-sun" cx="27" cy="30" r="14" fill="#FFD700"/>
    ${[0,45,90,135,180,225,270,315].map(a=>{
      const r=a*Math.PI/180,x1=27+16*Math.sin(r),y1=30-16*Math.cos(r),x2=27+22*Math.sin(r),y2=30-22*Math.cos(r);
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#FFD700" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>`;
    }).join('')}
    <g class="pc-cloud">
      <ellipse cx="50" cy="52" rx="22" ry="12" fill="white" opacity=".96"/>
      <circle cx="36" cy="48" r="11" fill="white" opacity=".96"/>
      <circle cx="53" cy="44" r="14" fill="white" opacity=".96"/>
    </g>
  </svg>`,

  cloudy: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <style>
      .c1{animation:cf 4.5s ease-in-out infinite}
      .c2{animation:cf 5.5s ease-in-out infinite reverse}
      @keyframes cf{0%,100%{transform:translateX(0)}50%{transform:translateX(4px)}}
    </style>
    <g class="c2" opacity=".45">
      <ellipse cx="34" cy="42" rx="18" ry="10" fill="#90A4AE"/>
      <circle cx="22" cy="38" r="9"  fill="#90A4AE"/>
      <circle cx="36" cy="34" r="11" fill="#90A4AE"/>
    </g>
    <g class="c1">
      <ellipse cx="48" cy="52" rx="23" ry="13" fill="#CFD8DC"/>
      <circle cx="33" cy="47" r="12" fill="#CFD8DC"/>
      <circle cx="51" cy="43" r="15" fill="#CFD8DC"/>
    </g>
  </svg>`,

  rainy: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <style>
      .rc{animation:cf 4s ease-in-out infinite}
      .dr{animation:rf 1.3s linear infinite}
      .dr:nth-child(3){animation-delay:.43s}
      .dr:nth-child(4){animation-delay:.86s}
      @keyframes cf{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
      @keyframes rf{0%{transform:translateY(0);opacity:1}100%{transform:translateY(22px);opacity:0}}
    </style>
    <g class="rc">
      <ellipse cx="42" cy="36" rx="23" ry="13" fill="#78909C"/>
      <circle cx="27" cy="31" r="12" fill="#78909C"/>
      <circle cx="44" cy="27" r="15" fill="#78909C"/>
    </g>
    <line class="dr" x1="27" y1="53" x2="23" y2="65" stroke="#64B5F6" stroke-width="2.5" stroke-linecap="round"/>
    <line class="dr" x1="41" y1="53" x2="37" y2="65" stroke="#64B5F6" stroke-width="2.5" stroke-linecap="round"/>
    <line class="dr" x1="55" y1="53" x2="51" y2="65" stroke="#64B5F6" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,

  pouring: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <style>
      .pc2{animation:shake .5s ease-in-out infinite alternate}
      .pd{animation:ph .8s linear infinite}
      .pd:nth-child(3){animation-delay:.16s}.pd:nth-child(4){animation-delay:.32s}
      .pd:nth-child(5){animation-delay:.48s}.pd:nth-child(6){animation-delay:.64s}
      @keyframes shake{0%{transform:translateX(-1px)}100%{transform:translateX(1px)}}
      @keyframes ph{0%{transform:translateY(0);opacity:1}100%{transform:translateY(22px);opacity:0}}
    </style>
    <g class="pc2">
      <ellipse cx="40" cy="32" rx="24" ry="13" fill="#546E7A"/>
      <circle cx="24" cy="28" r="12" fill="#546E7A"/>
      <circle cx="43" cy="24" r="15" fill="#546E7A"/>
    </g>
    <line class="pd" x1="20" y1="50" x2="16" y2="63" stroke="#1E88E5" stroke-width="2.5" stroke-linecap="round"/>
    <line class="pd" x1="31" y1="50" x2="27" y2="63" stroke="#1E88E5" stroke-width="2.5" stroke-linecap="round"/>
    <line class="pd" x1="42" y1="50" x2="38" y2="63" stroke="#1E88E5" stroke-width="2.5" stroke-linecap="round"/>
    <line class="pd" x1="53" y1="50" x2="49" y2="63" stroke="#1E88E5" stroke-width="2.5" stroke-linecap="round"/>
    <line class="pd" x1="63" y1="50" x2="59" y2="63" stroke="#1E88E5" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,

  snowy: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <style>
      .sc{animation:cf 4s ease-in-out infinite}
      .sf{animation:sf 2s linear infinite}
      .sf:nth-child(3){animation-delay:.67s}.sf:nth-child(4){animation-delay:1.33s}
      @keyframes cf{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
      @keyframes sf{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(22px) rotate(180deg);opacity:0}}
    </style>
    <g class="sc">
      <ellipse cx="40" cy="34" rx="23" ry="13" fill="#90A4AE"/>
      <circle cx="25" cy="30" r="12" fill="#90A4AE"/>
      <circle cx="43" cy="26" r="15" fill="#90A4AE"/>
    </g>
    <text class="sf" x="25" y="62" font-size="14" fill="#E3F2FD" text-anchor="middle">❄</text>
    <text class="sf" x="41" y="62" font-size="14" fill="#E3F2FD" text-anchor="middle">❄</text>
    <text class="sf" x="57" y="62" font-size="14" fill="#E3F2FD" text-anchor="middle">❄</text>
  </svg>`,

  'snowy-rainy': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <style>
      .src{animation:cf 4s ease-in-out infinite}
      .srd{animation:rf 1.5s linear infinite}
      .srf{animation:sf 2s linear infinite}
      .srd:nth-child(3){animation-delay:.5s}.srf:nth-child(5){animation-delay:1s}
      @keyframes cf{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
      @keyframes rf{0%{transform:translateY(0);opacity:1}100%{transform:translateY(20px);opacity:0}}
      @keyframes sf{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(20px) rotate(180deg);opacity:0}}
    </style>
    <g class="src">
      <ellipse cx="40" cy="33" rx="23" ry="13" fill="#78909C"/>
      <circle cx="25" cy="29" r="12" fill="#78909C"/>
      <circle cx="43" cy="25" r="15" fill="#78909C"/>
    </g>
    <line class="srd" x1="27" y1="50" x2="23" y2="62" stroke="#64B5F6" stroke-width="2.5" stroke-linecap="round"/>
    <line class="srd" x1="53" y1="50" x2="49" y2="62" stroke="#64B5F6" stroke-width="2.5" stroke-linecap="round"/>
    <text class="srf" x="41" y="63" font-size="14" fill="#E3F2FD" text-anchor="middle">❄</text>
  </svg>`,

  windy: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <style>
      .wl{animation:wb 2.2s ease-in-out infinite}
      .wl2{animation:wb 2.8s ease-in-out infinite;animation-delay:.4s}
      .wl3{animation:wb 3.2s ease-in-out infinite;animation-delay:.8s}
      @keyframes wb{0%{transform:translateX(-4px);opacity:0}40%{opacity:1}100%{transform:translateX(5px);opacity:0}}
    </style>
    <path class="wl"  d="M10 28 Q35 22 56 28 Q66 32 61 40 Q56 48 40 46" fill="none" stroke="#90A4AE" stroke-width="3.5" stroke-linecap="round"/>
    <path class="wl2" d="M10 42 Q30 36 52 42 Q60 46 56 52" fill="none" stroke="#90A4AE" stroke-width="3" stroke-linecap="round"/>
    <path class="wl3" d="M16 56 Q42 50 62 56" fill="none" stroke="#90A4AE" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,

  fog: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <style>
      .fl{animation:fd 3s ease-in-out infinite}
      .fl2{animation:fd 3.5s ease-in-out infinite;animation-delay:1s}
      .fl3{animation:fd 4s ease-in-out infinite;animation-delay:2s}
      @keyframes fd{0%,100%{transform:translateX(0);opacity:.35}50%{transform:translateX(7px);opacity:.7}}
    </style>
    <rect class="fl"  x="8"  y="24" width="64" height="7" rx="3.5" fill="#B0BEC5"/>
    <rect class="fl2" x="14" y="37" width="52" height="7" rx="3.5" fill="#B0BEC5"/>
    <rect class="fl3" x="8"  y="50" width="58" height="7" rx="3.5" fill="#B0BEC5"/>
  </svg>`,

  hail: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <style>
      .hc{animation:cf 3s ease-in-out infinite}
      .hs{animation:hf 1s linear infinite}
      .hs:nth-child(3){animation-delay:.33s}.hs:nth-child(4){animation-delay:.66s}
      @keyframes cf{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
      @keyframes hf{0%{transform:translateY(0);opacity:1}100%{transform:translateY(20px);opacity:0}}
    </style>
    <g class="hc">
      <ellipse cx="40" cy="33" rx="23" ry="13" fill="#607D8B"/>
      <circle cx="25" cy="29" r="12" fill="#607D8B"/>
      <circle cx="43" cy="25" r="15" fill="#607D8B"/>
    </g>
    <circle class="hs" cx="27" cy="53" r="5" fill="#B0BEC5" stroke="white" stroke-width="1.5"/>
    <circle class="hs" cx="41" cy="53" r="5" fill="#B0BEC5" stroke="white" stroke-width="1.5"/>
    <circle class="hs" cx="56" cy="53" r="5" fill="#B0BEC5" stroke="white" stroke-width="1.5"/>
  </svg>`,

  lightning: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <style>
      .lc{animation:ld .6s ease-in-out infinite alternate}
      .bolt{animation:lf 2s ease-in-out infinite}
      @keyframes ld{0%{fill:#37474F}100%{fill:#546E7A}}
      @keyframes lf{0%,88%,100%{opacity:0}90%,94%{opacity:1}92%{opacity:.2}}
    </style>
    <g class="lc">
      <ellipse cx="40" cy="31" rx="25" ry="14" fill="#37474F"/>
      <circle cx="23" cy="27" r="13" fill="#37474F"/>
      <circle cx="44" cy="23" r="16" fill="#37474F"/>
    </g>
    <polygon class="bolt" points="45,46 37,46 41,59 33,59 44,73 40,61 48,61" fill="#FFD600"/>
  </svg>`,

  'lightning-rainy': `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <style>
      .lrc{animation:ld .6s ease-in-out infinite alternate}
      .lrd{animation:rf 1.3s linear infinite}
      .lrd:nth-child(3){animation-delay:.43s}
      .lrbolt{animation:lf 2s ease-in-out infinite}
      @keyframes ld{0%{fill:#37474F}100%{fill:#546E7A}}
      @keyframes rf{0%{transform:translateY(0);opacity:1}100%{transform:translateY(16px);opacity:0}}
      @keyframes lf{0%,88%,100%{opacity:0}90%,94%{opacity:1}92%{opacity:.2}}
    </style>
    <g class="lrc">
      <ellipse cx="40" cy="28" rx="25" ry="13" fill="#37474F"/>
      <circle cx="23" cy="24" r="13" fill="#37474F"/>
      <circle cx="44" cy="20" r="16" fill="#37474F"/>
    </g>
    <line class="lrd" x1="22" y1="45" x2="18" y2="57" stroke="#64B5F6" stroke-width="2.5" stroke-linecap="round"/>
    <line class="lrd" x1="60" y1="45" x2="56" y2="57" stroke="#64B5F6" stroke-width="2.5" stroke-linecap="round"/>
    <polygon class="lrbolt" points="43,43 36,43 40,54 33,54 42,67 38,56 46,56" fill="#FFD600"/>
  </svg>`,

  exceptional: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <style>
      .exc{animation:ep 1.2s ease-in-out infinite;transform-origin:40px 40px}
      @keyframes ep{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.12);opacity:.7}}
    </style>
    <circle class="exc" cx="40" cy="40" r="28" fill="none" stroke="#FF7043" stroke-width="3"/>
    <text x="40" y="52" font-size="30" text-anchor="middle" fill="#FF7043" font-weight="bold">!</text>
  </svg>`
};

function getWeatherSVG(state) {
  if (WEATHER_SVG[state]) return WEATHER_SVG[state];
  if (state && state.includes('wind')) return WEATHER_SVG.windy;
  return WEATHER_SVG.cloudy;
}

// ─── CARD STYLES ─────────────────────────────────────────────────────────────

const CARD_CSS = `
  :host { display: block; width: 100%; }

  ha-card { padding: 0; overflow: hidden; position: relative; }

  .wrap {
    position: relative;
    padding: 20px 22px 18px;
    overflow: hidden;
  }

  .time-gradient {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    transition: background 3s ease;
  }

  .content { position: relative; z-index: 1; }

  /* ── TOP ROW ── */
  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 6px 12px;
    margin-bottom: 18px;
  }

  .greeting {
    font-size: clamp(1.25rem, 4vw, 1.65rem);
    font-weight: 700;
    color: var(--primary-text-color);
    line-height: 1.2;
    margin: 0;
  }

  .date-str {
    font-size: 0.82rem;
    color: var(--secondary-text-color);
    margin-top: 3px;
  }

  .clock {
    font-size: clamp(1.55rem, 5vw, 2.1rem);
    font-weight: 300;
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    letter-spacing: -1px;
    text-align: right;
  }

  /* ── WEATHER ROW ── */
  .weather-row {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    min-height: 44px;
    border-radius: 16px;
    padding: 4px 6px;
    transition: background .2s;
  }
  .weather-row:active { background: rgba(255,255,255,0.05); }

  .weather-icon-wrap {
    position: relative;
    width: 70px;
    height: 70px;
    flex-shrink: 0;
  }

  .weather-icon-svg { width: 100%; height: 100%; }

  .warn-badge {
    display: none;
    position: absolute;
    top: 2px;
    right: 2px;
    width: 14px;
    height: 14px;
    background: var(--error-color, #f44336);
    border-radius: 50%;
    animation: warn-pulse 1s ease-in-out infinite;
  }
  .warn-badge.show { display: block; }
  @keyframes warn-pulse {
    0%,100%{transform:scale(1);opacity:1}
    50%{transform:scale(1.4);opacity:0.5}
  }

  .weather-main { flex: 1; min-width: 0; }

  .temperature {
    font-size: clamp(1.8rem, 6vw, 2.5rem);
    font-weight: 700;
    color: var(--primary-text-color);
    line-height: 1;
  }

  .weather-desc {
    font-size: 0.82rem;
    color: var(--secondary-text-color);
    margin-top: 3px;
  }

  .stats {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
    margin-top: 10px;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 0.76rem;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }

  .stat-val {
    font-weight: 600;
    color: var(--primary-text-color);
    margin: 0 2px;
  }

  /* ── SUN BAR ── */
  .sun-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-size: 0.76rem;
    color: var(--secondary-text-color);
  }

  .sun-label {
    display: flex;
    align-items: center;
    gap: 3px;
    white-space: nowrap;
  }

  .sun-bar-track {
    flex: 1;
    height: 4px;
    background: var(--divider-color, rgba(128,128,128,0.25));
    border-radius: 2px;
    overflow: visible;
    position: relative;
  }

  .sun-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #FF9800, #FFD700);
    border-radius: 2px;
    position: relative;
    min-width: 0;
    transition: width 2s linear;
  }

  .sun-dot {
    position: absolute;
    right: -5px;
    top: 50%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    background: #FFD700;
    border-radius: 50%;
    box-shadow: 0 0 6px 2px rgba(255,213,0,.55);
    display: none;
  }

  /* ── DIVIDER ── */
  .divider {
    height: 1px;
    background: var(--divider-color, rgba(128,128,128,0.2));
    margin-bottom: 14px;
  }

  /* ── FORECAST ── */
  .forecast-row {
    display: flex;
    gap: 5px;
    overflow-x: auto;
    padding-bottom: 2px;
    scrollbar-width: none;
  }
  .forecast-row::-webkit-scrollbar { display: none; }

  .fc-day {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex: 1;
    min-width: 52px;
    padding: 8px 4px;
    border-radius: 12px;
    background: rgba(128,128,128,0.07);
  }

  .fc-name {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: var(--secondary-text-color);
  }

  .fc-icon { font-size: 1.35rem; line-height: 1; }

  .fc-temp-hi {
    font-weight: 700;
    font-size: 0.82rem;
    color: var(--primary-text-color);
  }

  .fc-temp-lo {
    font-size: 0.74rem;
    color: var(--secondary-text-color);
    margin-left: 3px;
  }

  .fc-precip {
    font-size: 0.67rem;
    font-weight: 600;
    color: #64B5F6;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 380px) {
    .wrap { padding: 16px 16px 14px; }
    .weather-icon-wrap { width: 58px; height: 58px; }
    .stats { gap: 5px 10px; }
    .fc-day { min-width: 44px; padding: 6px 2px; }
    .fc-icon { font-size: 1.1rem; }
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
    this._config = { weather: '', sun: 'sun.sun', person: '', ...c };
    if (this._ready) { const f = this.querySelector('ha-form'); if (f) f.data = this._data(); }
    else this._init();
  }

  _data() {
    return {
      weather: this._config.weather || '',
      sun:     this._config.sun     || 'sun.sun',
      person:  this._config.person  || '',
    };
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
      { name: 'weather', label: 'Weerstatie entiteit',          selector: { entity: { domain: 'weather' } } },
      { name: 'sun',     label: 'Zon entiteit (sun.sun)',        selector: { entity: { domain: 'sun' }     } },
      { name: 'person',  label: 'Persoon (voor begroeting)',     selector: { entity: { domain: 'person' }  } },
    ];
    form.data = this._data();
    form.addEventListener('value-changed', e => {
      const v = e.detail.value || {};
      let changed = false;
      for (const k of ['weather', 'sun', 'person']) {
        if (v[k] !== undefined && v[k] !== this._config[k]) {
          this._config[k] = v[k]; changed = true;
        }
      }
      if (changed) this._fire();
    });
  }
}

// ─── MAIN CARD ────────────────────────────────────────────────────────────────

class DashboardHeaderCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config        = {};
    this._hass          = null;
    this._domBuilt      = false;
    this._tickInterval  = null;
    this._forecastUnsub = null;
    this._forecast      = [];
    this._lastState     = null;
  }

  static getConfigElement() { return document.createElement('dashboard-header-card-editor'); }
  static getStubConfig()    { return { weather: '', sun: 'sun.sun', person: '' }; }

  setConfig(config) {
    this._config = { sun: 'sun.sun', ...config };
    if (this._hass) this._render();
  }

  set hass(hass) {
    const prevHass = this._hass;
    this._hass = hass;
    const wEntity = this._config.weather;
    if (wEntity) {
      const prevState = prevHass ? prevHass.states[wEntity] : null;
      const currState = hass.states[wEntity];
      if (currState && (!prevState || !this._forecastUnsub)) {
        this._subscribeForecast(wEntity);
      }
    }
    this._render();
  }

  connectedCallback()    { this._startTick(); }
  disconnectedCallback() {
    this._stopTick();
    if (this._forecastUnsub) { this._forecastUnsub(); this._forecastUnsub = null; }
  }

  _startTick() {
    if (this._tickInterval) return;
    this._tickInterval = setInterval(() => this._updateDOM(), 1000);
  }

  _stopTick() {
    if (this._tickInterval) { clearInterval(this._tickInterval); this._tickInterval = null; }
  }

  _subscribeForecast(entity) {
    if (!this._hass || !entity) return;
    if (this._forecastUnsub) { try { this._forecastUnsub(); } catch(_) {} this._forecastUnsub = null; }

    this._hass.connection.subscribeMessage(
      msg => {
        if (msg && msg.forecast) {
          this._forecast = msg.forecast;
          if (this._domBuilt) this._updateForecast();
        }
      },
      { type: 'weather/subscribe_forecast', forecast_type: 'daily', entity_id: entity }
    ).then(unsub => {
      this._forecastUnsub = unsub;
    }).catch(() => {
      // Fallback: use state attributes
      const st = this._hass && this._hass.states[entity];
      if (st && st.attributes.forecast) {
        this._forecast = st.attributes.forecast;
        if (this._domBuilt) this._updateForecast();
      }
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
        <div class="wrap">
          <div class="time-gradient" id="tg"></div>
          <div class="content">

            <!-- TOP ROW: greeting + clock -->
            <div class="top-row">
              <div>
                <div class="greeting"  id="greeting">Goedemorgen!</div>
                <div class="date-str"  id="date-str">...</div>
              </div>
              <div class="clock" id="clock">00:00</div>
            </div>

            <!-- WEATHER -->
            <div class="weather-row" id="weather-row">
              <div class="weather-icon-wrap">
                <div class="weather-icon-svg" id="wsvg"></div>
                <div class="warn-badge" id="warn"></div>
              </div>
              <div class="weather-main">
                <div class="temperature" id="temp">--°</div>
                <div class="weather-desc" id="wdesc">--</div>
                <div class="stats">
                  <div class="stat">💧 <span class="stat-val" id="humidity">--%</span> vochtigheid</div>
                  <div class="stat">💨 <span class="stat-val" id="wind">--</span> <span id="wdir"></span></div>
                  <div class="stat">☀️ UV <span class="stat-val" id="uv">--</span></div>
                  <div class="stat">🌧️ <span class="stat-val" id="precip">--%</span><span id="precip-mm"></span></div>
                </div>
              </div>
            </div>

            <!-- SUN PROGRESS -->
            <div class="sun-row">
              <div class="sun-label">🌅 <span id="sunrise">--:--</span></div>
              <div class="sun-bar-track">
                <div class="sun-bar-fill" id="sun-bar" style="width:0%">
                  <div class="sun-dot" id="sun-dot"></div>
                </div>
              </div>
              <div class="sun-label"><span id="sunset">--:--</span> 🌇</div>
            </div>

            <div class="divider"></div>

            <!-- FORECAST -->
            <div class="forecast-row" id="forecast-row">
              <div class="fc-day" style="justify-content:center;color:var(--secondary-text-color);font-size:.78rem;flex:1;">
                Voorspelling laden…
              </div>
            </div>

          </div>
        </div>
      </ha-card>
    `;

    // Scroll-aware tap helper
    const tap = (el, fn) => {
      if (!el) return;
      let sy = 0, sx = 0, fired = false;
      el.addEventListener('touchstart', e => {
        sy = e.touches[0].clientY; sx = e.touches[0].clientX; fired = false;
      }, { passive: true });
      el.addEventListener('touchend', e => {
        if (Math.abs(e.changedTouches[0].clientY - sy) > 8 ||
            Math.abs(e.changedTouches[0].clientX - sx) > 8) return;
        e.preventDefault(); fired = true; fn();
      }, { passive: false });
      el.addEventListener('click', () => { if (fired) { fired = false; return; } fn(); });
    };

    tap(sr.getElementById('weather-row'), () => {
      if (!this._config.weather || !this._hass) return;
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        detail: { entityId: this._config.weather }, bubbles: true, composed: true
      }));
    });
  }

  _updateDOM() {
    const sr = this.shadowRoot;
    if (!sr) return;
    const $ = id => sr.getElementById(id);

    const now  = new Date();
    const hour = now.getHours();

    // Clock (HH:MM only — seconds via CSS animation is enough for a header)
    const clockEl = $('clock');
    if (clockEl) {
      const hh = String(now.getHours()).padStart(2,'0');
      const mm = String(now.getMinutes()).padStart(2,'0');
      const ss = String(now.getSeconds()).padStart(2,'0');
      clockEl.textContent = `${hh}:${mm}:${ss}`;
    }

    // Date
    const dateEl = $('date-str');
    if (dateEl) dateEl.textContent = formatDate(now);

    // Time gradient
    const tg = $('tg');
    if (tg) tg.style.background = getTimeGradient(hour);

    // Greeting + person name
    const greetEl = $('greeting');
    if (greetEl) {
      let name = '';
      if (this._config.person && this._hass) {
        const ps = this._hass.states[this._config.person];
        if (ps) name = ps.attributes.friendly_name || '';
      }
      greetEl.textContent = getGreeting(hour, name);
    }

    // ── Weather ──────────────────────────────────────────
    const wEntity = this._config.weather;
    if (!wEntity || !this._hass) { this._updateForecast(); return; }
    const wState = this._hass.states[wEntity];
    if (!wState) { this._updateForecast(); return; }

    const attr  = wState.attributes;
    const state = wState.state;

    // SVG (only re-render when state changes)
    const svgEl = $('wsvg');
    if (svgEl && svgEl.dataset.state !== state) {
      svgEl.dataset.state = state;
      svgEl.innerHTML = getWeatherSVG(state);
    }

    // Warning badge
    const badge = $('warn');
    if (badge) badge.classList.toggle('show', EXTREME_CONDITIONS.has(state));

    // Temperature
    const tempEl = $('temp');
    if (tempEl) {
      const t = attr.temperature;
      const unit = attr.temperature_unit || '°C';
      tempEl.textContent = t !== undefined ? `${Math.round(t)}${unit.replace('°','').replace('C','').replace('F','')}°` : '--°';
    }

    // Description
    const descEl = $('wdesc');
    if (descEl) descEl.textContent = STATE_LABELS_NL[state] || state;

    // Humidity
    const humEl = $('humidity');
    if (humEl) humEl.textContent = attr.humidity !== undefined ? `${Math.round(attr.humidity)}%` : '--%';

    // Wind speed + direction
    const windEl = $('wind');
    if (windEl) {
      const ws   = attr.wind_speed;
      const unit = attr.wind_speed_unit || 'km/h';
      if (ws !== undefined) {
        // Convert m/s → km/h if needed
        const kmh = unit === 'm/s' ? Math.round(ws * 3.6) : Math.round(ws);
        windEl.textContent = `${kmh} km/h`;
      } else {
        windEl.textContent = '--';
      }
    }
    const wdirEl = $('wdir');
    if (wdirEl) wdirEl.textContent = windBearing(attr.wind_bearing);

    // UV index
    const uvEl = $('uv');
    if (uvEl) uvEl.textContent = attr.uv_index !== undefined ? attr.uv_index : '--';

    // Precipitation (prefer today's forecast entry, fallback to attrs)
    const todayFc = this._forecast && this._forecast[0];
    const precipEl = $('precip');
    if (precipEl) {
      const chance = todayFc?.precipitation_probability ?? attr.precipitation_probability;
      precipEl.textContent = chance !== undefined ? `${Math.round(chance)}%` : '--%';
    }
    const precipMmEl = $('precip-mm');
    if (precipMmEl) {
      const mm = todayFc?.precipitation ?? attr.precipitation;
      precipMmEl.textContent = mm !== undefined ? ` · ${mm} mm` : '';
    }

    // ── Sun bar ──────────────────────────────────────────
    const sunEntity = this._config.sun;
    if (sunEntity && this._hass) {
      const sunState = this._hass.states[sunEntity];
      if (sunState) {
        const sa = sunState.attributes;
        const isAbove = sunState.state === 'above_horizon';

        const nextRisingMs  = sa.next_rising  ? new Date(sa.next_rising).getTime()  : null;
        const nextSettingMs = sa.next_setting ? new Date(sa.next_setting).getTime() : null;

        // Derive today's sunrise/sunset
        let todaySunriseMs = nextRisingMs;
        let todaySunsetMs  = nextSettingMs;

        if (isAbove && nextRisingMs) {
          // next_rising is tomorrow → subtract 24h for today's approximate sunrise
          todaySunriseMs = nextRisingMs - 24 * 3600 * 1000;
          todaySunsetMs  = nextSettingMs;
        }

        const riseEl = $('sunrise');
        if (riseEl) riseEl.textContent = todaySunriseMs ? formatHHMM(new Date(todaySunriseMs).toISOString()) : '--:--';
        const setEl  = $('sunset');
        if (setEl)  setEl.textContent  = todaySunsetMs  ? formatHHMM(new Date(todaySunsetMs).toISOString())  : '--:--';

        // Progress bar
        const barEl = $('sun-bar');
        const dotEl = $('sun-dot');
        if (barEl && dotEl) {
          let prog = 0;
          if (isAbove && todaySunriseMs && todaySunsetMs) {
            const now2 = Date.now();
            prog = Math.max(0, Math.min(100, ((now2 - todaySunriseMs) / (todaySunsetMs - todaySunriseMs)) * 100));
          }
          barEl.style.width    = `${Math.round(prog)}%`;
          dotEl.style.display  = prog > 1 ? 'block' : 'none';
        }
      }
    }

    // Forecast
    this._updateForecast();
  }

  _updateForecast() {
    const sr = this.shadowRoot;
    if (!sr) return;
    const fcRow = sr.getElementById('forecast-row');
    if (!fcRow) return;

    let fc = this._forecast;
    if ((!fc || fc.length === 0) && this._config.weather && this._hass) {
      const ws = this._hass.states[this._config.weather];
      if (ws && ws.attributes.forecast) fc = ws.attributes.forecast;
    }

    if (!fc || fc.length === 0) {
      fcRow.innerHTML = `<div style="color:var(--secondary-text-color);font-size:.78rem;padding:6px 0;">Geen voorspelling beschikbaar</div>`;
      return;
    }

    const today = new Date().toDateString();
    const days  = fc.slice(0, 5);

    fcRow.innerHTML = days.map(day => {
      const d       = new Date(day.datetime);
      const dayName = d.toDateString() === today ? 'Vandaag' : DAYS_SHORT_NL[d.getDay()];
      const icon    = FORECAST_EMOJI[day.condition] || '🌤️';
      const hi      = day.temperature  !== undefined ? `${Math.round(day.temperature)}°`  : '-°';
      const lo      = day.templow      !== undefined ? `${Math.round(day.templow)}°`      : '';
      const chance  = day.precipitation_probability !== undefined
                        ? `${Math.round(day.precipitation_probability)}%` : '';
      const mm      = day.precipitation !== undefined ? ` · ${day.precipitation}mm` : '';

      return `<div class="fc-day">
        <div class="fc-name">${dayName}</div>
        <div class="fc-icon">${icon}</div>
        <div style="display:flex;align-items:baseline;">
          <span class="fc-temp-hi">${hi}</span>
          ${lo ? `<span class="fc-temp-lo">${lo}</span>` : ''}
        </div>
        ${chance ? `<div class="fc-precip">${chance}${mm}</div>` : ''}
      </div>`;
    }).join('');
  }
}

// ─── REGISTER ─────────────────────────────────────────────────────────────────

if (!customElements.get('dashboard-header-card-editor'))
  customElements.define('dashboard-header-card-editor', DashboardHeaderCardEditor);

if (!customElements.get('dashboard-header-card'))
  customElements.define('dashboard-header-card', DashboardHeaderCard);

window.customCards = window.customCards || [];
if (!window.customCards.find(c => c.type === 'dashboard-header-card')) {
  window.customCards.push({
    type:        'dashboard-header-card',
    name:        'Dashboard Header Kaart',
    description: 'Overzichtelijke header met klok, weer, begroeting en 5-daagse voorspelling',
    preview:     false,
  });
}
