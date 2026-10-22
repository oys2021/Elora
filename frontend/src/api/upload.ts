import { apiClient } from './client'

interface UploadSignature {
  timestamp: number
  signature: string
  folder: string
  apiKey: string
  cloudName: string
}

export async function uploadImage(file: File, folder?: string): Promise<string> {
  const { data: sig } = await apiClient.get<{ data: UploadSignature }>(
    `/uploads/signature${folder ? `?folder=${encodeURIComponent(folder)}` : ''}`
  )

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', sig.apiKey)
  formData.append('timestamp', String(sig.timestamp))
  formData.append('signature', sig.signature)
  formData.append('folder', sig.folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error?.message ?? 'Image upload failed')
  }

  const data = await res.json()
  return data.secure_url as string
}
