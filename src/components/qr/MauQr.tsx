import type { KieuKhungQr } from '@/lib/qr/types'

const TEN_KIEU: Record<KieuKhungQr, string> = {
  'toi-gian': 'Tối giản',
  'hoa-mem': 'Hoa mềm',
  'phong-bao': 'Phong bao',
}

export function MauQr({
  kieu,
  mauQr = '#8B2F20',
  mauNen = '#FFF8EF',
}: {
  kieu: KieuKhungQr
  mauQr?: string
  mauNen?: string
}) {
  return (
    <div
      aria-hidden="true"
      data-mau-qr={kieu}
      className={`relative mx-auto grid aspect-[4/5] w-24 place-items-center overflow-hidden border p-3 ${
        kieu === 'toi-gian' ? 'rounded-sm'
        : kieu === 'hoa-mem' ? 'rounded-2xl'
        : 'rounded-lg border-4'
      }`}
      style={{
        background: kieu === 'phong-bao' ? mauQr : mauNen,
        borderColor: mauQr,
      }}
    >
      {kieu === 'hoa-mem' && (
        <>
          <span className="absolute -left-2 -top-2 text-2xl opacity-40">❀</span>
          <span className="absolute -bottom-2 -right-2 text-2xl opacity-40">❀</span>
        </>
      )}
      {kieu === 'phong-bao' && (
        <span
          className="absolute left-0 right-0 top-0 h-8 border-b"
          style={{ borderColor: '#B0833C' }}
        />
      )}
      <svg
        viewBox="0 0 21 21"
        className="relative h-14 w-14 bg-white p-1"
        style={{ color: mauQr }}
      >
        <path
          fill="currentColor"
          d="M1 1h6v6H1V1Zm2 2v2h2V3H3Zm11-2h6v6h-6V1Zm2 2v2h2V3h-2ZM1 14h6v6H1v-6Zm2 2v2h2v-2H3ZM9 2h2v2H9V2Zm2 3h2v2h-2V5ZM8 8h3v3H8V8Zm5 0h2v2h-2V8Zm3 1h4v2h-4V9ZM2 9h4v2H2V9Zm0 3h2v1H2v-1Zm4 0h2v3H6v-3Zm3 1h2v2H9v-2Zm3-2h2v4h-2v-4Zm3 2h2v2h-2v-2Zm3-1h2v3h-2v-3ZM9 16h3v2H9v-2Zm4 0h2v4h-2v-4Zm3 1h4v3h-4v-3Z"
        />
      </svg>
      <span className="sr-only">{TEN_KIEU[kieu]}</span>
    </div>
  )
}
