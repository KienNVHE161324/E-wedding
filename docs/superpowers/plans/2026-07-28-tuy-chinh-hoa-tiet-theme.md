# Tùy Chỉnh Họa Tiết Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho admin chỉnh đầy đủ hai họa tiết mặc định trên bìa và xoay mọi chi tiết trang trí.

**Architecture:** Lưu override theo slot trong `tuyChinhGiaoDien.hoaTiet`, giữ theme làm fallback cho thiệp cũ. Component `HoaTietThemeTuyChinh` hợp nhất mặc định và override; editor `TuyChinhHoaTietTheme` cập nhật từng slot mà không làm mất trường khác.

**Tech Stack:** React 19, Next.js 16 App Router, TypeScript, Zod, CSS variables, Vitest, Testing Library.

## Global Constraints

- Bìa tiếp tục cao một màn hình.
- Không migration dữ liệu cũ.
- ID ảnh hỏng quay về ảnh theme.
- Góc xoay nằm trong `-180..180`.
- Không thay đổi kho `image_collections`.

---

### Task 1: Kiểu dữ liệu và schema góc xoay

**Files:**
- Modify: `src/lib/invitation/types.ts`
- Modify: `src/lib/invitation/schema.ts`
- Modify: `src/lib/invitation/__tests__/schema.test.ts`

**Interfaces:**
- Produces: `TuyChinhHoaTietTheme`, `TuyChinhGiaoDien.hoaTiet`, `ChiTietTrangTri.gocXoay`.

- [ ] **Step 1: Viết test RED**

Thêm fixture có `gocXoay: 45` và `hoaTiet.watermark.gocXoay: -30`, kiểm tra parse thành công; thêm test `gocXoay: 181` bị từ chối.

- [ ] **Step 2: Xác nhận RED**

Run: `npm.cmd test -- src/lib/invitation/__tests__/schema.test.ts`

Expected: FAIL vì schema loại bỏ/chưa nhận cấu hình mới.

- [ ] **Step 3: Implement kiểu và schema**

Khai báo trường đúng đặc tả; `id`, `x`, `y`, `kichThuoc`, `gocXoay`, `mau`, `doDam`, `raSauChu`, `an` đều optional trong override.

- [ ] **Step 4: Xác nhận GREEN và commit**

Run: `npm.cmd test -- src/lib/invitation/__tests__/schema.test.ts`

```powershell
git add -- src/lib/invitation/types.ts src/lib/invitation/schema.ts src/lib/invitation/__tests__/schema.test.ts
git commit -m "feat: mo rong cau hinh hoa tiet theme"
```

### Task 2: Renderer họa tiết theme và góc xoay

**Files:**
- Modify: `src/components/HoaTiet.tsx`
- Modify: `src/components/sections/Bia.tsx`
- Modify: `src/components/LopTrangTri.tsx`
- Modify: `src/components/__tests__/HoaTiet.test.tsx`
- Modify: `src/components/__tests__/LopTrangTri.test.tsx`

**Interfaces:**
- Consumes: `TuyChinhHoaTietTheme`, slot `watermark | corner`.
- Produces: `HoaTietThemeTuyChinh({ theme, slot, tuyChinh, macDinh })`.

- [ ] **Step 1: Viết test RED**

Kiểm tra override `id`, `x`, `y`, `kichThuoc`, `gocXoay`, `mau`, `doDam`, `raSauChu`; kiểm tra `an` không render và ID hỏng fallback theme. Thêm assertion:

```tsx
expect(el.style.transform).toBe('translate(-50%, -50%) rotate(45deg)')
```

cho `LopTrangTri`.

- [ ] **Step 2: Xác nhận RED**

Run: `npm.cmd test -- src/components/__tests__/HoaTiet.test.tsx src/components/__tests__/LopTrangTri.test.tsx`

Expected: FAIL vì component và transform chưa có.

- [ ] **Step 3: Implement tối thiểu**

Hợp nhất mặc định bìa:

```ts
watermark: { x: 50, y: 50, kichThuoc: 66, gocXoay: 0, raSauChu: true }
corner: { x: 50, y: 94, kichThuoc: 14, gocXoay: 0, raSauChu: true }
```

Tra asset override qua `layHoaTiet`; dùng file theme khi không tìm thấy. Thêm `rotate(${ct.gocXoay ?? 0}deg)` vào `LopTrangTri`.

- [ ] **Step 4: Xác nhận GREEN và commit**

Run lệnh test Task 2 và commit các file Task 2.

### Task 3: Editor họa tiết mặc định và xoay chi tiết tự do

**Files:**
- Create: `src/components/admin/TuyChinhHoaTietTheme.tsx`
- Modify: `src/components/admin/BangSua.tsx`
- Modify: `src/components/admin/ChonChiTiet.tsx`
- Modify: `src/components/__tests__/LopTrangTri.test.tsx`

**Interfaces:**
- Consumes: `slot`, `theme`, `giaTri?: TuyChinhHoaTietTheme`.
- Produces: `onDoi(value: TuyChinhHoaTietTheme)` và các điều khiển admin theo đặc tả.

- [ ] **Step 1: Viết test RED**

Render editor với `gocXoay: 10`, đổi range `Góc xoay của Họa tiết nền` thành `35`, kiểm tra `onDoi` nhận object giữ nguyên các trường cũ và `gocXoay: 35`. Kiểm tra `ChonChiTiet` cập nhật `gocXoay`.

- [ ] **Step 2: Xác nhận RED**

Run: `npm.cmd test -- src/components/__tests__/LopTrangTri.test.tsx`

Expected: FAIL vì chưa có điều khiển.

- [ ] **Step 3: Implement editor**

Tạo UI chọn ảnh từ `DANH_SACH_HOA_TIET`, reset về theme, range ngang/dọc/cỡ/xoay/đậm, color, checkbox lớp và ẩn. Trong `BangSua`, thay hai slider `corner`/`watermark` bằng editor mới; giữ slider các slot còn lại.

- [ ] **Step 4: Xác nhận GREEN và commit**

Run test Task 3 và commit:

```powershell
git add -- src/components/admin/TuyChinhHoaTietTheme.tsx src/components/admin/BangSua.tsx src/components/admin/ChonChiTiet.tsx src/components/__tests__/LopTrangTri.test.tsx
git commit -m "feat: cho phep dieu chinh hoa tiet bia"
```

### Task 4: Xác minh và push

**Files:** Verify only.

- [ ] **Step 1:** Run `npm.cmd test`.
- [ ] **Step 2:** Run `npx.cmd tsc --noEmit`.
- [ ] **Step 3:** Run `npm.cmd run lint`.
- [ ] **Step 4:** Run `npm.cmd run build`.
- [ ] **Step 5:** Kiểm tra `git status --short`, không stage tài sản review hoặc ảnh nguồn untracked.
- [ ] **Step 6:** Push `main` bằng `git push origin main` sau khi mọi kiểm tra đạt.
