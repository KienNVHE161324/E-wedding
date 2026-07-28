# Popup Mừng Cưới Theo Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Làm popup Mừng cưới có nền sáng theo theme, lớp thiệp phía sau tối mờ, kèm tải QR và icon sao chép số tài khoản.

**Architecture:** Render dialog trong cây theme thay vì portal để kế thừa biến CSS. `ThongTin` nhận chế độ gọn cho popup, quản lý phản hồi sao chép cục bộ và tạo link tải khi có QR.

**Tech Stack:** React 19, Next.js 16 App Router, TypeScript, CSS Modules, Vitest, Testing Library.

## Global Constraints

- Không đổi schema hoặc dữ liệu thiệp.
- Chế độ hiện QR trực tiếp giữ nguyên.
- Popup đóng bằng nút, nền và Escape; khóa cuộn nền.
- Không báo sao chép thành công khi Clipboard API thất bại.
- Không hiện tải QR nếu thiếu ảnh.

---

### Task 1: Popup kế thừa theme và hành động QR

**Files:**
- Modify: `src/components/sections/__tests__/MungCuoi.test.tsx`
- Modify: `src/components/sections/MungCuoi.tsx`
- Modify: `src/components/sections/MungCuoi.module.css`

**Interfaces:**
- Consumes: `OMungCuoi`, biến CSS trên tổ tiên `InvitationRenderer`.
- Produces: `ThongTin({ o, kieuGon? })`, dialog nằm dưới section, link `Tải QR <Tên bên>`, nút `Sao chép số tài khoản`.

- [ ] **Step 1: Viết test RED**

```tsx
const { container } = ve(true)
await userEvent.click(screen.getByRole('button', { name: 'Mở phong bao Nhà trai' }))
expect(container.querySelector('[data-section="mung-cuoi"]')!.contains(
  screen.getByRole('dialog', { name: 'Mừng cưới Nhà trai' }),
)).toBe(true)
expect(screen.getByRole('link', { name: 'Tải QR Nhà trai' })).toHaveAttribute(
  'href',
  thiepMau.mungCuoi[0].qrAnh!.url,
)
expect(screen.queryByText('Chép số tài khoản')).not.toBeInTheDocument()
```

Mock `navigator.clipboard.writeText`, bấm nút `Sao chép số tài khoản`, kiểm tra đúng số và nhãn đổi thành `Đã sao chép`.

- [ ] **Step 2: Xác nhận RED**

Run: `npm.cmd test -- src/components/sections/__tests__/MungCuoi.test.tsx`

Expected: FAIL vì dialog còn nằm trong portal và chưa có link/icon.

- [ ] **Step 3: Implement tối thiểu**

- Bỏ `createPortal`.
- Render overlay trực tiếp.
- Thêm `kieuGon`, state `daChep`, hàm async chỉ đặt thành công sau khi `writeText` resolve.
- Link tải dùng `download="qr-nha-trai.png"` hoặc `qr-nha-gai.png`.
- CSS overlay dùng `color-mix(in srgb, var(--mau-chu) 58%, transparent)`; popup có fallback `background: var(--mau-nen)` rồi pha sáng nhẹ bằng `color-mix`.

- [ ] **Step 4: Xác nhận GREEN**

Run: `npm.cmd test -- src/components/sections/__tests__/MungCuoi.test.tsx`

Expected: toàn bộ test file PASS.

- [ ] **Step 5: Commit**

```powershell
git add -- src/components/sections/MungCuoi.tsx src/components/sections/MungCuoi.module.css src/components/sections/__tests__/MungCuoi.test.tsx
git commit -m "fix: lam sang popup mung cuoi theo theme"
```
