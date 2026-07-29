# Decorative Invitation Text Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho phép người quản trị nhập chữ gắn trực tiếp với D1.1/D1.2/D1.5 ở mọi section mà không biến D1 thành nội dung chính.

**Architecture:** Tách metadata vùng chữ D1 vào module thủ công, mở rộng `ChiTietTrangTri` bằng cấu hình chữ tùy chọn, rồi dùng metadata chung cho editor và renderer. `LopTrangTri` dựng D1 bằng PNG màu gốc cùng lớp chữ trong một wrapper transform; họa tiết thường tiếp tục dùng CSS mask.

**Tech Stack:** Next.js 16.2.12, React 19.2.4, TypeScript, Tailwind CSS 4, Zod 4, Vitest, Testing Library.

## Global Constraints

- Đọc tài liệu liên quan trong `node_modules/next/dist/docs/` trước khi sửa code Next.js.
- D1 vẫn là chi tiết trang trí tùy chọn và dùng được ở mọi `SectionId`.
- Chữ phải di chuyển, thu phóng và xoay cùng D1.
- D1 dùng PNG màu gốc; họa tiết thường vẫn dùng CSS mask.
- Thiệp cũ không có `chu` tiếp tục parse và render.
- Không khôi phục cơ chế “mẫu bìa” chuyên biệt.

---

### Task 1: Model chữ và metadata vùng chữ D1

**Files:**
- Create: `src/lib/invitation/chiTietCoChu.ts`
- Modify: `src/lib/invitation/types.ts`
- Modify: `src/lib/invitation/schema.ts`
- Modify: `src/lib/invitation/__tests__/schema.test.ts`
- Create: `src/lib/invitation/__tests__/chiTietCoChu.test.ts`

**Interfaces:**
- Produces: `ChuChiTietTrangTri`, `ChiTietTrangTri.chu?`, `CAU_HINH_CHI_TIET_CO_CHU`, `layCauHinhChiTietCoChu(id)`.
- `CauHinhChiTietCoChu` chứa `tiLe`, `vungChu`, và `macDinh`.

- [ ] **Step 1: Viết kiểm thử schema thất bại**

Thêm vào `schema.test.ts`:

```ts
it('giữ cấu hình chữ hợp lệ của chi tiết trang trí', () => {
  const ketQua = invitationSchema.parse({
    ...thiepMau,
    chiTietTrangTri: [{
      id: 'primary-decor/wedding-ritual/thiep-phong-bi-giay-do-trien-doi-chim-01',
      section: 'album',
      x: 50, y: 50, mau: '#8B2F20', doDam: 1, kichThuoc: 60,
      chu: {
        noiDung: 'Trân trọng kính mời',
        font: 'serif-co-dien',
        coChu: 24,
        mauChu: '#6B2F24',
        canLe: 'center',
      },
    }],
  })

  expect(ketQua.chiTietTrangTri?.[0].chu?.noiDung).toBe('Trân trọng kính mời')
})

it('từ chối cấu hình chữ chi tiết không hợp lệ', () => {
  expect(() => invitationSchema.parse({
    ...thiepMau,
    chiTietTrangTri: [{
      id: 'x', section: 'bia', x: 50, y: 50,
      mau: '#8B2F20', doDam: 1, kichThuoc: 25,
      chu: { noiDung: '', font: 'sai', coChu: 100, mauChu: 'red', canLe: 'sai' },
    }],
  })).toThrow()
})
```

- [ ] **Step 2: Chạy test đỏ**

Run: `npm.cmd test -- src/lib/invitation/__tests__/schema.test.ts`

Expected: FAIL vì schema hiện loại bỏ `chu`.

- [ ] **Step 3: Thêm type và schema tối thiểu**

Trong `types.ts`:

```ts
export type FontChuChiTiet = 'serif-co-dien' | 'sans-sach'
export type CanLeChuChiTiet = 'left' | 'center' | 'right'

export interface ChuChiTietTrangTri {
  noiDung: string
  font: FontChuChiTiet
  coChu: number
  mauChu: string
  canLe: CanLeChuChiTiet
}
```

Thêm `chu?: ChuChiTietTrangTri` vào `ChiTietTrangTri`. Trong `schema.ts`, thêm:

```ts
chu: z.object({
  noiDung: z.string().max(500),
  font: z.enum(['serif-co-dien', 'sans-sach']),
  coChu: z.number().int().min(12).max(72),
  mauChu: maMauSchema,
  canLe: z.enum(['left', 'center', 'right']),
}).optional(),
```

- [ ] **Step 4: Viết test metadata thất bại**

Tạo `chiTietCoChu.test.ts`:

```ts
it.each([
  'primary-decor/wedding-ritual/thiep-phong-bi-do-son-mai-dinh-01',
  'primary-decor/wedding-ritual/thiep-phong-bi-giay-do-trien-doi-chim-01',
  'primary-decor/wedding-ritual/thiep-phong-bi-xanh-ngang-doi-chim-01',
])('có metadata vùng chữ cho %s', (id) => {
  const cauHinh = layCauHinhChiTietCoChu(id)
  expect(cauHinh).toBeDefined()
  expect(cauHinh?.vungChu.rong).toBeGreaterThan(0)
})

it('không nhận họa tiết thường là chi tiết có chữ', () => {
  expect(layCauHinhChiTietCoChu('primary-decor/florals/F01-lotus-front')).toBeUndefined()
})
```

- [ ] **Step 5: Tạo metadata D1**

Tạo `chiTietCoChu.ts`, chuyển tỷ lệ, vùng chữ và mặc định từ thiết kế D1 cũ:

```ts
export interface CauHinhChiTietCoChu {
  tiLe: string
  vungChu: { x: number; y: number; rong: number; cao: number; xoay?: number }
  macDinh: Omit<ChuChiTietTrangTri, 'noiDung'>
}

export const CAU_HINH_CHI_TIET_CO_CHU: Record<string, CauHinhChiTietCoChu> = {
  'primary-decor/wedding-ritual/thiep-phong-bi-do-son-mai-dinh-01': {
    tiLe: '1 / 1',
    vungChu: { x: 35, y: 11, rong: 38, cao: 42, xoay: 7 },
    macDinh: { font: 'serif-co-dien', coChu: 25, mauChu: '#6B2F24', canLe: 'center' },
  },
  'primary-decor/wedding-ritual/thiep-phong-bi-giay-do-trien-doi-chim-01': {
    tiLe: '3 / 2',
    vungChu: { x: 29, y: 42, rong: 48, cao: 28 },
    macDinh: { font: 'serif-co-dien', coChu: 27, mauChu: '#6B2F24', canLe: 'center' },
  },
  'primary-decor/wedding-ritual/thiep-phong-bi-xanh-ngang-doi-chim-01': {
    tiLe: '3 / 2',
    vungChu: { x: 17, y: 32, rong: 66, cao: 40 },
    macDinh: { font: 'sans-sach', coChu: 25, mauChu: '#173F43', canLe: 'center' },
  },
}

export function layCauHinhChiTietCoChu(id: string) {
  return CAU_HINH_CHI_TIET_CO_CHU[id]
}
```

- [ ] **Step 6: Chạy test xanh và commit**

Run: `npm.cmd test -- src/lib/invitation/__tests__/schema.test.ts src/lib/invitation/__tests__/chiTietCoChu.test.ts`

Expected: PASS.

```powershell
git add -- src/lib/invitation/types.ts src/lib/invitation/schema.ts src/lib/invitation/chiTietCoChu.ts src/lib/invitation/__tests__/schema.test.ts src/lib/invitation/__tests__/chiTietCoChu.test.ts
git commit -m "feat: them model chu cho chi tiet D1"
```

### Task 2: Editor nhập chữ cho D1

**Files:**
- Modify: `src/components/admin/ChonChiTiet.tsx`
- Modify: `src/components/admin/__tests__/ChonChiTiet.test.tsx`

**Interfaces:**
- Consumes: `layCauHinhChiTietCoChu(id)` và `ChuChiTietTrangTri`.
- Produces: D1 mới có `chu` mặc định; editor D1 cập nhật `chu`; họa tiết thường không có UI chữ.

- [ ] **Step 1: Viết test đỏ cho khởi tạo và chỉnh chữ**

Thêm vào `ChonChiTiet.test.tsx`:

```tsx
it('khởi tạo chữ mặc định và cho nhập chữ trên D1', async () => {
  const onThem = vi.fn()
  const d1 = DANH_SACH_HOA_TIET.find((m) => m.id === ID_D1_2)!
  const { rerender } = render(<ChonChiTiet giaTri={[]} section="album" onDoi={onThem} />)

  await userEvent.click(screen.getByRole('button', { name: 'Thêm chi tiết' }))
  await userEvent.selectOptions(screen.getByLabelText('Nhóm chi tiết'), d1.nhom)
  await userEvent.click(screen.getByRole('button', { name: `Thêm ${d1.nhan}` }))

  const moi = onThem.mock.calls[0][0][0]
  expect(moi.chu).toEqual(expect.objectContaining({ noiDung: '', canLe: 'center' }))

  const onSua = vi.fn()
  rerender(<ChonChiTiet giaTri={[moi]} section="album" onDoi={onSua} />)
  await userEvent.type(screen.getByLabelText('Chữ trên thiệp'), 'Kính mời')

  expect(onSua).toHaveBeenCalledWith([
    expect.objectContaining({ chu: expect.objectContaining({ noiDung: 'Kính mời' }) }),
  ])
})

it('không hiện ô chữ cho họa tiết thường', () => {
  render(<ChonChiTiet giaTri={[chiTietThuong]} section="bia" onDoi={() => {}} />)
  expect(screen.queryByLabelText('Chữ trên thiệp')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Chạy test đỏ**

Run: `npm.cmd test -- src/components/admin/__tests__/ChonChiTiet.test.tsx`

Expected: FAIL vì D1 chưa có `chu` và editor chưa có textarea.

- [ ] **Step 3: Khởi tạo và dựng form chữ**

Trong `them(id)`, lấy metadata và thêm:

```ts
const cauHinhChu = layCauHinhChiTietCoChu(id)
const chu = cauHinhChu ? { noiDung: '', ...cauHinhChu.macDinh } : undefined
onDoi([...giaTri, { ...MOI, id, section, ...(chu ? { chu } : {}) }])
```

Trong mỗi thẻ editor có metadata, dựng textarea `aria-label="Chữ trên thiệp"` và bốn control `Phông chữ trên thiệp`, `Cỡ chữ trên thiệp`, `Màu chữ trên thiệp`, `Căn chữ trên thiệp`. Mỗi `onChange` gọi:

```ts
sua(i, { chu: { ...ct.chu!, noiDung: e.target.value } })
```

- [ ] **Step 4: Chạy test xanh và commit**

Run: `npm.cmd test -- src/components/admin/__tests__/ChonChiTiet.test.tsx src/components/__tests__/LopTrangTri.test.tsx`

Expected: PASS.

```powershell
git add -- src/components/admin/ChonChiTiet.tsx src/components/admin/__tests__/ChonChiTiet.test.tsx
git commit -m "feat: cho nhap chu tren chi tiet D1"
```

### Task 3: Renderer ảnh màu gốc và chữ gắn với D1

**Files:**
- Modify: `src/components/LopTrangTri.tsx`
- Modify: `src/components/__tests__/LopTrangTri.test.tsx`

**Interfaces:**
- Consumes: `layCauHinhChiTietCoChu(id)` và `ChiTietTrangTri.chu`.
- Produces: wrapper `[data-chi-tiet-co-chu]`, ảnh `/hoa-tiet/${muc.tep}`, và chữ tùy chọn trong vùng metadata.

- [ ] **Step 1: Viết test đỏ cho D1**

Thêm vào `LopTrangTri.test.tsx`:

```tsx
it('dựng D1 bằng ảnh màu gốc và chữ trong cùng wrapper', () => {
  const d1 = chiTiet({
    id: ID_D1_2,
    kichThuoc: 60,
    gocXoay: 15,
    chu: {
      noiDung: 'Trân trọng kính mời',
      font: 'serif-co-dien',
      coChu: 27,
      mauChu: '#6B2F24',
      canLe: 'center',
    },
  })
  const { container } = render(<LopTrangTri chiTiet={[d1]} />)

  const wrapper = container.querySelector('[data-chi-tiet-co-chu]')
  expect(wrapper).toHaveStyle({ width: '60%', transform: 'translate(-50%, -50%) rotate(15deg)' })
  expect(container.querySelector('img')).toHaveAttribute(
    'src',
    expect.stringContaining('thiep-phong-bi'),
  )
  expect(screen.getByText('Trân trọng kính mời')).toBeInTheDocument()
})

it('không dựng lớp chữ khi nội dung D1 rỗng', () => {
  render(<LopTrangTri chiTiet={[chiTiet({ id: ID_D1_2, chu: { ...CHU_D1, noiDung: '' } })]} />)
  expect(screen.queryByTestId('chu-chi-tiet')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Chạy test đỏ**

Run: `npm.cmd test -- src/components/__tests__/LopTrangTri.test.tsx`

Expected: FAIL vì D1 hiện vẫn là CSS mask và không dựng chữ.

- [ ] **Step 3: Dựng wrapper D1**

Trong `LopTrangTri`, nếu có metadata:

```tsx
import Image from 'next/image'

<div
  data-chi-tiet-co-chu
  aria-hidden="true"
  style={{ ...viTriChung, aspectRatio: cauHinh.tiLe, opacity: ct.doDam, pointerEvents: 'none' }}
>
  <Image
    src={`/hoa-tiet/${muc.tep}`}
    alt=""
    fill
    sizes="(max-width: 520px) 100vw, 520px"
    className="absolute inset-0 h-full w-full object-contain"
  />
  {ct.chu?.noiDung.trim() && (
    <div
      data-testid="chu-chi-tiet"
      className="absolute flex items-center justify-center whitespace-pre-line px-1 leading-snug"
      style={{
        left: `${cauHinh.vungChu.x}%`,
        top: `${cauHinh.vungChu.y}%`,
        width: `${cauHinh.vungChu.rong}%`,
        height: `${cauHinh.vungChu.cao}%`,
        transform: cauHinh.vungChu.xoay ? `rotate(${cauHinh.vungChu.xoay}deg)` : undefined,
        color: ct.chu.mauChu,
        fontFamily: FONT_CHU_CHI_TIET_CSS[ct.chu.font],
        fontSize: `${ct.chu.coChu}px`,
        textAlign: ct.chu.canLe,
      }}
    >
      <span className="w-full">{ct.chu.noiDung}</span>
    </div>
  )}
</div>
```

Xuất `FONT_CHU_CHI_TIET_CSS` từ `chiTietCoChu.ts`. Nhánh không có metadata giữ nguyên `<HoaTiet>`.

- [ ] **Step 4: Chạy test xanh và commit**

Run: `npm.cmd test -- src/components/__tests__/LopTrangTri.test.tsx src/components/admin/__tests__/ChonChiTiet.test.tsx`

Expected: PASS, bao gồm các test CSS mask cũ.

```powershell
git add -- src/components/LopTrangTri.tsx src/components/__tests__/LopTrangTri.test.tsx src/lib/invitation/chiTietCoChu.ts
git commit -m "feat: hien thi chu gan voi chi tiet D1"
```

### Task 4: Xác minh tích hợp và push

**Files:**
- Verify: toàn bộ file của Tasks 1–3.

**Interfaces:**
- Consumes: model, editor và renderer D1 hoàn chỉnh.
- Produces: nhánh hiện tại đã kiểm thử và sẵn sàng push.

- [ ] **Step 1: Chạy test đầy đủ**

Run: `npm.cmd test`

Expected: tất cả test PASS.

- [ ] **Step 2: Chạy lint**

Run: `npm.cmd run lint`

Expected: PASS.

- [ ] **Step 3: Chạy production build**

Run: `npm.cmd run build`

Expected: PASS.

- [ ] **Step 4: Kiểm tra diff và push**

Run: `git diff --check`

Expected: không có lỗi whitespace.

```powershell
git push
```
