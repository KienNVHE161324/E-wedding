import type { Metadata, Viewport } from 'next'
import { Be_Vietnam_Pro, Dancing_Script, Noto_Serif } from 'next/font/google'
import './globals.css'

// Bắt buộc có subset vietnamese, nếu không chữ sẽ mất dấu.
const beVietnamPro = Be_Vietnam_Pro({
  variable: '--font-he-thong',
  subsets: ['vietnamese', 'latin'],
  weight: ['300', '400', '600'],
})

const notoSerif = Noto_Serif({
  variable: '--font-serif-co-dien',
  subsets: ['vietnamese', 'latin'],
})

const dancingScript = Dancing_Script({
  variable: '--font-viet-tay',
  subsets: ['vietnamese', 'latin'],
})

export const metadata: Metadata = {
  title: 'E-Wedding',
  description: 'Nền tảng tạo thiệp cưới online',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${notoSerif.variable} ${dancingScript.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
