# How to Work with the Project

## Package Management

Use **yarn** for all package operations. Never use npm.

```bash
yarn install          # install deps
yarn nx run server:build
yarn nx run frontend:build
yarn nx run-many -t test
```

---

## Project Structure

Nx monorepo with three packages:

```
wallet-websocket-app/
├── server/           # Node.js + Express + ws (WebSocket)
├── frontend/         # React 19 + Vite + Redux Toolkit
├── types/            # Shared TypeScript types (consumed by both)
└── nx.json           # Monorepo orchestration
```

Path aliases are declared in `tsconfig.base.json` and resolved at build time by `vite-tsconfig-paths`.

---

## Tech Stack

| Layer    | Technology                                   |
| -------- | -------------------------------------------- |
| Backend  | Node.js, Express 4, `ws` v8 (raw WebSocket)  |
| Frontend | React 19, React Router 7, Vite 8, Tailwind 3 |
| State    | Redux Toolkit 2 + redux-persist              |
| Types    | Shared `/types` package, AJV for validation  |
| Tooling  | Nx 22, esbuild (server), ESLint 9, Prettier  |
| Testing  | Vitest 4 + Testing Library, jsdom            |

---

## Architecture Patterns

### Provider Stack

All cross-cutting concerns are composed in a single `Providers` wrapper at the app root:

```
<Redux Provider>
  <PersistGate>
    <WebsocketProvider>
      <ModalProvider>
        {children}
```

Add new global providers here — do not spread context setup across feature modules.

### Feature Modules

Frontend is organized by domain under `frontend/src/modules/`:

```
modules/
├── auth/           # login/signup form, auth page
│   ├── index.tsx         # page component — owns mode state
│   ├── types.ts          # module-local types (e.g. Mode)
│   ├── const.ts          # UI constants (e.g. headings per mode)
│   └── components/
│       └── AuthenticationForm.tsx
├── main/           # dashboard layout, header, stats
├── wallet/         # card display, color picker, animations
└── transactions/   # transaction history list
```

Each module owns its `components/` and `hooks/` subdirectories. Shared atoms live in `frontend/src/components/`.

When a component needs to drive sibling or parent UI (e.g. a tab switch that changes a page-level heading), lift the state to the nearest common ancestor and pass it as props — do not reach up via context for simple local toggles.

### Shared Types Package

All interfaces shared between server and frontend live in `types/src/lib/`. Import via the path alias:

```typescript
import { CardData, WebsocketMessage } from '@wallet-websocket-app/types';
```

Never duplicate type definitions across packages.

---

## Code Patterns & Conventions

### Naming

| Thing              | Convention              | Example                            |
| ------------------ | ----------------------- | ---------------------------------- |
| Components         | PascalCase              | `CardLevitate.tsx`                 |
| Hooks              | `use` prefix, camelCase | `useInitCard`, `useCardColor`      |
| Event handlers     | `handle` prefix         | `handleTransfer`, `handleSubmit`   |
| Constants          | SCREAMING_SNAKE_CASE    | `SESSION_LIFETIME_MS`, `GRADIENTS` |
| Types / Interfaces | PascalCase noun         | `CardData`, `WebsocketMessage`     |
| Props types        | `{Name}Props` suffix    | `TransferModalProps`               |

### State Ownership

| State                  | Where it lives               |
| ---------------------- | ---------------------------- |
| Auth (login/logout)    | Redux slice (`authSlice`)    |
| WebSocket connection   | `WebsocketContext`           |
| Modal visibility       | `ModalContext`               |
| Card color per PAN     | localStorage + custom events |
| Balance / transactions | Component-local via hooks    |
| Auth form mode         | `auth/index.tsx` (page)      |

Redux is only used for auth. Keep it that way — do not add new slices for feature-level state.

### Component Structure

Use functional components with hooks exclusively — no class components. Structure a component file as:

1. Imports
2. Props type definition
3. Component function
4. Named export

### Constants

Static configuration lives in a `const.ts` file co-located with the module that owns it. Do not inline magic values in components.

---

## WebSocket Protocol

### Message Shape

All messages are discriminated unions keyed on `event`:

```typescript
type WebsocketMessage =
  | { event: 'ping' }
  | { event: 'auth'; token: string }
  | { event: 'auth_result'; success: boolean; expiresIn: number }
  | { event: 'init-card'; card: CardData }
  | {
      event: 'change-balance';
      balance: number;
      creditPan: string;
      message: string;
    }
  | { event: 'update-history'; transaction: Transaction }
  | { event: 'update-stats'; pan: string; income: number; spending: number }
  | {
      event: 'proceed-transfer';
      amount: number;
      debitPan: string;
      creditPan: string;
    }
  | { event: 'token_refresh'; token: string }
  | { event: 'token_refreshed'; success: boolean; expiresIn: number };
```

Add new message types to `types/src/lib/ws-message.ts` before implementing handlers. Use `event` values in kebab-case to match existing convention.

### Connection Lifecycle

```
connect → auth (5s timeout) → ping → init-card → [event loop] → disconnect
```

- Server enforces a **5-second auth timeout** and a **20-second session lifetime**.
- Frontend schedules a `token_refresh` **5 seconds before** expiration.
- Close codes: `4001` = auth expired, `1008` = policy violation — handle both in the frontend disconnect handler.

### Sending Messages (Frontend)

Always check readyState before sending:

```typescript
if (socket.readyState === WebSocket.OPEN) {
  socket.send(JSON.stringify(message));
}
```

### Adding a New Event

1. Add the type variant to `WebsocketMessage` in `/types`.
2. Add a handler in `server/src/main.ts` inside the `message` switch.
3. Add a listener in the relevant frontend hook/component, with cleanup in the `return` of `useEffect`.

---

## Server-Side Patterns

### UserManager

`UserManager` is the single source of truth for in-memory state:

- `panMap: Map<string, WebSocket>` — routes messages to specific card holders
- `statsMap: Map<string, StatData>` — income/spending with sparkline history (capped at 20 points)
- `connections: Set<WebSocket>` — all active sockets for broadcast

Use `sendByPan(pan, message)` for targeted delivery, `sendAll(message)` for broadcasts.

### No Persistence

All server state is in-memory and resets on restart. Do not add a database without discussing the impact on session handling and the auth flow.

---

## Frontend WebSocket Hooks Pattern

Listen to messages inside a `useEffect` that cleans up on unmount:

```typescript
useEffect(() => {
  const handler = (event: MessageEvent) => {
    try {
      const msg: WebsocketMessage = JSON.parse(event.data);
      if (msg.event === 'change-balance') {
        setBalance(msg.balance);
      }
    } catch {
      // ignore malformed messages
    }
  };
  socket?.addEventListener('message', handler);
  return () => socket?.removeEventListener('message', handler);
}, [socket]);
```

Never attach listeners outside of `useEffect` — it causes duplicate registrations and memory leaks.

---

## Animation Patterns

### 3D Card Tilt

`CardLevitate.tsx` drives all transforms via `requestAnimationFrame` + lerp:

- Mouse position normalized to `[-0.5, 0.5]`
- Lerp formula: `current + (target - current) * factor`
- Only `transform` and `box-shadow` are animated — no layout-triggering properties

### Animated Counter

`useAnimatedBalance.ts` uses exponential easing over 800ms with `requestAnimationFrame`. Always cancel the frame ID in the cleanup function.

### CSS Animations

Particle/sparkle effects use CSS `@keyframes` injected via `<style>` tags inside the component. Keep animation keyframes local to the component that owns them.

---

## Styling Conventions

- **Tailwind utility classes** for all styling — no CSS modules, no styled-components.
- **Glassmorphism** is the design language: `bg-white/[opacity]`, `backdrop-blur-md`, `border-white/[opacity]`.
- **Dynamic styles** (animation transforms, per-card gradients) use inline `style` props.
- **Gradients and color themes** are defined as constants in `const.ts`, not inline strings.

---

## Testing

Run all tests:

```bash
yarn nx run-many -t test
```

- Frontend tests run in **jsdom** environment.
- Wrap components that use routing in `<BrowserRouter>` in tests.
- Use `@testing-library/react` query methods — avoid querying by implementation detail (class names, DOM structure).
- Coverage is collected with the v8 provider; output goes to `coverage/`.

---

## Build & Dev

```bash
# Start backend (watch mode)
yarn nx run server:serve

# Start frontend dev server (port 3001)
yarn nx run frontend:serve

# Production build
yarn nx run server:build
yarn nx run frontend:build
```

esbuild targets CommonJS for the server. Source maps are enabled in development only.

---

## Validation

`server/main.ts` validates WebSocket message structure inline. For new events with complex payloads, use AJV (already a dependency in `/types`) to validate against a JSON schema before processing.

## Code guidelines

- Never use nested ternary operators
- You can define a module specific but not important type in module's types.ts file. But entity types, or shared, place into types monorepo
