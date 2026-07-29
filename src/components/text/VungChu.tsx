'use client'

import {
  useContext,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { FONT_CHU_OPTIONS } from '@/lib/invitation/fonts'
import type { FontChu, TextRegionId } from '@/lib/invitation/textTypes'
import type { Invitation } from '@/lib/invitation/types'
import { TextEditorBridge } from './TextEditorBridge'

function layFontCss(font: FontChu | undefined): string | undefined {
  return FONT_CHU_OPTIONS.find((luaChon) => luaChon.id === font)?.css
}

function xuLyMuiTen(
  event: KeyboardEvent<HTMLSpanElement>,
): { dx: number; dy: number } | null {
  const buoc = event.shiftKey ? 2 : 0.5

  switch (event.key) {
    case 'ArrowLeft':
      return { dx: -buoc, dy: 0 }
    case 'ArrowRight':
      return { dx: buoc, dy: 0 }
    case 'ArrowUp':
      return { dx: 0, dy: -buoc }
    case 'ArrowDown':
      return { dx: 0, dy: buoc }
    default:
      return null
  }
}

export function VungChu({
  id,
  thiep,
  noiDung,
  className,
}: {
  id: TextRegionId
  thiep: Invitation
  noiDung: ReactNode
  className?: string
}): ReactElement {
  const bridge = useContext(TextEditorBridge)
  const override = thiep.tuyChinhChu?.[id]
  const noiDungHienThi = override?.noiDung ?? noiDung

  const style = {
    color: override?.mauChu,
    fontFamily: layFontCss(override?.font),
    '--co-chu-responsive': override?.coChu
      ? `${override.coChu / 5.2}cqw`
      : undefined,
    fontSize: override?.coChu
      ? 'clamp(8px, var(--co-chu-responsive), 120px)'
      : undefined,
    transform: `translate(${override?.x ?? 0}cqw, ${override?.y ?? 0}cqw)`,
  } as CSSProperties & { '--co-chu-responsive'?: string }

  const dangChinh = bridge?.dangChinh === true
  const editorProps = dangChinh
    ? {
        tabIndex: 0,
        'data-text-selected': bridge.dangChon === id ? 'true' : undefined,
        onClick(event: MouseEvent<HTMLSpanElement>) {
          event.preventDefault()
          event.stopPropagation()
          bridge.chon(id)
        },
        onPointerDown(event: PointerEvent<HTMLSpanElement>) {
          bridge.batDauKeo(id, event)
        },
        onKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
          const delta = xuLyMuiTen(event)
          if (!delta) return

          event.preventDefault()
          event.stopPropagation()
          bridge.dichBangPhim(id, delta.dx, delta.dy)
        },
      }
    : {}

  return (
    <span
      data-text-region={id}
      className={['inline-block', className].filter(Boolean).join(' ')}
      style={style}
      {...editorProps}
    >
      {noiDungHienThi}
    </span>
  )
}
