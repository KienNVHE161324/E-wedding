import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { dangNhap } from './ho-tro'

async function taoThiepKiemThu(page: Page, testInfo: TestInfo) {
  const slug = `e2e-chinh-chu-${testInfo.project.name}-${Date.now()}`

  await dangNhap(page)
  await page.getByRole('link', { name: 'Tạo đám cưới mới' }).click()
  await page.getByLabel('Tên chú rể').fill('Chú rể E2E')
  await page.getByLabel('Tên cô dâu').fill('Cô dâu E2E')
  await page.getByLabel('Ngày cưới').fill('2026-12-20')
  await page.getByLabel('Đường dẫn thiệp').fill(slug)
  await page.getByLabel('Giao diện').selectOption('mac-dinh')
  await page.getByRole('button', { name: 'Tạo và bắt đầu sửa' }).click()
  await expect(page).toHaveURL(/\/admin\/thiep\/[^/]+$/)
}

async function batChinhChuVaChonCoDau(page: Page) {
  await page.getByLabel('Chỉnh chữ').check()
  await page.locator('[data-text-region="bia.co-dau.ten"]').click()
  await expect(page.getByLabel('Nội dung vùng chữ')).toBeVisible()
}

async function themHaiSuKien(page: Page) {
  await page.getByRole('button', { name: 'Thêm mốc lịch trình' }).click()
  await page.getByLabel('Thời điểm mốc 1').fill('2026-12-20T10:00')
  await page.getByLabel('Tên mốc 1').fill('Lễ rước dâu')
  await page.getByRole('button', { name: 'Thêm mốc lịch trình' }).click()
  await page.getByLabel('Thời điểm mốc 2').fill('2026-12-20T11:00')
  await page.getByLabel('Tên mốc 2').fill('Lễ thành hôn')
  await page.getByRole('button', { name: 'Mở thiệp' }).click()
  await expect(page.locator('[data-section="su-kien"]')).toBeVisible()
}

test('chỉnh, kéo, lưu và tải lại từng vùng chữ', async ({ page }, testInfo) => {
  await taoThiepKiemThu(page, testInfo)
  await batChinhChuVaChonCoDau(page)

  await page.getByLabel('Nội dung vùng chữ').fill('Thu Hà')
  await page.getByLabel('Phông chữ vùng chữ').selectOption('viet-tay')
  await page.getByLabel('Cỡ chữ vùng chữ').fill('42')
  await page.getByLabel('Màu chữ vùng chữ', { exact: true }).fill('#123456')
  await page.getByLabel('Tọa độ X vùng chữ').fill('8.5')
  await page.getByRole('button', { name: 'Lưu', exact: true }).click()
  await expect(page.getByText('Đã lưu')).toBeVisible()

  await page.reload()
  const coDau = page.locator('[data-text-region="bia.co-dau.ten"]')
  await expect(coDau).toHaveText('Thu Hà')
  await expect(coDau).toHaveCSS('color', 'rgb(18, 52, 86)')
})

test('kéo vùng chữ bằng chuột sẽ cập nhật tọa độ', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Chuột được kiểm tra ở dự án desktop.')
  await taoThiepKiemThu(page, testInfo)
  await batChinhChuVaChonCoDau(page)

  const coDau = page.locator('[data-text-region="bia.co-dau.ten"]')
  const box = await coDau.boundingBox()
  expect(box).not.toBeNull()
  if (!box) throw new Error('Không lấy được vị trí vùng chữ cô dâu.')

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 36, box.y + box.height / 2 + 20, {
    steps: 4,
  })
  await page.mouse.up()

  await expect(page.getByLabel('Tọa độ X vùng chữ')).not.toHaveValue('')
})

test('chạm và kéo vùng chữ trên mobile sẽ cập nhật tọa độ', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Sự kiện pointer cảm ứng chỉ áp dụng cho mobile.')
  await taoThiepKiemThu(page, testInfo)
  await batChinhChuVaChonCoDau(page)

  const coDau = page.locator('[data-text-region="bia.co-dau.ten"]')
  const box = await coDau.boundingBox()
  expect(box).not.toBeNull()
  if (!box) throw new Error('Không lấy được vị trí vùng chữ cô dâu.')

  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await coDau.dispatchEvent('pointerdown', {
    pointerId: 21,
    pointerType: 'touch',
    isPrimary: true,
    button: 0,
    clientX: x,
    clientY: y,
  })
  await page.evaluate(
    ({ startX, startY }) => {
      window.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          cancelable: true,
          pointerId: 21,
          pointerType: 'touch',
          isPrimary: true,
          clientX: startX + 36,
          clientY: startY + 20,
        }),
      )
      window.dispatchEvent(
        new PointerEvent('pointerup', {
          bubbles: true,
          cancelable: true,
          pointerId: 21,
          pointerType: 'touch',
          isPrimary: true,
          clientX: startX + 36,
          clientY: startY + 20,
        }),
      )
    },
    { startX: x, startY: y },
  )

  await expect(page.getByLabel('Tọa độ X vùng chữ')).not.toHaveValue('')
})

test('đổi thứ tự sự kiện vẫn giữ vùng chữ theo ID ổn định', async ({ page }, testInfo) => {
  await taoThiepKiemThu(page, testInfo)
  await themHaiSuKien(page)
  await page.getByLabel('Chỉnh chữ').check()

  const regionA = page.locator('[data-text-region$=".ten"]').filter({ hasText: 'Lễ rước dâu' })
  const idA = await regionA.getAttribute('data-text-region')
  expect(idA).toMatch(/^su-kien\.[^.]+\.ten$/)
  if (!idA) throw new Error('Không lấy được ID vùng chữ của sự kiện.')

  await regionA.click()
  await page.getByLabel('Màu chữ vùng chữ', { exact: true }).fill('#123456')
  await page.getByLabel('Thời điểm mốc 1').fill('2026-12-20T12:00')

  await expect(page.locator(`[data-text-region="${idA}"]`)).toHaveCSS(
    'color',
    'rgb(18, 52, 86)',
  )
  await expect(page.locator('[data-section="su-kien"] h3')).toHaveText([
    'Lễ thành hôn',
    'Lễ rước dâu',
  ])
})

test('nhãn của biểu mẫu chỉnh chữ không phải vùng có thể chọn', async ({ page }, testInfo) => {
  await taoThiepKiemThu(page, testInfo)
  await batChinhChuVaChonCoDau(page)

  for (const nhan of [
    'Nội dung vùng chữ',
    'Phông chữ vùng chữ',
    'Cỡ chữ vùng chữ',
    'Màu chữ vùng chữ',
    'Tọa độ X vùng chữ',
  ]) {
    const control = page.getByLabel(nhan, { exact: true })
    await expect(control).not.toHaveAttribute('data-text-region')
    expect(await control.evaluate((element) => element.closest('[data-text-region]'))).toBeNull()
  }
})
