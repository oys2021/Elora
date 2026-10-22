// Shared guard for every image uploader (product, category, banner). `accept`
// on the <Upload> only filters by file type, so without this an admin could
// pick a 40MB phone photo and it would sit there uploading slowly, or get
// rejected by Cloudinary with no clear message. Catching it here is instant
// and the message says exactly what to do.
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10 MB

export function imageSizeError(file: File): string | null {
  if (file.size <= MAX_IMAGE_BYTES) return null
  const mb = (file.size / (1024 * 1024)).toFixed(1)
  const limitMb = MAX_IMAGE_BYTES / (1024 * 1024)
  return `"${file.name}" is ${mb} MB — images must be under ${limitMb} MB. Resize or compress it and try again.`
}

// Splits a file list into ones under the limit and the rejection messages for
// the rest, so callers can upload the good ones and report the bad ones.
export function splitBySize(files: File[]): { ok: File[]; errors: string[] } {
  const ok: File[] = []
  const errors: string[] = []
  for (const file of files) {
    const error = imageSizeError(file)
    if (error) errors.push(error)
    else ok.push(file)
  }
  return { ok, errors }
}
