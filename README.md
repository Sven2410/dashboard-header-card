# Dashboard Header Card

A professional, fully animated Home Assistant Lovelace header card. Place it at the very top of your dashboard for a clean overview of time, weather, greeting, sun position and a 5-day forecast.

## Features

- **Live clock** — hours, minutes and seconds, updated every second
- **Full date** — Dutch day name, day, month and year
- **Personalised greeting** — Goedemorgen / Goedemiddag / Goedenavond / Goedenacht, with the friendly name of the selected `person` entity
- **Animated weather icon** — SVG animations for: sunny, clear-night, partly cloudy, cloudy, rainy, pouring, snowy, snowy-rainy, windy, fog, hail, lightning, lightning-rainy and exceptional
- **Weather stats** — temperature, humidity, UV index, wind speed (km/h + direction), precipitation probability and mm
- **Warning badge** — pulsing red dot on extreme conditions (lightning, hail, pouring, heavy snow)
- **Sunrise & sunset** — derived from `sun.sun`, with an animated progress bar showing where the sun currently is in the sky
- **Time-of-day gradient** — the card background subtly shifts colour from warm orange at dawn → clear blue midday → purple-red at sunset → deep indigo at night
- **5-day forecast** — scrollable row with emoji icon, high/low temperature and precipitation chance per day. Uses the `weather/subscribe_forecast` WebSocket API with a graceful fallback to state attributes
- **Tap to more-info** — tapping the weather block opens the standard Home Assistant detail dialog for the weather entity
- **Liquid Glass theme compatible** — no background or border-radius set on `ha-card`; lets your card-mod theme apply automatically

## Installation

### Via HACS (recommended)

1. Add this repository as a **Custom Repository** in HACS (type: *Lovelace*)
2. Install **Dashboard Header Card**
3. Clear browser cache and reload

### Manual

1. Copy `dist/dashboard-header-card.js` to `config/www/dashboard-header-card.js`
2. Add the resource in **Settings → Dashboards → Resources**:

```yaml
url: /local/dashboard-header-card.js
type: module
```

3. Clear browser cache and reload

## Configuration

Add the card via the UI card picker (search for *Dashboard Header*) or paste YAML manually:

```yaml
type: custom:dashboard-header-card
weather: weather.home          # required — your weather entity
sun: sun.sun                   # optional — defaults to sun.sun
person: person.sven            # optional — for personalised greeting
```

### Options

| Option    | Type   | Default   | Description                              |
|-----------|--------|-----------|------------------------------------------|
| `weather` | string | —         | Weather entity (domain `weather`)        |
| `sun`     | string | `sun.sun` | Sun entity for sunrise/sunset data       |
| `person`  | string | —         | Person entity; friendly_name used in greeting |

## Compatibility

- Home Assistant 2024.1+
- Works without HACS (manual install)
- No external libraries — pure vanilla JS + SVG animations
- Shadow DOM for style isolation
- Mobile & desktop responsive (minimum tap target 44px)

## Screenshots

*Place screenshots here after first install*

## License

MIT — © 2024 Sven2410
