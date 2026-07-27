import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import type { KhoLuuTru } from './types'

function batBuoc(ten: string): string {
  const giaTri = process.env[ten]
  if (!giaTri) throw new Error(`Thiếu biến môi trường ${ten}`)
  return giaTri
}

/**
 * Lưu vào Cloudflare R2. Gói miễn phí 10GB, không tính phí băng thông ra.
 * R2 tương thích giao thức S3 nên dùng luôn SDK của AWS.
 *
 * Bucket phải được bật truy cập công khai (r2.dev hoặc tên miền riêng),
 * và R2_PUBLIC_URL trỏ đúng địa chỉ đó.
 */
/** Ghép địa chỉ công khai, bỏ dấu / thừa để không sinh ra đường dẫn có //. */
export function ghepDiaChi(goc: string, duongDan: string): string {
  return `${goc.replace(/\/+$/, '')}/${duongDan.replace(/^\/+/, '')}`
}

export function taoKhoR2(): KhoLuuTru {
  const bucket = batBuoc('R2_BUCKET')
  const diaChiCongKhai = batBuoc('R2_PUBLIC_URL')

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${batBuoc('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: batBuoc('R2_ACCESS_KEY_ID'),
      secretAccessKey: batBuoc('R2_SECRET_ACCESS_KEY'),
    },
  })

  return {
    ten: 'Cloudflare R2',

    async luu(duongDan, tep) {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: duongDan,
          Body: new Uint8Array(await tep.arrayBuffer()),
          ContentType: tep.type,
          // Tên tệp có UUID nên nội dung không bao giờ đổi.
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      )
      return ghepDiaChi(diaChiCongKhai, duongDan)
    },

    async xoa(duongDan) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: duongDan }))
    },
  }
}
