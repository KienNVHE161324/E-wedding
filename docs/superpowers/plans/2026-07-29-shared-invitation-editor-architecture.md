# Shared Invitation Editor Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the invitation editor so every registered theme automatically uses the same content model, editing features, preview renderer, fallback behavior, and persistence flow.

**Architecture:** Keep `Invitation` as the single editable document and make themes declarative `ThemeDefinition` values. A pure resolver produces a complete `ResolvedInvitationView`; both the admin preview and public renderer use that result, while a provider and panel registry keep editor features independent from `themeId`.

**Tech Stack:** Next.js App Router, React Client and Server Components, TypeScript, Zod, Tailwind CSS, Vitest, Testing Library, Playwright

## Global Constraints

- Read the relevant guide under `node_modules/next/dist/docs/` before changing a Next.js API, convention, or file structure.
- All themes use the same existing section set; theme-specific sections and theme-specific editor forms are out of scope.
- Changing `themeId` must preserve content, section settings, and saved invitation overrides.
- Admin preview and the public page must use the same resolver and `InvitationRenderer`.
- Do not branch editor or renderer behavior directly on `themeId`.
- Keep Server-to-Client props serializable.
- Use test-driven development and commit each independently testable task.

---

## File Structure

### Theme and view model

- `src/lib/themes/types.ts`: declarative `ThemeDefinition`, design tokens, section variants, and resolved types.
- `src/lib/themes/mac-dinh-he-thong.ts`: complete safe system defaults.
- `src/lib/themes/mac-dinh.ts`: the existing default theme expressed as a `ThemeDefinition`.
- `src/lib/themes/index.ts`: theme registry, contract guard, safe lookup, and strict lookup.
- `src/lib/themes/resolve.ts`: pure merge from invitation plus theme to `ResolvedInvitationView`.
- `src/lib/themes/__tests__/registry.test.ts`: registry contract and fallback tests.
- `src/lib/themes/__tests__/resolve.test.ts`: precedence and preservation tests.

### Invitation compatibility

- `src/lib/invitation/chuanHoa.ts`: pure normalization of persisted legacy invitation data.
- `src/lib/invitation/__tests__/chuanHoa.test.ts`: legacy and invalid-reference coverage.
- `src/app/admin/thiep/[id]/page.tsx`: normalize before crossing the Server/Client boundary.
- `src/app/[slug]/page.tsx`: normalize before public rendering.
- `src/app/api/admin/luu/route.ts`: keep structured validation errors and save only valid invitations.
- `src/app/api/admin/__tests__/luuRoute.test.ts`: invalid input and no-write assertions.

### Shared editor

- `src/components/admin/editor/InvitationEditorProvider.tsx`: draft state, immutable updates, selected theme, save status, and save action.
- `src/components/admin/editor/ThemeSelector.tsx`: theme choice without theme-specific logic.
- `src/components/admin/editor/InvitationPreview.tsx`: shared resolver and renderer bridge.
- `src/components/admin/editor/EditorShell.tsx`: toolbar, scrollable panel column, and preview layout.
- `src/components/admin/editor/types.ts`: serializable editor metadata and panel contracts.
- `src/components/admin/editor/registry.tsx`: ordered shared panel registry.
- `src/components/admin/editor/panels/VanHanhPanels.tsx`: publishing, Sheets, URL, and wedding configuration panels.
- `src/components/admin/editor/panels/NoiDungPanels.tsx`: couple, dates, schedule, dress code, gifts, album, music, and RSVP panels.
- `src/components/admin/editor/panels/GiaoDienPanels.tsx`: theme, section ordering, decorations, and opacity panels.
- `src/components/admin/editor/__tests__/InvitationEditorProvider.test.tsx`: immutable update and theme-switch preservation.
- `src/components/admin/editor/__tests__/registry.test.tsx`: shared registry is theme-independent.
- `src/components/admin/BangSua.tsx`: thin composition root retaining its public prop contract.

### Shared rendering and integration

- `src/components/InvitationRenderer.tsx`: consume resolved view configuration.
- `src/components/sections/types.ts`: expose the resolved theme contract to every section.
- `src/components/__tests__/InvitationRenderer.test.tsx`: renderer parity and CSS token tests.
- `src/components/admin/__tests__/BangSua.test.tsx`: editor interaction across two theme fixtures.
- `e2e/quan-tri.spec.ts`: edit, switch theme, save, reload, and public-page flow.

---

### Task 1: Define the declarative theme contract and safe registry

**Files:**
- Modify: `src/lib/themes/types.ts`
- Create: `src/lib/themes/mac-dinh-he-thong.ts`
- Modify: `src/lib/themes/mac-dinh.ts`
- Modify: `src/lib/themes/index.ts`
- Create: `src/lib/themes/__tests__/registry.test.ts`

**Interfaces:**
- Produces: `ThemeDefinition`, `ResolvedTheme`, `THEME_MAC_DINH_ID`, `layTheme(id: string): ThemeDefinition`, and `layThemeAnToan(id: string): { theme: ThemeDefinition; daFallback: boolean }`.
- Consumes: existing `SectionRef`, `SlotHoaTiet`, and `CauHinhQrTheme`.

- [ ] **Step 1: Write failing registry contract tests**

```ts
import { describe, expect, it } from 'vitest'
import { THEMES, THEME_MAC_DINH_ID, layThemeAnToan } from '../index'

describe('theme registry', () => {
  it('mọi theme có đủ hợp đồng dùng chung', () => {
    for (const [id, theme] of Object.entries(THEMES)) {
      expect(theme.id).toBe(id)
      expect(theme.ten.length).toBeGreaterThan(0)
      expect(theme.xemTruoc.alt.length).toBeGreaterThan(0)
      expect(theme.thuTuSection.map((ref) => ref.id)).toContain('bia')
    }
  })

  it('theme không tồn tại fallback về theme mặc định', () => {
    const ketQua = layThemeAnToan('khong-ton-tai')
    expect(ketQua.theme.id).toBe(THEME_MAC_DINH_ID)
    expect(ketQua.daFallback).toBe(true)
  })
})
```

- [ ] **Step 2: Run the tests and verify the missing API failure**

Run: `npm test -- src/lib/themes/__tests__/registry.test.ts`

Expected: FAIL because `THEME_MAC_DINH_ID`, `xemTruoc`, and `layThemeAnToan` do not exist.

- [ ] **Step 3: Add the minimal complete theme contract**

Add these shapes to `src/lib/themes/types.ts` while retaining the existing slot types:

```ts
export interface ThemeDefinition {
  id: string
  ten: string
  xemTruoc: { src: string; alt: string }
  mau: { nen: string; chu: string; chinh: string; phu: string; nhan: string }
  font: { tieuDe: string; noiDung: string }
  boCuc?: {
    doRongThiep?: number
    boGocSection?: number
    khoangCachSection?: number
  }
  bienTheSection?: Partial<Record<SectionId, 'mac-dinh' | 'gon' | 'noi-bat'>>
  hoaTiet: Partial<Record<SlotHoaTiet, string>>
  doDam: Partial<Record<SlotHoaTiet, number>>
  qr: CauHinhQrTheme
  thuTuSection: SectionRef[]
}

export interface ResolvedTheme extends ThemeDefinition {
  boCuc: {
    doRongThiep: number
    boGocSection: number
    khoangCachSection: number
  }
  bienTheSection: Record<SectionId, 'mac-dinh' | 'gon' | 'noi-bat'>
  doDam: Record<SlotHoaTiet, number>
}

export type Theme = ThemeDefinition
```

Create `MAC_DINH_HE_THONG` in `mac-dinh-he-thong.ts` with `doRongThiep: 520`,
`boGocSection: 0`, `khoangCachSection: 0`, every section variant set to
`'mac-dinh'`, and every decoration opacity set to `1`.

Add `xemTruoc: { src: '/theme-previews/mac-dinh.png', alt: 'Giao diện mặc định' }`
to `macDinh`. The referenced preview may use an existing suitable image copied
under `public/theme-previews/mac-dinh.png`; no generated asset is required.

In `src/lib/themes/index.ts`, export:

```ts
export const THEME_MAC_DINH_ID = macDinh.id

export function layThemeAnToan(id: string) {
  const theme = THEMES[id]
  return theme
    ? { theme, daFallback: false }
    : { theme: THEMES[THEME_MAC_DINH_ID], daFallback: true }
}
```

Keep `layTheme` strict for callers and tests that expect an unknown ID to throw.

- [ ] **Step 4: Run focused and existing theme tests**

Run: `npm test -- src/lib/themes src/components/__tests__/HoaTiet.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the theme contract**

```powershell
git add src/lib/themes public/theme-previews/mac-dinh.png
git commit -m "refactor: chuan hoa hop dong theme"
```

---

### Task 2: Add the pure invitation view resolver

**Files:**
- Create: `src/lib/themes/resolve.ts`
- Create: `src/lib/themes/__tests__/resolve.test.ts`
- Modify: `src/components/InvitationRenderer.tsx`
- Modify: `src/components/sections/types.ts`

**Interfaces:**
- Consumes: `Invitation`, `ThemeDefinition`, `MAC_DINH_HE_THONG`, and motif IDs from `DANH_SACH_HOA_TIET`.
- Produces: `ResolvedInvitationView` and `resolveInvitationView(invitation: Invitation, theme: ThemeDefinition): ResolvedInvitationView`.

- [ ] **Step 1: Write failing precedence and fallback tests**

```ts
import { describe, expect, it } from 'vitest'
import { thiepMau } from '@/lib/invitation/mau'
import { macDinh } from '../mac-dinh'
import { resolveInvitationView } from '../resolve'

describe('resolveInvitationView', () => {
  it('override của thiệp thắng theme và mặc định hệ thống', () => {
    const view = resolveInvitationView(
      {
        ...thiepMau,
        tuyChinhGiaoDien: {
          mauChinh: '#112233',
          doDam: { divider: 0.25 },
        },
      },
      macDinh,
    )
    expect(view.theme.mau.chinh).toBe('#112233')
    expect(view.theme.doDam.divider).toBe(0.25)
    expect(view.theme.boCuc.doRongThiep).toBe(520)
  })

  it('không thay đổi invitation đầu vào', () => {
    const input = structuredClone(thiepMau)
    resolveInvitationView(input, macDinh)
    expect(input).toEqual(thiepMau)
  })

  it('bỏ qua id họa tiết override không còn tồn tại', () => {
    const view = resolveInvitationView(
      {
        ...thiepMau,
        tuyChinhGiaoDien: {
          hoaTiet: { corner: { id: 'asset-da-bi-xoa' } },
        },
      },
      macDinh,
    )
    expect(view.tuyChinhHoaTiet.corner?.id).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run the resolver test and verify it fails**

Run: `npm test -- src/lib/themes/__tests__/resolve.test.ts`

Expected: FAIL because `resolveInvitationView` does not exist.

- [ ] **Step 3: Implement the resolver and resolved view**

Define:

```ts
export interface ResolvedInvitationView {
  invitation: Invitation
  theme: ResolvedTheme
  tuyChinhHoaTiet: Partial<Record<'watermark' | 'corner', TuyChinhHoaTietTheme>>
}

export function resolveInvitationView(
  invitation: Invitation,
  theme: ThemeDefinition,
): ResolvedInvitationView
```

Merge nested values explicitly:

- `theme.boCuc` over `MAC_DINH_HE_THONG.boCuc`.
- `theme.bienTheSection` over the complete system section map.
- `theme.doDam`, then invitation `tuyChinhGiaoDien.doDam`, over system opacity.
- Invitation `mauNen`, `mauChinh`, and `mauPhu` over theme colors.
- Preserve `invitation` without mutation.
- For `hoaTiet.watermark` and `hoaTiet.corner`, keep placement/color overrides
  but omit an `id` that is not present in `DANH_SACH_HOA_TIET`.

- [ ] **Step 4: Move merge logic out of the renderer**

Allow `InvitationRenderer` to accept either a resolved view or resolve exactly
once at its boundary:

```ts
export function InvitationRenderer({
  thiep,
  theme,
  view = resolveInvitationView(thiep, theme),
  loiChuc = [],
}: {
  thiep: Invitation
  theme: ThemeDefinition
  view?: ResolvedInvitationView
  loiChuc?: LoiChucDayDu[]
})
```

Use `view.theme` for CSS variables and section props. Add:

```ts
'--do-rong-thiep': `${view.theme.boCuc.doRongThiep}px`,
'--bo-goc-section': `${view.theme.boCuc.boGocSection}px`,
'--khoang-cach-section': `${view.theme.boCuc.khoangCachSection}px`,
```

Replace `max-w-[520px]` with
`style={{ maxWidth: 'var(--do-rong-thiep)' }}`. Update `SectionProps.theme` to
`ResolvedTheme`.

- [ ] **Step 5: Run resolver and renderer tests**

Run: `npm test -- src/lib/themes/__tests__/resolve.test.ts src/components/__tests__/InvitationRenderer.test.tsx src/components/sections`

Expected: PASS.

- [ ] **Step 6: Commit the shared resolver**

```powershell
git add src/lib/themes src/components/InvitationRenderer.tsx src/components/sections/types.ts
git commit -m "refactor: dung chung bo resolve giao dien thiep"
```

---

### Task 3: Normalize legacy data at read boundaries

**Files:**
- Create: `src/lib/invitation/chuanHoa.ts`
- Create: `src/lib/invitation/__tests__/chuanHoa.test.ts`
- Modify: `src/app/admin/thiep/[id]/page.tsx`
- Modify: `src/app/[slug]/page.tsx`
- Modify: `src/app/api/admin/luu/route.ts`
- Create: `src/app/api/admin/__tests__/luuRoute.test.ts`

**Interfaces:**
- Consumes: `invitationSchema`, `THEMES`, `THEME_MAC_DINH_ID`, and persisted `unknown`.
- Produces: `chuanHoaThiep(duLieu: unknown): { thiep: Invitation; themeDaFallback: boolean }`.

- [ ] **Step 1: Write failing normalization tests**

```ts
import { expect, it } from 'vitest'
import { thiepMau } from '../mau'
import { chuanHoaThiep } from '../chuanHoa'

it('điền collection thiếu của dữ liệu cũ', () => {
  const { thiep } = chuanHoaThiep({
    ...thiepMau,
    sections: undefined,
    album: undefined,
    suKien: undefined,
    mungCuoi: undefined,
    chuyenChungMinh: undefined,
  })
  expect(thiep.sections).toEqual([])
  expect(thiep.album).toEqual([])
  expect(thiep.suKien).toEqual([])
  expect(thiep.mungCuoi).toEqual([])
  expect(thiep.chuyenChungMinh).toEqual([])
})

it('fallback theme sai nhưng giữ nội dung', () => {
  const { thiep, themeDaFallback } = chuanHoaThiep({
    ...thiepMau,
    themeId: 'theme-da-xoa',
  })
  expect(themeDaFallback).toBe(true)
  expect(thiep.chuRe).toEqual(thiepMau.chuRe)
  expect(thiep.themeId).toBe('mac-dinh')
})
```

- [ ] **Step 2: Run the normalization test and verify it fails**

Run: `npm test -- src/lib/invitation/__tests__/chuanHoa.test.ts`

Expected: FAIL because `chuanHoaThiep` does not exist.

- [ ] **Step 3: Implement pure normalization**

In `chuanHoa.ts`, treat a non-object as invalid, shallow-copy the object, default
the five required arrays to `[]`, filter `sections` to known `SectionId` values,
replace an unknown `themeId` with `THEME_MAC_DINH_ID`, and finish with
`invitationSchema.parse(candidate)`. Return whether the theme was replaced.

Do not persist from this function and do not mutate the input.

- [ ] **Step 4: Apply normalization at server read boundaries**

In both server pages, call `chuanHoaThiep(ban.thiep)` before rendering. Pass
`themeDaFallback` into `BangSua` on the admin page. On the public page, resolve
the normalized `themeId` with `layTheme`.

Keep the existing async `params: Promise<...>` signature required by the
installed Next.js version.

- [ ] **Step 5: Write and run the save-route no-write test**

Mock `luuThiep`, send a request with an invalid invitation, and assert:

```ts
expect(response.status).toBe(400)
expect(await response.json()).toEqual({
  loi: expect.any(String),
  truong: expect.any(String),
})
expect(luuThiep).not.toHaveBeenCalled()
```

Modify the route to return the first Zod issue as `{ loi, truong:
issue.path.join('.') }`. Run:

`npm test -- src/app/api/admin/__tests__/luuRoute.test.ts`

Expected: PASS.

- [ ] **Step 6: Run invitation, DB, and page-adjacent tests**

Run: `npm test -- src/lib/invitation src/lib/db src/app/api/admin`

Expected: PASS.

- [ ] **Step 7: Commit compatibility handling**

```powershell
git add src/lib/invitation src/app/admin/thiep src/app/[slug] src/app/api/admin
git commit -m "refactor: chuan hoa du lieu thiep khi doc"
```

---

### Task 4: Introduce the shared editor state provider

**Files:**
- Create: `src/components/admin/editor/types.ts`
- Create: `src/components/admin/editor/InvitationEditorProvider.tsx`
- Create: `src/components/admin/editor/__tests__/InvitationEditorProvider.test.tsx`

**Interfaces:**
- Consumes: serializable `EditorMetadata` and normalized `Invitation`.
- Produces: `InvitationEditorProvider`, `useInvitationEditor()`, `updateField<K extends keyof Invitation>(key: K, value: Invitation[K]): void`, `updateDraft(updater: (draft: Invitation) => Invitation): void`, and `save(): Promise<void>`.

- [ ] **Step 1: Write failing provider behavior tests**

Use a probe component calling `useInvitationEditor()`. Cover:

```ts
it('đổi theme chỉ cập nhật themeId', async () => {
  const banDau = structuredClone(thiepMau)
  // render provider and probe, call updateField('themeId', 'theme-thu-hai')
  expect(latest.draft).toEqual({ ...banDau, themeId: 'theme-thu-hai' })
  expect(banDau).toEqual(thiepMau)
})

it('lưu lỗi giữ nguyên bản nháp để thử lại', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({ loi: 'Mất kết nối' }),
  }))
  // edit bride name, call save()
  expect(latest.draft.coDau.ten).toBe('Tên đã sửa')
  expect(latest.saveStatus).toEqual({ kind: 'error', message: 'Mất kết nối' })
})
```

- [ ] **Step 2: Run the provider test and verify it fails**

Run: `npm test -- src/components/admin/editor/__tests__/InvitationEditorProvider.test.tsx`

Expected: FAIL because the provider and hook do not exist.

- [ ] **Step 3: Implement metadata and context**

Define serializable metadata:

```ts
export interface EditorMetadata {
  invitationId: string
  publicSlug: string | null
  vongDoi: VongDoi
  spreadsheetId: string | null
  emailServiceAccount: string
  themeDaFallback: boolean
}
```

The context exposes:

```ts
interface InvitationEditorContextValue {
  draft: Invitation
  theme: ThemeDefinition
  metadata: EditorMetadata
  saveStatus:
    | { kind: 'idle' }
    | { kind: 'saving'; message: string }
    | { kind: 'saved'; message: string }
    | { kind: 'error'; message: string }
  updateField: <K extends keyof Invitation>(key: K, value: Invitation[K]) => void
  updateDraft: (updater: (draft: Invitation) => Invitation) => void
  save: () => Promise<void>
}
```

Resolve `theme` with `layThemeAnToan(draft.themeId).theme`. `save()` posts the
current draft to `/api/admin/luu`; failure changes only `saveStatus`.

- [ ] **Step 4: Run provider tests**

Run: `npm test -- src/components/admin/editor/__tests__/InvitationEditorProvider.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the editor state boundary**

```powershell
git add src/components/admin/editor
git commit -m "refactor: tach trang thai editor dung chung"
```

---

### Task 5: Register theme-independent editor panels

**Files:**
- Create: `src/components/admin/editor/registry.tsx`
- Create: `src/components/admin/editor/panels/VanHanhPanels.tsx`
- Create: `src/components/admin/editor/panels/NoiDungPanels.tsx`
- Create: `src/components/admin/editor/panels/GiaoDienPanels.tsx`
- Create: `src/components/admin/editor/ThemeSelector.tsx`
- Create: `src/components/admin/editor/__tests__/registry.test.tsx`

**Interfaces:**
- Consumes: `useInvitationEditor()` and existing focused controls under `src/components/admin/`.
- Produces: `EditorPanelDefinition`, `EDITOR_PANEL_REGISTRY`, and a panel list that is identical for every theme.

- [ ] **Step 1: Write the failing registry invariance test**

```ts
import { expect, it } from 'vitest'
import { EDITOR_PANEL_REGISTRY } from '../registry'

it('registry không lọc panel theo theme', () => {
  expect(EDITOR_PANEL_REGISTRY.map((panel) => panel.id)).toEqual([
    'van-hanh',
    'cau-hinh',
    'giao-dien',
    'nguoi-cuoi',
    'ngay-cuoi',
    'lich-trinh',
    'dress-code',
    'mung-cuoi',
    'album',
    'nhac',
    'rsvp',
    'sections',
    'trang-tri',
  ])
  expect(EDITOR_PANEL_REGISTRY.every((panel) => !('themeId' in panel))).toBe(true)
})
```

- [ ] **Step 2: Run the registry test and verify it fails**

Run: `npm test -- src/components/admin/editor/__tests__/registry.test.tsx`

Expected: FAIL because the registry does not exist.

- [ ] **Step 3: Define and populate the registry**

Use:

```ts
export interface EditorPanelDefinition {
  id: string
  Component: ComponentType
}

export const EDITOR_PANEL_REGISTRY: EditorPanelDefinition[] = [
  { id: 'van-hanh', Component: VanHanhPanel },
  { id: 'cau-hinh', Component: CauHinhPanel },
  { id: 'giao-dien', Component: GiaoDienPanel },
  { id: 'nguoi-cuoi', Component: NguoiCuoiPanel },
  { id: 'ngay-cuoi', Component: NgayCuoiPanel },
  { id: 'lich-trinh', Component: LichTrinhPanel },
  { id: 'dress-code', Component: DressCodePanel },
  { id: 'mung-cuoi', Component: MungCuoiPanel },
  { id: 'album', Component: AlbumPanel },
  { id: 'nhac', Component: NhacPanel },
  { id: 'rsvp', Component: RsvpPanel },
  { id: 'sections', Component: SectionsPanel },
  { id: 'trang-tri', Component: TrangTriPanel },
]
```

Move the existing JSX from `BangSua` into these focused panel components without
changing Vietnamese labels or business behavior. Each panel reads shared state
from `useInvitationEditor`; existing controls remain controlled through their
current `value`/`onChange` contracts.

- [ ] **Step 4: Implement the theme selector and fallback warning**

`ThemeSelector` renders `Object.values(THEMES)` and calls only:

```ts
updateField('themeId', event.target.value)
```

If `metadata.themeDaFallback` is true, show a `role="alert"` message explaining
that the removed/unknown theme was replaced by the default and asking the user
to save to confirm.

- [ ] **Step 5: Run registry and existing control tests**

Run: `npm test -- src/components/admin/editor src/components/admin/__tests__`

Expected: PASS.

- [ ] **Step 6: Commit the shared panel registry**

```powershell
git add src/components/admin/editor
git commit -m "refactor: dang ky cac bang sua thiep dung chung"
```

---

### Task 6: Compose the editor shell and shared preview

**Files:**
- Create: `src/components/admin/editor/InvitationPreview.tsx`
- Create: `src/components/admin/editor/EditorShell.tsx`
- Modify: `src/components/admin/BangSua.tsx`
- Create: `src/components/admin/__tests__/BangSua.test.tsx`

**Interfaces:**
- Consumes: `InvitationEditorProvider`, `EDITOR_PANEL_REGISTRY`, `resolveInvitationView`, and `InvitationRenderer`.
- Produces: the unchanged `BangSua` public entry point plus the new required boolean prop `themeDaFallback`.

- [ ] **Step 1: Write a failing cross-theme editor test**

Register a second test-only `ThemeDefinition` with a distinct background color,
render `BangSua`, edit the bride name, switch theme, and assert:

```ts
expect(screen.getByDisplayValue('Tên cô dâu mới')).toBeInTheDocument()
expect(screen.getAllByText('Tên cô dâu mới').length).toBeGreaterThan(1)
expect(screen.getByTestId('invitation-preview-root')).toHaveStyle({
  backgroundColor: 'var(--mau-nen)',
})
```

Also inspect the preview CSS variable and assert the second theme color is used
while the edited name remains.

- [ ] **Step 2: Run the editor integration test and verify it fails**

Run: `npm test -- src/components/admin/__tests__/BangSua.test.tsx`

Expected: FAIL because the provider, shell, and preview are not yet composed.

- [ ] **Step 3: Implement `InvitationPreview`**

```tsx
export function InvitationPreview() {
  const { draft, theme } = useInvitationEditor()
  const view = useMemo(
    () => resolveInvitationView(draft, theme),
    [draft, theme],
  )

  return (
    <div data-testid="invitation-preview-root" className="flex-1 overflow-y-auto bg-neutral-100">
      <InvitationRenderer thiep={draft} theme={theme} view={view} />
    </div>
  )
}
```

- [ ] **Step 4: Implement `EditorShell`**

Render the back link, save button, accessible save state, every component in
`EDITOR_PANEL_REGISTRY`, and `InvitationPreview`. Keep the existing responsive
two-column behavior and scroll boundaries.

- [ ] **Step 5: Reduce `BangSua` to the composition root**

Keep the existing metadata props, add `themeDaFallback`, build one
`EditorMetadata` object, and render:

```tsx
<InvitationEditorProvider initialInvitation={banDau} metadata={metadata}>
  <EditorShell />
</InvitationEditorProvider>
```

Remove all form state, save fetch logic, and theme-specific merge logic from
`BangSua`.

- [ ] **Step 6: Run editor and renderer suites**

Run: `npm test -- src/components/admin src/components/__tests__/InvitationRenderer.test.tsx src/components/sections`

Expected: PASS.

- [ ] **Step 7: Commit the composed editor**

```powershell
git add src/components/admin
git commit -m "refactor: dung editor chung cho moi giao dien"
```

---

### Task 7: Prove persistence and public-preview parity

**Files:**
- Modify: `e2e/quan-tri.spec.ts`
- Modify: `docs/kiem-tra-tay.md`

**Interfaces:**
- Consumes: the complete shared editor, normalized server reads, save route, and public renderer.
- Produces: regression coverage for the approved user workflow.

- [ ] **Step 1: Add the failing end-to-end scenario**

Add a scenario that:

1. Logs in and creates an invitation.
2. Changes the bride name to `Cô Dâu Giữ Nguyên`.
3. Changes one appearance override.
4. Selects a second registered production theme fixture added for this test
   flow, with visibly different default background and the same section set.
5. Verifies the edited name and override remain in the editor.
6. Saves, reloads, and verifies both remain.
7. Publishes and opens the public URL.
8. Verifies the public invitation has the same bride name, selected theme token,
   section order, and override as the preview.

Use stable labels and `data-*` attributes; do not assert Tailwind-generated class
names.

- [ ] **Step 2: Run the scenario and verify it fails for the intended missing fixture or selector**

Run: `npx playwright test e2e/quan-tri.spec.ts --grep "đổi giao diện giữ nguyên dữ liệu"`

Expected: FAIL at the first assertion not yet supported by the production second
theme fixture or parity selector.

- [ ] **Step 3: Add the smallest production theme fixture required by the test**

Create `src/lib/themes/kiem-thu-chia-se.ts` as a complete `ThemeDefinition` using
the same section set and existing assets, but with a distinct safe color palette.
Register it in `THEMES`. This fixture demonstrates that adding a theme changes
only the theme registry and assets; it must not add editor or renderer branches.

Add stable attributes to the invitation root only:

```tsx
data-theme-id={view.theme.id}
data-invitation-root
```

- [ ] **Step 4: Run the focused end-to-end scenario**

Run: `npx playwright test e2e/quan-tri.spec.ts --grep "đổi giao diện giữ nguyên dữ liệu"`

Expected: PASS.

- [ ] **Step 5: Update manual verification notes**

Add a section to `docs/kiem-tra-tay.md` with these exact checks:

- Open an existing invitation, record its section order and one custom motif.
- Switch between both registered themes.
- Confirm all editor panels remain available.
- Confirm content, section order, and the custom motif remain unchanged.
- Save, reload, and compare the public page with the admin preview.
- Temporarily load a fixture with an unknown theme ID and confirm the fallback warning appears.

- [ ] **Step 6: Run full verification**

Run:

```powershell
npm test
npm run lint
npm run build
npx playwright test
git diff --check
```

Expected: every command exits with code `0`.

- [ ] **Step 7: Commit integration coverage**

```powershell
git add src/lib/themes e2e/quan-tri.spec.ts docs/kiem-tra-tay.md
git commit -m "test: bao ve editor khi doi giao dien"
```

---

## Completion Review

- Confirm `rg -n "themeId.*\\?|themeId.*===|switch.*themeId" src/components/admin src/components/InvitationRenderer.tsx` returns no theme-specific editor or renderer branches.
- Confirm every registered theme passes the contract suite.
- Confirm unknown themes normalize to the default without losing invitation content.
- Confirm an API validation failure never calls `luuThiep`.
- Confirm theme switching preserves content, section state, and overrides before and after reload.
- Confirm preview and public rendering use `resolveInvitationView` and `InvitationRenderer`.
- Confirm no theme-specific panel registry exists.

