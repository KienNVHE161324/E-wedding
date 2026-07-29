# Per-Text Invitation Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho phép quản trị viên chọn từng vùng chữ trên thiệp để sửa nội dung, phông, màu, cỡ và vị trí bằng kéo-thả hoặc tọa độ mà không làm thay đổi thiệp cũ.

**Architecture:** Mỗi vùng chữ có ID ổn định và được render qua component nhẹ `VungChu`; style/vị trí ghi đè nằm trong `Invitation.tuyChinhChu`, còn nội dung nghiệp vụ tiếp tục cập nhật trường gốc. Nhánh quản trị bọc renderer bằng context editor để chọn/kéo vùng chữ và hiển thị panel; renderer công khai chỉ nhận context rỗng và không tải panel quản trị.

**Tech Stack:** Next.js 16.2.12 App Router, React 19.2.4, TypeScript, Zod 4, Tailwind CSS 4, Vitest/Testing Library, Playwright.

## Global Constraints

- Đọc `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md` trước khi sửa font.
- Đọc `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` trước khi thêm context/client boundary.
- Không nhận URL font, tên font hoặc CSS tùy ý từ dữ liệu quản trị.
- `font` chỉ nhận `serif-co-dien`, `sans-sach`, `viet-tay`.
- `coChu` nằm trong `8..120`; `x/y` nằm trong `-100..100`; màu theo `#RRGGBB`.
- `tuyChinhChu` có tối đa 250 khóa; nội dung hệ thống tối đa 500 ký tự.
- `x/y` là độ dịch chuyển theo phần trăm chiều rộng khung thiệp 520 px; `0/0` giữ layout gốc.
- Nhãn/placeholder/option/lỗi form, nội dung khách gửi và accessible-only labels không trở thành vùng chỉnh sửa.
- Nội dung nghiệp vụ cập nhật trường gốc; `tuyChinhChu[id].noiDung` chỉ dùng cho copy hệ thống.
- Thiệp cũ không có `tuyChinhChu` hoặc ID phần tử lặp phải parse và render không đổi.
- Mỗi task dùng TDD, chỉ commit các file thuộc task sau khi test task pass.

---

## File Map

**Model and utilities**

- Create `src/lib/invitation/textTypes.ts`: kiểu font, override và ID vùng chữ.
- Create `src/lib/invitation/textOverrides.ts`: merge/reset/dọn override và toán học kéo.
- Create `src/lib/invitation/textRegions.ts`: registry tĩnh, descriptor động và setter nội dung nghiệp vụ.
- Create `src/lib/invitation/normalizeTextIds.ts`: gắn ID bền vững cho `SuKien`/`ChangChuyen`.
- Modify `src/lib/invitation/types.ts`: thêm ID dữ liệu lặp và `tuyChinhChu`.
- Modify `src/lib/invitation/schema.ts`: validation cho ID và override.

**Rendering and fonts**

- Create `src/components/text/VungChu.tsx`: renderer span semantic-safe.
- Create `src/components/text/TextEditorBridge.tsx`: context nhẹ dùng chung renderer/editor.
- Create `src/lib/invitation/fonts.ts`: registry font và CSS family.
- Modify `src/app/layout.tsx`: self-host font bằng `next/font/google`.
- Modify `src/components/InvitationRenderer.tsx`: biến tỷ lệ font và bridge tùy chọn.
- Modify section/popup components để đăng ký vùng chữ.

**Admin editor**

- Create `src/components/admin/text/TextEditorProvider.tsx`: selection và Pointer Events.
- Create `src/components/admin/text/BangChinhChu.tsx`: danh sách vùng và controls.
- Create `src/components/admin/text/numberInput.ts`: parse input số dở dang.
- Modify `src/components/admin/BangSua.tsx`: normalize state, bật/tắt editor và cập nhật dữ liệu.
- Modify `src/components/admin/OLichTrinh.tsx`: giữ ID khi thêm/sửa/xóa và dọn override qua callback cha.
- Modify `src/components/admin/ChonChiTiet.tsx`: dùng chung font registry.

**Tests**

- Add unit tests beside each new utility/component.
- Add `src/components/admin/__tests__/BangSua.textEditor.test.tsx`.
- Add `e2e/chinh-chu.spec.ts`.

## Required Region IDs

The registry and rendered DOM must use these exact IDs:

- `bia.loi-mo-dau`, `bia.chu-re.ten`, `bia.ky-hieu-noi`,
  `bia.co-dau.ten`, `bia.nut-mo`.
- `dem-nguoc.tieu-de`, `dem-nguoc.thang`, `dem-nguoc.thu`,
  `dem-nguoc.ngay`.
- `co-dau-chu-re.tieu-de`, `co-dau-chu-re.ky-hieu-noi`, plus
  `co-dau-chu-re.<chu-re|co-dau>.<vai-tro|ten|gioi-thieu|ten-bo|ten-me>`.
- `chuyen-chung-minh.tieu-de`, plus
  `chuyen-chung-minh.<item-id>.<tieu-de|noi-dung>` only for story fields the
  component actually renders.
- `album.tieu-de`.
- `su-kien.tieu-de`, `su-kien.ngay.<yyyy-mm-dd>`, plus
  `su-kien.<item-id>.<gio|ten|dia-diem|nut-them-lich>`.
- `dress-code.tieu-de`, `dress-code.mo-ta`, `dress-code.huong-dan`.
- `rsvp.tieu-de`, `rsvp.loi-moi`, `rsvp.nut-mo`.
- `mung-cuoi.tieu-de`, plus
  `mung-cuoi.<nha-trai|nha-gai>.<ten-ben|chu-tai-khoan|so-tai-khoan|ngan-hang|goi-y-mo|nut-sao-chep>`.
- `so-luu-but.tieu-de`, `so-luu-but.trang-thai-rong`,
  `so-luu-but.nut-gui`, `so-luu-but.cam-on`.
- `popup-rsvp.tieu-de`, `nut-rsvp-noi`,
  `popup-loi-chuc.tieu-de`, `popup-mung-cuoi.tieu-de`.

The following must never receive IDs: input labels/placeholders/options/errors,
album navigation/close controls, music controls, popup close controls, guest
names and guest-submitted wishes.

---

### Task 1: Extend the invitation model and schema

**Files:**

- Create: `src/lib/invitation/textTypes.ts`
- Modify: `src/lib/invitation/types.ts`
- Modify: `src/lib/invitation/schema.ts`
- Modify: `src/lib/invitation/__tests__/schema.test.ts`

**Interfaces:**

- Produces:

```ts
export const FONT_CHU = ['serif-co-dien', 'sans-sach', 'viet-tay'] as const
export type FontChu = (typeof FONT_CHU)[number]
export type TextRegionId = string

export interface TuyChinhVungChu {
  noiDung?: string
  font?: FontChu
  coChu?: number
  mauChu?: string
  x?: number
  y?: number
}

export type TuyChinhChu = Record<TextRegionId, TuyChinhVungChu>
```

- Adds `id?: string` to `ChangChuyen` and `SuKien`.
- Adds `tuyChinhChu?: TuyChinhChu` to `Invitation`.
- Replaces `FontChuChiTiet` union with alias `FontChu` so D1 accepts the same catalog.

- [ ] **Step 1: Write failing schema tests**

Append tests that parse:

```ts
const tuyChinhChuHopLe = {
  'bia.chu-re.ten': {
    font: 'viet-tay',
    coChu: 42,
    mauChu: '#8B2F20',
    x: 12.5,
    y: -3,
  },
}

expect(
  invitationSchema.parse({ ...thiepMau, tuyChinhChu: tuyChinhChuHopLe }).tuyChinhChu,
).toEqual(tuyChinhChuHopLe)

for (const sai of [
  { font: 'comic-sans' },
  { coChu: 121 },
  { coChu: 7 },
  { mauChu: 'red' },
  { x: -101 },
  { y: 101 },
  { noiDung: 'x'.repeat(501) },
]) {
  expect(() =>
    invitationSchema.parse({ ...thiepMau, tuyChinhChu: { 'bia.loi-mo-dau': sai } }),
  ).toThrow()
}

expect(() =>
  invitationSchema.parse({
    ...thiepMau,
    tuyChinhChu: Object.fromEntries(
      Array.from({ length: 251 }, (_, i) => [`vung-${i}`, { x: 0 }]),
    ),
  }),
).toThrow()
```

Also assert an old invitation without IDs and without `tuyChinhChu` still parses.

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```powershell
npm test -- src/lib/invitation/__tests__/schema.test.ts
```

Expected: FAIL because `tuyChinhChu` and `viet-tay` are not in the model/schema.

- [ ] **Step 3: Add the types and Zod schema**

Implement `textTypes.ts` exactly as the interface block above. In `schema.ts` add:

```ts
const tuyChinhVungChuSchema = z.object({
  noiDung: z.string().max(500).optional(),
  font: z.enum(FONT_CHU).optional(),
  coChu: z.number().min(8).max(120).optional(),
  mauChu: maMauSchema.optional(),
  x: z.number().min(-100).max(100).optional(),
  y: z.number().min(-100).max(100).optional(),
})

const tuyChinhChuSchema = z
  .record(z.string().min(1), tuyChinhVungChuSchema)
  .refine((v) => Object.keys(v).length <= 250, 'Tối đa 250 vùng chữ')
```

Add optional `id` schemas with `z.string().uuid().optional()` to `SuKien` and
`ChangChuyen`. Add `tuyChinhChu: tuyChinhChuSchema.optional()` to the invitation.

- [ ] **Step 4: Run model tests**

Run:

```powershell
npm test -- src/lib/invitation/__tests__/schema.test.ts src/lib/invitation/__tests__/cauHinh.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/invitation/textTypes.ts src/lib/invitation/types.ts src/lib/invitation/schema.ts src/lib/invitation/__tests__/schema.test.ts
git commit -m "feat: add per-text invitation overrides"
```

---

### Task 2: Normalize stable IDs for repeated content

**Files:**

- Create: `src/lib/invitation/normalizeTextIds.ts`
- Create: `src/lib/invitation/__tests__/normalizeTextIds.test.ts`
- Modify: `src/lib/invitation/taoMoi.ts`
- Modify: `src/lib/invitation/__tests__/taoMoi.test.ts`
- Modify: `src/components/admin/OLichTrinh.tsx`
- Modify: `src/components/admin/__tests__/OLichTrinh.test.tsx`

**Interfaces:**

- Produces:

```ts
export function damBaoIdVungChu(
  thiep: Invitation,
  taoId?: () => string,
): Invitation
```

- New `SuKien` and `ChangChuyen` items created in the admin always receive `crypto.randomUUID()`.

- [ ] **Step 1: Write failing normalization tests**

```ts
const ids = ['00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002']
let i = 0
const ketQua = damBaoIdVungChu(
  {
    ...thiepMau,
    suKien: [{ ngay: '2026-09-29', gio: '09:00', ten: 'Đón khách' }],
    chuyenChungMinh: [{ anh: thiepMau.album[0], tieuDe: 'Gặp nhau', noiDung: '...' }],
  },
  () => ids[i++],
)

expect(ketQua.suKien[0].id).toBe(ids[0])
expect(ketQua.chuyenChungMinh[0].id).toBe(ids[1])
expect(damBaoIdVungChu(ketQua, () => crypto.randomUUID())).toEqual(ketQua)
expect(ketQua).not.toBe(thiepMau)
```

Add an `OLichTrinh` test asserting a newly added item includes a UUID and editing
an existing item keeps its ID.

- [ ] **Step 2: Run focused tests and confirm RED**

```powershell
npm test -- src/lib/invitation/__tests__/normalizeTextIds.test.ts src/components/admin/__tests__/OLichTrinh.test.tsx
```

Expected: FAIL because the normalizer does not exist and new events have no ID.

- [ ] **Step 3: Implement immutable normalization**

```ts
export function damBaoIdVungChu(
  thiep: Invitation,
  taoId: () => string = () => crypto.randomUUID(),
): Invitation {
  return {
    ...thiep,
    suKien: thiep.suKien.map((item) => item.id ? item : { ...item, id: taoId() }),
    chuyenChungMinh: thiep.chuyenChungMinh.map((item) =>
      item.id ? item : { ...item, id: taoId() },
    ),
  }
}
```

Use `crypto.randomUUID()` when `OLichTrinh.them()` creates a new event. Ensure
`taoMoi.ts` assigns IDs to any repeated default data it creates.

- [ ] **Step 4: Run focused tests**

```powershell
npm test -- src/lib/invitation/__tests__/normalizeTextIds.test.ts src/components/admin/__tests__/OLichTrinh.test.tsx src/lib/invitation/__tests__/taoMoi.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/invitation/normalizeTextIds.ts src/lib/invitation/__tests__/normalizeTextIds.test.ts src/lib/invitation/taoMoi.ts src/lib/invitation/__tests__/taoMoi.test.ts src/components/admin/OLichTrinh.tsx src/components/admin/__tests__/OLichTrinh.test.tsx
git commit -m "feat: assign stable ids to invitation text items"
```

---

### Task 3: Add override helpers, pointer math, and font registry

**Files:**

- Create: `src/lib/invitation/textOverrides.ts`
- Create: `src/lib/invitation/__tests__/textOverrides.test.ts`
- Create: `src/lib/invitation/fonts.ts`
- Create: `src/lib/invitation/__tests__/fonts.test.ts`

**Interfaces:**

```ts
export const FONT_CHU_OPTIONS: readonly {
  id: FontChu
  nhan: string
  css: string
}[]

export function capNhatVungChu(
  hienTai: TuyChinhChu | undefined,
  id: TextRegionId,
  thayDoi: Partial<TuyChinhVungChu>,
): TuyChinhChu | undefined

export function xoaOverrideTheoPrefix(
  hienTai: TuyChinhChu | undefined,
  prefix: string,
): TuyChinhChu | undefined

export function deltaSangToaDo(
  deltaX: number,
  deltaY: number,
  rongKhung: number,
  banDau: { x: number; y: number },
): { x: number; y: number }
```

- [ ] **Step 1: Write failing utility tests**

```ts
expect(capNhatVungChu(undefined, 'bia.loi-mo-dau', { x: 2 })).toEqual({
  'bia.loi-mo-dau': { x: 2 },
})
expect(capNhatVungChu({ 'bia.loi-mo-dau': { x: 2 } }, 'bia.loi-mo-dau', { x: undefined }))
  .toBeUndefined()
expect(
  xoaOverrideTheoPrefix(
    {
      'su-kien.a.ten': { x: 1 },
      'su-kien.a.gio': { y: 2 },
      'su-kien.b.ten': { x: 3 },
    },
    'su-kien.a.',
  ),
).toEqual({ 'su-kien.b.ten': { x: 3 } })
expect(deltaSangToaDo(52, -26, 520, { x: 1, y: 2 })).toEqual({ x: 11, y: -3 })
expect(deltaSangToaDo(10000, -10000, 520, { x: 0, y: 0 })).toEqual({ x: 100, y: -100 })
```

Assert font IDs are unique and include all three allowed values.

- [ ] **Step 2: Run tests and confirm RED**

```powershell
npm test -- src/lib/invitation/__tests__/textOverrides.test.ts src/lib/invitation/__tests__/fonts.test.ts
```

- [ ] **Step 3: Implement helpers**

Delete keys whose value is `undefined`, delete empty region objects, and return
`undefined` when the whole map is empty. Round coordinates to one decimal and
clamp with:

```ts
const clamp = (n: number) => Math.max(-100, Math.min(100, Math.round(n * 10) / 10))
```

Define font CSS mappings:

```ts
export const FONT_CHU_OPTIONS = [
  { id: 'serif-co-dien', nhan: 'Có chân cổ điển', css: 'var(--font-serif-co-dien), "Times New Roman", serif' },
  { id: 'sans-sach', nhan: 'Không chân dễ đọc', css: 'var(--font-he-thong), Arial, sans-serif' },
  { id: 'viet-tay', nhan: 'Viết tay', css: 'var(--font-viet-tay), cursive' },
] as const
```

- [ ] **Step 4: Run utility tests**

```powershell
npm test -- src/lib/invitation/__tests__/textOverrides.test.ts src/lib/invitation/__tests__/fonts.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/invitation/textOverrides.ts src/lib/invitation/fonts.ts src/lib/invitation/__tests__/textOverrides.test.ts src/lib/invitation/__tests__/fonts.test.ts
git commit -m "feat: add text override utilities"
```

---

### Task 4: Build the text-region registry and canonical content setters

**Files:**

- Create: `src/lib/invitation/textRegions.ts`
- Create: `src/lib/invitation/__tests__/textRegions.test.ts`

**Interfaces:**

```ts
export type NhomVungChu = 'title' | 'body' | 'caption' | 'action'

export interface MoTaVungChu {
  id: TextRegionId
  section: SectionId | 'popup'
  nhan: string
  nhom: NhomVungChu
  noiDung: string
  choSuaNoiDung: boolean
  capNhatNoiDung?: (thiep: Invitation, noiDung: string) => Invitation
}

export function lietKeVungChu(thiep: Invitation): MoTaVungChu[]
export function timVungChu(thiep: Invitation, id: TextRegionId): MoTaVungChu | undefined
```

- [ ] **Step 1: Write failing registry tests**

Assert static IDs exist exactly once:

```ts
const ids = lietKeVungChu(thiepMau).map((v) => v.id)
expect(new Set(ids).size).toBe(ids.length)
expect(ids).toEqual(expect.arrayContaining([
  'bia.loi-mo-dau',
  'bia.chu-re.ten',
  'bia.ky-hieu-noi',
  'bia.co-dau.ten',
  'bia.nut-mo',
  'dem-nguoc.tieu-de',
  'co-dau-chu-re.tieu-de',
  'album.tieu-de',
  'dress-code.tieu-de',
  'rsvp.tieu-de',
  'rsvp.loi-moi',
  'rsvp.nut-mo',
  'mung-cuoi.tieu-de',
  'so-luu-but.tieu-de',
  'so-luu-but.nut-gui',
  'popup-rsvp.tieu-de',
  'popup-loi-chuc.tieu-de',
]))
```

For an event with ID `abc`, assert `su-kien.abc.gio`, `.ten`, `.dia-diem` exist.
Call the `.ten` setter and assert only that event changes. Assert guest messages,
form labels and accessible-only labels are absent.

- [ ] **Step 2: Run registry tests and confirm RED**

```powershell
npm test -- src/lib/invitation/__tests__/textRegions.test.ts
```

- [ ] **Step 3: Implement static descriptors and dynamic factories**

Use small factories, not one giant conditional:

```ts
function suKienRegions(sk: SuKien): MoTaVungChu[] {
  if (!sk.id) return []
  const prefix = `su-kien.${sk.id}`
  return [
    descriptor(`${prefix}.gio`, 'Giờ sự kiện', 'caption', sk.gio, (t, v) =>
      suaSuKien(t, sk.id!, { gio: v })),
    descriptor(`${prefix}.ten`, 'Tên sự kiện', 'title', sk.ten, (t, v) =>
      suaSuKien(t, sk.id!, { ten: v })),
    descriptor(`${prefix}.dia-diem`, 'Địa điểm', 'body', sk.diaDiem ?? '', (t, v) =>
      suaSuKien(t, sk.id!, { diaDiem: v || undefined })),
  ]
}
```

Static system copy descriptors set `choSuaNoiDung: true` but omit
`capNhatNoiDung`; the panel will write `tuyChinhChu[id].noiDung`. Generated
calendar cells expose group style descriptors with `choSuaNoiDung: false`.

- [ ] **Step 4: Run registry tests**

```powershell
npm test -- src/lib/invitation/__tests__/textRegions.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/invitation/textRegions.ts src/lib/invitation/__tests__/textRegions.test.ts
git commit -m "feat: register editable invitation text regions"
```

---

### Task 5: Implement lightweight text rendering and font loading

**Files:**

- Create: `src/components/text/TextEditorBridge.tsx`
- Create: `src/components/text/VungChu.tsx`
- Create: `src/components/text/__tests__/VungChu.test.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/InvitationRenderer.tsx`
- Modify: `src/components/__tests__/InvitationRenderer.test.tsx`

**Interfaces:**

```ts
export interface TextEditorBridgeValue {
  dangChinh: boolean
  dangChon: TextRegionId | null
  chon: (id: TextRegionId) => void
  batDauKeo: (id: TextRegionId, event: React.PointerEvent<HTMLElement>) => void
  dichBangPhim: (id: TextRegionId, dx: number, dy: number) => void
}

export function VungChu(props: {
  id: TextRegionId
  thiep: Invitation
  noiDung: React.ReactNode
  className?: string
}): React.ReactElement
```

- [ ] **Step 1: Write failing renderer tests**

```tsx
render(
  <p>
    <VungChu
      id="bia.loi-mo-dau"
      thiep={{
        ...thiepMau,
        tuyChinhChu: {
          'bia.loi-mo-dau': {
            noiDung: 'Trân trọng kính mời',
            font: 'viet-tay',
            coChu: 40,
            mauChu: '#123456',
            x: 10,
            y: -5,
          },
        },
      }}
      noiDung="Thân mời"
    />
  </p>,
)
const vung = screen.getByText('Trân trọng kính mời')
expect(vung.tagName).toBe('SPAN')
expect(vung).toHaveAttribute('data-text-region', 'bia.loi-mo-dau')
expect(vung.style.color).toBe('rgb(18, 52, 86)')
expect(vung.style.fontFamily).toContain('--font-viet-tay')
expect(vung.style.transform).toContain('--khung-thiep-rong')
```

Also test no override preserves the supplied content and does not emit editor
handlers when no provider is present.

- [ ] **Step 2: Run tests and confirm RED**

```powershell
npm test -- src/components/text/__tests__/VungChu.test.tsx src/components/__tests__/InvitationRenderer.test.tsx
```

- [ ] **Step 3: Load fonts according to bundled Next docs**

In `layout.tsx` import `Noto_Serif` and `Dancing_Script` from
`next/font/google`, both with `subsets: ['vietnamese', 'latin']`, and expose:

```ts
variable: '--font-serif-co-dien'
variable: '--font-viet-tay'
```

Add both variables to `<html className>`. Do not add runtime Google requests.

- [ ] **Step 4: Implement bridge and `VungChu`**

Use a context default of `null`. `VungChu` renders `inline-block`, resolves
override content and styles, and only attaches editor handlers when
`bridge?.dangChinh`:

```tsx
const noiDungHienThi = override?.noiDung ?? noiDung
const style = {
  color: override?.mauChu,
  fontFamily: layFontCss(override?.font),
  fontSize: override?.coChu
    ? `clamp(8px, calc(${override.coChu} / 520 * var(--khung-thiep-rong)), 120px)`
    : undefined,
  transform: `translate(
    calc(${override?.x ?? 0} / 100 * var(--khung-thiep-rong)),
    calc(${override?.y ?? 0} / 100 * var(--khung-thiep-rong))
  )`,
}
```

Set `--khung-thiep-rong: min(100vw, 520px)` on invitation root. Preserve parent
heading/button semantics by using a span inside the existing element.

- [ ] **Step 5: Run renderer tests**

```powershell
npm test -- src/components/text/__tests__/VungChu.test.tsx src/components/__tests__/InvitationRenderer.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/components/text src/app/layout.tsx src/components/InvitationRenderer.tsx src/components/__tests__/InvitationRenderer.test.tsx
git commit -m "feat: render editable invitation text regions"
```

---

### Task 6: Build selection, drag, keyboard, and the admin control panel

**Files:**

- Create: `src/components/admin/text/TextEditorProvider.tsx`
- Create: `src/components/admin/text/BangChinhChu.tsx`
- Create: `src/components/admin/text/numberInput.ts`
- Create: `src/components/admin/text/__tests__/TextEditorProvider.test.tsx`
- Create: `src/components/admin/text/__tests__/BangChinhChu.test.tsx`
- Modify: `src/components/admin/BangSua.tsx`
- Create: `src/components/admin/__tests__/BangSua.textEditor.test.tsx`

**Interfaces:**

```ts
export function TextEditorProvider(props: {
  enabled: boolean
  thiep: Invitation
  onDoi: (thiep: Invitation) => void
  children: React.ReactNode
}): React.ReactElement

export function BangChinhChu(props: {
  thiep: Invitation
  dangChon: TextRegionId | null
  onChon: (id: TextRegionId | null) => void
  onDoi: (thiep: Invitation) => void
}): React.ReactElement
```

- [ ] **Step 1: Write failing provider tests**

Simulate pointer drag with a mocked section width of 520:

```tsx
fireEvent.pointerDown(screen.getByText('Tên cô dâu'), {
  pointerId: 1,
  clientX: 100,
  clientY: 100,
})
fireEvent.pointerMove(window, { pointerId: 1, clientX: 152, clientY: 74 })
fireEvent.pointerUp(window, { pointerId: 1 })
expect(onDoi).toHaveBeenLastCalledWith(expect.objectContaining({
  tuyChinhChu: expect.objectContaining({
    'bia.co-dau.ten': expect.objectContaining({ x: 10, y: -5 }),
  }),
}))
```

Test pointer capture/cancel, click selection, Arrow key = 0.5%, Shift+Arrow =
2%, disabled mode allowing the original click, and selection clearing when a
region disappears.

- [ ] **Step 2: Write failing panel tests**

Select `bia.co-dau.ten`, then assert:

```tsx
await userEvent.clear(screen.getByLabelText('Nội dung vùng chữ'))
await userEvent.type(screen.getByLabelText('Nội dung vùng chữ'), 'Thu Hà')
await userEvent.selectOptions(screen.getByLabelText('Phông chữ vùng chữ'), 'viet-tay')
fireEvent.change(screen.getByLabelText('Cỡ chữ vùng chữ'), { target: { value: '42' } })
fireEvent.change(screen.getByLabelText('Màu chữ vùng chữ'), { target: { value: '#123456' } })
fireEvent.change(screen.getByLabelText('Tọa độ X vùng chữ'), { target: { value: '8.5' } })
expect(onDoi).toHaveBeenCalled()
```

Test invalid/partial numeric input does not corrupt invitation state, reset
position clears `x/y`, reset style clears `font/coChu/mauChu`, and system copy
writes `noiDung` override while canonical content uses its registry setter.

- [ ] **Step 3: Run tests and confirm RED**

```powershell
npm test -- src/components/admin/text src/components/admin/__tests__/BangSua.textEditor.test.tsx
```

- [ ] **Step 4: Implement provider**

Keep drag state in a ref:

```ts
type DragState = {
  id: TextRegionId
  pointerId: number
  startX: number
  startY: number
  width: number
  initial: { x: number; y: number }
}
```

Use native `window` pointer listeners only while dragging and remove them in
cleanup. On pointer down find `closest('[data-section]')`, read its rect, call
`setPointerCapture`, and prevent action only when `enabled`.

- [ ] **Step 5: Implement panel and number parsing**

`numberInput.ts` exposes:

```ts
export function parseSoNhap(raw: string, min: number, max: number): number | null
```

Return `null` for `''`, `'-'`, `'.'`, non-finite or out-of-range values. Keep
the raw string in component state and commit only a valid number.

Group `lietKeVungChu(thiep)` by section. Render controls only when a selected
descriptor exists. Use `FONT_CHU_OPTIONS` for the select.

- [ ] **Step 6: Integrate into `BangSua`**

Initialize once:

```ts
const [thiep, setThiep] = useState(() => damBaoIdVungChu(banDau))
const [dangChinhChu, setDangChinhChu] = useState(false)
const [vungChuDangChon, setVungChuDangChon] = useState<TextRegionId | null>(null)
```

Add the “Chỉnh chữ” toggle and `BangChinhChu` near “Giao diện”. Wrap only the
preview `InvitationRenderer` with `TextEditorProvider`; do not wrap admin form
labels.

- [ ] **Step 7: Run editor tests**

```powershell
npm test -- src/components/admin/text src/components/admin/__tests__/BangSua.textEditor.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit**

```powershell
git add src/components/admin/text src/components/admin/BangSua.tsx src/components/admin/__tests__/BangSua.textEditor.test.tsx
git commit -m "feat: add drag-and-drop text editor controls"
```

---

### Task 7: Register cover and static section text

**Files:**

- Modify: `src/components/sections/Bia.tsx`
- Modify: `src/components/sections/DemNguoc.tsx`
- Modify: `src/components/sections/CoDauChuRe.tsx`
- Modify: `src/components/sections/Album.tsx`
- Modify: `src/components/sections/DressCode.tsx`
- Modify: `src/components/sections/Rsvp.tsx`
- Modify tests under `src/components/sections/__tests__/`

**Interfaces:**

- Consumes `VungChu`, IDs from `textRegions.ts`, and `SectionProps.thiep`.
- Produces all static IDs listed in Task 4 as actual `data-text-region` nodes.

- [ ] **Step 1: Add failing section coverage tests**

For each section, render with one override and assert content/style is applied.
Also assert exact ID coverage:

```ts
expect(
  Array.from(container.querySelectorAll('[data-text-region]')).map(
    (el) => el.getAttribute('data-text-region'),
  ),
).toEqual(expect.arrayContaining([
  'bia.loi-mo-dau',
  'bia.chu-re.ten',
  'bia.ky-hieu-noi',
  'bia.co-dau.ten',
  'bia.nut-mo',
]))
```

For the RSVP button, confirm editing mode can select it while normal mode still
calls `onMoRsvp`.

- [ ] **Step 2: Run static section tests and confirm RED**

```powershell
npm test -- src/components/sections/__tests__
```

- [ ] **Step 3: Wrap every in-scope static text node**

Preserve semantic parents:

```tsx
<h2 className="text-2xl" style={existingStyle}>
  <VungChu id="rsvp.tieu-de" thiep={thiep} noiDung="Xác nhận tham dự" />
</h2>
```

Split the cover `<h1>` into three `VungChu` spans so groom, connector and bride
move independently. Do not wrap image alt text, calendar individual cells,
screen-reader labels or form labels.

- [ ] **Step 4: Run static section tests**

```powershell
npm test -- src/components/sections/__tests__ src/components/text/__tests__/VungChu.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/components/sections
git commit -m "feat: make static invitation text editable"
```

---

### Task 8: Register dynamic story, schedule, wedding-gift, and guestbook text

**Files:**

- Modify: `src/components/sections/ChuyenChungMinh.tsx`
- Modify: `src/components/sections/SuKien.tsx`
- Modify: `src/components/sections/MungCuoi.tsx`
- Modify: `src/components/sections/SoLuuBut.tsx`
- Modify: `src/components/PopupRsvp.tsx`
- Modify: `src/components/FormRsvp.tsx`
- Modify: `src/components/PopupLoiChuc.tsx`
- Modify: `src/components/NutRsvpNoi.tsx`
- Modify corresponding component tests.

**Interfaces:**

- Dynamic IDs use persisted item IDs, never array indexes.
- Guest-submitted `LoiChucDayDu.noiDung/hoTen` remain ordinary text.
- Form labels/placeholders/options/errors remain ordinary text.

- [ ] **Step 1: Write failing dynamic-ID tests**

Render two events with stable IDs and overrides:

```ts
tuyChinhChu: {
  'su-kien.event-a.ten': { mauChu: '#123456', x: 3 },
  'su-kien.event-b.ten': { mauChu: '#654321', x: -2 },
}
```

Assert each style is applied to the correct event after `sapXepLichTrinh`
reorders them. Assert deleting `event-a` via the admin flow removes all
`su-kien.event-a.*` overrides and leaves `event-b`.

Add assertions that story title/body, bank fields, popup titles and allowed
buttons expose their exact registry IDs. Assert guest messages and form labels
do not have `data-text-region`.

- [ ] **Step 2: Run focused tests and confirm RED**

```powershell
npm test -- src/components/sections/__tests__ src/components/__tests__/PopupRsvp.test.tsx src/components/__tests__/FormRsvp.test.tsx src/components/__tests__/PopupLoiChuc.test.tsx
```

- [ ] **Step 3: Integrate dynamic text**

Use persisted IDs:

```tsx
<VungChu
  id={`su-kien.${sk.id}.ten`}
  thiep={thiep}
  noiDung={sk.ten}
/>
```

If old public data lacks an ID, render ordinary text; do not synthesize an
unstable index ID in the public renderer.

For `MungCuoi`, use semantic `ben` in IDs:

```ts
`mung-cuoi.${o.ben}.chu-tai-khoan`
`mung-cuoi.${o.ben}.so-tai-khoan`
`mung-cuoi.${o.ben}.ngan-hang`
```

Wrap only in-scope popup headings and visible action copy. Leave accessible-only
close labels unchanged.

- [ ] **Step 4: Clean overrides on deletion**

In `BangSua`, replace direct event updates with a helper that compares removed
IDs and calls `xoaOverrideTheoPrefix` for each removed ID before setting state.
Apply the same rule to `chuyenChungMinh` when its admin editor is added or
modified.

- [ ] **Step 5: Run dynamic tests**

```powershell
npm test -- src/components/sections/__tests__ src/components/__tests__ src/components/admin/__tests__/BangSua.textEditor.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/components/sections src/components/PopupRsvp.tsx src/components/FormRsvp.tsx src/components/PopupLoiChuc.tsx src/components/NutRsvpNoi.tsx src/components/admin/BangSua.tsx src/components/admin/__tests__/BangSua.textEditor.test.tsx
git commit -m "feat: make dynamic invitation text editable"
```

---

### Task 9: Unify D1 text controls with the shared font catalog

**Files:**

- Modify: `src/lib/invitation/chiTietCoChu.ts`
- Modify: `src/components/admin/ChonChiTiet.tsx`
- Modify: `src/components/LopTrangTri.tsx`
- Modify: `src/components/admin/__tests__/ChonChiTiet.test.tsx`
- Modify: `src/components/__tests__/LopTrangTri.test.tsx`

**Interfaces:**

- Consumes `FontChu`, `FONT_CHU_OPTIONS`, and `layFontCss`.
- Keeps `ChiTietTrangTri.chu` storage and D1 transform behavior unchanged.

- [ ] **Step 1: Write failing D1 font tests**

```tsx
await userEvent.selectOptions(
  screen.getByLabelText('Phông chữ trên thiệp'),
  'viet-tay',
)
expect(onDoi).toHaveBeenLastCalledWith([
  expect.objectContaining({
    chu: expect.objectContaining({ font: 'viet-tay' }),
  }),
])
```

Render D1 with `font: 'viet-tay'` and assert its CSS family uses
`--font-viet-tay`. Preserve existing assertions that D1 text moves/scales/rotates
with the image.

- [ ] **Step 2: Run D1 tests and confirm RED**

```powershell
npm test -- src/components/admin/__tests__/ChonChiTiet.test.tsx src/components/__tests__/LopTrangTri.test.tsx
```

- [ ] **Step 3: Replace local font map with shared registry**

Remove `FONT_CHU_CHI_TIET_CSS`. Populate the select from `FONT_CHU_OPTIONS` and
resolve renderer CSS through `layFontCss(ct.chu.font)`. Do not move D1 text into
`tuyChinhChu`.

- [ ] **Step 4: Run D1 tests**

```powershell
npm test -- src/components/admin/__tests__/ChonChiTiet.test.tsx src/components/__tests__/LopTrangTri.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/invitation/chiTietCoChu.ts src/components/admin/ChonChiTiet.tsx src/components/LopTrangTri.tsx src/components/admin/__tests__/ChonChiTiet.test.tsx src/components/__tests__/LopTrangTri.test.tsx
git commit -m "refactor: share invitation text font controls"
```

---

### Task 10: Add save/reload E2E coverage and complete verification

**Files:**

- Create: `e2e/chinh-chu.spec.ts`
- Modify: `e2e/quan-tri.spec.ts` only if a shared login helper must be exported.
- Modify: `docs/superpowers/specs/2026-07-29-per-text-invitation-editor-design.md` only if implementation reveals a necessary clarification; do not silently change scope.

**Interfaces:**

- E2E uses the existing authenticated admin setup and a disposable invitation.
- Covers mobile and desktop Playwright projects.

- [ ] **Step 1: Write the E2E spec**

The spec must:

```ts
test('chỉnh, kéo, lưu và tải lại từng vùng chữ', async ({ page }) => {
  await page.getByRole('button', { name: 'Chỉnh chữ' }).click()
  await page.locator('[data-text-region="bia.co-dau.ten"]').click()
  await page.getByLabel('Nội dung vùng chữ').fill('Thu Hà')
  await page.getByLabel('Phông chữ vùng chữ').selectOption('viet-tay')
  await page.getByLabel('Cỡ chữ vùng chữ').fill('42')
  await page.getByLabel('Màu chữ vùng chữ').fill('#123456')
  await page.getByLabel('Tọa độ X vùng chữ').fill('8.5')
  await page.getByRole('button', { name: 'Lưu' }).click()
  await expect(page.getByText('Đã lưu')).toBeVisible()
  await page.reload()
  await expect(page.locator('[data-text-region="bia.co-dau.ten"]')).toHaveText('Thu Hà')
  await expect(page.locator('[data-text-region="bia.co-dau.ten"]')).toHaveCSS(
    'color',
    'rgb(18, 52, 86)',
  )
})
```

Add a drag test using `page.mouse`, a mobile touch/pointer-equivalent test, an
event reorder test proving stable IDs, and a test that form labels are not
selectable regions.

- [ ] **Step 2: Run focused E2E**

```powershell
npx playwright test e2e/chinh-chu.spec.ts --project=desktop
npx playwright test e2e/chinh-chu.spec.ts --project=mobile
```

Expected: PASS. If credentials are absent, record the exact missing variable and
still complete unit/lint/build verification; do not claim E2E passed.

- [ ] **Step 3: Run the entire unit suite**

```powershell
npm test
```

Expected: all Vitest tests PASS.

- [ ] **Step 4: Run lint**

```powershell
npm run lint
```

Expected: exit code 0 with no errors.

- [ ] **Step 5: Run production build**

```powershell
npm run build
```

Expected: Next.js 16.2.12 production build exits 0.

- [ ] **Step 6: Manually inspect responsive editor behavior**

Run:

```powershell
npm run dev
```

At widths 320, 390 and 520 px verify:

- selected outline tracks the correct region;
- dragged text remains selectable;
- no unchanged section shifts before any override;
- buttons work normally after turning edit mode off;
- D1 text still moves with its image.

- [ ] **Step 7: Commit E2E and final adjustments**

```powershell
git add e2e/chinh-chu.spec.ts e2e/quan-tri.spec.ts
git commit -m "test: cover per-text invitation editing"
```

- [ ] **Step 8: Final diff and status audit**

```powershell
git diff --check
git status --short
git log --oneline -10
```

Expected: no whitespace errors; working tree clean; task commits appear in
dependency order.
