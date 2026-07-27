import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm, readFile, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { taoKhoODia } from '../oDia'

let goc: string

beforeEach(async () => {
  goc = await mkdtemp(path.join(tmpdir(), 'e-wedding-'))
})

afterEach(async () => {
  await rm(goc, { recursive: true, force: true })
})

const tepMau = () => new File([new Uint8Array([1, 2, 3])], 'anh.jpg', { type: 'image/jpeg' })

describe('kho ổ đĩa', () => {
  it('ghi tệp xuống đúng chỗ và trả về đường dẫn phục vụ được', async () => {
    const kho = taoKhoODia(goc)
    const url = await kho.luu('nam-linh/abc.jpg', tepMau())

    expect(url).toBe('/tai-len/nam-linh/abc.jpg')
    expect(await readFile(path.join(goc, 'nam-linh/abc.jpg'))).toEqual(
      Buffer.from([1, 2, 3]),
    )
  })

  it('tự tạo thư mục con theo slug', async () => {
    const kho = taoKhoODia(goc)
    await kho.luu('dam-cuoi-moi/x.png', tepMau())
    expect(await readFile(path.join(goc, 'dam-cuoi-moi/x.png'))).toBeDefined()
  })

  it('từ chối đường dẫn thoát ra ngoài thư mục cho phép', async () => {
    const kho = taoKhoODia(goc)
    await expect(kho.luu('../../thoat.jpg', tepMau())).rejects.toThrow(
      'Đường dẫn tệp không hợp lệ',
    )
  })

  it('xóa được tệp đã lưu', async () => {
    const kho = taoKhoODia(goc)
    await kho.luu('nam-linh/abc.jpg', tepMau())
    await kho.xoa('nam-linh/abc.jpg')
    await expect(readFile(path.join(goc, 'nam-linh/abc.jpg'))).rejects.toThrow()
  })

  it('xóa tệp không tồn tại thì im lặng, không ném lỗi', async () => {
    const kho = taoKhoODia(goc)
    await expect(kho.xoa('khong-co/gi.jpg')).resolves.toBeUndefined()
  })

  it('không đụng tới tệp nằm ngoài thư mục khi bị yêu cầu xóa bậy', async () => {
    const ngoai = path.join(goc, '..', `ngoai-${path.basename(goc)}.txt`)
    await mkdir(path.dirname(ngoai), { recursive: true })
    await writeFile(ngoai, 'giữ nguyên')

    const kho = taoKhoODia(goc)
    await expect(kho.xoa(`../${path.basename(ngoai)}`)).rejects.toThrow()
    expect(await readFile(ngoai, 'utf8')).toBe('giữ nguyên')

    await rm(ngoai, { force: true })
  })
})
