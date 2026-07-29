import type { ReactNode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { thiepMau } from '@/lib/invitation/mau'
import {
  TextEditorBridge,
  type TextEditorBridgeValue,
} from '../TextEditorBridge'
import { VungChu } from '../VungChu'

function renderTrongBridge(
  bridge: TextEditorBridgeValue,
  children: ReactNode,
) {
  return render(
    <TextEditorBridge.Provider value={bridge}>
      {children}
    </TextEditorBridge.Provider>,
  )
}

function taoBridge(
  thayDoi: Partial<TextEditorBridgeValue> = {},
): TextEditorBridgeValue {
  return {
    dangChinh: true,
    dangChon: null,
    chon: vi.fn(),
    batDauKeo: vi.fn(),
    dichBangPhim: vi.fn(),
    ...thayDoi,
  }
}

describe('VungChu', () => {
  it('render nội dung và style ghi đè theo chiều rộng khung thiệp', () => {
    render(
      <p>
        <VungChu
          id="bia.loi-mo-dau"
          thiep={{
            ...thiepMau,
            tuyChinhChu: {
              'bia.loi-mo-dau': {
                noiDung: 'Trân trọng kính mời',
                font: 'viet-tay',
                coChu: 40,
                mauChu: '#123456',
                x: 10,
                y: -5,
              },
            },
          }}
          noiDung="Thân mời"
        />
      </p>,
    )

    const vung = screen.getByText('Trân trọng kính mời')
    expect(vung.tagName).toBe('SPAN')
    expect(vung).toHaveAttribute('data-text-region', 'bia.loi-mo-dau')
    expect(vung).toHaveClass('inline-block')
    expect(vung.style.color).toBe('rgb(18, 52, 86)')
    expect(vung.style.fontFamily).toContain('--font-viet-tay')
    expect(vung.style.getPropertyValue('--co-chu-responsive')).toContain('vw')
    expect(vung.style.getPropertyValue('--co-chu-responsive')).toContain('40px')
    expect(vung.style.getPropertyValue('--dich-x-responsive')).toContain('10vw')
    expect(vung.style.getPropertyValue('--dich-x-responsive')).toContain('52px')
    expect(vung.style.getPropertyValue('--dich-y-responsive')).toContain('-5vw')
    expect(vung.style.getPropertyValue('--dich-y-responsive')).toContain('-26px')
    expect(vung.style.cssText).not.toContain('cqw')
  })

  it('giữ nội dung và hành vi của phần tử cha khi không có bridge', async () => {
    const onClick = vi.fn()

    render(
      <button type="button" onClick={onClick}>
        <VungChu
          id="bia.loi-mo-dau"
          thiep={thiepMau}
          noiDung="Thân mời"
          className="uppercase"
        />
      </button>,
    )

    const vung = screen.getByText('Thân mời')
    expect(vung.tagName).toBe('SPAN')
    expect(vung).toHaveClass('inline-block', 'uppercase')
    expect(vung).not.toHaveAttribute('tabindex')

    await userEvent.click(vung)

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('chỉ kích hoạt handler editor khi bridge đang chỉnh', async () => {
    const onClickPhanTuCha = vi.fn()
    const bridgeTat = taoBridge({ dangChinh: false })
    const { rerender } = renderTrongBridge(
      bridgeTat,
      <button type="button" onClick={onClickPhanTuCha}>
        <VungChu
          id="bia.loi-mo-dau"
          thiep={thiepMau}
          noiDung="Thân mời"
        />
      </button>,
    )

    await userEvent.click(screen.getByText('Thân mời'))
    expect(onClickPhanTuCha).toHaveBeenCalledOnce()
    expect(bridgeTat.chon).not.toHaveBeenCalled()

    const bridgeBat = taoBridge()
    rerender(
      <TextEditorBridge.Provider value={bridgeBat}>
        <button type="button" onClick={onClickPhanTuCha}>
          <VungChu
            id="bia.loi-mo-dau"
            thiep={thiepMau}
            noiDung="Thân mời"
          />
        </button>
      </TextEditorBridge.Provider>,
    )

    const vung = screen.getByText('Thân mời')
    fireEvent.pointerDown(vung, { pointerId: 7, clientX: 20, clientY: 30 })
    fireEvent.keyDown(vung, { key: 'ArrowRight', shiftKey: true })
    await userEvent.click(vung)

    expect(bridgeBat.batDauKeo).toHaveBeenCalledWith(
      'bia.loi-mo-dau',
      expect.any(Object),
    )
    expect(bridgeBat.dichBangPhim).toHaveBeenCalledWith(
      'bia.loi-mo-dau',
      2,
      0,
    )
    expect(bridgeBat.chon).toHaveBeenCalledWith('bia.loi-mo-dau')
    expect(onClickPhanTuCha).toHaveBeenCalledOnce()
  })

  it('phơi bày aria-selected cho cả vùng được chọn và chưa được chọn', () => {
    const { rerender } = renderTrongBridge(
      taoBridge(),
      <VungChu
        id="bia.loi-mo-dau"
        thiep={thiepMau}
        noiDung="Thân mời"
      />,
    )

    expect(screen.getByText('Thân mời')).toHaveAttribute(
      'aria-selected',
      'false',
    )

    rerender(
      <TextEditorBridge.Provider
        value={taoBridge({ dangChon: 'bia.loi-mo-dau' })}
      >
        <VungChu
          id="bia.loi-mo-dau"
          thiep={thiepMau}
          noiDung="Thân mời"
        />
      </TextEditorBridge.Provider>,
    )

    expect(screen.getByText('Thân mời')).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })
})
