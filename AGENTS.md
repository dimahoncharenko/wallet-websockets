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

> **`aria-describedby` over `aria-description`**: Never use the `aria-description` attribute. It is not translated by browser auto-translation services, stranding users who rely on them. Always associate descriptions via `aria-describedby` pointing to a visible DOM element — translators and auto-translation tools can reach that text. If you're tempted to visually hide the description node, ask first whether the content is useful to all users; if it is, make it visible rather than hiding it.

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

### Animations & Accessibility

- Respect `prefers-reduced-motion`. Wrap non-essential animations (card tilt, sparkles, animated counter) in a media query check and provide an instant-value fallback:

```typescript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches;
// Skip rAF loop and set final value directly when true
```

- Never convey information solely through animation. If a balance change triggers a counter animation, the final numeric value must always be present in the DOM for assistive technology.

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

This applies to every inline `style` prop and every Tailwind arbitrary value (e.g. `bg-[#0d0d14]` → use a CSS variable or move the value to theme). The only accepted exceptions are card-overlay translucent whites (`rgba(255,255,255,0.N)`) that are painted on top of a dynamic card gradient and are inherently card-surface-specific, not app-UI tokens.

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

---

## Testing

Run all tests:

```bash
yarn nx run-many -t test
```

- Frontend tests run in **jsdom** environment.
- Wrap components that use routing in `<BrowserRouter>` in tests.
- Coverage is collected with the v8 provider; output goes to `coverage/`.

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

## Code Guidelines

- Never use nested ternary operators.
- Module-specific but non-shared types go in the module's `types.ts` file. Entity types or anything shared between packages go into the `types` monorepo.
- Emojis must be wrapped in `<span role="img" aria-label="descriptive label">`.
- Every interactive element must use a semantic HTML tag — no `<div>` or `<span>` buttons.
- All form inputs must be associated with a `<label>`.
- Dynamic UI state must be communicated via ARIA attributes (`aria-expanded`, `aria-invalid`, `aria-live`, etc.).
- Real-time updates from WebSocket must be surfaced to assistive technology via `aria-live` regions.
- Non-essential animations must respect `prefers-reduced-motion`.
- Tests must use `getByRole` / `getByLabelText` as primary queries — avoid `getByTestId` unless no semantic query is possible.
- Every component test must include a `vitest-axe` no-violations assertion.
