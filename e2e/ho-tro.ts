import { expect, type Page } from '@playwright/test'

const EMAIL = process.env.E2E_EMAIL!
const MAT_KHAU = process.env.E2E_MAT_KHAU!

export async function dangNhap(page: Page) {
  await page.goto('/dang-nhap')
  await page.getByLabel('Email').fill(EMAIL)
  await page.getByLabel('Mật khẩu').fill(MAT_KHAU)
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
  await expect(page.getByRole('heading', { name: 'Các đám cưới' })).toBeVisible()
}
