# Long Background and Dynamic Layer Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable mobile-first invitation template whose long imported background remains fixed while real E-Wedding content and interactive components can be positioned, edited, locked, versioned, and rendered above it.

**Architecture:** Add a versioned template aggregate separate from `Invitation`, with a discriminated layer model shared by the editor and renderer. The editor uses percentage geometry and a reducer for undo/redo, while the public renderer combines a published template version with invitation data. Background upload remains a Next.js Route Handler using Web `Request.formData()` and stores an original plus optimized WebP segments through the existing `KhoLuuTru` abstraction.

**Tech Stack:** Next.js 16.2 App Router and Route Handlers, React 19, TypeScript 5, Zod 4, Supabase/PostgreSQL, existing storage adapters, Sharp for server-side image metadata/optimization, Vitest/Testing Library, Playwright.

## Global Constraints

- Read relevant guides in `node_modules/next/dist/docs/` before changing Next.js APIs; this plan is based on `01-app/01-getting-started/15-route-handlers.md` and `01-app/01-getting-started/12-images.md`.
- One mobile layout must scale uniformly at every phone width; do not create breakpoint-specific layer positions.
- The background must use its natural aspect ratio, remain uncropped, and stay locked by default.
- Desktop must render the invitation in the existing centered phone frame with `max-w-[520px]`.
- Version 1 accepts PNG, JPG, or WebP uploads; it does not parse Figma or Canva files.
- Public invitations read only a published template version; draft edits must never change the live invitation.
- Geometry is stored as percentages of the full canvas, not viewport pixels.
- Custom links accept only `https:`, `http:`, `mailto:`, and `tel:` protocols.
- Implement with tests first and commit after each task.

---

## File Structure

### Domain and validation

- Create `src/lib/giaoDien/types.ts`: template, background, geometry, binding, and discriminated layer types.
- Create `src/lib/giaoDien/schema.ts`: Zod validation for API and persisted JSON.
- Create `src/lib/giaoDien/hinhHoc.ts`: percentage/pixel conversion, bounds, and minimum target helpers.
- Create `src/lib/giaoDien/lienKet.ts`: safe URL and invitation-binding resolution.
- Create `src/lib/giaoDien/kiemTraXuatBan.ts`: deterministic publish diagnostics.
- Create `src/lib/giaoDien/lichSu.ts`: pure editor reducer with undo/redo.

### Database and storage

- Create `supabase/migrations/0005_mau_giao_dien_canvas.sql`: templates, immutable versions, and invitation association.
- Create `src/lib/db/mauGiaoDien.ts`: template draft and published-version persistence.
- Modify `src/lib/db/invitations.ts`: load template references and layout override.
- Modify `src/lib/luuTru/types.ts` and all adapters only if binary `File` variants expose a missing capability; keep the existing `luu(path, File)` interface.

### API

- Create `src/app/api/admin/mau-giao-dien/route.ts`: create/list templates.
- Create `src/app/api/admin/mau-giao-dien/[id]/route.ts`: load and save draft.
- Create `src/app/api/admin/mau-giao-dien/[id]/nen/route.ts`: validate and optimize background.
- Create `src/app/api/admin/mau-giao-dien/[id]/xuat-ban/route.ts`: validate and publish immutable version.
- Create `src/app/api/admin/mau-giao-dien/[id]/phuc-hoi/route.ts`: restore an immutable version into the editable draft.
- Create `src/app/api/admin/thiep/[id]/mau-giao-dien/route.ts`: attach or detach an invitation layout.

### Rendering

- Create `src/components/giaoDien/CanvasGiaoDien.tsx`: scaled canvas and background segments.
- Create `src/components/giaoDien/LayerGiaoDien.tsx`: layer dispatcher and positioning wrapper.
- Create `src/components/giaoDien/LayerChu.tsx`, `LayerAnh.tsx`, `LayerNut.tsx`, and `LayerThanhPhan.tsx`: focused renderers.
- Modify `src/components/InvitationRenderer.tsx`: select standard section mode or canvas-template mode.
- Modify `src/app/[slug]/page.tsx`: load the published template aggregate.

### Editor

- Create `src/components/admin/giaoDien/TrinhDungGiaoDien.tsx`: editor composition and mode switching.
- Create `src/components/admin/giaoDien/KhungCanvas.tsx`: selection and pointer interaction.
- Create `src/components/admin/giaoDien/ThuVienLayer.tsx`: add supported layers.
- Create `src/components/admin/giaoDien/DanhSachLayer.tsx`: reorder, lock, hide, duplicate, delete.
- Create `src/components/admin/giaoDien/ThuocTinhLayer.tsx`: layer-specific properties and bindings.
- Create `src/components/admin/giaoDien/ThanhCongCu.tsx`: undo/redo, widths, edit/guest modes, save/publish.
- Create `src/components/admin/giaoDien/TaiNen.tsx`: background upload UI.
- Create `src/components/admin/giaoDien/useTuDongLuu.ts`: debounced draft save and offline state.
- Create `src/app/admin/mau-giao-dien/[id]/page.tsx`: server entry for the template editor.
- Modify `src/components/admin/BangSua.tsx`: template selection and detach control for invitations.

---

### Task 1: Define the canvas domain contract

**Files:**
- Create: `src/lib/giaoDien/types.ts`
- Create: `src/lib/giaoDien/schema.ts`
- Create: `src/lib/giaoDien/__tests__/schema.test.ts`

**Interfaces:**
- Produces: `HinhHocLayer`, `NenCanvas`, `NguonNoiDung`, `LayerGiaoDien`, `BanNhapGiaoDien`, `PhienBanGiaoDien`, `banNhapGiaoDienSchema`.
- `LayerGiaoDien` is discriminated by `loai`: `chu | anh | nut | album | dem-nguoc | su-kien | ban-do | rsvp | mung-cuoi`.

- [ ] **Step 1: Write failing schema tests**

```ts
import { describe, expect, it } from 'vitest'
import { banNhapGiaoDienSchema } from '../schema'

const hopLe = {
  ten: 'Sen đỏ',
  nen: {
    anhGoc: '/tai-len/mau/a.png',
    rong: 390,
    cao: 4200,
    dungLuongGoc: 640000,
    segments: [],
  },
  layers: [{
    id: 'ten-doi',
    loai: 'chu',
    hinhHoc: { x: 10, y: 5, rong: 80, cao: 3, gocXoay: 0 },
    khoa: false,
    an: false,
    zIndex: 10,
    noiDung: { kieu: 'du-lieu', truong: 'cap-doi' },
    kieuChu: { font: 'serif-co-dien', coChu: 32, mau: '#8B2F20', canLe: 'center' },
  }],
}

describe('banNhapGiaoDienSchema', () => {
  it('nhan canvas va layer chu hop le', () => {
    expect(banNhapGiaoDienSchema.parse(hopLe)).toEqual(hopLe)
  })

  it('tu choi hinh hoc vuot canvas', () => {
    const sai = structuredClone(hopLe)
    sai.layers[0].hinhHoc.x = 101
    expect(() => banNhapGiaoDienSchema.parse(sai)).toThrow()
  })

  it('tu choi loai layer khong co trong hop dong', () => {
    const sai = structuredClone(hopLe)
    sai.layers[0].loai = 'html'
    expect(() => banNhapGiaoDienSchema.parse(sai)).toThrow()
  })
})
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm test -- src/lib/giaoDien/__tests__/schema.test.ts`

Expected: FAIL because `../schema` does not exist.

- [ ] **Step 3: Add exact shared types**

```ts
export interface HinhHocLayer {
  x: number; y: number; rong: number; cao: number; gocXoay: number
}
export interface NenCanvas {
  anhGoc: string
  rong: number
  cao: number
  dungLuongGoc: number
  segments: { url: string; y: number; cao: number }[]
}
export type TruongLienKet =
  | 'cap-doi' | 'chu-re' | 'co-dau' | 'ngay-cuoi' | 'dia-diem-chinh'
export type NguonNoiDung =
  | { kieu: 'co-dinh'; giaTri: string }
  | { kieu: 'du-lieu'; truong: TruongLienKet; duPhong?: string }

interface LayerCoSo {
  id: string
  hinhHoc: HinhHocLayer
  khoa: boolean
  an: boolean
  zIndex: number
  nhanSection?: string
}
export type LayerGiaoDien =
  | (LayerCoSo & { loai: 'chu'; noiDung: NguonNoiDung; kieuChu: {
      font: 'serif-co-dien' | 'sans-sach'; coChu: number; mau: string;
      canLe: 'left' | 'center' | 'right'
    }})
  | (LayerCoSo & { loai: 'anh'; nguon: { kieu: 'co-dinh'; url: string } | {
      kieu: 'du-lieu'; truong: 'anh-co-dau' | 'anh-chu-re'
    }; moTa: string; objectFit: 'cover' | 'contain'; doDam: number })
  | (LayerCoSo & { loai: 'nut'; nhan: NguonNoiDung; url: string;
      moCuaSoMoi: boolean })
  | (LayerCoSo & { loai: 'album' | 'dem-nguoc' | 'su-kien' | 'ban-do'
      | 'rsvp' | 'mung-cuoi' })

export interface BanNhapGiaoDien { ten: string; nen?: NenCanvas; layers: LayerGiaoDien[] }
export interface PhienBanGiaoDien extends BanNhapGiaoDien {
  id: string; mauId: string; soPhienBan: number; xuatBanLuc: string
}
```

Implement equivalent discriminated Zod schemas with `z.discriminatedUnion('loai', ...)`, percentage bounds `0..100`, positive background dimensions, unique layer IDs, and unique `zIndex` normalization left to Task 2.

- [ ] **Step 4: Run schema tests**

Run: `npm test -- src/lib/giaoDien/__tests__/schema.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/giaoDien
git commit -m "feat: define canvas template contract"
```

### Task 2: Add geometry, bindings, and editor history primitives

**Files:**
- Create: `src/lib/giaoDien/hinhHoc.ts`
- Create: `src/lib/giaoDien/lienKet.ts`
- Create: `src/lib/giaoDien/lichSu.ts`
- Create: `src/lib/giaoDien/__tests__/hinhHoc.test.ts`
- Create: `src/lib/giaoDien/__tests__/lienKet.test.ts`
- Create: `src/lib/giaoDien/__tests__/lichSu.test.ts`

**Interfaces:**
- Consumes: `HinhHocLayer`, `LayerGiaoDien`, `Invitation`.
- Produces: `sangPhanTram(px, kichThuoc)`, `sangPixel(phanTram, kichThuoc)`, `gioiHanHinhHoc(value)`, `layNoiDung(nguon, thiep)`, `urlAnToan(value)`, and `lichSuReducer(state, action)`.

- [ ] **Step 1: Write failing pure-function tests**

```ts
expect(sangPhanTram(195, 390)).toBe(50)
expect(sangPixel(25, 4200)).toBe(1050)
expect(gioiHanHinhHoc({ x: -2, y: 99, rong: 20, cao: 4, gocXoay: 0 }))
  .toMatchObject({ x: 0, y: 96 })
expect(urlAnToan('javascript:alert(1)')).toBe(false)
expect(urlAnToan('https://maps.google.com')).toBe(true)
expect(layNoiDung({ kieu: 'du-lieu', truong: 'cap-doi' }, thiepMau))
  .toBe(`${thiepMau.chuRe.ten} & ${thiepMau.coDau.ten}`)
```

Add reducer assertions for `CAP_NHAT_LAYER`, `HOAN_TAC`, `LAM_LAI`, `THEM_LAYER`, `XOA_LAYER`, and `SAP_XEP_LAYER`, including preservation of a locked layer.

- [ ] **Step 2: Verify the tests fail**

Run: `npm test -- src/lib/giaoDien/__tests__/hinhHoc.test.ts src/lib/giaoDien/__tests__/lienKet.test.ts src/lib/giaoDien/__tests__/lichSu.test.ts`

Expected: FAIL with missing modules.

- [ ] **Step 3: Implement the pure primitives**

Use `Math.round(value * 10000) / 10000` for stable percentage serialization. `gioiHanHinhHoc` must clamp width/height to `0.5..100`, then clamp `x` to `0..100-rong` and `y` to `0..100-cao`. The reducer state is:

```ts
export interface LichSuState {
  hienTai: LayerGiaoDien[]
  quaKhu: LayerGiaoDien[][]
  tuongLai: LayerGiaoDien[][]
}
```

Every mutating action pushes the previous snapshot to `quaKhu`, clears `tuongLai`, refuses mutation of `khoa: true`, and normalizes `zIndex` to sequential integers after reorder/delete.

- [ ] **Step 4: Run pure-function tests**

Run: `npm test -- src/lib/giaoDien/__tests__/hinhHoc.test.ts src/lib/giaoDien/__tests__/lienKet.test.ts src/lib/giaoDien/__tests__/lichSu.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/giaoDien
git commit -m "feat: add canvas geometry and history"
```

### Task 3: Persist templates and immutable versions

**Files:**
- Create: `supabase/migrations/0005_mau_giao_dien_canvas.sql`
- Create: `src/lib/db/mauGiaoDien.ts`
- Create: `src/lib/db/__tests__/mauGiaoDien.test.ts`
- Modify: `src/lib/db/invitations.ts`
- Modify: `src/lib/db/__tests__/invitations.test.ts`

**Interfaces:**
- Produces: `taoMau(ten, nguoiTao)`, `layMau(id)`, `luuBanNhap(id, banNhap)`, `xuatBanMau(id)`, `layPhienBan(id)`, `phucHoiBanNhap(mauId, phienBanId)`, `ganMauVaoThiep(invitationId, phienBanId)`, `tachMauKhoiThiep(invitationId, banNhap)`.

- [ ] **Step 1: Add failing repository tests with the existing Supabase mock pattern**

Assert that saving a draft updates only `mau_giao_dien.ban_nhap`; publishing inserts a new `phien_ban_giao_dien` row and then updates `phien_ban_da_xuat_ban_id`; restoring copies one version's `noi_dung` into the draft without changing the published pointer; attaching writes `phien_ban_giao_dien_id` and clears `bo_cuc_rieng`; detaching copies version JSON into `bo_cuc_rieng` and clears the version ID.

- [ ] **Step 2: Run repository tests and verify failure**

Run: `npm test -- src/lib/db/__tests__/mauGiaoDien.test.ts src/lib/db/__tests__/invitations.test.ts`

Expected: FAIL because the repository and columns do not exist.

- [ ] **Step 3: Add migration**

```sql
create table mau_giao_dien (
  id uuid primary key default gen_random_uuid(),
  ten text not null,
  ban_nhap jsonb not null,
  phien_ban_da_xuat_ban_id uuid,
  nguoi_tao uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table phien_ban_giao_dien (
  id uuid primary key default gen_random_uuid(),
  mau_id uuid not null references mau_giao_dien(id) on delete cascade,
  so_phien_ban integer not null,
  noi_dung jsonb not null,
  created_at timestamptz not null default now(),
  unique (mau_id, so_phien_ban)
);

alter table mau_giao_dien
  add constraint mau_giao_dien_phien_ban_fk
  foreign key (phien_ban_da_xuat_ban_id) references phien_ban_giao_dien(id);

alter table invitations
  add column phien_ban_giao_dien_id uuid references phien_ban_giao_dien(id),
  add column bo_cuc_rieng jsonb;

alter table mau_giao_dien enable row level security;
alter table phien_ban_giao_dien enable row level security;

create or replace function xuat_ban_mau_giao_dien(p_mau_id uuid)
returns phien_ban_giao_dien
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mau mau_giao_dien;
  v_phien_ban phien_ban_giao_dien;
begin
  select * into v_mau
  from mau_giao_dien
  where id = p_mau_id
  for update;

  if not found then
    raise exception 'Khong tim thay mau giao dien';
  end if;

  insert into phien_ban_giao_dien (mau_id, so_phien_ban, noi_dung)
  values (
    p_mau_id,
    coalesce((
      select max(so_phien_ban)
      from phien_ban_giao_dien
      where mau_id = p_mau_id
    ), 0) + 1,
    v_mau.ban_nhap
  )
  returning * into v_phien_ban;

  update mau_giao_dien
  set phien_ban_da_xuat_ban_id = v_phien_ban.id,
      updated_at = now()
  where id = p_mau_id;

  return v_phien_ban;
end;
$$;
```

- [ ] **Step 4: Implement repositories and validate JSON at boundaries**

Parse every `ban_nhap`/`noi_dung` value with `banNhapGiaoDienSchema`. Publishing calls `supabase.rpc('xuat_ban_mau_giao_dien', { p_mau_id: id })`; the row lock in the migration makes version allocation and pointer update atomic.

- [ ] **Step 5: Run repository tests**

Run: `npm test -- src/lib/db/__tests__/mauGiaoDien.test.ts src/lib/db/__tests__/invitations.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add supabase/migrations/0005_mau_giao_dien_canvas.sql src/lib/db
git commit -m "feat: persist versioned canvas templates"
```

### Task 4: Upload, inspect, optimize, and segment long backgrounds

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/lib/giaoDien/xuLyNen.ts`
- Create: `src/lib/giaoDien/__tests__/xuLyNen.test.ts`
- Create: `src/app/api/admin/mau-giao-dien/[id]/nen/route.ts`
- Create: `src/app/api/admin/mau-giao-dien/[id]/nen/__tests__/route.test.ts`

**Interfaces:**
- Produces: `xuLyNen(file, prefix, kho): Promise<NenCanvas>`.
- Route input: multipart `file` and no slug; template ID comes from `await ctx.params`.
- Route output: `{ nen: NenCanvas, canhBao: string[] }`.

- [ ] **Step 1: Install Sharp explicitly**

Run: `npm install sharp`

Expected: `sharp` appears in dependencies and lockfile.

- [ ] **Step 2: Write failing image-pipeline and route tests**

Create a generated 390×9000 PNG fixture in memory with Sharp. Assert:

- PNG/JPEG/WebP are accepted; SVG, GIF, audio, and files over 25 MB return 400.
- Images narrower than 320 px return 400.
- Original is stored at `mau-giao-dien/<id>/nen-goc.<ext>`.
- Optimized WebP segments are at most 2048 px tall and returned with contiguous percentage `y/cao`.
- Segment widths are 520 px or natural width when smaller.
- The returned `NenCanvas` retains natural `rong/cao`.

- [ ] **Step 3: Verify focused failure**

Run: `npm test -- src/lib/giaoDien/__tests__/xuLyNen.test.ts src/app/api/admin/mau-giao-dien/[id]/nen/__tests__/route.test.ts`

Expected: FAIL with missing modules.

- [ ] **Step 4: Implement the pipeline**

Read `await file.arrayBuffer()`, call `sharp(buffer).metadata()`, reject invalid dimensions, store the original as a `File`, resize each extracted vertical region to width `min(520, naturalWidth)`, encode with `.webp({ quality: 82 })`, and store each segment through `KhoLuuTru.luu`. Return warnings when natural height exceeds 12,000 px or original size exceeds 8 MB, and persist `file.size` as `dungLuongGoc` for deterministic publish diagnostics.

The handler signature must follow Next.js 16:

```ts
export async function POST(
  req: Request,
  ctx: RouteContext<'/api/admin/mau-giao-dien/[id]/nen'>,
) {
  const { id } = await ctx.params
  const form = await req.formData()
  // validate File, call xuLyNen, save draft background, return JSON
}
```

- [ ] **Step 5: Run image and route tests**

Run: `npm test -- src/lib/giaoDien/__tests__/xuLyNen.test.ts src/app/api/admin/mau-giao-dien/[id]/nen/__tests__/route.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add package.json package-lock.json src/lib/giaoDien src/app/api/admin/mau-giao-dien
git commit -m "feat: optimize long template backgrounds"
```

### Task 5: Render a published canvas with real invitation components

**Files:**
- Create: `src/components/giaoDien/CanvasGiaoDien.tsx`
- Create: `src/components/giaoDien/LayerGiaoDien.tsx`
- Create: `src/components/giaoDien/LayerChu.tsx`
- Create: `src/components/giaoDien/LayerAnh.tsx`
- Create: `src/components/giaoDien/LayerNut.tsx`
- Create: `src/components/giaoDien/LayerThanhPhan.tsx`
- Create: `src/components/giaoDien/__tests__/CanvasGiaoDien.test.tsx`
- Modify: `src/components/InvitationRenderer.tsx`
- Modify: `src/components/__tests__/InvitationRenderer.test.tsx`
- Modify: `src/app/[slug]/page.tsx`

**Interfaces:**
- `CanvasGiaoDien({ boCuc, thiep, cheDo, onMoThiep?, onMoRsvp? })`.
- `cheDo` is `'khach' | 'xem-truoc'`; editor interaction is added in Task 7.
- `InvitationRenderer` gains optional `boCuc?: BanNhapGiaoDien`.

- [ ] **Step 1: Write failing renderer tests**

Assert that:

- The canvas uses `aspect-ratio: nen.rong / nen.cao`.
- Background segments use absolute percentage top/height, width 100%, `loading="lazy"` except the first.
- Hidden layers do not render.
- Fixed and bound text resolve correctly.
- Unsafe custom links are omitted and safe links preserve target choice.
- RSVP invokes preview callback without submitting in preview mode.
- Existing section rendering is unchanged when `boCuc` is absent.

- [ ] **Step 2: Verify renderer tests fail**

Run: `npm test -- src/components/giaoDien/__tests__/CanvasGiaoDien.test.tsx src/components/__tests__/InvitationRenderer.test.tsx`

Expected: FAIL because canvas components do not exist.

- [ ] **Step 3: Implement positioning and dispatch**

Use one absolute wrapper per layer:

```tsx
const style: CSSProperties = {
  left: `${layer.hinhHoc.x}%`,
  top: `${layer.hinhHoc.y}%`,
  width: `${layer.hinhHoc.rong}%`,
  height: `${layer.hinhHoc.cao}%`,
  transform: `rotate(${layer.hinhHoc.gocXoay}deg)`,
  zIndex: layer.zIndex,
}
```

`LayerThanhPhan` maps complex layer types to existing components from `src/components/sections`. Wrap RSVP and mừng cưới so they retain real callbacks. Use `<img>` for uploaded runtime URLs because natural background dimensions are already known and storage hosts can vary; do not add broad `next/image` remote patterns.

- [ ] **Step 4: Load the published aggregate on the public page**

Extend the invitation DB result with `boCuc`: prefer `bo_cuc_rieng`, otherwise join `phien_ban_giao_dien.noi_dung`. Parse it and pass it to `InvitationRenderer`. Do not read `mau_giao_dien.ban_nhap` from the public page.

- [ ] **Step 5: Run renderer and existing component tests**

Run: `npm test -- src/components/giaoDien src/components/__tests__/InvitationRenderer.test.tsx src/components/__tests__/InvitationRenderer.moThiep.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/components/giaoDien src/components/InvitationRenderer.tsx src/components/__tests__ src/app/[slug]/page.tsx src/lib/db/invitations.ts
git commit -m "feat: render published canvas invitations"
```

### Task 6: Add template CRUD, attach, and detach APIs

**Files:**
- Create: `src/app/api/admin/mau-giao-dien/route.ts`
- Create: `src/app/api/admin/mau-giao-dien/[id]/route.ts`
- Create: `src/app/api/admin/mau-giao-dien/[id]/xuat-ban/route.ts`
- Create: `src/app/api/admin/mau-giao-dien/[id]/phuc-hoi/route.ts`
- Create: `src/app/api/admin/thiep/[id]/mau-giao-dien/route.ts`
- Create: `src/app/api/admin/mau-giao-dien/__tests__/routes.test.ts`
- Create: `src/lib/giaoDien/kiemTraXuatBan.ts`
- Create: `src/lib/giaoDien/__tests__/kiemTraXuatBan.test.ts`

**Interfaces:**
- `POST /api/admin/mau-giao-dien`: `{ ten } -> { id }`.
- `GET/PATCH /api/admin/mau-giao-dien/[id]`: fetch/update validated draft.
- `POST /api/admin/mau-giao-dien/[id]/xuat-ban`: diagnostics then immutable version.
- `POST /api/admin/mau-giao-dien/[id]/phuc-hoi`: `{ phienBanId }` copies an owned version into the draft without publishing it.
- `PUT /api/admin/thiep/[id]/mau-giao-dien`: `{ phienBanId }`.
- `DELETE /api/admin/thiep/[id]/mau-giao-dien`: `{ xacNhan: true }` detaches.

- [ ] **Step 1: Write failing diagnostics tests**

Cover: missing background (error), unsafe link (error), missing required binding fallback (error), fully/partially out-of-canvas layer (warning), text box smaller than 1% height (warning), interactive target under 44 CSS px at 390 px preview (warning), and heavy background (warning).

- [ ] **Step 2: Write failing route tests**

Mock repositories and assert Zod 400 responses, awaited `ctx.params`, 404 for missing IDs, publish 422 with diagnostics, successful publish 201, restore refusal when the version belongs to another template, successful restore without changing the live version, and detach refusal unless `{ xacNhan: true }`.

- [ ] **Step 3: Verify tests fail**

Run: `npm test -- src/lib/giaoDien/__tests__/kiemTraXuatBan.test.ts src/app/api/admin/mau-giao-dien/__tests__/routes.test.ts`

Expected: FAIL with missing modules.

- [ ] **Step 4: Implement deterministic diagnostics and handlers**

Use native `Request`/`Response` or `NextResponse`, never cache admin GET handlers, parse all JSON before repository calls, and return `{ loi, chanDoan? }` consistently. Only diagnostics with `muc: 'loi'` block publishing; warnings are returned alongside the new version.

- [ ] **Step 5: Run diagnostics and route tests**

Run: `npm test -- src/lib/giaoDien/__tests__/kiemTraXuatBan.test.ts src/app/api/admin/mau-giao-dien/__tests__/routes.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/app/api/admin src/lib/giaoDien
git commit -m "feat: add template lifecycle APIs"
```

### Task 7: Build the selectable, draggable canvas editor

**Files:**
- Create: `src/components/admin/giaoDien/TrinhDungGiaoDien.tsx`
- Create: `src/components/admin/giaoDien/KhungCanvas.tsx`
- Create: `src/components/admin/giaoDien/ThuVienLayer.tsx`
- Create: `src/components/admin/giaoDien/DanhSachLayer.tsx`
- Create: `src/components/admin/giaoDien/ThuocTinhLayer.tsx`
- Create: `src/components/admin/giaoDien/ThanhCongCu.tsx`
- Create: `src/components/admin/giaoDien/TaiNen.tsx`
- Create: `src/components/admin/giaoDien/__tests__/KhungCanvas.test.tsx`
- Create: `src/components/admin/giaoDien/__tests__/TrinhDungGiaoDien.test.tsx`

**Interfaces:**
- Consumes Task 2 reducer and Task 5 renderers.
- Produces `TrinhDungGiaoDien({ id, banDau, thiepMau })`.

- [ ] **Step 1: Write failing editor interaction tests**

Using `userEvent.pointer`, assert:

- Pointer movement converts client deltas using the measured canvas rectangle.
- Dragging cannot move a layer outside the canvas.
- Locked layers cannot move or delete.
- Resize handles preserve percentage geometry.
- Rotate handle updates `gocXoay`.
- Layer list reorder normalizes z-index.
- Duplicate gets `crypto.randomUUID()` and a 1% x/y offset.
- 360/390/430 preview buttons change only display width.
- Guest mode removes selection handles and executes safe interactions.
- Undo and redo restore exact snapshots.

- [ ] **Step 2: Verify focused failure**

Run: `npm test -- src/components/admin/giaoDien/__tests__/KhungCanvas.test.tsx src/components/admin/giaoDien/__tests__/TrinhDungGiaoDien.test.tsx`

Expected: FAIL with missing editor.

- [ ] **Step 3: Implement pointer interactions without a drag dependency**

Use Pointer Events with `setPointerCapture`, a `ResizeObserver` for canvas bounds, and reducer actions only on committed pointer-up. During movement keep transient geometry in component state. Add keyboard movement by 0.1%, Shift+arrow by 1%, Delete for unlocked selected layers, and Ctrl/Cmd+Z / Ctrl/Cmd+Shift+Z.

- [ ] **Step 4: Implement library, properties, and layer panel**

Every add button must create a fully valid default layer. Property edits dispatch through the history reducer. Show lock/visibility controls with accessible labels. Draw center and edge snap guides when values are within 0.5 percentage points.

- [ ] **Step 5: Run editor tests**

Run: `npm test -- src/components/admin/giaoDien`

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/components/admin/giaoDien
git commit -m "feat: add drag and drop template editor"
```

### Task 8: Add autosave, editor page, publish UI, and invitation attachment

**Files:**
- Create: `src/components/admin/giaoDien/useTuDongLuu.ts`
- Create: `src/components/admin/giaoDien/__tests__/useTuDongLuu.test.tsx`
- Create: `src/app/admin/mau-giao-dien/[id]/page.tsx`
- Modify: `src/components/admin/giaoDien/TrinhDungGiaoDien.tsx`
- Modify: `src/components/admin/giaoDien/ThanhCongCu.tsx`
- Modify: `src/components/admin/BangSua.tsx`
- Modify: `src/components/admin/__tests__/BangDieuKhien.test.tsx`

**Interfaces:**
- `useTuDongLuu({ id, banNhap, delayMs: 800 }) -> { trangThai, thuLai }`.
- `trangThai`: `'da-luu' | 'dang-cho' | 'dang-luu' | 'loi'`.

- [ ] **Step 1: Write failing fake-timer autosave tests**

Assert one PATCH after 800 ms of inactivity, cancellation/restart after another edit, no PATCH for unchanged serialized content, retry after a failed request, and `beforeunload` warning while `dang-cho | dang-luu | loi`.

- [ ] **Step 2: Verify failure**

Run: `npm test -- src/components/admin/giaoDien/__tests__/useTuDongLuu.test.tsx`

Expected: FAIL because the hook does not exist.

- [ ] **Step 3: Implement autosave and editor server page**

The server page must use:

```ts
export default async function Page({
  params,
}: PageProps<'/admin/mau-giao-dien/[id]'>) {
  const { id } = await params
  const mau = await layMau(id)
  if (!mau) notFound()
  return <TrinhDungGiaoDien id={id} banDau={mau.banNhap} thiepMau={thiepMau} />
}
```

This follows Next.js 16 asynchronous route params. Publish UI displays diagnostics, blocks on errors, allows warnings, and updates the last published version label after success. Add a version list whose `Khôi phục thành bản nháp` action requires confirmation, calls the restore route, and replaces editor history with the restored draft; it must not update the public invitation until a later publish and attachment.

- [ ] **Step 4: Add template attachment to invitation editor**

Load available published template versions in the admin invitation page and pass them into `BangSua`. Add a select to attach a published version. Show `Tách khỏi mẫu` only when attached and require an explicit confirmation dialog before calling DELETE. After detach, keep the resolved layout in preview.

- [ ] **Step 5: Run admin tests**

Run: `npm test -- src/components/admin/giaoDien src/components/admin/__tests__/BangDieuKhien.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/components/admin src/app/admin
git commit -m "feat: connect template editor lifecycle"
```

### Task 9: Verify accessibility, responsive behavior, and the complete workflow

**Files:**
- Create: `e2e/giao-dien-canvas.spec.ts`
- Modify: `src/app/globals.css`
- Modify: `docs/kiem-tra-tay.md`

**Interfaces:**
- Consumes all previous tasks.
- Produces end-to-end evidence for import → edit → publish → attach → public render → detach.

- [ ] **Step 1: Add failing Playwright workflow**

The test must:

1. Create a template.
2. Upload a deterministic 390×2400 background fixture.
3. Add bound couple-name text and a custom HTTPS button.
4. Drag, resize, lock, and verify locked movement is refused.
5. Preview at 360, 390, and 430 px and compare the same percentage geometry.
6. Publish, attach to an invitation, open the public slug, and assert the real data and link.
7. Reopen the template, change the draft, and assert the public slug is unchanged.
8. Publish a second version, attach it, then detach and assert later template changes do not affect the invitation.
9. Restore version 1 as a draft and assert the public invitation remains on its currently attached immutable version.

- [ ] **Step 2: Run the new E2E test and capture the first failure**

Run: `npm run e2e -- e2e/giao-dien-canvas.spec.ts`

Expected: FAIL on the first missing or incorrect workflow behavior.

- [ ] **Step 3: Fix only workflow defects and add visual/accessibility polish**

Ensure focus rings, 44 px editor controls, keyboard-operable layer actions, visible save state, `aria-live` status messages, no horizontal page scrolling, and reduced-motion behavior. Add the full manual matrix to `docs/kiem-tra-tay.md`.

- [ ] **Step 4: Run complete verification**

Run:

```powershell
npm test
npm run lint
npx tsc --noEmit
npm run build
npm run e2e -- e2e/giao-dien-canvas.spec.ts
```

Expected: all commands exit 0.

- [ ] **Step 5: Inspect a production build manually**

Run: `npm start`

Verify with browser widths 320, 360, 390, 430, 520, and 1440 px. At 1440 px the invitation remains a centered 520 px phone frame. Confirm no seams between background segments and no draft changes leak to the public invitation.

- [ ] **Step 6: Commit**

```powershell
git add e2e/giao-dien-canvas.spec.ts src/app/globals.css docs/kiem-tra-tay.md
git commit -m "test: verify canvas template workflow"
```

## Completion Gate

Before claiming completion:

- Every test added in Tasks 1–9 passes.
- `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build` all exit 0.
- The focused Playwright workflow exits 0.
- A published invitation reads an immutable version, not a mutable draft.
- The background remains uncropped at 320–520 px and the desktop frame stays centered.
- Unsafe custom links cannot be published.
- The worktree contains no unrelated modified files.
