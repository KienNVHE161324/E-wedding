# Căn Giữa Thông Tin Mừng Cưới Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Căn đúng tâm QR, ngân hàng và số tài khoản trong popup mà icon sao chép không kéo lệch số.

**Architecture:** Giữ nguyên markup dữ liệu; bổ sung định danh bố cục cho hai dòng thông tin. Dòng số tài khoản co theo nội dung và icon được định vị tuyệt đối bên phải.

**Tech Stack:** React 19, CSS Modules, Vitest, Testing Library.

## Global Constraints

- Không thêm nhãn `Ngân hàng:` hoặc `STK:`.
- Không thay đổi hành vi tải QR hoặc sao chép.
- Chế độ hiển thị trực tiếp giữ nguyên.

---

### Task 1: Căn giữa độc lập với icon

**Files:**
- Modify: `src/components/sections/__tests__/MungCuoi.test.tsx`
- Modify: `src/components/sections/MungCuoi.tsx`
- Modify: `src/components/sections/MungCuoi.module.css`

**Interfaces:**
- Produces: class `dongNganHang`, `hangSoTaiKhoan` và `giaTriSoTaiKhoan`.

- [ ] **Step 1: Viết test RED**

Mở popup Nhà trai; kiểm tra ngân hàng có class `dongNganHang`, số tài khoản có class `giaTriSoTaiKhoan`, và không có text bắt đầu bằng `Ngân hàng:` hoặc `STK:`.

- [ ] **Step 2: Xác nhận RED**

Run: `npm.cmd test -- src/components/sections/__tests__/MungCuoi.test.tsx`

Expected: FAIL vì markup chưa có hai class bố cục mới.

- [ ] **Step 3: Implement tối thiểu**

Thêm class cho ngân hàng và số tài khoản. CSS đặt `text-align: center`; `hangSoTaiKhoan` dùng `width: fit-content; margin-inline: auto; position: relative`; icon dùng `position: absolute; left: calc(100% + .25rem)`.

- [ ] **Step 4: Xác nhận GREEN và commit**

Run test Task 1, sau đó stage đúng ba file và commit `fix: can giua thong tin mung cuoi`.

- [ ] **Step 5: Xác minh và push**

Run `npm.cmd test`, `npx.cmd tsc --noEmit`, `npm.cmd run lint`, `npm.cmd run build`; nếu đều đạt thì push `main`.
