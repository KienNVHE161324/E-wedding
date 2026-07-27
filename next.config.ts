import type { NextConfig } from 'next'

/**
 * Ảnh khách tải lên nằm ở kho ngoài (Cloudflare R2 mặc định).
 * Thêm host của R2_PUBLIC_URL vào đây, nếu không next/image sẽ từ chối tải.
 */
const hostAnh = process.env.R2_PUBLIC_URL
  ? [new URL(process.env.R2_PUBLIC_URL).hostname]
  : []

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...hostAnh.map((hostname) => ({ protocol: 'https' as const, hostname })),
      { protocol: 'https' as const, hostname: '**.r2.dev' },
      { protocol: 'https' as const, hostname: '**.supabase.co' },
    ],
  },
}

export default nextConfig
