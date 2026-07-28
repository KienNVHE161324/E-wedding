# Music Clip Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho phép mỗi thiệp phát cả bài hoặc phát lặp một đoạn 1 phút/30 giây được admin chọn bằng thanh thời gian.

**Architecture:** Mở rộng dữ liệu `nhac` bằng hai trường tùy chọn và gom phép tính biên đoạn vào module thuần dùng chung. `ONhac` đọc metadata để hiển thị thanh chọn và nghe thử; `InvitationRenderer` dùng cùng phép tính để lặp đoạn mà không tạo file MP3 mới.

**Tech Stack:** Next.js 16 App Router, React 19 Client Components, TypeScript, Zod 4, Vitest, Testing Library.

## Global Constraints

- Không tạo file MP3 đã cắt và không thêm FFmpeg hay dependency âm thanh mới.
- Nhạc mặc định nằm trong `public/nhac`; nhạc tải riêng giữ nguyên kho lưu trữ hiện tại.
- `thoiLuong` chỉ nhận `30`, `60` hoặc không có; không có nghĩa là phát cả bài.
- Dữ liệu thiệp cũ không có `batDau` và `thoiLuong` phải tiếp tục hợp lệ và phát cả bài.
- Nhạc chỉ tự phát sau thao tác `Mở thiệp`; mọi chế độ đều tự lặp.

---

### Task 1: Mô hình dữ liệu và phép tính đoạn nhạc

**Files:**
- Create: `src/lib/nhac/doanNhac.ts`
- Create: `src/lib/nhac/__tests__/doanNhac.test.ts`
- Modify: `src/lib/invitation/types.ts`
- Modify: `src/lib/invitation/schema.ts`
- Modify: `src/lib/invitation/__tests__/schema.test.ts`

**Interfaces:**
- Produces: `type ThoiLuongDoanNhac = 30 | 60`
- Produces: `gioiHanBatDau(batDau: number, thoiLuong: ThoiLuongDoanNhac, tongThoiLuong: number): number`
- Produces: `layKetThucDoan(batDau: number, thoiLuong: ThoiLuongDoanNhac, tongThoiLuong: number): number`
- Produces: `dinhDangThoiGian(soGiay: number): string`
- Extends: `Invitation['nhac']` with `batDau?: number` and `thoiLuong?: ThoiLuongDoanNhac`

- [ ] **Step 1: Viết test thất bại cho schema nhạc**

Thêm vào `src/lib/invitation/__tests__/schema.test.ts`:

```ts
it('chấp nhận cấu hình đoạn nhạc và vẫn nhận dữ liệu nhạc cũ', () => {
  expect(() => invitationSchema.parse(thiepMau)).not.toThrow()
  const ketQua = invitationSchema.parse({
    ...thiepMau,
    nhac: { ...thiepMau.nhac!, batDau: 80, thoiLuong: 30 },
  })
  expect(ketQua.nhac).toMatchObject({ batDau: 80, thoiLuong: 30 })
})

it('từ chối thời lượng đoạn và điểm bắt đầu không hợp lệ', () => {
  expect(() =>
    invitationSchema.parse({
      ...thiepMau,
      nhac: { ...thiepMau.nhac!, batDau: -1, thoiLuong: 45 },
    }),
  ).toThrow()
})
```

- [ ] **Step 2: Chạy test schema để xác nhận RED**

Run: `npx.cmd vitest run src/lib/invitation/__tests__/schema.test.ts`

Expected: FAIL vì schema loại bỏ hoặc chưa kiểm tra `batDau` và `thoiLuong`.

- [ ] **Step 3: Mở rộng type và schema tối thiểu**

Trong `src/lib/invitation/types.ts`:

```ts
export type ThoiLuongDoanNhac = 30 | 60

export type Nhac = {
  url: string
  ten: string
  batDau?: number
  thoiLuong?: ThoiLuongDoanNhac
}
```

Đổi `nhac?: { url: string; ten: string }` thành `nhac?: Nhac`.

Trong `src/lib/invitation/schema.ts`, thay schema nhạc bằng:

```ts
nhac: z
  .object({
    url: z.string().min(1),
    ten: z.string(),
    batDau: z.number().finite().nonnegative().optional(),
    thoiLuong: z.union([z.literal(30), z.literal(60)]).optional(),
  })
  .optional(),
```

- [ ] **Step 4: Viết test thất bại cho phép tính biên đoạn**

Tạo `src/lib/nhac/__tests__/doanNhac.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { dinhDangThoiGian, gioiHanBatDau, layKetThucDoan } from '../doanNhac'

describe('đoạn nhạc', () => {
  it('giới hạn điểm bắt đầu để đoạn không vượt cuối bài', () => {
    expect(gioiHanBatDau(190, 30, 200)).toBe(170)
    expect(gioiHanBatDau(-5, 30, 200)).toBe(0)
  })

  it('dùng toàn bộ bài nếu bài ngắn hơn đoạn đã chọn', () => {
    expect(gioiHanBatDau(10, 60, 40)).toBe(0)
    expect(layKetThucDoan(0, 60, 40)).toBe(40)
  })

  it('định dạng số giây thành phút và giây', () => {
    expect(dinhDangThoiGian(80)).toBe('01:20')
  })
})
```

- [ ] **Step 5: Chạy test helper để xác nhận RED**

Run: `npx.cmd vitest run src/lib/nhac/__tests__/doanNhac.test.ts`

Expected: FAIL vì `src/lib/nhac/doanNhac.ts` chưa tồn tại.

- [ ] **Step 6: Cài đặt helper tối thiểu**

Tạo `src/lib/nhac/doanNhac.ts`:

```ts
import type { ThoiLuongDoanNhac } from '@/lib/invitation/types'

export function gioiHanBatDau(
  batDau: number,
  thoiLuong: ThoiLuongDoanNhac,
  tongThoiLuong: number,
): number {
  const gioiHan = Math.max(0, tongThoiLuong - thoiLuong)
  return Math.min(Math.max(0, batDau), gioiHan)
}

export function layKetThucDoan(
  batDau: number,
  thoiLuong: ThoiLuongDoanNhac,
  tongThoiLuong: number,
): number {
  return Math.min(gioiHanBatDau(batDau, thoiLuong, tongThoiLuong) + thoiLuong, tongThoiLuong)
}

export function dinhDangThoiGian(soGiay: number): string {
  const anToan = Math.max(0, Math.floor(soGiay))
  const phut = Math.floor(anToan / 60)
  const giay = anToan % 60
  return `${String(phut).padStart(2, '0')}:${String(giay).padStart(2, '0')}`
}
```

- [ ] **Step 7: Chạy test Task 1 và xác nhận GREEN**

Run: `npx.cmd vitest run src/lib/invitation/__tests__/schema.test.ts src/lib/nhac/__tests__/doanNhac.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit Task 1**

```powershell
git add src/lib/invitation/types.ts src/lib/invitation/schema.ts src/lib/invitation/__tests__/schema.test.ts src/lib/nhac/doanNhac.ts src/lib/nhac/__tests__/doanNhac.test.ts
git commit -m "feat: them cau hinh doan nhac"
```

### Task 2: Danh mục nhạc mặc định và giao diện chọn đoạn

**Files:**
- Create: `public/nhac/.gitkeep`
- Create: `src/lib/nhac/macDinh.ts`
- Create: `src/components/admin/__tests__/ONhac.test.tsx`
- Modify: `src/components/admin/ONhac.tsx`

**Interfaces:**
- Consumes: `gioiHanBatDau`, `layKetThucDoan`, `dinhDangThoiGian`
- Produces: `DANH_SACH_NHAC_MAC_DINH: ReadonlyArray<{ ten: string; url: string }>`
- Preserves: `ONhac({ giaTri, slug, onDoi })`

- [ ] **Step 1: Viết test thất bại cho lựa chọn thời lượng**

Tạo `src/components/admin/__tests__/ONhac.test.tsx` với harness có state:

```tsx
import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ONhac } from '../ONhac'
import type { Invitation } from '@/lib/invitation/types'

function Harness({ onDoi = vi.fn() }: { onDoi?: (v: Invitation['nhac']) => void }) {
  const [nhac, setNhac] = useState<Invitation['nhac']>({
    url: '/nhac/ban-tinh-ca.mp3',
    ten: 'Bản tình ca',
  })
  return (
    <ONhac
      giaTri={nhac}
      slug="nam-linh"
      onDoi={(moi) => {
        setNhac(moi)
        onDoi(moi)
      }}
    />
  )
}

describe('ONhac', () => {
  it('chọn đoạn 30 giây và lưu điểm bắt đầu từ thanh thời gian', async () => {
    const onDoi = vi.fn()
    render(<Harness onDoi={onDoi} />)
    const audio = screen.getByTestId('nghe-thu-nhac')
    Object.defineProperty(audio, 'duration', { configurable: true, value: 200 })
    fireEvent.loadedMetadata(audio)

    await userEvent.click(screen.getByRole('radio', { name: '30 giây' }))
    fireEvent.change(screen.getByRole('slider', { name: 'Điểm bắt đầu đoạn nhạc' }), {
      target: { value: '80' },
    })

    expect(screen.getByText('Đoạn phát: 01:20 – 01:50')).toBeInTheDocument()
    expect(onDoi.mock.calls.at(-1)?.[0]).toMatchObject({ batDau: 80, thoiLuong: 30 })
  })

  it('chọn cả bài thì xóa cấu hình đoạn', async () => {
    const onDoi = vi.fn()
    render(<Harness onDoi={onDoi} />)
    await userEvent.click(screen.getByRole('radio', { name: 'Cả bài' }))
    expect(onDoi.mock.calls.at(-1)?.[0]).toEqual({
      url: '/nhac/ban-tinh-ca.mp3',
      ten: 'Bản tình ca',
    })
  })
})
```

- [ ] **Step 2: Chạy test form để xác nhận RED**

Run: `npx.cmd vitest run src/components/admin/__tests__/ONhac.test.tsx`

Expected: FAIL vì chưa có radio, slider và nhãn khoảng thời gian.

- [ ] **Step 3: Tách danh mục nhạc mặc định**

Tạo `src/lib/nhac/macDinh.ts`:

```ts
export const DANH_SACH_NHAC_MAC_DINH = [
  { ten: 'Người ở đừng về (quan họ)', url: '/nhac/nguoi-o-dung-ve.mp3' },
  { ten: 'Bèo dạt mây trôi (hòa tấu)', url: '/nhac/beo-dat-may-troi.mp3' },
  { ten: 'Se chỉ luồn kim (quan họ)', url: '/nhac/se-chi-luon-kim.mp3' },
] as const
```

Tạo `public/nhac/.gitkeep`. Sau này file MP3 do người dùng copy vào thư mục này và
mỗi bài mới được thêm một mục tương ứng vào danh mục.

- [ ] **Step 4: Cài đặt trạng thái metadata và lựa chọn đoạn trong `ONhac`**

Thêm:

```ts
const [tongThoiLuong, setTongThoiLuong] = useState<number>()
const cheDo = giaTri?.thoiLuong ?? 'ca-bai'
```

Gắn vào audio nghe thử:

```tsx
<audio
  data-testid="nghe-thu-nhac"
  controls
  src={giaTri.url}
  onLoadedMetadata={(e) => setTongThoiLuong(e.currentTarget.duration)}
  onTimeUpdate={(e) => {
    if (!giaTri.thoiLuong || !tongThoiLuong) return
    const batDau = gioiHanBatDau(giaTri.batDau ?? 0, giaTri.thoiLuong, tongThoiLuong)
    const ketThuc = layKetThucDoan(batDau, giaTri.thoiLuong, tongThoiLuong)
    if (e.currentTarget.currentTime >= ketThuc) {
      e.currentTarget.currentTime = batDau
      void e.currentTarget.play()
    }
  }}
  className="mt-2 w-full"
/>
```

Thêm nhóm radio `Cả bài`, `1 phút`, `30 giây`. Khi chọn cả bài gọi:

```ts
onDoi({ url: giaTri.url, ten: giaTri.ten })
```

Khi chọn đoạn gọi:

```ts
onDoi({
  ...giaTri,
  thoiLuong,
  batDau: tongThoiLuong ? gioiHanBatDau(giaTri.batDau ?? 0, thoiLuong, tongThoiLuong) : 0,
})
```

Slider dùng:

```tsx
<input
  type="range"
  aria-label="Điểm bắt đầu đoạn nhạc"
  min={0}
  max={Math.max(0, tongThoiLuong - giaTri.thoiLuong)}
  step={1}
  value={gioiHanBatDau(giaTri.batDau ?? 0, giaTri.thoiLuong, tongThoiLuong)}
  onChange={(e) => onDoi({ ...giaTri, batDau: Number(e.target.value) })}
/>
```

Chỉ bật lựa chọn đoạn và slider khi `Number.isFinite(tongThoiLuong)`. Đổi `GOI_Y`
trong component thành import `DANH_SACH_NHAC_MAC_DINH`.

- [ ] **Step 5: Chạy test Task 2 và xác nhận GREEN**

Run: `npx.cmd vitest run src/components/admin/__tests__/ONhac.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit Task 2**

```powershell
git add public/nhac/.gitkeep src/lib/nhac/macDinh.ts src/components/admin/ONhac.tsx src/components/admin/__tests__/ONhac.test.tsx
git commit -m "feat: them thanh chon doan nhac"
```

### Task 3: Phát lặp đoạn trên thiệp

**Files:**
- Modify: `src/components/InvitationRenderer.tsx`
- Modify: `src/components/__tests__/InvitationRenderer.moThiep.test.tsx`

**Interfaces:**
- Consumes: `gioiHanBatDau`, `layKetThucDoan`
- Preserves: full-song behavior when `thiep.nhac.thoiLuong` is absent

- [ ] **Step 1: Viết test thất bại cho điểm bắt đầu và vòng lặp đoạn**

Thêm vào `InvitationRenderer.moThiep.test.tsx`:

```tsx
it('bắt đầu và lặp lại đúng đoạn nhạc đã chọn', async () => {
  const thiep = {
    ...thiepMau,
    nhac: { ...thiepMau.nhac!, batDau: 80, thoiLuong: 30 as const },
  }
  const { container } = render(<InvitationRenderer thiep={thiep} theme={theme} />)
  const audio = container.querySelector('audio')!
  Object.defineProperty(audio, 'duration', { configurable: true, value: 200 })

  await userEvent.click(screen.getByRole('button', { name: 'Mở thiệp' }))
  expect(audio.currentTime).toBe(80)

  audio.currentTime = 110
  fireEvent.timeUpdate(audio)
  expect(audio.currentTime).toBe(80)
})

it('giữ cơ chế loop gốc khi phát cả bài', () => {
  const { container } = render(<InvitationRenderer thiep={thiepMau} theme={theme} />)
  expect(container.querySelector('audio')).toHaveAttribute('loop')
})
```

Nhớ thêm `fireEvent` vào import từ Testing Library.

- [ ] **Step 2: Chạy test renderer để xác nhận RED**

Run: `npx.cmd vitest run src/components/__tests__/InvitationRenderer.moThiep.test.tsx`

Expected: FAIL vì `currentTime` chưa được đặt về 80 và audio đoạn vẫn dùng loop cả bài.

- [ ] **Step 3: Cài đặt phát và lặp đoạn**

Trong `InvitationRenderer.tsx`, tạo helper nội bộ:

```ts
function duaVeDauDoanNeuCan(audio: HTMLAudioElement): void {
  if (!thiep.nhac?.thoiLuong || !Number.isFinite(audio.duration)) return
  const batDau = gioiHanBatDau(
    thiep.nhac.batDau ?? 0,
    thiep.nhac.thoiLuong,
    audio.duration,
  )
  const ketThuc = layKetThucDoan(batDau, thiep.nhac.thoiLuong, audio.duration)
  if (audio.currentTime < batDau || audio.currentTime >= ketThuc) {
    audio.currentTime = batDau
  }
}
```

Gọi helper ngay trước `play()` trong `moThiep` và nhánh phát của `batTatNhac`.
Trên phần tử audio:

```tsx
loop={!thiep.nhac.thoiLuong}
onLoadedMetadata={(e) => duaVeDauDoanNeuCan(e.currentTarget)}
onTimeUpdate={(e) => {
  const audio = e.currentTarget
  if (!thiep.nhac?.thoiLuong || !Number.isFinite(audio.duration)) return
  const batDau = gioiHanBatDau(
    thiep.nhac.batDau ?? 0,
    thiep.nhac.thoiLuong,
    audio.duration,
  )
  const ketThuc = layKetThucDoan(batDau, thiep.nhac.thoiLuong, audio.duration)
  if (audio.currentTime >= ketThuc) {
    audio.currentTime = batDau
    void audio.play()
  }
}}
```

- [ ] **Step 4: Chạy test renderer và xác nhận GREEN**

Run: `npx.cmd vitest run src/components/__tests__/InvitationRenderer.moThiep.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit Task 3**

```powershell
git add src/components/InvitationRenderer.tsx src/components/__tests__/InvitationRenderer.moThiep.test.tsx
git commit -m "feat: lap doan nhac tren thiep"
```

### Task 4: Kiểm tra tích hợp và tương thích

**Files:**
- Modify only if verification reveals an in-scope defect.

**Interfaces:**
- Verifies all interfaces and compatibility introduced by Tasks 1–3.

- [ ] **Step 1: Chạy toàn bộ test**

Run: `npm.cmd test`

Expected: tất cả test PASS, không có file test lỗi.

- [ ] **Step 2: Kiểm tra TypeScript**

Run: `npx.cmd tsc --noEmit`

Expected: exit code `0`.

- [ ] **Step 3: Chạy lint**

Run: `npm.cmd run lint`

Expected: exit code `0`, không có lỗi ESLint.

- [ ] **Step 4: Build production**

Run: `npm.cmd run build`

Expected: exit code `0`; các route hiện tại được tạo thành công.

- [ ] **Step 5: Kiểm tra thủ công ở trang admin**

Khởi động app, mở một thiệp trong `/admin/[slug]`, chọn bài có metadata hợp lệ và xác nhận:

1. `Cả bài` không hiện thanh chọn đoạn.
2. `1 phút` và `30 giây` hiện thanh chọn sau khi metadata tải xong.
3. Kéo thanh cập nhật đúng `Đoạn phát: mm:ss – mm:ss`.
4. Nghe thử quay lại đầu đoạn khi chạm cuối.
5. Lưu và tải lại trang vẫn giữ lựa chọn.

- [ ] **Step 6: Kiểm tra thủ công trên thiệp công khai**

Mở `/[slug]`, nhấn `Mở thiệp` và xác nhận nhạc bắt đầu tại điểm đã chọn, tự quay
lại đầu đoạn, nút bật/tắt hoạt động, và thiệp dùng chế độ cả bài vẫn lặp toàn bài.

- [ ] **Step 7: Commit sửa lỗi tích hợp nếu có**

Nếu các bước kiểm tra buộc phải sửa file, chỉ stage đúng file đã sửa:

```powershell
git add src/lib/invitation/types.ts src/lib/invitation/schema.ts src/lib/nhac/doanNhac.ts src/lib/nhac/macDinh.ts src/components/admin/ONhac.tsx src/components/InvitationRenderer.tsx
git commit -m "fix: hoan thien phat doan nhac"
```

Nếu không phát sinh sửa lỗi, bỏ qua bước commit này.
