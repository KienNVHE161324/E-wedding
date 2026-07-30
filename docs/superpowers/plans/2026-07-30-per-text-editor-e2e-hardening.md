# Per-text Editor E2E Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chạy ổn định toàn bộ E2E chỉnh chữ trên đúng build hiện tại và bảo đảm preview mobile có thể chạm chọn/kéo text.

**Architecture:** Playwright khởi động production server riêng ở cổng 3100 và không tái sử dụng server có sẵn. Bố cục admin giữ hai cột trên desktop; mobile xếp dọc với panel co được/cuộn riêng và preview có vùng hiển thị độc lập.

**Tech Stack:** Next.js 16.2.12, React 19, Tailwind CSS, Playwright 1.62, Vitest 4.

## Global Constraints

- Invitation mobile-first từ 320px; không được cuộn ngang.
- Panel và preview căn giữa mặc định; thao tác chạm dùng mục tiêu ít nhất 44px khi áp dụng.
- Desktop từ breakpoint `lg` giữ nguyên bố cục hiện tại.
- Không dùng `force: true` để che lỗi pointer interception.
- Không commit `E2E_EMAIL` hoặc `E2E_MAT_KHAU`.

---

### Task 1: Cô lập server và làm locator E2E chính xác

**Files:**
- Modify: `playwright.config.ts:19-32`
- Modify: `e2e/chinh-chu.spec.ts:35-163`

**Interfaces:**
- Consumes: biến môi trường E2E đã được nạp bởi `playwright.config.ts`.
- Produces: Playwright server tại `http://localhost:3100`; locator strict không nhập nhằng.

- [ ] **Step 1: Xác nhận regression RED trên cấu hình cũ**

Run khi một Next server khác đang chiếm cổng 3000:

`npm.cmd run e2e -- e2e/chinh-chu.spec.ts --project=desktop --grep "chỉnh, kéo, lưu" --workers=1`

Expected: FAIL tại đăng nhập vì `/admin` bị server cũ redirect 307 về `/dang-nhap`.

- [ ] **Step 2: Cô lập production server E2E**

Trong `playwright.config.ts`, dùng:

```ts
const E2E_PORT = 3100
const E2E_BASE_URL = `http://localhost:${E2E_PORT}`

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: E2E_BASE_URL },
  webServer: {
    command: `npm run build && npm run start -- --port ${E2E_PORT}`,
    url: E2E_BASE_URL,
    reuseExistingServer: false,
    timeout: 180_000,
  },
})
```

Giữ nguyên hai project desktop/mobile hiện có.

- [ ] **Step 3: Làm locator strict chính xác**

Trong `e2e/chinh-chu.spec.ts`, dùng `exact: true` cho ô text màu chữ, nút `Lưu`, và vòng lặp kiểm tra label:

```ts
page.getByLabel('Màu chữ vùng chữ', { exact: true })
page.getByRole('button', { name: 'Lưu', exact: true })
page.getByLabel(nhan, { exact: true })
```

- [ ] **Step 4: Chạy desktop để xác nhận GREEN**

Run:

`npm.cmd run e2e -- e2e/chinh-chu.spec.ts --project=desktop`

Expected: 4 passed, 1 skipped.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts e2e/chinh-chu.spec.ts
git commit -m "test: isolate per-text editor E2E server"
```

### Task 2: Làm preview mobile có thể chạm và kéo

**Files:**
- Modify: `src/components/admin/BangSua.tsx:130-405`
- Test: `e2e/chinh-chu.spec.ts`

**Interfaces:**
- Consumes: `TextEditorProvider`, `InvitationRenderer`, state `dangChinhChu` và `vungChuDangChon` hiện có.
- Produces: mobile stack gồm panel cuộn riêng và preview có vùng hiển thị/chạm độc lập; desktop không đổi.

- [ ] **Step 1: Xác nhận regression RED trên mobile**

Run:

`npm.cmd run e2e -- e2e/chinh-chu.spec.ts --project=mobile --grep "chỉnh, kéo, lưu" --workers=1`

Expected: FAIL vì phần tử trong panel intercept click dành cho `[data-text-region="bia.co-dau.ten"]`.

- [ ] **Step 2: Sửa layout nhỏ nhất**

Đổi wrapper và hai vùng trong `BangSua.tsx`:

```tsx
<div className="flex min-h-screen flex-col overflow-x-hidden lg:h-screen lg:flex-row">
  <div className="max-h-[55dvh] shrink-0 space-y-6 overflow-y-auto border-b p-5 lg:max-h-none lg:w-[420px] lg:border-b-0 lg:border-r">
    {/* form controls hiện có */}
  </div>
  <div className="min-h-[45dvh] flex-1 overflow-y-auto bg-neutral-100">
    {/* TextEditorProvider + InvitationRenderer hiện có */}
  </div>
</div>
```

Không thay đổi logic form, selection hoặc drag.

- [ ] **Step 3: Chạy mobile để xác nhận GREEN**

Run:

`npm.cmd run e2e -- e2e/chinh-chu.spec.ts --project=mobile`

Expected: 4 passed, 1 skipped; không có pointer interception.

- [ ] **Step 4: Chạy verification toàn bộ**

Run theo thứ tự:

```bash
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run e2e -- e2e/chinh-chu.spec.ts
```

Expected:
- lint exit 0;
- 58 test files / 377 tests pass hoặc nhiều hơn nếu suite tăng;
- production build exit 0;
- E2E 8 passed, 2 skipped.

- [ ] **Step 5: Kiểm tra diff và commit**

```bash
git diff --check
git add src/components/admin/BangSua.tsx
git commit -m "fix: expose text preview on mobile editor"
```
