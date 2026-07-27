# Hoàn thiện mẫu thiệp hiện tại Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sửa lớp trang trí bìa, chuyển lịch trình sang mục lục một trục và đổi sổ lưu bút thành lịch sử cuộn với popup gửi lời chúc.

**Architecture:** Giữ nguyên dữ liệu và API hiện có. Các component section chịu trách nhiệm bố cục; popup lời chúc được tách thành component client riêng; registry `Image_collections` tiếp tục cấp asset cho `LopTrangTri` và trình chỉnh admin.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Vitest, Testing Library.

## Global Constraints

- Đọc tài liệu Next.js liên quan trong `node_modules/next/dist/docs/` trước khi sửa code.
- Không sao chép asset trực tiếp vào component; dùng registry sinh bởi `npm run hoa-tiet`.
- Màu sắc lấy từ biến theme `--mau-chinh`, `--mau-phu`, `--mau-nen`, `--mau-chu`.
- Giữ nguyên API `/api/loi-chuc` và trang quản trị lời chúc.
- Ưu tiên mobile và tôn trọng `prefers-reduced-motion`.
- Không sửa hoặc xóa các thay đổi workspace không thuộc các file được liệt kê trong từng task.

---

### Task 1: Bảo vệ nội dung bìa khỏi họa tiết

**Files:**
- Modify: `src/components/sections/Bia.tsx`
- Modify: `src/components/admin/ChonChiTiet.tsx`
- Modify: `src/components/__tests__/LopTrangTri.test.tsx`
- Test: `src/components/__tests__/InvitationRenderer.moThiep.test.tsx`

**Interfaces:**
- Consumes: `ChiTietTrangTri.raSauChu?: boolean`, `HoaTietTheme`, `LopTrangTri`.
- Produces: chi tiết mới mặc định có `raSauChu: true`; nội dung và nút bìa có lớp hiển thị cao hơn họa tiết theme.

- [ ] **Step 1: Viết test thất bại cho mặc định lớp trang trí**

Thêm test vào `src/components/__tests__/LopTrangTri.test.tsx` để render `ChonChiTiet`, chọn một asset và xác nhận callback nhận chi tiết có `raSauChu: true`.

```tsx
it('chi tiết mới mặc định nằm sau chữ', async () => {
  const onDoi = vi.fn()
  render(<ChonChiTiet giaTri={[]} section="bia" onDoi={onDoi} />)
  await userEvent.click(screen.getByRole('button', { name: 'Thêm chi tiết' }))
  await userEvent.click(screen.getAllByRole('button', { name: /^Thêm / })[0])
  expect(onDoi).toHaveBeenCalledWith([
    expect.objectContaining({ section: 'bia', raSauChu: true }),
  ])
})
```

- [ ] **Step 2: Chạy test và xác nhận RED**

Run:

```powershell
npm.cmd test -- --run src/components/__tests__/LopTrangTri.test.tsx
```

Expected: FAIL vì chi tiết mới chưa có `raSauChu: true`.

- [ ] **Step 3: Đặt chi tiết mới ra sau chữ**

Trong `src/components/admin/ChonChiTiet.tsx`, bổ sung giá trị mặc định:

```ts
const MOI: Omit<ChiTietTrangTri, 'id' | 'section'> = {
  x: 50,
  y: 8,
  mau: '#8B2F20',
  doDam: 1,
  kichThuoc: 25,
  raSauChu: true,
}
```

Trong `Bia.tsx`, bọc nội dung chữ và nút trong một container `relative z-10`; đặt `HoaTietTheme` watermark ở `z-0` và không thay đổi nguồn asset.

- [ ] **Step 4: Chạy test và xác nhận GREEN**

Run:

```powershell
npm.cmd test -- --run src/components/__tests__/LopTrangTri.test.tsx src/components/__tests__/InvitationRenderer.moThiep.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit task**

```powershell
git add src/components/sections/Bia.tsx src/components/admin/ChonChiTiet.tsx src/components/__tests__/LopTrangTri.test.tsx src/components/__tests__/InvitationRenderer.moThiep.test.tsx
git commit -m "fix: giu hoa tiet bia sau noi dung"
```

### Task 2: Lịch trình mục lục một trục

**Files:**
- Modify: `src/components/sections/SuKien.tsx`
- Modify: `src/components/sections/__tests__/SuKien.test.tsx`

**Interfaces:**
- Consumes: `sapXepLichTrinh(thiep.suKien)`, `lienKetThemVaoLich(sk)`, `SuKien`.
- Produces: markup có `data-testid="timeline-truc"`, một node `data-testid="timeline-node"` cho mỗi sự kiện và không còn SVG nối cong.

- [ ] **Step 1: Viết test thất bại cho timeline một trục**

Thêm các assertion:

```tsx
it('hiện lịch trình dạng mục lục một trục có node', () => {
  const { container } = ve(thiepMau.suKien)
  expect(screen.getByTestId('timeline-truc')).toBeInTheDocument()
  expect(screen.getAllByTestId('timeline-node')).toHaveLength(thiepMau.suKien.length)
  expect(container.querySelector('svg')).toBeNull()
})
```

- [ ] **Step 2: Chạy test và xác nhận RED**

Run:

```powershell
npm.cmd test -- --run src/components/sections/__tests__/SuKien.test.tsx
```

Expected: FAIL vì chưa có `timeline-truc` và vẫn còn SVG.

- [ ] **Step 3: Thay SVG dây leo bằng trục và node**

Trong `SuKien.tsx`:

- Nhóm sự kiện theo ngày sau khi sắp xếp.
- Render nhãn ngày một lần cho mỗi nhóm.
- Mỗi nhóm có `<ol data-testid="timeline-truc">`.
- Trục dùng border trái của container.
- Mỗi `<li>` có node tròn tuyệt đối `data-testid="timeline-node"`.
- Nội dung bên phải gồm giờ, tên, địa điểm, link thêm lịch và ảnh bản đồ.
- Không render SVG.

Khung chính:

```tsx
<ol data-testid="timeline-truc" className="relative ml-3 border-l">
  {suKienTrongNgay.map((sk, i) => (
    <li key={`${sk.ngay}-${sk.gio}-${i}`} className="relative pb-8 pl-8 last:pb-0">
      <span
        data-testid="timeline-node"
        aria-hidden="true"
        className="absolute -left-2 top-1 h-4 w-4 rounded-full border-4"
      />
      {/* giờ, tên, địa điểm, lịch, bản đồ */}
    </li>
  ))}
</ol>
```

- [ ] **Step 4: Chạy test và xác nhận GREEN**

Run:

```powershell
npm.cmd test -- --run src/components/sections/__tests__/SuKien.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit task**

```powershell
git add src/components/sections/SuKien.tsx src/components/sections/__tests__/SuKien.test.tsx
git commit -m "feat: doi lich trinh sang timeline mot truc"
```

### Task 3: Popup gửi lời chúc và lịch sử cuộn

**Files:**
- Create: `src/components/PopupLoiChuc.tsx`
- Modify: `src/components/sections/SoLuuBut.tsx`
- Modify: `src/components/sections/__tests__/SoLuuBut.test.tsx`

**Interfaces:**
- Consumes: `Invitation`, callback `onDaGui(loiChuc: LoiChucDayDu)`, API `/api/loi-chuc`.
- Produces:

```ts
interface PopupLoiChucProps {
  thiep: Invitation
  onDong(): void
  onDaGui(loiChuc: LoiChucDayDu): void
}
```

- [ ] **Step 1: Viết test thất bại cho trạng thái mặc định**

Thay test “có ô viết riêng” bằng:

```tsx
it('mặc định chỉ hiện lịch sử và nút mở popup', () => {
  ve([lc('1', 'Nguyễn A', 'Chúc mừng hạnh phúc')])
  expect(screen.queryByLabelText('Tên của bạn')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Gửi lời chúc' })).toBeInTheDocument()
  expect(screen.getByTestId('lich-su-loi-chuc')).toHaveClass('overflow-y-auto')
})
```

- [ ] **Step 2: Chạy test và xác nhận RED**

Run:

```powershell
npm.cmd test -- --run src/components/sections/__tests__/SoLuuBut.test.tsx
```

Expected: FAIL vì form đang hiện trực tiếp.

- [ ] **Step 3: Viết test popup mở và đóng**

```tsx
it('mở popup khi bấm gửi và đóng bằng nút hoặc Escape', async () => {
  ve()
  await userEvent.click(screen.getByRole('button', { name: 'Gửi lời chúc' }))
  expect(screen.getByRole('dialog', { name: 'Gửi lời chúc' })).toBeInTheDocument()
  expect(screen.getByLabelText('Tên của bạn')).toBeInTheDocument()
  await userEvent.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
```

Run lại test và xác nhận vẫn FAIL đúng vì popup chưa tồn tại.

- [ ] **Step 4: Tạo `PopupLoiChuc`**

Component:

- Dùng `useEffect` nghe Escape và khóa cuộn `document.body`.
- Overlay đóng khi click; panel dừng propagation.
- Form giữ logic POST hiện tại.
- Gửi thành công gọi `onDaGui(data.loiChuc)`, hiển thị xác nhận ngắn và gọi `onDong`.
- Lỗi giữ popup mở và render `role="alert"`.

- [ ] **Step 5: Refactor `SoLuuBut` thành lịch sử cuộn**

- Giữ `danhSach` trong state.
- Thêm `moPopup`.
- Render danh sách trong container:

```tsx
<div
  data-testid="lich-su-loi-chuc"
  className="scroll-loi-chuc mx-auto mt-8 max-h-80 max-w-md overflow-y-auto pr-2"
>
```

- Nút dưới danh sách mở popup.
- `onDaGui` thêm lời chúc mới lên đầu.
- Thêm class `.scroll-loi-chuc` vào `globals.css` nếu cần tạo thumb/track theo màu theme; nếu sửa CSS, bổ sung file này vào commit.

- [ ] **Step 6: Chạy test và xác nhận GREEN**

Run:

```powershell
npm.cmd test -- --run src/components/sections/__tests__/SoLuuBut.test.tsx
```

Expected: tất cả test sổ lưu bút PASS.

- [ ] **Step 7: Commit task**

```powershell
git add src/components/PopupLoiChuc.tsx src/components/sections/SoLuuBut.tsx src/components/sections/__tests__/SoLuuBut.test.tsx src/app/globals.css
git commit -m "feat: gui loi chuc trong popup"
```

### Task 4: Kiểm tra hồi quy, build và push

**Files:**
- Modify only if verification finds a defect in files from Tasks 1–3.

**Interfaces:**
- Consumes: toàn bộ thay đổi của Tasks 1–3.
- Produces: nhánh đã kiểm tra và push lên `origin/nen-tang-v1`.

- [ ] **Step 1: Đồng bộ registry asset**

Run:

```powershell
npm.cmd run hoa-tiet
git diff --check
```

Expected: registry hợp lệ; thay đổi sinh tự động chỉ phản ánh asset mới trong `Image_collections`.

- [ ] **Step 2: Chạy toàn bộ test**

```powershell
npm.cmd test
```

Expected: 0 test failures.

- [ ] **Step 3: Kiểm tra TypeScript, lint và build**

```powershell
.\node_modules\.bin\tsc.cmd --noEmit
npm.cmd run lint
npm.cmd run build
```

Expected: cả ba lệnh exit 0, không có error.

- [ ] **Step 4: Kiểm tra Git**

```powershell
git diff --check
git status --short --branch
git log --oneline --decorate -5
```

Xác nhận không ghi đè file người dùng ngoài phạm vi. Nếu `npm run hoa-tiet` tạo thay đổi registry từ asset người dùng mới, đưa thay đổi đó vào commit riêng cùng asset liên quan.

- [ ] **Step 5: Commit phần còn lại và push**

```powershell
git add src/lib/motifs/danhSach.ts public/hoa-tiet
git commit -m "chore: dong bo kho hoa tiet"
git push origin nen-tang-v1
```
