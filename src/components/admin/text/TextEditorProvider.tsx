'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import {
  TextEditorBridge,
  type TextEditorBridgeValue,
} from '@/components/text/TextEditorBridge'
import {
  capNhatVungChu,
  deltaSangToaDo,
} from '@/lib/invitation/textOverrides'
import { timVungChu } from '@/lib/invitation/textRegions'
import type { TextRegionId } from '@/lib/invitation/textTypes'
import type { Invitation } from '@/lib/invitation/types'

type DragState = {
  id: TextRegionId
  pointerId: number
  startX: number
  startY: number
  width: number
  initial: { x: number; y: number }
  minDeltaX: number
  maxDeltaX: number
  minDeltaY: number
  maxDeltaY: number
}

type TextEditorProviderProps = {
  enabled: boolean
  thiep: Invitation
  onDoi: (thiep: Invitation) => void
  children: ReactNode
  /**
   * Optional controlled selection keeps the preview provider narrow while
   * allowing the sibling admin panel to share the same selected region.
   */
  dangChon?: TextRegionId | null
  onChon?: (id: TextRegionId | null) => void
}

export function TextEditorProvider({
  enabled,
  thiep,
  onDoi,
  children,
  dangChon,
  onChon,
}: TextEditorProviderProps): ReactElement {
  const [dangChonNoiBo, setDangChonNoiBo] =
    useState<TextRegionId | null>(null)
  const duocKiemSoat = dangChon !== undefined
  const vungDangChon = duocKiemSoat ? dangChon : dangChonNoiBo
  const drag = useRef<DragState | null>(null)
  const captureTarget = useRef<HTMLElement | null>(null)
  const donListener = useRef<(() => void) | null>(null)
  const thiepMoiNhat = useRef(thiep)
  const onDoiMoiNhat = useRef(onDoi)

  useEffect(() => {
    thiepMoiNhat.current = thiep
    onDoiMoiNhat.current = onDoi
  }, [onDoi, thiep])

  const chon = useCallback(
    (id: TextRegionId | null) => {
      if (!duocKiemSoat) setDangChonNoiBo(id)
      onChon?.(id)
    },
    [duocKiemSoat, onChon],
  )

  const ketThucKeo = useCallback(() => {
    const hienTai = drag.current
    if (hienTai && captureTarget.current) {
      try {
        captureTarget.current.releasePointerCapture?.(hienTai.pointerId)
      } catch {
        // Pointer capture may already have been released by the browser.
      }
    }
    drag.current = null
    captureTarget.current = null
    const don = donListener.current
    donListener.current = null
    don?.()
  }, [])

  const capNhatToaDo = useCallback(
    (id: TextRegionId, toaDo: { x: number; y: number }) => {
      const hienTai = thiepMoiNhat.current
      onDoiMoiNhat.current({
        ...hienTai,
        tuyChinhChu: capNhatVungChu(hienTai.tuyChinhChu, id, toaDo),
      })
    },
    [],
  )

  const batDauKeo = useCallback(
    (id: TextRegionId, event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled) return

      event.preventDefault()
      event.stopPropagation()
      const section = event.currentTarget.closest<HTMLElement>('[data-section]')
      const sectionRect = section?.getBoundingClientRect()
      const targetRect = event.currentTarget.getBoundingClientRect()
      const width = sectionRect?.width ?? 0
      if (width <= 0) return
      const coKichThuocVung =
        targetRect.width > 0 && targetRect.height > 0
      const phanConLaiCoTheChon = coKichThuocVung
        ? Math.min(16, targetRect.width, targetRect.height)
        : 0

      ketThucKeo()
      event.currentTarget.focus()
      const pointerId = event.pointerId
      const override = thiepMoiNhat.current.tuyChinhChu?.[id]
      drag.current = {
        id,
        pointerId,
        startX: event.clientX,
        startY: event.clientY,
        width,
        initial: { x: override?.x ?? 0, y: override?.y ?? 0 },
        minDeltaX: coKichThuocVung
          ? sectionRect!.left + phanConLaiCoTheChon - targetRect.right
          : Number.NEGATIVE_INFINITY,
        maxDeltaX: coKichThuocVung
          ? sectionRect!.right - phanConLaiCoTheChon - targetRect.left
          : Number.POSITIVE_INFINITY,
        minDeltaY: coKichThuocVung
          ? sectionRect!.top + phanConLaiCoTheChon - targetRect.bottom
          : Number.NEGATIVE_INFINITY,
        maxDeltaY: coKichThuocVung
          ? sectionRect!.bottom - phanConLaiCoTheChon - targetRect.top
          : Number.POSITIVE_INFINITY,
      }
      captureTarget.current = event.currentTarget
      event.currentTarget.setPointerCapture?.(pointerId)
      chon(id)

      const xuLyDiChuyen = (pointerEvent: PointerEvent) => {
        const hienTai = drag.current
        if (!hienTai || pointerEvent.pointerId !== hienTai.pointerId) return
        pointerEvent.preventDefault()
        const deltaX = Math.max(
          hienTai.minDeltaX,
          Math.min(
            hienTai.maxDeltaX,
            pointerEvent.clientX - hienTai.startX,
          ),
        )
        const deltaY = Math.max(
          hienTai.minDeltaY,
          Math.min(
            hienTai.maxDeltaY,
            pointerEvent.clientY - hienTai.startY,
          ),
        )
        capNhatToaDo(
          hienTai.id,
          deltaSangToaDo(
            deltaX,
            deltaY,
            hienTai.width,
            hienTai.initial,
          ),
        )
      }
      const xuLyKetThuc = (pointerEvent: PointerEvent) => {
        if (pointerEvent.pointerId !== drag.current?.pointerId) return
        ketThucKeo()
      }

      window.addEventListener('pointermove', xuLyDiChuyen)
      window.addEventListener('pointerup', xuLyKetThuc)
      window.addEventListener('pointercancel', xuLyKetThuc)
      donListener.current = () => {
        window.removeEventListener('pointermove', xuLyDiChuyen)
        window.removeEventListener('pointerup', xuLyKetThuc)
        window.removeEventListener('pointercancel', xuLyKetThuc)
      }
    },
    [capNhatToaDo, chon, enabled, ketThucKeo],
  )

  const dichBangPhim = useCallback(
    (id: TextRegionId, dx: number, dy: number) => {
      if (!enabled) return
      const override = thiepMoiNhat.current.tuyChinhChu?.[id]
      capNhatToaDo(
        id,
        deltaSangToaDo(dx, dy, 100, {
          x: override?.x ?? 0,
          y: override?.y ?? 0,
        }),
      )
    },
    [capNhatToaDo, enabled],
  )

  const vungDangChonHopLe =
    vungDangChon && timVungChu(thiep, vungDangChon)
      ? vungDangChon
      : null

  useEffect(() => {
    if (vungDangChon && !vungDangChonHopLe) {
      const timeout = window.setTimeout(() => chon(null), 0)
      return () => window.clearTimeout(timeout)
    }
  }, [chon, vungDangChon, vungDangChonHopLe])

  useEffect(() => {
    if (!enabled) ketThucKeo()
    return ketThucKeo
  }, [enabled, ketThucKeo])

  const bridge = useMemo<TextEditorBridgeValue>(
    () => ({
      dangChinh: enabled,
      dangChon: vungDangChonHopLe,
      chon,
      batDauKeo,
      dichBangPhim,
    }),
    [batDauKeo, chon, dichBangPhim, enabled, vungDangChonHopLe],
  )

  return (
    <TextEditorBridge.Provider value={bridge}>
      {children}
    </TextEditorBridge.Provider>
  )
}
