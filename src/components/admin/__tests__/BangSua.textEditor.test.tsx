import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { thiepMau } from '@/lib/invitation/mau'
import type { Invitation } from '@/lib/invitation/types'
import type { VongDoi } from '@/lib/vongDoi/types'
import { BangSua } from '../BangSua'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Task 7 will register the real cover regions. This focused Task 6 integration
// double exposes one real VungChu so the BangSua provider boundary and
// controlled selection can be exercised without pulling Task 7 into scope.
vi.mock('@/components/InvitationRenderer', async () => {
  const { VungChu } = await vi.importActual<
    typeof import('@/components/text/VungChu')
  >('@/components/text/VungChu')

  return {
    InvitationRenderer({ thiep }: { thiep: Invitation }) {
      return (
        <div data-invitation-root>
          <section data-section="bia">
            <VungChu
              id="bia.co-dau.ten"
              thiep={thiep}
              noiDung={thiep.coDau.ten}
            />
          </section>
        </div>
      )
    },
  }
})

const vongDoi: VongDoi = {
  trangThaiLuu: 'nhap',
  ngayXuatBan: null,
  ngayDong: null,
}

function renderBangSua(banDau: Invitation = thiepMau) {
  return render(
    <BangSua
      banDau={banDau}
      invitationId="invitation-1"
      publicSlug={null}
      vongDoi={vongDoi}
      spreadsheetId={null}
      emailServiceAccount="wedding@example.com"
    />,
  )
}

function boId<T extends { id?: string }>(item: T): T {
  const ketQua = { ...item }
  delete ketQua.id
  return ketQua
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('BangSua text editor', () => {
  it('chuẩn hóa ID dữ liệu cũ ngay trong initializer và lưu lại các ID đó', async () => {
    const fetchMock = vi.fn(
      async (url: string, init?: RequestInit) => {
        void url
        void init
        return {
          ok: true,
          json: async () => ({}),
        }
      },
    )
    vi.stubGlobal('fetch', fetchMock)
    renderBangSua({
      ...thiepMau,
      suKien: thiepMau.suKien.map(boId),
      chuyenChungMinh: thiepMau.chuyenChungMinh.map(boId),
    })

    await userEvent.click(screen.getByRole('button', { name: 'Lưu' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/luu',
        expect.any(Object),
      )
    })
    const loiGoiLuu = fetchMock.mock.calls.find(
      ([url]) => url === '/api/admin/luu',
    )
    expect(loiGoiLuu).toBeDefined()
    const init = loiGoiLuu?.[1]
    const payload = JSON.parse(String(init?.body)) as { thiep: Invitation }

    expect(payload.thiep.suKien.every((item) => Boolean(item.id))).toBe(true)
    expect(
      payload.thiep.chuyenChungMinh.every((item) => Boolean(item.id)),
    ).toBe(true)
  })

  it('toggle controlled đồng bộ click preview với panel và cập nhật tức thì', async () => {
    const { container } = renderBangSua()

    expect(
      screen.queryByLabelText('Nội dung vùng chữ'),
    ).not.toBeInTheDocument()
    await userEvent.click(screen.getByLabelText('Chỉnh chữ'))

    const preview = container.querySelector(
      '[data-invitation-root]',
    ) as HTMLElement
    await userEvent.click(within(preview).getByText(thiepMau.coDau.ten))

    const noiDung = screen.getByLabelText('Nội dung vùng chữ')
    expect(noiDung).toHaveValue(thiepMau.coDau.ten)
    expect(within(preview).getByText(thiepMau.coDau.ten)).toHaveAttribute(
      'data-text-selected',
      'true',
    )

    await userEvent.clear(noiDung)
    await userEvent.type(noiDung, 'Thu Hà')

    expect(within(preview).getByText('Thu Hà')).toBeInTheDocument()
    expect(
      screen.getByLabelText('Giao diện').closest('[data-invitation-root]'),
    ).toBeNull()
  })

  it('xóa mốc qua BangSua dọn override theo ID và giữ override mốc còn lại', async () => {
    const fetchMock = vi.fn(
      async (url: string, init?: RequestInit) => {
        void url
        void init
        return {
          ok: true,
          json: async () => ({}),
        }
      },
    )
    vi.stubGlobal('fetch', fetchMock)
    const eventA = {
      ...thiepMau.suKien[0],
      id: 'event-a',
      ten: 'Sự kiện A',
    }
    const eventB = {
      ...thiepMau.suKien[1],
      id: 'event-b',
      ten: 'Sự kiện B',
    }
    renderBangSua({
      ...thiepMau,
      suKien: [eventA, eventB],
      tuyChinhChu: {
        'su-kien.event-a.ten': { mauChu: '#123456' },
        'su-kien.event-a.gio': { x: 3 },
        'su-kien.event-b.ten': { mauChu: '#654321' },
        'bia.loi-mo-dau': { y: 2 },
      },
    })

    await userEvent.click(screen.getByRole('button', { name: 'Bỏ mốc 1' }))
    await userEvent.click(screen.getByRole('button', { name: 'Lưu' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/admin/luu', expect.any(Object))
    })
    const loiGoiLuu = fetchMock.mock.calls.find(
      ([url]) => url === '/api/admin/luu',
    )
    const payload = JSON.parse(String(loiGoiLuu?.[1]?.body)) as {
      thiep: Invitation
    }

    expect(payload.thiep.suKien.map((item) => item.id)).toEqual(['event-b'])
    expect(payload.thiep.tuyChinhChu).toEqual({
      'su-kien.event-b.ten': { mauChu: '#654321' },
      'bia.loi-mo-dau': { y: 2 },
    })
  })
})
