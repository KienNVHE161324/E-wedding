import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Ảnh khách tải lên nằm ở Supabase Storage.
    remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }],
  },
}

export default nextConfig
