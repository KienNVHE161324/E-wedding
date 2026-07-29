# Default Theme Warm Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change the default invitation theme background from white to the selected warm cream `#FFF8EF`.

**Architecture:** Keep the change in the default theme token so every renderer consumer receives the new fallback automatically. Preserve the existing `InvitationRenderer` override path, which continues to prefer `thiep.tuyChinh.mauNen` when present.

**Tech Stack:** Next.js 16.2.12, React 19.2.4, TypeScript 5, Vitest, Testing Library.

## Global Constraints

- Only `mau.nen` of theme `mac-dinh` changes to `#FFF8EF`.
- Existing text, primary, secondary, accent, font, decoration, opacity, and QR values stay unchanged.
- Other themes and invitation-level `tuyChinh.mauNen` values are not changed.
- Read relevant installed Next.js documentation before production code changes, as required by `AGENTS.md`.

---

### Task 1: Warm default theme background

**Files:**
- Create: `src/lib/themes/__tests__/mac-dinh.test.ts`
- Modify: `src/lib/themes/mac-dinh.ts`
- Verify: `src/components/__tests__/InvitationRenderer.test.tsx`

**Interfaces:**
- Consumes: `layTheme(id: string): Theme` from `src/lib/themes/index.ts`.
- Produces: `layTheme('mac-dinh').mau.nen === '#FFF8EF'`.

- [ ] **Step 1: Read the installed Next.js CSS guide**

Run:

```powershell
Get-Content -Raw node_modules\next\dist\docs\01-app\01-getting-started\05-css.md
```

Confirm that no framework API change is required because the renderer already passes the theme token through an inline CSS custom property.

- [ ] **Step 2: Write the failing theme test**

Create `src/lib/themes/__tests__/mac-dinh.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { layTheme } from '../index'

describe('theme mặc định', () => {
  it('dùng nền kem ấm để nội dung và họa tiết dễ quan sát', () => {
    expect(layTheme('mac-dinh').mau.nen).toBe('#FFF8EF')
  })
})
```

This test catches a regression back to white or an unintended cream value.

- [ ] **Step 3: Run the focused test and verify RED**

Run:

```powershell
npm test -- src/lib/themes/__tests__/mac-dinh.test.ts
```

Expected: FAIL with `expected '#FFFFFF' to be '#FFF8EF'`.

- [ ] **Step 4: Implement the minimal token change**

In `src/lib/themes/mac-dinh.ts`, change only:

```ts
nen: '#FFF8EF',
```

Do not modify the existing QR background, which already equals `#FFF8EF`.

- [ ] **Step 5: Run the focused and renderer tests**

Run:

```powershell
npm test -- src/lib/themes/__tests__/mac-dinh.test.ts src/components/__tests__/InvitationRenderer.test.tsx
```

Expected: both test files PASS. The renderer tests retain coverage that invitation-level custom background colors override the theme token.

- [ ] **Step 6: Run repository verification**

Run:

```powershell
npm test
npm run lint
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 7: Verify mobile rendering**

Start the local app with the worktree's `.env.local`, open `/nam-linh`, reveal the invitation, and inspect it at `390 × 844`. Confirm computed `--mau-nen` is `#FFF8EF`, the page has no horizontal overflow, and the text remains legible.

- [ ] **Step 8: Commit**

```powershell
git add src/lib/themes/mac-dinh.ts src/lib/themes/__tests__/mac-dinh.test.ts
git commit -m "feat: doi nen theme mac dinh sang kem am"
```
