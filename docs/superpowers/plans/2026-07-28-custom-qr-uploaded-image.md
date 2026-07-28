# Custom Uploaded QR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three theme-aware presentation presets for uploaded wedding gift QR images, selectable in a creation popup and overridable per family side in the editor.

**Architecture:** Keep QR configuration and safety decisions in pure functions under `src/lib/qr`, then render them through a focused client component that owns canvas recoloring/download fallback. Theme, invitation, and per-side configuration resolve in one direction; existing invitations without the new fields retain their current plain-image rendering.

**Tech Stack:** Next.js 16.2.12 App Router, React 19, TypeScript, Zod 4, CSS Modules, browser Canvas API, Vitest, Testing Library, Playwright.

## Global Constraints

- Only customize QR images uploaded through the existing `qrAnh` flow; do not generate or decode VietQR/NAPAS.
- Provide exactly `toi-gian`, `hoa-mem`, and `phong-bao`.
- Never change QR module geometry or finder-eye shapes.
- Keep ornaments outside the QR quiet zone.
- Preserve old invitation parsing and display when no QR customization exists.
- If recoloring or PNG composition fails, display and download the original image.
- Typography customization is explicitly deferred to a later phase.
- Read relevant Next.js 16 documentation under `node_modules/next/dist/docs/` before changing framework-facing code.

---

## File Map

- `src/lib/qr/types.ts`: QR preset/configuration contracts shared by invitation and theme models.
- `src/lib/qr/cauHinh.ts`: configuration resolution, color parsing, contrast, and safe-color fallback.
- `src/lib/qr/__tests__/cauHinh.test.ts`: pure behavior tests.
- `src/lib/qr/xuLyAnh.ts`: browser image loading, pixel recoloring, and composed PNG export.
- `src/lib/qr/__tests__/xuLyAnh.test.ts`: Canvas failure/success contract tests.
- `src/components/qr/QrTuyChinh.tsx`: runtime QR preview and download behavior.
- `src/components/qr/QrTuyChinh.module.css`: three production presets and quiet-zone layout.
- `src/components/qr/MauQr.tsx`: small reusable preset thumbnail.
- `src/components/qr/__tests__/QrTuyChinh.test.tsx`: rendering, warning, and download fallback tests.
- `src/components/admin/PopupChonKieuQr.tsx`: accessible creation-time preset picker.
- `src/components/admin/__tests__/PopupChonKieuQr.test.tsx`: popup interaction tests.
- Existing invitation/theme/create/editor/wedding-section files: wire the new contracts into current flows.

---

### Task 1: QR Contracts, Schema, and Resolution

**Files:**
- Create: `src/lib/qr/types.ts`
- Create: `src/lib/qr/cauHinh.ts`
- Create: `src/lib/qr/__tests__/cauHinh.test.ts`
- Modify: `src/lib/themes/types.ts`
- Modify: `src/lib/themes/mac-dinh.ts`
- Modify: `src/lib/invitation/types.ts`
- Modify: `src/lib/invitation/schema.ts`
- Modify: `src/lib/invitation/__tests__/schema.test.ts`

**Interfaces:**
- Produces: `KieuKhungQr`, `TuyChinhQr`, `CauHinhQrTheme`, `CauHinhQrDaXuLy`.
- Produces: `resolveCauHinhQr(themeQr, kieuKhungThiep, tuyChinhBen)`.
- Produces: `doTuongPhan(mauTruoc, mauSau)` and `mauQrAnToan(config)`.

- [ ] **Step 1: Write failing pure-function tests**

```ts
import { describe, expect, it } from 'vitest'
import { doTuongPhan, mauQrAnToan, resolveCauHinhQr } from '../cauHinh'

describe('resolveCauHinhQr', () => {
  const theme = { kieuKhung: 'hoa-mem', mauQr: '#8B2F20', mauNen: '#FFF8EF' } as const

  it('uses theme defaults', () => {
    expect(resolveCauHinhQr(theme)).toEqual(theme)
  })

  it('uses invitation preset then per-side overrides', () => {
    expect(resolveCauHinhQr(theme, 'toi-gian', {
      kieuKhung: 'phong-bao',
      mauQr: '#111111',
    })).toEqual({
      kieuKhung: 'phong-bao',
      mauQr: '#111111',
      mauNen: '#FFF8EF',
    })
  })
})

it('falls back to black and white for unsafe contrast', () => {
  expect(mauQrAnToan({
    kieuKhung: 'toi-gian',
    mauQr: '#F7F7F7',
    mauNen: '#FFFFFF',
  })).toMatchObject({ mauQr: '#000000', mauNen: '#FFFFFF', coCanhBao: true })
})
```

- [ ] **Step 2: Run the pure-function test and verify RED**

Run: `npm test -- src/lib/qr/__tests__/cauHinh.test.ts`

Expected: FAIL because `src/lib/qr/cauHinh.ts` does not exist.

- [ ] **Step 3: Add QR contracts and minimal resolver**

```ts
export const KIEU_KHUNG_QR = ['toi-gian', 'hoa-mem', 'phong-bao'] as const
export type KieuKhungQr = (typeof KIEU_KHUNG_QR)[number]

export interface TuyChinhQr {
  kieuKhung?: KieuKhungQr
  mauQr?: string
  mauNen?: string
}

export interface CauHinhQrTheme {
  kieuKhung: KieuKhungQr
  mauQr: string
  mauNen: string
}
```

Implement WCAG relative luminance/contrast for `#RRGGBB`. Use minimum ratio `4.5`;
`mauQrAnToan` returns the input plus `coCanhBao: false`, or black/white plus
`coCanhBao: true`.

- [ ] **Step 4: Run QR resolver tests and verify GREEN**

Run: `npm test -- src/lib/qr/__tests__/cauHinh.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing backward-compatibility schema tests**

Add assertions that `invitationSchema.parse(thiepMau)` still succeeds, and that:

```ts
const parsed = invitationSchema.parse({
  ...thiepMau,
  kieuKhungQr: 'phong-bao',
  mungCuoi: [{
    ...thiepMau.mungCuoi[0],
    tuyChinhQr: { kieuKhung: 'toi-gian', mauQr: '#111111', mauNen: '#FFFFFF' },
  }],
})
expect(parsed.kieuKhungQr).toBe('phong-bao')
```

Also assert `mauQr: 'red'` and an unknown preset are rejected.

- [ ] **Step 6: Run schema tests and verify RED**

Run: `npm test -- src/lib/invitation/__tests__/schema.test.ts`

Expected: FAIL because the new fields are stripped or rejected by the typed schema.

- [ ] **Step 7: Wire contracts into invitation and theme models**

Add `qr: CauHinhQrTheme` to `Theme`, `kieuKhungQr?: KieuKhungQr` to `Invitation`,
and `tuyChinhQr?: TuyChinhQr` to `OMungCuoi`. Extend Zod with the exact enum and
`#RRGGBB` validation. Configure `macDinh.qr` as:

```ts
qr: {
  kieuKhung: 'hoa-mem',
  mauQr: '#8B2F20',
  mauNen: '#FFF8EF',
},
```

- [ ] **Step 8: Run focused tests**

Run: `npm test -- src/lib/qr/__tests__/cauHinh.test.ts src/lib/invitation/__tests__/schema.test.ts`

Expected: PASS.

- [ ] **Step 9: Commit the model slice**

```powershell
git add -- src/lib/qr src/lib/themes/types.ts src/lib/themes/mac-dinh.ts src/lib/invitation/types.ts src/lib/invitation/schema.ts src/lib/invitation/__tests__/schema.test.ts
git commit -m "feat: them cau hinh qr theo giao dien"
```

---

### Task 2: Creation Popup and Persisted Default Preset

**Files:**
- Create: `src/components/qr/MauQr.tsx`
- Create: `src/components/admin/PopupChonKieuQr.tsx`
- Create: `src/components/admin/__tests__/PopupChonKieuQr.test.tsx`
- Modify: `src/components/admin/FormTaoMoi.tsx`
- Modify: `src/components/admin/__tests__/BangDieuKhien.test.tsx` or create `src/components/admin/__tests__/FormTaoMoi.test.tsx`
- Modify: `src/app/api/admin/tao/route.ts`
- Modify: `src/lib/invitation/taoMoi.ts`
- Modify: `src/lib/invitation/__tests__/taoMoi.test.ts`

**Interfaces:**
- Consumes: `KieuKhungQr`, `KIEU_KHUNG_QR`.
- Produces: `PopupChonKieuQr({ giaTri, onChon, onDong })`.
- Persists: optional `kieuKhungQr` through create route into `taoThiepMoi`.

- [ ] **Step 1: Write failing popup interaction tests**

```tsx
render(<PopupChonKieuQr giaTri="hoa-mem" onChon={onChon} onDong={onDong} />)
expect(screen.getByRole('dialog', { name: 'Chọn kiểu QR' })).toBeInTheDocument()
expect(screen.getAllByRole('radio')).toHaveLength(3)
await userEvent.click(screen.getByRole('radio', { name: 'Phong bao' }))
expect(onChon).toHaveBeenCalledWith('phong-bao')
await userEvent.keyboard('{Escape}')
expect(onDong).toHaveBeenCalled()
```

- [ ] **Step 2: Run popup tests and verify RED**

Run: `npm test -- src/components/admin/__tests__/PopupChonKieuQr.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement reusable thumbnails and accessible popup**

`MauQr` renders deterministic CSS shapes, not a generated bitmap and not a real QR.
`PopupChonKieuQr` uses `role="dialog"`, `aria-modal="true"`, radio inputs, a close
button, Escape handling, and backdrop click handling.

- [ ] **Step 4: Run popup tests and verify GREEN**

Run: `npm test -- src/components/admin/__tests__/PopupChonKieuQr.test.tsx`

Expected: PASS.

- [ ] **Step 5: Write failing create-flow tests**

Test that clicking `Chọn kiểu QR`, selecting `Tối giản`, and submitting sends:

```ts
expect(JSON.parse(fetchBody)).toMatchObject({ kieuKhungQr: 'toi-gian' })
```

In `taoMoi.test.ts`, assert `taoThiepMoi({ ...tt, kieuKhungQr: 'phong-bao' })`
returns the selected value and omission leaves the field undefined.

- [ ] **Step 6: Run create-flow tests and verify RED**

Run: `npm test -- src/components/admin/__tests__/FormTaoMoi.test.tsx src/lib/invitation/__tests__/taoMoi.test.ts`

Expected: FAIL because creation does not accept or send `kieuKhungQr`.

- [ ] **Step 7: Wire popup selection through creation**

Add popup state to `FormTaoMoi`, a visible selected-preset summary, and
`kieuKhungQr` in the JSON request. Extend the route Zod schema with the optional
enum and extend `ThongTinTaoMoi`. Do not add QR upload controls to this form.

- [ ] **Step 8: Run create-flow and popup tests**

Run: `npm test -- src/components/admin/__tests__/PopupChonKieuQr.test.tsx src/components/admin/__tests__/FormTaoMoi.test.tsx src/lib/invitation/__tests__/taoMoi.test.ts`

Expected: PASS.

- [ ] **Step 9: Commit creation selection**

```powershell
git add -- src/components/qr/MauQr.tsx src/components/admin/PopupChonKieuQr.tsx src/components/admin/__tests__/PopupChonKieuQr.test.tsx src/components/admin/FormTaoMoi.tsx src/components/admin/__tests__/FormTaoMoi.test.tsx src/app/api/admin/tao/route.ts src/lib/invitation/taoMoi.ts src/lib/invitation/__tests__/taoMoi.test.ts
git commit -m "feat: chon kieu qr khi tao thiep"
```

---

### Task 3: Canvas Recoloring and Download Fallback

**Files:**
- Create: `src/lib/qr/xuLyAnh.ts`
- Create: `src/lib/qr/__tests__/xuLyAnh.test.ts`

**Interfaces:**
- Consumes: `CauHinhQrDaXuLy`.
- Produces: `taiAnh(url): Promise<HTMLImageElement>`.
- Produces: `toMauQr(ctx, width, height, mauQr, mauNen): void`.
- Produces: `taoPngQr(url, config): Promise<Blob | null>`.

- [ ] **Step 1: Write failing pixel recoloring tests**

Use a fake `CanvasRenderingContext2D` image buffer containing black, white, and
mid-gray pixels. Assert dark pixels become `mauQr`, light pixels become `mauNen`,
alpha remains opaque, and no geometry is added or removed.

- [ ] **Step 2: Run image-processing tests and verify RED**

Run: `npm test -- src/lib/qr/__tests__/xuLyAnh.test.ts`

Expected: FAIL because `xuLyAnh.ts` does not exist.

- [ ] **Step 3: Implement deterministic recoloring**

Use luminance threshold `128`: pixels below become QR color and pixels at or above
become background color. `taoPngQr` creates a same-size canvas, loads with
`crossOrigin = 'anonymous'`, draws the source, recolors, and resolves `null` on
load, CORS, context, security, or `toBlob` failure. Do not throw to the UI.

- [ ] **Step 4: Add and verify failure-contract tests**

Assert missing 2D context, rejected image load, and null `toBlob` all resolve
`null`, while a valid fake canvas resolves a PNG Blob.

Run: `npm test -- src/lib/qr/__tests__/xuLyAnh.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit image processing**

```powershell
git add -- src/lib/qr/xuLyAnh.ts src/lib/qr/__tests__/xuLyAnh.test.ts
git commit -m "feat: xu ly mau va tai anh qr"
```

---

### Task 4: Runtime QR Component and Three Frames

**Files:**
- Create: `src/components/qr/QrTuyChinh.tsx`
- Create: `src/components/qr/QrTuyChinh.module.css`
- Create: `src/components/qr/__tests__/QrTuyChinh.test.tsx`
- Modify: `src/components/sections/MungCuoi.tsx`
- Modify: `src/components/sections/__tests__/MungCuoi.test.tsx`

**Interfaces:**
- Consumes: `resolveCauHinhQr`, `mauQrAnToan`, `taoPngQr`.
- Produces: `QrTuyChinh({ anh, themeQr, kieuKhungThiep, tuyChinh, ben, choTai })`.

- [ ] **Step 1: Write failing component tests**

Test that each preset produces `data-kieu-qr`, that unsafe colors set
`data-mau-fallback="true"`, and that a missing custom config renders a plain image
compatible with existing assertions. Mock `taoPngQr` to cover both:

```ts
vi.mock('@/lib/qr/xuLyAnh', () => ({ taoPngQr: vi.fn() }))
expect(screen.getByRole('link', { name: 'Tải QR Nhà trai' }))
  .toHaveAttribute('href', thiepMau.mungCuoi[0].qrAnh!.url)
```

For a successful Blob, assert click creates and revokes an object URL.

- [ ] **Step 2: Run runtime component tests and verify RED**

Run: `npm test -- src/components/qr/__tests__/QrTuyChinh.test.tsx`

Expected: FAIL because `QrTuyChinh` does not exist.

- [ ] **Step 3: Implement the runtime component**

Render the original image immediately. After client mount, attempt a recolored data
URL preview without blocking the image. Use CSS classes for all decorations and a
dedicated inner `.quietZone`. Implement download as an event handler: try composed
PNG, otherwise navigate through an anchor using the original URL.

- [ ] **Step 4: Implement the three CSS presets**

- `toi-gian`: ivory surface, thin burgundy line, square quiet zone.
- `hoa-mem`: rounded blush surface with CSS/SVG-like floral corner shapes outside
  `.quietZone`.
- `phong-bao`: red outer frame, gold border/flap lines, white central quiet zone.

All selectors must keep `pointer-events: none` on ornaments and must not overlap
`.quietZone`.

- [ ] **Step 5: Replace direct QR image rendering in Mừng cưới**

Pass `theme.qr`, `thiep.kieuKhungQr`, and `o.tuyChinhQr`. Preserve the existing
compact popup, copy-account behavior, alt text, and accessible download name.

- [ ] **Step 6: Run component and section tests**

Run: `npm test -- src/components/qr/__tests__/QrTuyChinh.test.tsx src/components/sections/__tests__/MungCuoi.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit runtime rendering**

```powershell
git add -- src/components/qr src/components/sections/MungCuoi.tsx src/components/sections/__tests__/MungCuoi.test.tsx
git commit -m "feat: hien ba kieu khung qr mung cuoi"
```

---

### Task 5: Per-Side Editor Overrides and Contrast Warning

**Files:**
- Modify: `src/components/admin/OMungCuoi.tsx`
- Create: `src/components/admin/__tests__/OMungCuoi.test.tsx`
- Modify: `src/components/admin/BangSua.tsx`
- Modify: `src/components/admin/__tests__/BangSua.test.tsx` if present, otherwise `src/components/admin/__tests__/BangDieuKhien.test.tsx`

**Interfaces:**
- Consumes: `MauQr`, `resolveCauHinhQr`, `mauQrAnToan`.
- Adds to `OMungCuoi` props: `themeQr`, `kieuKhungThiep`.
- Emits the unchanged `OMungCuoiData[]` shape with optional per-side overrides.

- [ ] **Step 1: Write failing editor tests**

Render two sides and assert:

- both default to `Theo giao diện`;
- choosing `Phong bao` only changes `nha-trai.tuyChinhQr.kieuKhung`;
- changing QR/background colors only changes the selected side;
- `Khôi phục theo giao diện` removes `tuyChinhQr`;
- a low-contrast pair displays `role="alert"`.

- [ ] **Step 2: Run editor tests and verify RED**

Run: `npm test -- src/components/admin/__tests__/OMungCuoi.test.tsx`

Expected: FAIL because override controls do not exist.

- [ ] **Step 3: Add per-side controls**

For each side add:

- select with `Theo giao diện` and the three preset labels;
- `input type="color"` for QR and background;
- compact `MauQr` preview;
- contrast warning based on the resolved effective values;
- reset button that sets `tuyChinhQr: undefined`.

Do not mutate the other side when editing one entry.

- [ ] **Step 4: Pass theme and invitation defaults from editor shell**

Update `BangSua`:

```tsx
<OMungCuoi
  giaTri={thiep.mungCuoi}
  slug={thiep.slug}
  themeQr={theme.qr}
  kieuKhungThiep={thiep.kieuKhungQr}
  onDoi={(v) => sua('mungCuoi', v)}
/>
```

- [ ] **Step 5: Run editor and existing admin tests**

Run: `npm test -- src/components/admin/__tests__/OMungCuoi.test.tsx src/components/admin/__tests__/BangDieuKhien.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit editor overrides**

```powershell
git add -- src/components/admin/OMungCuoi.tsx src/components/admin/__tests__/OMungCuoi.test.tsx src/components/admin/BangSua.tsx src/components/admin/__tests__
git commit -m "feat: tuy chinh qr rieng tung ben"
```

---

### Task 6: Integration Verification and Documentation

**Files:**
- Modify: `e2e/quan-tri.spec.ts`
- Modify: `docs/kiem-tra-tay.md`
- Modify only if needed by observed failures: files already listed in Tasks 1–5.

**Interfaces:**
- Verifies the complete create → edit → preview → save contract.

- [ ] **Step 1: Add an E2E scenario**

Extend the admin flow to open `Chọn kiểu QR`, select `Phong bao`, create the
invitation, verify the editor preview carries `data-kieu-qr="phong-bao"` after QR
upload/sample setup, change nhà gái to `Hoa mềm`, save, reload, and verify both
resolved presets remain correct.

- [ ] **Step 2: Run the focused E2E test**

Run: `npm run e2e -- e2e/quan-tri.spec.ts`

Expected: PASS. If environment credentials make the existing suite skip, record
the exact skip output and perform the equivalent manual flow.

- [ ] **Step 3: Update manual verification notes**

Document:

1. create-popup selection;
2. three preset visual checks on mobile and desktop;
3. separate nhà trai/nhà gái overrides;
4. low-contrast warning/fallback;
5. download customized PNG and original-image fallback;
6. scan tests in at least two banking/camera apps using a real uploaded QR.

- [ ] **Step 4: Run complete automated verification**

Run in order:

```powershell
npm run lint
npm test
npm run build
npm run e2e
```

Expected: all applicable commands exit `0`; skipped tests must be reported rather
than described as passing.

- [ ] **Step 5: Review the production diff**

Run:

```powershell
git diff main...HEAD --check
git diff --stat main...HEAD
git status --short
```

Confirm only planned tracked files are in the feature diff and all pre-existing
untracked image/design files remain untouched.

- [ ] **Step 6: Commit integration coverage**

```powershell
git add -- e2e/quan-tri.spec.ts docs/kiem-tra-tay.md
git commit -m "test: kiem tra luong tuy chinh qr"
```

- [ ] **Step 7: Request code review**

Invoke `superpowers:requesting-code-review`, address verified findings, rerun the
complete verification commands, and hand off branch `codex/custom-qr` without
merging into `main`.
