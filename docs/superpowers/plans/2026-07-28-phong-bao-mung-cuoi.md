# Phong Bao Mừng Cưới Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay hộp quà bằng hai phong bao CSS chuyển động nhẹ và mở thông tin QR đúng bên trong popup truy cập được.

**Architecture:** Giữ `MungCuoi` là Client Component và trạng thái `OMungCuoi | null` xác định popup đang mở. Tách CSS riêng bằng CSS Module cho hình phong bao và chuyển động; tái sử dụng `ThongTin` trong dialog để dữ liệu QR chỉ có một cách hiển thị.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, CSS Modules, Vitest, Testing Library.

## Global Constraints

- Không thay đổi schema hoặc dữ liệu thiệp.
- Chế độ không che QR giữ nguyên.
- Popup đóng bằng nút đóng, vùng nền và Escape; khóa cuộn nền khi mở.
- Tôn trọng `prefers-reduced-motion`.
- Không thêm thư viện hoặc ảnh phong bao.

---

### Task 1: Hành vi phong bao và popup

**Files:**
- Modify: `src/components/sections/__tests__/MungCuoi.test.tsx`
- Modify: `src/components/sections/MungCuoi.tsx`
- Create: `src/components/sections/MungCuoi.module.css`

**Interfaces:**
- Consumes: `OMungCuoi`, `Ben`, `ThongTin`.
- Produces: `PhongBao({ o, onMo })`, `PopupMungCuoi({ o, onDong })` nội bộ component.

- [ ] **Step 1: Viết test thất bại cho dialog đúng bên**

Thay kỳ vọng hiển thị inline sau khi bấm bằng:

```tsx
await userEvent.click(screen.getByRole('button', { name: 'Mở phong bao Nhà trai' }))
const dialog = screen.getByRole('dialog', { name: 'Mừng cưới Nhà trai' })
expect(within(dialog).getByAltText('QR nhà trai')).toBeInTheDocument()
expect(within(dialog).queryByText('9876543210')).not.toBeInTheDocument()
```

Thêm test đóng bằng nút, vùng nền và Escape; mỗi test mở dialog mới rồi xác nhận `queryByRole('dialog')` trả về `null`.

- [ ] **Step 2: Chạy test và xác nhận RED**

Run: `npm.cmd test -- src/components/sections/__tests__/MungCuoi.test.tsx`

Expected: FAIL vì chưa có nút “Mở phong bao” và chưa có dialog.

- [ ] **Step 3: Viết implementation tối thiểu**

Trong `MungCuoi.tsx`:

```tsx
const [dangMo, setDangMo] = useState<OMungCuoi | null>(null)
```

`PhongBao` gọi `onMo(o)`. `PopupMungCuoi` dùng `role="dialog"`, `aria-modal="true"`, xử lý `Escape`, lưu và phục hồi `document.body.style.overflow`, đóng khi nền được bấm nhưng không đóng khi bấm nội dung.

Trong `MungCuoi.module.css`, tạo thân, nắp, mép gấp và con dấu phong bao bằng pseudo-element; dùng `@keyframes` nổi nhẹ, `animation-delay` lệch nhịp và:

```css
@media (prefers-reduced-motion: reduce) {
  .phongBao { animation: none; }
}
```

- [ ] **Step 4: Chạy test và xác nhận GREEN**

Run: `npm.cmd test -- src/components/sections/__tests__/MungCuoi.test.tsx`

Expected: toàn bộ test file PASS.

- [ ] **Step 5: Commit**

```powershell
git add -- src/components/sections/MungCuoi.tsx src/components/sections/MungCuoi.module.css src/components/sections/__tests__/MungCuoi.test.tsx
git commit -m "feat: mo qr tu phong bao mung cuoi"
```

### Task 2: Xác minh và phát hành

**Files:**
- Verify only: toàn bộ repository.

**Interfaces:**
- Consumes: kết quả Task 1.
- Produces: commit đã kiểm tra trên `main` và được push lên `origin`.

- [ ] **Step 1: Chạy toàn bộ test**

Run: `npm.cmd test`

Expected: tất cả test PASS.

- [ ] **Step 2: Kiểm tra kiểu, lint và build**

Run lần lượt:

```powershell
npx.cmd tsc --noEmit
npm.cmd run lint
npm.cmd run build
```

Expected: cả ba lệnh exit code 0.

- [ ] **Step 3: Kiểm tra phạm vi commit**

Run:

```powershell
git status --short
git log -3 --oneline
```

Xác nhận không stage các ảnh review, tài liệu bàn giao hoặc script riêng đang untracked.

- [ ] **Step 4: Push**

Run:

```powershell
git push -u origin main
```

Expected: `main` trên GitHub trỏ tới commit mới nhất.
