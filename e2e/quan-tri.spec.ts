import { test, expect, type Page } from '@playwright/test'

const EMAIL = process.env.E2E_EMAIL!
const MAT_KHAU = process.env.E2E_MAT_KHAU!

async function dangNhap(page: Page) {
  await page.goto('/dang-nhap')
  await page.getByLabel('Email').fill(EMAIL)
  await page.getByLabel('Mật khẩu').fill(MAT_KHAU)
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
  await expect(page.getByRole('heading', { name: 'Các đám cưới' })).toBeVisible()
}

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

  await page.getByRole('button', { name: 'Xuất bản thiệp' }).click()
  await expect(page.getByText(/Đang mở, còn 14 ngày/)).toBeVisible()

  await trangKhach.goto(`/${slug}`)
  await expect(trangKhach.getByText(/Nguyễn Kiểm Thử/)).toBeVisible()
  await expect(trangKhach.locator('[data-section="so-luu-but"]')).toHaveCount(0)
  await expect(trangKhach.locator('[data-section="su-kien"]')).toHaveCount(0)

  await khach.close()
})
