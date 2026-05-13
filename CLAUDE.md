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

All cross-cutting concerns are composed in `frontend/src/modules/main/providers.tsx`:

```
<Redux Provider>
  <PersistGate>
    <AppInitializer>        ← blocks tree until Supabase session resolves
      <WebsocketProvider>
        <NotificationsProvider>  ← side-effect only; attaches WS listeners
          <ModalProvider>
            {children}
```

- `AppInitializer` subscribes to Supabase auth state and dispatches `setSession` to the `auth` slice. It renders `null` until `auth.initialized` is `true`.
- `NotificationsProvider` has no context of its own — it only attaches socket listeners that dispatch to the `app` slice.
- `WalletCardsProvider` no longer exists — wallet state lives entirely in the `wallet` Redux slice.

Add new global providers inside `AppInitializer` (if they need auth) or inside `WebsocketProvider` (if they need the socket). Do not spread context setup across feature modules.

### Redux Slices

All application state lives in three slices, configured in `frontend/src/modules/main/store.ts`:

| Slice    | State fields                                               | Persisted?                              |
| -------- | ---------------------------------------------------------- | --------------------------------------- |
| `auth`   | `session`, `initialized`                                   | No (blacklisted)                        |
| `app`    | `activeNav`, `notifications`                               | No (blacklisted)                        |
| `wallet` | `cards`, `activeCardIndex`, `colors`, `income`, `spending` | `colors` only (nested `persistReducer`) |

**Wallet persistence detail:** the wallet slice uses a nested `persistReducer` with `whitelist: ['colors']`. The root persist config blacklists `wallet` so only the nested config (key `persist:wallet`) writes to localStorage. `cards`, `income`, and `spending` are always ephemeral — they come from WebSocket on connect.

Never put non-serializable values (functions, class instances) in any slice. If a component needs to trigger side effects in another part of the tree, dispatch a serializable action and handle the effect in the appropriate hook.

### Feature Modules

Frontend is organized by domain under `frontend/src/modules/`:

```
modules/
├── app/            # AppInitializer + app-level Redux slice (nav, notifications)
│   ├── AppInitializer.tsx
│   └── store.ts
├── auth/           # login/signup form, auth Redux slice
│   ├── index.tsx
│   ├── store.ts
│   ├── types.ts
│   ├── const.ts
│   └── components/
│       └── AuthenticationForm.tsx
├── main/           # dashboard layout, header, stats, providers, root store
│   ├── store.ts          # configureStore, RootState, AppDispatch
│   ├── providers.tsx
│   ├── index.tsx
│   ├── components/
│   └── hooks/
│       └── useInitCards.ts   # WS message dispatcher for wallet events
├── wallet/         # card display, color picker, animations, wallet Redux slice
│   ├── store.ts
│   └── components/
├── notifications/  # notification panel UI
└── transactions/   # transaction history list
```

Each module owns its `components/` and `hooks/` subdirectories. Shared atoms live in `frontend/src/components/`.

### Shared Types Package

All interfaces shared between server and frontend live in `types/src/lib/`. Import via the bare specifier:

```typescript
import { CardData, WebsocketMessage } from 'types';
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

| State                   | Where it lives                                       |
| ----------------------- | ---------------------------------------------------- |
| Auth session / user     | Redux `auth` slice; initialized via `AppInitializer` |
| Active nav tab          | Redux `app` slice (`activeNav`)                      |
| Notifications           | Redux `app` slice (`notifications`)                  |
| Card list + balances    | Redux `wallet` slice (`cards`)                       |
| Active card index       | Redux `wallet` slice (`activeCardIndex`)             |
| Card color overrides    | Redux `wallet` slice (`colors`), persisted           |
| Income / spending stats | Redux `wallet` slice (`income`, `spending`)          |
| WebSocket connection    | `WebsocketContext` (not in Redux — not serializable) |
| Modal visibility        | `ModalContext`                                       |
| Auth form mode          | `auth/index.tsx` (page-local)                        |

### Component Structure

Use functional components with hooks exclusively — no class components. Prefer `const` arrow functions:

```typescript
// ✓ correct
export const MyComponent = () => { ... };

// ✗ avoid
export function MyComponent() { ... }
```

Structure a component file as:

1. Imports
2. Props type definition
3. Component function
4. Named export

### Constants

Static configuration lives in a `const.ts` file co-located with the module that owns it. Do not inline magic values in components.

---

## SVG Icons

All SVG icon components live in `frontend/src/components/Icons.tsx`. Never create standalone icon files or inline SVGs in feature components.

**Naming:** `Svg` prefix + PascalCase descriptor — `SvgArrowUp`, `SvgBell`, `SvgClose`.

**Color prop convention:**

- Icons used as standalone decorative elements (nav, stats, header) accept an optional `color?: string` prop defaulting to `colors.textPrimary`.
- Icons used as interactive affordances inside styled containers (`SvgEyeOpen`, `SvgCopy`, `SvgCheck`, `SvgPlusCircle`, `SvgDots`) use `currentColor`, inheriting from the parent element's `color` CSS property. Do not add a `color` prop to these.
- Most icons also accept an optional `size?: number` (defaults vary per icon).

```typescript
// standalone icon — explicit color with theme default
<SvgBell color={cardTheme.dot} />
<SvgBell />                          // falls back to colors.textPrimary

// container-themed icon — parent controls color via CSS
<button style={{ color: 'rgba(255,255,255,0.5)' }}>
  <SvgCopy />                        // inherits rgba(255,255,255,0.5)
</button>
```

---

## Per-Card Theming

Each `WalletCard` derives its own gradient theme from its own `card` prop — not from the globally active card. This is critical when multiple cards are visible in the carousel:

```typescript
// ✓ correct — per-card theme
const { colors: cardColors } = useWalletCards();
const activeColor = card
  ? (cardColors[card.pan] ?? card.cardColor ?? 'violet')
  : 'violet';
const theme = CARD_THEMES[activeColor];

// ✗ wrong — all cards share the active card's theme
const { cardTheme } = useWalletCards();
```

`cardTheme` from `useWalletCards()` is only appropriate for UI chrome that should match the active card (slider dots, glow gradients, accent buttons).

---

## WebSocket Protocol

### Message Shape

All messages are discriminated unions keyed on `event`:

```typescript
type WebsocketMessage =
  | { event: 'ping' }
  | { event: 'auth'; token: string }
  | { event: 'auth_result'; success: boolean; expiresIn: number }
  | { event: 'init-cards'; cards: CardData[] }
  | { event: 'card-added'; card: CardData }
  | {
      event: 'change-balance';
      balance: string;
      creditPan: string;
      message?: string;
    }
  | { event: 'update-history'; transaction: Transaction }
  | { event: 'update-stats'; pan: string; income: StatData; spending: StatData }
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

### WebSocket & Accessibility

Real-time WebSocket updates (balance changes, transaction confirmations, connection errors) must be announced to screen readers. Use `aria-live` regions to surface these changes:

```tsx
// Balance update announced to screen readers
<div aria-live="polite" aria-atomic="true">
  Balance: ${balance}
</div>

// Connection error announced assertively
<div aria-live="assertive" role="alert">
  {connectionError}
</div>
```

### Connection Lifecycle

```
connect → auth (5s timeout) → ping → init-cards → [event loop] → disconnect
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

### Handling Messages (Frontend)

All wallet-domain WS messages (`init-cards`, `card-added`, `change-balance`, `update-stats`) are handled in `useInitCards` and dispatched to the `wallet` slice. Do not add wallet message handlers elsewhere.

For `update-stats`, the handler compares `msg.pan` against the current card's PAN via a `useRef` (to avoid re-attaching the listener on every card switch):

```typescript
const currentCardPanRef = useRef(currentCardPan);
useEffect(() => {
  currentCardPanRef.current = currentCardPan;
}, [currentCardPan]);
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

---

## Frontend WebSocket Hooks Pattern

Listen to messages inside a `useEffect` that cleans up on unmount:

```typescript
useEffect(() => {
  if (!socket) return;
  const handler = (event: MessageEvent) => {
    try {
      const msg: WebsocketMessage = JSON.parse(event.data);
      if (msg.event === 'change-balance') {
        dispatch(
          updateCardBalance({ pan: msg.creditPan, delta: Number(msg.balance) }),
        );
      }
    } catch {
      // ignore malformed messages
    }
  };
  socket.addEventListener('message', handler);
  return () => socket.removeEventListener('message', handler);
}, [socket, dispatch]);
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

- **Tailwind utility classes** for layout and utility styling — no CSS modules, no styled-components.
- **Glassmorphism** is the design language: `bg-white/[opacity]`, `backdrop-blur-md`, `border-white/[opacity]`.
- **Dynamic styles** (animation transforms, per-card gradients) use inline `style` props.
- **Design tokens** (colors, font sizes, font weights, letter spacings, radii, layout dimensions, z-index, transitions) are centralized in `frontend/src/lib/theme.ts`. Import via `@lib/theme`. Do not hardcode raw CSS values — always reference a named token.
- **Per-module constants** (e.g. card theme color arrays, label maps) stay in the module's `const.ts`. The shared theme file is for universal UI primitives, not feature-specific data.

### Theme usage rule

**Always use theme variables. Never write raw CSS values in components.**

```typescript
// ✗ wrong
style={{ background: '#0d0d14', fontSize: '13px', borderRadius: 12 }}

// ✓ correct
import { colors, fontSize, radius } from '@lib/theme';
style={{ background: colors.bg, fontSize: fontSize.sm, borderRadius: radius.lg }}
```

The only accepted exceptions are card-overlay translucent whites (`rgba(255,255,255,0.N)`) painted on top of a dynamic card gradient — these are inherently card-surface-specific, not app-UI tokens.

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

---

## Accessibility (a11y)

Accessibility is a first-class requirement. Every component must be usable with keyboard-only navigation and understandable through assistive technologies (screen readers). Think in terms of the **Accessibility Tree**, not just the visual DOM.

### The Accessibility Tree Mental Model

When the browser renders JSX, it builds an Accessibility Tree alongside the DOM. Each node in this tree exposes three things to assistive technology:

| Property               | Source                                                 | Example                     |
| ---------------------- | ------------------------------------------------------ | --------------------------- |
| **Role**               | Implicit from the element or explicit `role` attribute | `button`, `dialog`, `alert` |
| **Accessible Name**    | Text content, `aria-label`, `aria-labelledby`          | `"Save changes"`            |
| **State / Properties** | ARIA attributes                                        | `aria-expanded="true"`      |

Purely decorative elements (`<div>`, `<span>` used for layout) are ignored by the tree. Mark decorative images with `alt=""` and decorative icons with `aria-hidden="true"`.

### Semantic HTML First

Always use native HTML elements for interactive controls: `<button>`, `<a>`, `<input>`, `<select>`, `<textarea>`, `<dialog>`, `<details>`. Never attach `onClick` to a `<div>` or `<span>` to simulate a button or link. Native elements provide built-in keyboard support (focus, `Enter`/`Space` activation) and correct roles in the Accessibility Tree for free.

```tsx
// ❌ Bad
<div className="btn" onClick={handleClick}>Save</div>

// ✅ Good
<button className="btn" onClick={handleClick}>Save</button>
```

### ARIA Attributes

Use ARIA only when native HTML semantics are insufficient (e.g., custom compound widgets):

- Every interactive element must have an **accessible name** — via visible text content, `aria-label`, or `aria-labelledby`.
- Reflect component state with ARIA properties: `aria-expanded`, `aria-selected`, `aria-checked`, `aria-invalid`, `aria-disabled`, `aria-pressed`.
- Use `role` sparingly. Prefer a native element with the correct implicit role. If you must use `role`, pair it with all required ARIA states and keyboard interactions for that role (see WAI-ARIA Authoring Practices).
- Use `aria-live` regions (`polite` or `assertive`) for dynamic content that sighted users see but screen readers would otherwise miss — toasts, inline validation errors, WebSocket-driven balance updates, loading states.

```tsx
// Custom disclosure widget — ARIA required because there is no single native element
<button aria-expanded={isOpen} aria-controls="panel-1">
  Section Title
</button>
<div id="panel-1" role="region" hidden={!isOpen}>
  {content}
</div>
```

### Emoji Accessibility

Emojis must be wrapped in a `<span>` with `role="img"` and a descriptive `aria-label`:

```tsx
// ❌ Bad
<p>Transfer complete 🎉</p>

// ✅ Good
<p>Transfer complete <span role="img" aria-label="celebration">🎉</span></p>
```

### Accessible Forms

- Every `<input>` must have an associated `<label>` via `htmlFor`/`id` pairing or by nesting the input inside the label.
- Group related fields with `<fieldset>` and `<legend>`.
- Validation errors must be programmatically linked to their field using `aria-describedby` and announced with `aria-invalid="true"`.

```tsx
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? "email-error" : undefined}
/>
{errors.email && <span id="email-error" role="alert">{errors.email}</span>}
```

### Keyboard Navigation

- All interactive elements must be reachable via `Tab` and activatable via `Enter` or `Space`.
- Composite widgets (tabs, menus, grids) must implement arrow-key navigation within the group and a single `Tab` stop for the container.
- Never remove `:focus-visible` outlines without providing an equivalent visible focus indicator.
- Manage focus intentionally: when the transfer modal opens, move focus into it; when it closes, return focus to the trigger element.

### A11y Checklist (pre-merge)

Before merging any component, verify:

- [ ] Uses semantic HTML elements (no `<div>` buttons).
- [ ] All interactive elements have an accessible name.
- [ ] Form inputs are associated with labels.
- [ ] Emojis are wrapped in `<span role="img" aria-label="...">`.
- [ ] Dynamic state is communicated via ARIA attributes.
- [ ] Component is fully operable with keyboard alone.
- [ ] Focus management is handled for modals, drawers, and route changes.
- [ ] Tests use `getByRole` / `getByLabelText` as primary queries.
- [ ] `vitest-axe` audit passes with no violations.
- [ ] Decorative elements are hidden from the accessibility tree.

### Animations

- Respect `prefers-reduced-motion`. Wrap non-essential animations (card tilt, sparkles, animated counter) in a media query check and provide an instant-value fallback:

```typescript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches;
// Skip rAF loop and set final value directly when true
```

- Never convey information solely through animation. If a balance change triggers a counter animation, the final numeric value must always be present in the DOM for assistive technology.

### Focus Indicators

Never remove or hide `:focus-visible` outlines globally. If the default browser outline clashes with the glassmorphism design, replace it with a visible custom focus ring — do not delete it:

```css
/* ✅ Acceptable override */
:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
```

Ensure sufficient contrast (3:1 minimum against adjacent colors per WCAG 2.1).

### Semantic Query Priority

Use `@testing-library/react` query methods. Prefer semantic queries that mirror how assistive technology finds elements — never query by class names or DOM structure:

1. `getByRole` — asserts both role and accessible name in one call. **Default choice.**
2. `getByLabelText` — verifies label-input association. **Preferred for form fields.**
3. `getByPlaceholderText`, `getByDisplayValue` — for inputs without visible labels (last resort).
4. `getByText` — for non-interactive text content.
5. `getByTestId` — **only** when no semantic query is possible.

```ts
// ❌ Avoid
screen.getByTestId('submit-btn');

// ✅ Prefer
screen.getByRole('button', { name: /submit/i });
```

### Semantic Matchers

Use matchers from `@testing-library/jest-dom` to assert accessibility state:

- `toBeRequired()` — checks `aria-required` or the `required` attribute.
- `toBeInvalid()` — checks `aria-invalid`.
- `toHaveAccessibleDescription()` — checks `aria-describedby` resolution.
- `toHaveAccessibleName()` — checks the computed accessible name.

### Automated A11y Audits

Every new component test file must include a `vitest-axe` audit:

```ts
import { axe, toHaveNoViolations } from "vitest-axe";
expect.extend(toHaveNoViolations);

it("has no a11y violations", async () => {
  const { container } = render(<MyComponent />);
  expect(await axe(container)).toHaveNoViolations();
});
```

### Manual Screen Reader Testing

Automated tools catch roughly 30–50% of accessibility issues. Supplement with manual testing:

| Platform    | Screen Reader        |
| ----------- | -------------------- |
| macOS / iOS | VoiceOver (built-in) |
| Windows     | NVDA (free) or JAWS  |
| Android     | TalkBack (built-in)  |

When possible, involve real users with disabilities in usability testing (e.g., via Fable).

---

## Code Guidelines

- Never use nested ternary operators
- Module-specific non-entity types go in the module's `types.ts`. Entity types or anything shared between packages go in the `types` monorepo package.
- Emojis must be wrapped in `<span role="img" aria-label="description">`.
- Prefer `const` arrow function expressions over `function` declarations for components and hooks.
- After any change reflect this in test cases. If there is no test cases for the logic yet, create a test file (valid for compound components, logic-rich components, not dumb components, hooks, store and helpers)
- Never comment self-explanatory code, for instance:
  `// ─── markAllRead ───────────────────────────────────────────────────────────`
  `describe('markAllRead', () => {`
- There is no need for testing const files
- Every interactive element must use a semantic HTML tag — no `<div>` or `<span>` buttons.
- All form inputs must be associated with a `<label>`.
- Dynamic UI state must be communicated via ARIA attributes (`aria-expanded`, `aria-invalid`, `aria-live`, etc.).
- Real-time updates from WebSocket must be surfaced to assistive technology via `aria-live` regions.
- Non-essential animations must respect `prefers-reduced-motion`.
- Tests must use `getByRole` / `getByLabelText` as primary queries — avoid `getByTestId` unless no semantic query is possible.
- Every component test must include a `vitest-axe` no-violations assertion.

### # React Shared UI Component Library

**Pure Presentation**

- **Rule:** Components are purely UI — no business logic, no API calls, and no service dependencies.
- **React Context:** Build "dumb" or presentational components. All data should be passed in via `props`, and any interactions should trigger callback functions passed from the parent component (e.g., `onClick`, `onSubmit`).

**Component Configurations**

- **Rule:** Components should use a configuration-driven API with preset variants.
- **React Context:** Instead of factory methods, use a variant-based prop pattern, typically powered by libraries like `class-variance-authority` (CVA) or styled-components.
- _Example:_ Rather than `.callToActionProminent()`, use `<Button variant="prominent"/>`.
- _Example:_ Rather than `.cell()`, use `<ListItem layout="cell"/>`.

**Composition & Styling**

- **Rule:** Provide standardized ways to layout and wrap components.
- **React Context:** React prefers component composition and utility classes over chained modifiers.
- _Example:_ Instead of a `.platterBackground()` modifier, create a wrapper component: `<Platter><YourComponent/></Platter>`.
- _Example:_ Instead of `.frame(square:)`, allow standard `className` overriding using a utility merger like `tailwind-merge` or `clsx`, or provide specific size props like `<Avatar size="lg"/>`.

**Presets Location**

- **Rule:** Centralize design tokens and presets.
- **React Context:** Store design tokens, constants, and theme variants in a central `theme/` or `constants/` directory. If using a utility CSS framework, these belong in your `tailwind.config.js` or equivalent theme provider object.

**Platform Variants**

- **Rule:** Handle environment/platform specific rendering cleanly.
  Rely on CSS media queries for device targeting (e.g., desktop vs. mobile layouts) rather than JS-based conditionally rendered trees whenever possible.
