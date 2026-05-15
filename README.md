# TAPE: Live Markets Terminal

> [!IMPORTANT]
> **Heads up on regional access.** TAPE streams live data directly from Binance's public WebSocket and REST endpoints. Binance restricts traffic from certain regions, so the live feed may not work everywhere. If the connection stays stuck on **reconnecting** or **offline** in your area, the API is being blocked at the network layer, not by the app. Use a VPN and refresh, or switch the data source to **Synthetic** in Settings to demo the UI with a generated feed.

A production-styled real-time crypto markets dashboard built for **HNG Stage 5A**. TAPE streams live ticker, kline, and trade data from Binance over WebSockets, renders it with ECharts on a frame budget, and ships with a polished trading-terminal UX (command palette, watchlists, dark/light themes, pause/resume, offline indicators).

## Stack

- **Framework:** Vue 3 (`<script setup>` + Composition API) + TypeScript
- **Build:** Vite 8
- **State:** Pinia (`shallowRef`-based stores for cheap diffs)
- **Routing:** vue-router (lazy-loaded views)
- **Charts:** ECharts 6 via `vue-echarts` (tree-shaken registration)
- **Styling:** Tailwind v4 + design tokens (CSS vars) + scoped component styles
- **Validation:** Zod (every inbound WS frame is schema-checked)
- **Utilities:** `@vueuse/core`
- **Lint/Format:** ESLint (flat config) + oxlint + Prettier
- **Package manager:** pnpm

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # type-check + production build
pnpm preview      # serve the built bundle
pnpm lint         # oxlint --fix && eslint --fix --cache
pnpm format       # prettier --write src/
```

Requires Node `^20.19.0 || >=22.12.0`.

## Routes

| Path                  | View                | Purpose                                  |
| --------------------- | ------------------- | ---------------------------------------- |
| `/`                   | `LandingView`       | Marketing landing page                   |
| `/dashboard`          | `OverviewView`      | Metric cards, sparklines, top movers     |
| `/markets/:symbol`    | `MarketDetailView`  | Price/volume/candlestick + trade feed    |
| `/activity`           | `ActivityView`      | Global live trade/event feed             |
| `/settings`           | `SettingsView`      | Data source, theme, watchlist controls   |
| `*` (catch-all)       | `NotFoundView`      | On-brand 404 page                        |

## Architecture

```
src/
├── App.vue, main.ts
├── router/                 lazy-loaded routes + dynamic <title>
├── views/                  one component per route
├── components/
│   ├── cards/              MetricCard, Sparkline, AnimatedNumber
│   ├── charts/             PriceChart, VolumeBarChart, CandlestickChart
│   ├── controls/           PauseResume, ThemeToggle, StatusPill, SegmentedControl
│   ├── feed/               ActivityFeed, ActivityRow
│   ├── overlays/           CommandPalette, SymbolPicker, MarketSwitcher, Modal
│   ├── layout/             AppShell, TopBar, SideRail, TickerTape, MobileDrawer
│   ├── landing/            HeroPreview
│   └── feedback/           Skeleton, EmptyState
├── composables/            useStream, useChartData, useRafBatch, usePause,
│                           useWatchlist, useTheme, useDataSource, useDensity,
│                           useFocusedSymbol, useHeartbeat, useOverlays,
│                           useMobileDrawer, useRecentSymbols
├── stores/                 streamStore, marketStore, klineStore,
│                           symbolsStore, activityStore
├── services/stream/        BaseClient, BinanceClient, BinanceRest,
│                           MockClient, StreamService, schema.ts (Zod)
├── charts/                 echartsBootstrap.ts (tree-shaken)
├── types/                  Domain models (Ticker, Candle, Trade, PricePoint)
├── utils/                  format.ts
└── mocks/                  fixtures.ts (synthetic generator)
```

The app is layered: **services** own the network transport, **stores** are the single source of truth for normalized market data, **composables** wrap reactive lifecycle/UX concerns, and **components** are dumb consumers of stores.

## Data streaming

### Live mode (default): Binance public market data

- **WebSocket:** `wss://stream.binance.com:9443/stream?streams=...`. `BinanceClient` builds a combined stream URL per watchlist symbol, subscribing to `@ticker`, `@kline_1m`, and `@trade` channels.
- **REST seed:** `BinanceRest` hits `/api/v3/ticker/24hr` and `/api/v3/klines` to backfill 240 minutes of history before the WS catches up, so charts are never empty on first paint.
- **Schema validation:** Every inbound frame goes through `schema.ts` (Zod). Malformed frames are counted in `droppedMsgs` and silently discarded, so the UI never crashes on bad input.
- **Reconnect:** Exponential backoff with a 30s cap (`BaseClient.backoffMs`). After 4 failed attempts the stream is marked `offline`. A 5s heartbeat watchdog force-closes the socket if no frames arrive for 45s (e.g. dropped connection or sleeping laptop) and triggers reconnect. Visibility-hidden tabs are exempt from the watchdog to avoid spurious reconnects.

### Synthetic mode (opt-in)

A `MockClient` generates a realistic-looking ticker/kline/trade feed from `mocks/fixtures.ts`. **Synthetic is never an automatic fallback when live fails.** It's a deliberate user choice in Settings, so demos and offline review stay clearly labeled.

## State management

Five Pinia stores, each scoped to one concern:

| Store            | Holds                                                  |
| ---------------- | ------------------------------------------------------ |
| `streamStore`    | Connection state, attempt count, latency, msgs/sec     |
| `marketStore`    | Tickers, sparkline series (cap 600), recent trades     |
| `klineStore`     | Candle history per symbol/interval                     |
| `symbolsStore`   | Universe of tradable symbols + metadata                |
| `activityStore`  | Global activity feed (ring-buffered, newest first)     |

Stores use `shallowRef` for dictionaries and replace references on update (`{ ...prev, [key]: next }`) rather than mutating nested objects. This makes Vue's reactivity O(1) per write regardless of how many symbols are tracked, and keeps ECharts' shallow change detection happy.

Series and trade arrays are **bounded** (`SERIES_CAP = 600`, `TRADES_CAP = 80`). The price-series writer also throttles to one point per ~800ms to keep the sparkline smooth without spawning thousands of points on a hot symbol.

## Rendering performance

Real-time dashboards live or die on frame budget. TAPE applies several layers:

1. **RAF coalescing.** `createRafBatch` (in `useRafBatch.ts`) buffers every inbound WS event and flushes them in a single `requestAnimationFrame`. Multiple ticker/kline/trade updates arriving in the same 16ms window collapse into one store write and one Vue render pass. Without this, hot symbols (BTC, ETH) would trigger 50+ re-renders per second.
2. **Shallow reactivity.** Stores use `shallowRef` + reference replacement. Vue only re-renders subscribers; it doesn't deep-walk the dictionary.
3. **Tree-shaken ECharts.** `charts/echartsBootstrap.ts` registers only the components we use (`LineChart`, `BarChart`, `CandlestickChart`, axis + tooltip + dataZoom). The chart bundle is a fraction of full ECharts.
4. **Notify, don't replace.** Chart components use `useChartData` to push incremental updates via the ECharts instance API rather than re-rendering the entire option tree.
5. **Visibility-aware streaming.** Hidden tabs don't trigger the stale-frame watchdog; the WS stays open but the UI work pauses naturally.
6. **Lazy routes + code splitting.** Every view is `() => import(...)` so first paint isn't blocked by the candlestick chart on `/markets/:symbol`.
7. **Pause-aware drain.** When the user pauses (Space bar or button), the RAF drain function returns early; frames keep arriving (so latency/heartbeat stay accurate) but the UI freezes cleanly without snapshot drift on resume.
8. **Cleanup discipline.** `useStream` ref-counts attach/detach so the socket and timers tear down deterministically when no view needs them.

## UX details

- **Command palette** (`Cmd/Ctrl+K`): jump to any symbol, route, or action.
- **Pause/resume** (`Space`): freeze the UI without dropping the connection.
- **Watchlist** with one-click add/remove from `/markets/:symbol`.
- **Theme toggle** (light/dark/system), persisted to `localStorage`.
- **Status pill** with live/reconnecting/offline/paused states and an animated latency badge.
- **Offline indicator** on the chart interface when the WS drops past the retry threshold.
- **Responsive shell:** desktop side rail collapses to a mobile drawer below 1024px, search bar to an icon below 1200px.
- **Animated numbers, sparklines, ticker tape:** small touches to make the dashboard feel alive.

## Resilience

- Zod schemas reject malformed frames; counters expose how many were dropped.
- Reconnect uses exponential backoff with jitter and surfaces `attempt` + reason to the UI.
- A heartbeat detects silent stalls (no frames for 45s) and force-cycles the socket.
- All timers, listeners, and sockets are unwound in `onBeforeUnmount` / `stop()`.
- Stream service is ref-counted: the socket only stays open while at least one view needs it.
- The store layer treats every external input as untrusted (defensive copies on writes, bounded buffers).

## Trade-offs

- **ECharts over D3:** more bundled weight, but far less code to maintain for production-quality candlestick + zoom interactions.
- **Pinia over a Redux-style toolkit:** smaller surface area; the `shallowRef` pattern gives us most of the perf benefits of immutable stores without the boilerplate.
- **800ms sparkline throttle:** trades visual density on hot symbols for a stable render budget. Configurable in `marketStore.ts`.
- **No Web Worker:** Zod parsing + RAF batching keeps the main thread well under 16ms per frame even at >50 msgs/sec; a worker would add complexity without measurable gain at current load.
- **Synthetic feed is opt-in only:** prevents users from accidentally evaluating the UI against fake data when live fails. Failure is surfaced explicitly via the status pill and offline indicator.

## Deployment

`vercel.json` ships a SPA rewrite so deep links (`/markets/BTCUSDT`, `/activity`) resolve correctly. The build output in `dist/` is static and can be served from any host.

## Scripts reference

| Command          | Purpose                                              |
| ---------------- | ---------------------------------------------------- |
| `pnpm dev`       | Vite dev server with HMR                             |
| `pnpm build`     | Parallel `vue-tsc --build` + `vite build`            |
| `pnpm preview`   | Serve the production bundle locally                  |
| `pnpm type-check`| Run vue-tsc only                                     |
| `pnpm lint`      | oxlint → eslint, both with `--fix`                   |
| `pnpm format`    | Prettier across `src/`                               |
