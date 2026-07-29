import { useContext, useState } from 'react'
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { VungChu } from '@/components/text/VungChu'
import {
  TextEditorBridge,
  type TextEditorBridgeValue,
} from '@/components/text/TextEditorBridge'
import { thiepMau } from '@/lib/invitation/mau'
import { capNhatVungChu } from '@/lib/invitation/textOverrides'
import type { TextRegionId } from '@/lib/invitation/textTypes'
import type { Invitation } from '@/lib/invitation/types'
import { TextEditorProvider } from '../TextEditorProvider'

const ID_CO_DAU = 'bia.co-dau.ten'
const THIEP_CO_ID: Invitation = {
  ...thiepMau,
  chuyenChungMinh: thiepMau.chuyenChungMinh.map((item, index) => ({
    ...item,
    id: `00000000-0000-4000-8000-00000000000${index}`,
  })),
  suKien: thiepMau.suKien.map((item, index) => ({
    ...item,
    id: `10000000-0000-4000-8000-00000000000${index}`,
  })),
}

function KhungProvider({
  banDau = THIEP_CO_ID,
  enabled = true,
  onDoi = vi.fn(),
  dangChon,
  onChon,
  onClickGoc,
}: {
  banDau?: Invitation
  enabled?: boolean
  onDoi?: (thiep: Invitation) => void
  dangChon?: TextRegionId | null
  onChon?: (id: TextRegionId | null) => void
  onClickGoc?: () => void
}) {
  const [thiep, setThiep] = useState(banDau)
  const noiDung = (
    <VungChu id={ID_CO_DAU} thiep={thiep} noiDung="Tên cô dâu" />
  )

  return (
    <TextEditorProvider
      enabled={enabled}
      thiep={thiep}
      onDoi={(giaTri) => {
        setThiep(giaTri)
        onDoi(giaTri)
      }}
      dangChon={dangChon}
      onChon={onChon}
    >
      <section data-section="bia">
        {onClickGoc ? (
          <button type="button" onClick={onClickGoc}>
            {noiDung}
          </button>
        ) : (
          <p>{noiDung}</p>
        )}
      </section>
    </TextEditorProvider>
  )
}

function chuanBiKeo() {
  const vung = screen.getByText('Tên cô dâu')
  const section = vung.closest('[data-section]') as HTMLElement
  vi.spyOn(section, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    right: 520,
    bottom: 600,
    left: 0,
    width: 520,
    height: 600,
    toJSON: () => ({}),
  })
  const setPointerCapture = vi.fn()
  const releasePointerCapture = vi.fn()
  Object.defineProperties(vung, {
    setPointerCapture: { configurable: true, value: setPointerCapture },
    releasePointerCapture: { configurable: true, value: releasePointerCapture },
  })
  return { vung, setPointerCapture, releasePointerCapture }
}

function KhungCapNhatGiuaLucKeo({ onDoi }: { onDoi: (thiep: Invitation) => void }) {
  const [thiep, setThiep] = useState(THIEP_CO_ID)

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setThiep((hienTai) => ({
            ...hienTai,
            tuyChinhChu: capNhatVungChu(
              hienTai.tuyChinhChu,
              ID_CO_DAU,
              { mauChu: '#123456' },
            ),
          }))
        }
      >
        Đổi màu ngoài drag
      </button>
      <TextEditorProvider
        enabled
        thiep={thiep}
        onDoi={(giaTri) => {
          setThiep(giaTri)
          onDoi(giaTri)
        }}
      >
        <section data-section="bia">
          <VungChu id={ID_CO_DAU} thiep={thiep} noiDung="Tên cô dâu" />
        </section>
      </TextEditorProvider>
    </>
  )
}

function TrangThaiBridge() {
  const bridge = useContext(TextEditorBridge)
  return (
    <output aria-label="Lựa chọn trong bridge">
      {bridge?.dangChon ?? 'không có'}
    </output>
  )
}

function KhungVungDong({ controlled }: { controlled: boolean }) {
  const [coVung, setCoVung] = useState(true)
  const [dangChon, setDangChon] = useState<TextRegionId | null>(null)
  const suKien = THIEP_CO_ID.suKien[0]
  const id = `su-kien.${suKien.id}.ten`
  const thiep = {
    ...THIEP_CO_ID,
    suKien: coVung ? [suKien] : [],
  }

  return (
    <>
      <button type="button" onClick={() => setCoVung(false)}>
        Bỏ vùng động
      </button>
      <button type="button" onClick={() => setCoVung(true)}>
        Khôi phục vùng động
      </button>
      <output aria-label="Lựa chọn controlled">
        {dangChon ?? 'không có'}
      </output>
      <TextEditorProvider
        enabled
        thiep={thiep}
        onDoi={vi.fn()}
        {...(controlled ? { dangChon, onChon: setDangChon } : {})}
      >
        <TrangThaiBridge />
        {coVung && (
          <section data-section="su-kien">
            <VungChu id={id} thiep={thiep} noiDung="Tên sự kiện động" />
          </section>
        )}
      </TextEditorProvider>
    </>
  )
}

describe('TextEditorProvider', () => {
  it('chọn vùng bằng click với state fallback nội bộ', async () => {
    render(<KhungProvider />)

    const vung = screen.getByText('Tên cô dâu')
    await userEvent.click(vung)

    expect(vung).toHaveAttribute('data-text-selected', 'true')
  })

  it('đồng bộ lựa chọn qua controlled dangChon/onChon', async () => {
    function KhungControlled() {
      const [dangChon, setDangChon] = useState<TextRegionId | null>(null)
      return (
        <>
          <output aria-label="Vùng đang chọn">{dangChon ?? 'không có'}</output>
          <KhungProvider dangChon={dangChon} onChon={setDangChon} />
        </>
      )
    }

    render(<KhungControlled />)
    await userEvent.click(screen.getByText('Tên cô dâu'))

    expect(screen.getByLabelText('Vùng đang chọn')).toHaveTextContent(ID_CO_DAU)
    expect(screen.getByText('Tên cô dâu')).toHaveAttribute(
      'data-text-selected',
      'true',
    )
  })

  it.each(['mouse', 'touch', 'pen'])(
    'kéo bằng Pointer Events loại %s theo phần trăm chiều rộng section',
    (pointerType) => {
      const onDoi = vi.fn()
      render(<KhungProvider onDoi={onDoi} />)
      const { vung, setPointerCapture, releasePointerCapture } = chuanBiKeo()

      fireEvent.pointerDown(vung, {
        pointerId: 1,
        pointerType,
        clientX: 100,
        clientY: 100,
      })
      fireEvent.pointerMove(window, {
        pointerId: 1,
        pointerType,
        clientX: 152,
        clientY: 74,
      })
      fireEvent.pointerUp(window, { pointerId: 1, pointerType })

      expect(setPointerCapture).toHaveBeenCalledWith(1)
      expect(releasePointerCapture).toHaveBeenCalledWith(1)
      expect(onDoi).toHaveBeenLastCalledWith(
        expect.objectContaining({
          tuyChinhChu: expect.objectContaining({
            [ID_CO_DAU]: expect.objectContaining({ x: 10, y: -5 }),
          }),
        }),
      )
    },
  )

  it('giữ một phần vùng chữ trong section thấp khi kéo quá xa', () => {
    const onDoi = vi.fn()
    render(<KhungProvider onDoi={onDoi} />)
    const { vung } = chuanBiKeo()
    const section = vung.closest('[data-section]') as HTMLElement
    vi.mocked(section.getBoundingClientRect).mockReturnValue({
      x: 0,
      y: 100,
      top: 100,
      right: 520,
      bottom: 140,
      left: 0,
      width: 520,
      height: 40,
      toJSON: () => ({}),
    })
    vi.spyOn(vung, 'getBoundingClientRect').mockReturnValue({
      x: 200,
      y: 110,
      top: 110,
      right: 320,
      bottom: 130,
      left: 200,
      width: 120,
      height: 20,
      toJSON: () => ({}),
    })

    fireEvent.pointerDown(vung, {
      pointerId: 11,
      clientX: 260,
      clientY: 120,
    })
    fireEvent.pointerMove(window, {
      pointerId: 11,
      clientX: 10_000,
      clientY: 10_000,
    })
    fireEvent.pointerUp(window, { pointerId: 11 })

    expect(onDoi).toHaveBeenLastCalledWith(
      expect.objectContaining({
        tuyChinhChu: expect.objectContaining({
          [ID_CO_DAU]: expect.objectContaining({
            x: 58.5,
            y: 2.7,
          }),
        }),
      }),
    )
  })

  it('giữ cập nhật invitation khác xảy ra giữa các pointermove', () => {
    const onDoi = vi.fn()
    render(<KhungCapNhatGiuaLucKeo onDoi={onDoi} />)
    const { vung } = chuanBiKeo()

    fireEvent.pointerDown(vung, {
      pointerId: 1,
      clientX: 100,
      clientY: 100,
    })
    fireEvent.pointerMove(window, {
      pointerId: 1,
      clientX: 152,
      clientY: 100,
    })
    fireEvent.click(screen.getByRole('button', { name: 'Đổi màu ngoài drag' }))
    fireEvent.pointerMove(window, {
      pointerId: 1,
      clientX: 204,
      clientY: 100,
    })
    fireEvent.pointerUp(window, { pointerId: 1 })

    expect(onDoi).toHaveBeenLastCalledWith(
      expect.objectContaining({
        tuyChinhChu: expect.objectContaining({
          [ID_CO_DAU]: expect.objectContaining({
            x: 20,
            y: 0,
            mauChu: '#123456',
          }),
        }),
      }),
    )
  })

  it('chỉ gắn listener window trong lúc kéo và dọn khi pointer bị hủy', () => {
    const onDoi = vi.fn()
    const themListener = vi.spyOn(window, 'addEventListener')
    const boListener = vi.spyOn(window, 'removeEventListener')
    render(<KhungProvider onDoi={onDoi} />)
    const { vung, releasePointerCapture } = chuanBiKeo()

    expect(
      themListener.mock.calls.some(([ten]) => ten === 'pointermove'),
    ).toBe(false)

    fireEvent.pointerDown(vung, {
      pointerId: 7,
      clientX: 20,
      clientY: 30,
    })

    expect(themListener).toHaveBeenCalledWith(
      'pointermove',
      expect.any(Function),
    )
    expect(themListener).toHaveBeenCalledWith('pointerup', expect.any(Function))
    expect(themListener).toHaveBeenCalledWith(
      'pointercancel',
      expect.any(Function),
    )

    fireEvent.pointerMove(window, {
      pointerId: 7,
      clientX: 72,
      clientY: 30,
    })
    expect(onDoi).toHaveBeenCalledOnce()

    fireEvent.pointerCancel(window, { pointerId: 7 })
    fireEvent.pointerMove(window, {
      pointerId: 7,
      clientX: 124,
      clientY: 30,
    })

    expect(onDoi).toHaveBeenCalledOnce()
    expect(releasePointerCapture).toHaveBeenCalledWith(7)
    expect(boListener).toHaveBeenCalledWith(
      'pointermove',
      expect.any(Function),
    )
    expect(boListener).toHaveBeenCalledWith('pointerup', expect.any(Function))
    expect(boListener).toHaveBeenCalledWith(
      'pointercancel',
      expect.any(Function),
    )
  })

  it('Arrow dịch chính xác 0.5%', () => {
    const onDoi = vi.fn()
    render(<KhungProvider onDoi={onDoi} />)

    fireEvent.keyDown(screen.getByText('Tên cô dâu'), {
      key: 'ArrowRight',
    })

    expect(onDoi).toHaveBeenLastCalledWith(
      expect.objectContaining({
        tuyChinhChu: expect.objectContaining({
          [ID_CO_DAU]: expect.objectContaining({ x: 0.5, y: 0 }),
        }),
      }),
    )
  })

  it('Shift+Arrow dịch chính xác 2% khi chưa chạm giới hạn', () => {
    const onDoi = vi.fn()
    render(<KhungProvider onDoi={onDoi} />)

    fireEvent.keyDown(screen.getByText('Tên cô dâu'), {
      key: 'ArrowRight',
      shiftKey: true,
    })

    expect(onDoi).toHaveBeenLastCalledWith(
      expect.objectContaining({
        tuyChinhChu: expect.objectContaining({
          [ID_CO_DAU]: expect.objectContaining({ x: 2, y: 0 }),
        }),
      }),
    )
  })

  it('clamp Shift+Arrow bằng giới hạn tọa độ', () => {
    const onDoi = vi.fn()
    render(
      <KhungProvider
        banDau={{
          ...THIEP_CO_ID,
          tuyChinhChu: { [ID_CO_DAU]: { x: 99, y: -99 } },
        }}
        onDoi={onDoi}
      />,
    )
    const vung = screen.getByText('Tên cô dâu')

    fireEvent.keyDown(vung, { key: 'ArrowRight', shiftKey: true })
    fireEvent.keyDown(vung, { key: 'ArrowUp', shiftKey: true })

    expect(onDoi).toHaveBeenLastCalledWith(
      expect.objectContaining({
        tuyChinhChu: expect.objectContaining({
          [ID_CO_DAU]: expect.objectContaining({ x: 100, y: -100 }),
        }),
      }),
    )
  })

  it('focus vùng khi pointerdown để click rồi gõ Arrow hoạt động thật', async () => {
    const onDoi = vi.fn()
    render(<KhungProvider onDoi={onDoi} />)
    const { vung } = chuanBiKeo()
    const user = userEvent.setup()

    await user.click(vung)
    await user.keyboard('{ArrowRight}')

    expect(vung).toHaveFocus()
    expect(onDoi).toHaveBeenLastCalledWith(
      expect.objectContaining({
        tuyChinhChu: expect.objectContaining({
          [ID_CO_DAU]: expect.objectContaining({ x: 0.5, y: 0 }),
        }),
      }),
    )
  })

  it('bridge tắt giữ nguyên click gốc và không chạm callback pointer/keyboard', async () => {
    const onDoi = vi.fn()
    const onClickGoc = vi.fn()
    render(
      <KhungProvider
        enabled={false}
        onDoi={onDoi}
        onClickGoc={onClickGoc}
      />,
    )
    const vung = screen.getByText('Tên cô dâu')
    const setPointerCapture = vi.fn()
    Object.defineProperty(vung, 'setPointerCapture', {
      configurable: true,
      value: setPointerCapture,
    })

    fireEvent.pointerDown(vung, {
      pointerId: 3,
      clientX: 10,
      clientY: 10,
    })
    fireEvent.keyDown(vung, { key: 'ArrowRight' })
    await userEvent.click(vung)

    expect(onClickGoc).toHaveBeenCalledOnce()
    expect(onDoi).not.toHaveBeenCalled()
    expect(setPointerCapture).not.toHaveBeenCalled()
    expect(vung).not.toHaveAttribute('tabindex')
  })

  it('VungChu không gọi trực tiếp callback bridge pointer/keyboard khi bridge tắt', async () => {
    const onClickGoc = vi.fn()
    const bridgeTat: TextEditorBridgeValue = {
      dangChinh: false,
      dangChon: null,
      chon: vi.fn(),
      batDauKeo: vi.fn(),
      dichBangPhim: vi.fn(),
    }
    render(
      <TextEditorBridge.Provider value={bridgeTat}>
        <button type="button" onClick={onClickGoc}>
          <VungChu
            id={ID_CO_DAU}
            thiep={THIEP_CO_ID}
            noiDung="Tên cô dâu"
          />
        </button>
      </TextEditorBridge.Provider>,
    )
    const vung = screen.getByText('Tên cô dâu')

    fireEvent.pointerDown(vung, { pointerId: 8 })
    fireEvent.keyDown(vung, { key: 'ArrowRight' })
    await userEvent.click(vung)

    expect(bridgeTat.batDauKeo).not.toHaveBeenCalled()
    expect(bridgeTat.dichBangPhim).not.toHaveBeenCalled()
    expect(bridgeTat.chon).not.toHaveBeenCalled()
    expect(onClickGoc).toHaveBeenCalledOnce()
  })

  it('bỏ chọn controlled khi vùng động biến mất khỏi registry', async () => {
    const idSuKien = THIEP_CO_ID.suKien[0].id!
    const dangChon = `su-kien.${idSuKien}.ten`
    const onChon = vi.fn()
    const { rerender } = render(
      <TextEditorProvider
        enabled
        thiep={THIEP_CO_ID}
        onDoi={vi.fn()}
        dangChon={dangChon}
        onChon={onChon}
      >
        <div />
      </TextEditorProvider>,
    )

    rerender(
      <TextEditorProvider
        enabled
        thiep={{ ...THIEP_CO_ID, suKien: THIEP_CO_ID.suKien.slice(1) }}
        onDoi={vi.fn()}
        dangChon={dangChon}
        onChon={onChon}
      >
        <div />
      </TextEditorProvider>,
    )

    await waitFor(() => expect(onChon).toHaveBeenCalledWith(null))
  })

  it.each([
    ['fallback nội bộ', false],
    ['controlled', true],
  ])(
    'xóa hẳn lựa chọn %s để vùng cùng ID không tự chọn lại khi xuất hiện',
    async (_nhan, controlled) => {
      render(<KhungVungDong controlled={controlled} />)

      await userEvent.click(screen.getByText('Tên sự kiện động'))
      expect(screen.getByLabelText('Lựa chọn trong bridge')).not.toHaveTextContent(
        'không có',
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Bỏ vùng động' }),
      )
      await waitFor(() =>
        expect(screen.getByLabelText('Lựa chọn trong bridge')).toHaveTextContent(
          'không có',
        ),
      )
      await new Promise((resolve) => setTimeout(resolve, 0))
      await userEvent.click(
        screen.getByRole('button', { name: 'Khôi phục vùng động' }),
      )

      expect(screen.getByText('Tên sự kiện động')).not.toHaveAttribute(
        'data-text-selected',
      )
      if (controlled) {
        expect(screen.getByLabelText('Lựa chọn controlled')).toHaveTextContent(
          'không có',
        )
      }
    },
  )
})
