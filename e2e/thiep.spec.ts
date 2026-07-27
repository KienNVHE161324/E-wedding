import { test, expect } from '@playwright/test'

// Thiệp cố định phải được tạo sẵn trong Supabase ở trạng thái đã xuất bản,
// hạn còn dài, noi_dung là JSON của thiepMau với slug đổi thành 'e2e-co-dinh'.
const SLUG = 'e2e-co-dinh'

test('mở thiệp và thấy đủ các phần', async ({ page }) => {
  await page.goto(`/${SLUG}`)
  await expect(page.getByText(/Nguyễn Hoài Nam/)).toBeVisible()

  await page.getByRole('button', { name: 'Mở thiệp' }).click()
  await expect(page.getByRole('link', { name: 'Xác nhận tham dự' })).toBeVisible()
  await expect(page.locator('[data-section="su-kien"]')).toBeAttached()
  await expect(page.locator('[data-section="mung-cuoi"]')).toBeAttached()
})

test('trang không bị tràn ngang', async ({ page }) => {
  await page.goto(`/${SLUG}`)
  await page.getByRole('button', { name: 'Mở thiệp' }).click()

  const tran = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  )
  expect(tran).toBe(false)
})

test('gửi xác nhận tham dự thành công', async ({ page }) => {
  await page.goto(`/${SLUG}`)
  await page.getByRole('button', { name: 'Mở thiệp' }).click()
  await page.getByRole('link', { name: 'Xác nhận tham dự' }).click()

  await page.getByLabel('Họ và tên').fill('Khách kiểm thử')
  await page.getByLabel('Bạn là khách của').selectOption('nha-trai')
  await page.getByLabel('Quan hệ với cô dâu/chú rể').fill('Đồng nghiệp')
  await page.getByLabel('Phương tiện di chuyển').selectOption('Xe máy')
  await page.getByLabel('Đến ăn ngày').selectOption('14/11/2026')
  await page.getByRole('button', { name: 'Gửi xác nhận' }).click()

  await expect(page.getByText(/Cảm ơn bạn/)).toBeVisible()
})

test('bỏ trống họ tên thì không gửi được', async ({ page }) => {
  await page.goto(`/${SLUG}`)
  await page.getByRole('button', { name: 'Mở thiệp' }).click()
  await page.getByRole('button', { name: 'Gửi xác nhận' }).click()
  await expect(page.getByText(/Cảm ơn bạn/)).toHaveCount(0)
})
