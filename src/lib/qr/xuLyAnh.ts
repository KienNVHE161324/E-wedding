import type { CauHinhQrDaXuLy } from './types'

function rgb(maMau: string): [number, number, number] {
  return [
    Number.parseInt(maMau.slice(1, 3), 16),
    Number.parseInt(maMau.slice(3, 5), 16),
    Number.parseInt(maMau.slice(5, 7), 16),
  ]
}

export function toMauDuLieuAnh(
  anh: ImageData,
  mauQr: string,
  mauNen: string,
): ImageData {
  const mauToi = rgb(mauQr)
  const mauSang = rgb(mauNen)
  const data = anh.data

  for (let i = 0; i < data.length; i += 4) {
    const doSang = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
    const mau = data[i + 3] < 128 || doSang >= 128 ? mauSang : mauToi
    data[i] = mau[0]
    data[i + 1] = mau[1]
    data[i + 2] = mau[2]
    data[i + 3] = 255
  }

  return anh
}

export function taiAnh(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const anh = new Image()
    anh.crossOrigin = 'anonymous'
    anh.onload = () => resolve(anh)
    anh.onerror = () => reject(new Error('Không tải được ảnh QR'))
    anh.src = url
  })
}

function xuatBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

export async function taoPngQr(
  url: string,
  cauHinh: CauHinhQrDaXuLy,
): Promise<Blob | null> {
  try {
    const canvasNguon = await taoCanvasQrDaToMau(url, cauHinh)
    if (!canvasNguon) return null
    const rong = canvasNguon.width
    const cao = canvasNguon.height

    const le = Math.max(24, Math.round(Math.max(rong, cao) * 0.12))
    const canvas = document.createElement('canvas')
    canvas.width = rong + le * 2
    canvas.height = cao + le * 2
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.fillStyle = cauHinh.kieuKhung === 'phong-bao' ? '#8B2F20' : cauHinh.mauNen
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = cauHinh.mauNen
    ctx.fillRect(le * 0.55, le * 0.55, rong + le * 0.9, cao + le * 0.9)
    ctx.strokeStyle = cauHinh.kieuKhung === 'phong-bao' ? '#B0833C' : cauHinh.mauQr
    ctx.lineWidth = Math.max(2, le * 0.08)
    ctx.strokeRect(le * 0.3, le * 0.3, rong + le * 1.4, cao + le * 1.4)
    if (cauHinh.kieuKhung === 'hoa-mem') {
      ctx.globalAlpha = 0.25
      ctx.fillStyle = cauHinh.mauQr
      ctx.beginPath()
      ctx.arc(le * 0.55, le * 0.55, le * 0.3, 0, Math.PI * 2)
      ctx.arc(canvas.width - le * 0.55, canvas.height - le * 0.55, le * 0.3, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    } else if (cauHinh.kieuKhung === 'phong-bao') {
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(canvas.width / 2, le)
      ctx.lineTo(canvas.width, 0)
      ctx.stroke()
    }
    ctx.drawImage(canvasNguon, le, le)

    return await xuatBlob(canvas)
  } catch {
    return null
  }
}

async function taoCanvasQrDaToMau(
  url: string,
  cauHinh: CauHinhQrDaXuLy,
): Promise<HTMLCanvasElement | null> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const anh = await taiAnh(url)
  const rong = anh.naturalWidth || anh.width
  const cao = anh.naturalHeight || anh.height
  if (!rong || !cao) return null
  canvas.width = rong
  canvas.height = cao
  ctx.drawImage(anh, 0, 0, rong, cao)
  const daToMau = toMauDuLieuAnh(
    ctx.getImageData(0, 0, rong, cao),
    cauHinh.mauQr,
    cauHinh.mauNen,
  )
  ctx.putImageData(daToMau, 0, 0)
  return canvas
}

export async function taoAnhQrDaToMau(
  url: string,
  cauHinh: CauHinhQrDaXuLy,
): Promise<Blob | null> {
  try {
    const canvas = await taoCanvasQrDaToMau(url, cauHinh)
    return canvas ? await xuatBlob(canvas) : null
  } catch {
    return null
  }
}
