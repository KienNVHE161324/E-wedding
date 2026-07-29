import { test, expect } from '@playwright/test'
import { dangNhap } from './ho-tro'

test('chưa đăng nhập thì bị chuyển về trang đăng nhập', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/dang-nhap/)
  await expect(page.getByRole('heading', { name: 'Đăng nhập quản trị' })).toBeVisible()
})

test('API quản trị trả về 401 khi chưa đăng nhập', async ({ request }) => {
  const res = await request.post('/api/admin/luu', { data: {} })
  expect(res.status()).toBe(401)
})

test('tạo đám cưới, chọn phần hiển thị, xuất bản rồi khách xem được', async ({ page, browser }) => {
  await dangNhap(page)

  const slug = `e2e-${Date.now()}`
  await page.getByRole('link', { name: 'Tạo đám cưới mới' }).click()
  await page.getByLabel('Tên chú rể').fill('Nguyễn Kiểm Thử')
  await page.getByLabel('Tên cô dâu').fill('Trần Kiểm Thử')
  await page.getByLabel('Ngày cưới').fill('2026-12-20')
  await page.getByLabel('Đường dẫn thiệp').fill(slug)
  await page.getByLabel('Giao diện').selectOption('mac-dinh')
  await page.getByRole('button', { name: 'Chọn kiểu QR' }).click()
  await page.getByRole('radio', { name: 'Phong bao' }).check()
  await page.getByRole('button', { name: 'Dùng kiểu này' }).click()
  await expect(page.getByText('Phong bao', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Tạo và bắt đầu sửa' }).click()

  await expect(page).toHaveURL(new RegExp(`/admin/${slug}$`))

  // Khách vào lúc này phải thấy trang chưa mở.
  const khach = await browser.newContext()
  const trangKhach = await khach.newPage()
  await trangKhach.goto(`/${slug}`)
  await expect(trangKhach.getByText('Thiệp chưa được mở')).toBeVisible()

  // Tắt phần Sổ lưu bút rồi lưu.
  await page.getByRole('checkbox', { name: 'Hiện phần Sổ lưu bút' }).uncheck()
  await page.getByRole('button', { name: 'Lưu' }).click()
  await expect(page.getByText('Đã lưu')).toBeVisible()

  await page.getByRole('button', { name: 'Mở thiệp cho khách xem' }).click()
  await expect(page.getByText(/Đang mở, còn 14 ngày/)).toBeVisible()

  await trangKhach.goto(`/${slug}`)
  await expect(trangKhach.getByRole('heading', { name: /Nguyễn Kiểm Thử/ }).first()).toBeVisible()
  await expect(trangKhach.locator('[data-section="so-luu-but"]')).toHaveCount(0)
  await expect(trangKhach.locator('[data-section="su-kien"]')).toHaveCount(0)

  await khach.close()
})
