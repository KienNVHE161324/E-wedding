# Phone Frame and Unified Decorations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Giữ thiệp trong khung điện thoại dọc và biến D1.1/D1.2/D1.5 thành chi tiết trang trí dùng được ở mọi section thay vì mẫu thay thế bìa.

**Architecture:** `DANH_SACH_HOA_TIET` là nguồn dữ liệu duy nhất cho mọi chi tiết kéo/thả; `ChonChiTiet` ghi lựa chọn vào `Invitation.chiTietTrangTri`, còn `LopTrangTri` dựng chúng mà không can thiệp component nội dung. `InvitationRenderer` áp một chiều rộng điện thoại duy nhất cho cả trang khách và preview quản trị.

**Tech Stack:** Next.js 16.2.12, React 19.2.4, TypeScript, Tailwind CSS 4, Zod 4, Vitest, Testing Library.

## Global Constraints

- Đọc hướng dẫn liên quan trong `node_modules/next/dist/docs/` trước khi sửa code Next.js.
- Mọi chi tiết trong `DANH_SACH_HOA_TIET` phải dùng được ở mọi `SectionId`.
- Chi tiết trang trí không được thay thế nội dung hoặc bố cục chính.
- Không thêm cuộn ngang hoặc điều hướng dạng slide.
- Không ghi đè các thay đổi chưa commit không thuộc tính năng này.

---

### Task 1: Loại bỏ chế độ mẫu bìa thay thế nội dung

**Files:**
- Delete: `src/components/admin/ChonMauBia.tsx`
- Delete: `src/components/admin/__tests__/ChonMauBia.test.tsx`
- Modify: `src/components/sections/__tests__/BiaMau.test.tsx`
- Delete: `src/lib/invitation/mauBia.ts`
- Modify: `src/components/admin/BangSua.tsx`
- Modify: `src/components/sections/Bia.tsx`
- Modify: `src/lib/invitation/types.ts`
- Modify: `src/lib/invitation/schema.ts`
- Modify: `src/lib/invitation/__tests__/schema.test.ts`
- Test: `src/components/sections/__tests__/BiaMau.test.tsx`

**Interfaces:**
- Consumes: `Invitation.chiTietTrangTri?: ChiTietTrangTri[]`.
- Produces: `Bia({ thiep, theme, onMoThiep })` luôn dựng nội dung bìa chuẩn; `Invitation` và `invitationSchema` không còn trường `bia`.

- [ ] **Step 1: Viết kiểm thử thất bại cho bìa chuẩn khi có D1**

Thay nội dung kiểm thử bìa mẫu bằng kiểm thử đảm bảo D1 chỉ là dữ liệu trang trí và không đổi nội dung chính:

```tsx
it('bỏ qua dữ liệu mẫu bìa cũ và vẫn dựng nội dung chính', () => {
  const thiepVoiDuLieuBiaCu = {
    ...thiepMau,
    bia: {
      mauId: 'd1-2-giay-do',
      noiDung: 'Nội dung thay thế không được hiển thị',
      font: 'sans-sach',
      coChu: 28,
      mauChu: '#123456',
      canLe: 'left',
    },
  } as typeof thiepMau

  render(
    <Bia
      thiep={thiepVoiDuLieuBiaCu}
      theme={theme}
      onMoThiep={() => undefined}
    />,
  )

  expect(screen.getByText(thiepMau.chuRe.ten)).toBeInTheDocument()
  expect(screen.getByText(thiepMau.coDau.ten)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Mở thiệp' })).toBeInTheDocument()
  expect(screen.queryByText('Nội dung thay thế không được hiển thị')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Chạy kiểm thử bìa để xác nhận nó thất bại**

Run: `npm.cmd test -- src/components/sections/__tests__/BiaMau.test.tsx`

Expected: FAIL vì nhánh `thiep.bia` và kiểu/cấu hình mẫu bìa chuyên biệt vẫn tồn tại.

- [ ] **Step 3: Gỡ đường đi chuyên biệt của mẫu bìa**

Trong `BangSua.tsx`, xóa import và section dựng `ChonMauBia`. Trong `Bia.tsx`, xóa `BiaDungMau`, import `next/image`, và import từ `mauBia`; giữ nguyên component bìa chuẩn.

Trong `types.ts`, xóa các kiểu chỉ phục vụ mẫu bìa (`MauBiaId`, `FontChuBia`, `CanLeChuBia`, `CauHinhBia`) và xóa:

```ts
bia?: CauHinhBia
```

Trong `schema.ts`, xóa import các hằng từ `mauBia` và xóa trường:

```ts
bia: z.object({ /* cấu hình mẫu bìa */ }).optional(),
```

Xóa các assertion/fixture `bia` khỏi `schema.test.ts`, rồi xóa bốn file chuyên biệt được liệt kê ở phần Files.

- [ ] **Step 4: Chạy kiểm thử liên quan**

Run: `npm.cmd test -- src/components/sections/__tests__/BiaMau.test.tsx src/lib/invitation/__tests__/schema.test.ts`

Expected: PASS; bìa chuẩn còn tên hai người và nút mở thiệp, schema không nhận biết cấu hình `bia`.

- [ ] **Step 5: Commit riêng thay đổi**

```powershell
git add -- src/components/admin/BangSua.tsx src/components/sections/Bia.tsx src/lib/invitation/types.ts src/lib/invitation/schema.ts src/lib/invitation/__tests__/schema.test.ts src/components/sections/__tests__/BiaMau.test.tsx
git add -u -- src/components/admin/ChonMauBia.tsx src/components/admin/__tests__/ChonMauBia.test.tsx src/lib/invitation/mauBia.ts
git commit -m "refactor: dung chi tiet trang tri thay mau bia"
```

### Task 2: Chứng minh mọi chi tiết dùng được ở mọi section

**Files:**
- Create: `src/components/admin/__tests__/ChonChiTiet.test.tsx`
- Modify: `src/lib/motifs/danhSach.ts` only if any D1 entry or label/group is missing.
- Test: `src/components/admin/__tests__/ChonChiTiet.test.tsx`
- Test: `src/components/__tests__/LopTrangTri.test.tsx`

**Interfaces:**
- Consumes: `ChonChiTiet({ giaTri: ChiTietTrangTri[], section: SectionId, onDoi })`.
- Produces: khi chọn bất kỳ `MucHoaTiet`, callback nhận một phần tử mới có chính xác `id` đã chọn và `section` đang chỉnh.

- [ ] **Step 1: Viết kiểm thử thất bại cho việc thêm D1 vào section không phải bìa**

```tsx
it('thêm chi tiết D1 vào section đang chọn mà không giới hạn ở bìa', async () => {
  const onDoi = vi.fn()
  render(<ChonChiTiet giaTri={[]} section="album" onDoi={onDoi} />)

  await userEvent.click(screen.getByRole('button', { name: 'Thêm chi tiết' }))
  await userEvent.selectOptions(screen.getByLabelText('Nhóm chi tiết'), 'Nghi lễ cưới')
  await userEvent.click(screen.getByRole('button', { name: /thêm.*D1\.2/i }))

  expect(onDoi).toHaveBeenCalledWith([
    expect.objectContaining({
      id: 'primary-decor/wedding-ritual/thiep-phong-bi-giay-do-trien-doi-chim-01',
      section: 'album',
    }),
  ])
})
```

- [ ] **Step 2: Chạy kiểm thử để xác nhận trạng thái ban đầu**

Run: `npm.cmd test -- src/components/admin/__tests__/ChonChiTiet.test.tsx`

Expected: FAIL nếu nhãn nhóm/ảnh D1 chưa đủ để người dùng chọn qua thư viện chung; nếu PASS ngay, kiểm thử chứng minh cơ chế hiện có đã đáp ứng yêu cầu và không cần thêm nhánh riêng.

- [ ] **Step 3: Hoàn thiện metadata D1 trong thư viện chung nếu cần**

Đảm bảo ba entry có ID/tệp hiện có, cùng nhóm `Nghi lễ cưới`, và nhãn nhận diện:

```ts
{
  id: 'primary-decor/wedding-ritual/thiep-phong-bi-giay-do-trien-doi-chim-01',
  tep: 'primary-decor/wedding-ritual/thiep-phong-bi-giay-do-trien-doi-chim-01.png',
  nhan: 'D1.2 – Thiệp phong bì giấy dó',
  nhom: 'Nghi lễ cưới',
}
```

Không thêm điều kiện theo `SectionId` vào `ChonChiTiet`; prop `section` tiếp tục được chép thẳng vào phần tử mới.

- [ ] **Step 4: Chạy kiểm thử thư viện và lớp dựng**

Run: `npm.cmd test -- src/components/admin/__tests__/ChonChiTiet.test.tsx src/components/__tests__/LopTrangTri.test.tsx`

Expected: PASS; D1 thêm được vào `album`, còn `LopTrangTri` vẫn dựng đúng lớp trước/sau chữ.

- [ ] **Step 5: Commit riêng thay đổi**

```powershell
git add -- src/components/admin/__tests__/ChonChiTiet.test.tsx src/lib/motifs/danhSach.ts
git commit -m "test: bao dam chi tiet dung duoc o moi phan"
```

### Task 3: Cố định khung thiệp theo chiều rộng điện thoại

**Files:**
- Modify: `src/components/InvitationRenderer.tsx`
- Modify: `src/components/__tests__/InvitationRenderer.test.tsx`

**Interfaces:**
- Consumes: cùng props hiện có của `InvitationRenderer`.
- Produces: một `main` có `w-full max-w-[520px]` trên mọi breakpoint, không có `md:max-w-[720px]`.

- [ ] **Step 1: Viết kiểm thử thất bại cho khung điện thoại**

```tsx
it('giữ chiều rộng khung điện thoại trên mọi kích thước màn hình', () => {
  const { container } = render(<InvitationRenderer thiep={thiepMau} theme={theme} />)
  const main = container.querySelector('main')

  expect(main).toHaveClass('w-full', 'max-w-[520px]')
  expect(main).not.toHaveClass('md:max-w-[720px]')
})
```

- [ ] **Step 2: Chạy kiểm thử để xác nhận nó thất bại**

Run: `npm.cmd test -- src/components/__tests__/InvitationRenderer.test.tsx`

Expected: FAIL vì `main` hiện còn class `md:max-w-[720px]`.

- [ ] **Step 3: Giới hạn chiều rộng duy nhất**

Đổi class của `main` trong `InvitationRenderer.tsx` thành:

```tsx
<main className="mx-auto w-full max-w-[520px]">
```

Không thêm `overflow-x`, `scroll-snap-x` hoặc chiều cao viewport cố định.

- [ ] **Step 4: Chạy kiểm thử renderer**

Run: `npm.cmd test -- src/components/__tests__/InvitationRenderer.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit riêng thay đổi**

```powershell
git add -- src/components/InvitationRenderer.tsx src/components/__tests__/InvitationRenderer.test.tsx
git commit -m "feat: giu thiep trong khung dien thoai"
```

### Task 4: Xác minh tích hợp

**Files:**
- Verify only: all files changed in Tasks 1–3.

**Interfaces:**
- Consumes: model thiệp không có `bia`, thư viện trang trí thống nhất, renderer rộng tối đa `520px`.
- Produces: build kiểm tra kiểu và toàn bộ test suite đều thành công.

- [ ] **Step 1: Kiểm tra không còn tham chiếu mẫu bìa**

Run: `rg -n "ChonMauBia|CauHinhBia|mauBia|thiep\\.bia|md:max-w-\\[720px\\]" src`

Expected: không có kết quả.

- [ ] **Step 2: Chạy toàn bộ test suite**

Run: `npm.cmd test`

Expected: PASS.

- [ ] **Step 3: Chạy lint**

Run: `npm.cmd run lint`

Expected: PASS.

- [ ] **Step 4: Chạy production build**

Run: `npm.cmd run build`

Expected: PASS; Next.js và TypeScript không báo lỗi.

- [ ] **Step 5: Kiểm tra diff**

Run: `git diff --check`

Expected: không có lỗi whitespace.
