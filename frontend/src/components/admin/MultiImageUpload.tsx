import { useRef, useState } from 'react'
import { Upload, Button, message } from 'antd'
import { UploadOutlined, CloseOutlined, LeftOutlined, RightOutlined, LoadingOutlined } from '@ant-design/icons'
import { uploadImage } from '../../api/upload'
import { splitBySize } from '../../utils/imageValidation'

interface MultiImageUploadProps {
  value?: string[]
  onChange?: (urls: string[]) => void
  folder?: string
  onUploadingChange?: (uploading: boolean) => void
  maxCount?: number
}

// Several images for one product. The first image is the "main" one shown on
// product cards; the order here is the order of the gallery on the product page.
export default function MultiImageUpload({
  value = [],
  onChange,
  folder,
  onUploadingChange,
  maxCount = 10,
}: MultiImageUploadProps) {
  const [uploadingCount, setUploadingCount] = useState(0)

  // Uploads finish at different times; always build on the newest list, not the
  // one captured when the upload started.
  const latest = useRef(value)
  latest.current = value

  const commit = (urls: string[]) => {
    latest.current = urls
    onChange?.(urls)
  }

  const uploadBatch = async (files: File[]) => {
    const { ok: sized, errors: sizeErrors } = splitBySize(files)
    sizeErrors.forEach((error) => message.error(error))

    const room = maxCount - latest.current.length
    if (room <= 0) {
      if (sized.length) message.warning(`You can add up to ${maxCount} images`)
      return
    }
    const batch = sized.slice(0, room)
    if (batch.length < sized.length) {
      message.warning(`Only ${batch.length} of ${sized.length} images added (limit is ${maxCount})`)
    }
    if (!batch.length) return

    setUploadingCount(batch.length)
    onUploadingChange?.(true)
    try {
      // Upload in parallel, but keep the order the files were selected in.
      const results = await Promise.allSettled(batch.map((file) => uploadImage(file, folder)))
      const urls = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))
      const failed = results.length - urls.length
      if (urls.length) commit([...latest.current, ...urls])
      if (failed) message.error(`${failed} image${failed === 1 ? '' : 's'} failed to upload`)
    } finally {
      setUploadingCount(0)
      onUploadingChange?.(false)
    }
  }

  const remove = (index: number) => commit(latest.current.filter((_, i) => i !== index))

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= latest.current.length) return
    const next = [...latest.current]
    ;[next[index], next[target]] = [next[target], next[index]]
    commit(next)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((url, index) => (
          <div key={url} className="relative h-20 w-20">
            <img src={url} alt="" className="h-20 w-20 rounded-lg border border-neutral-200 object-cover" />
            {index === 0 && (
              <span className="absolute left-1 top-1 rounded bg-neutral-900/80 px-1.5 py-0.5 text-[9px] font-medium text-white">
                Main
              </span>
            )}
            <button
              type="button"
              aria-label="Remove image"
              onClick={() => remove(index)}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white"
            >
              <CloseOutlined style={{ fontSize: 10 }} />
            </button>
            <div className="absolute inset-x-0 bottom-0 flex justify-between rounded-b-lg bg-black/45 px-1 py-0.5 text-white">
              <button
                type="button"
                aria-label="Move earlier"
                disabled={index === 0}
                onClick={() => move(index, -1)}
                className="disabled:opacity-30"
              >
                <LeftOutlined style={{ fontSize: 10 }} />
              </button>
              <button
                type="button"
                aria-label="Move later"
                disabled={index === value.length - 1}
                onClick={() => move(index, 1)}
                className="disabled:opacity-30"
              >
                <RightOutlined style={{ fontSize: 10 }} />
              </button>
            </div>
          </div>
        ))}

        {Array.from({ length: uploadingCount }).map((_, i) => (
          <div
            key={`uploading-${i}`}
            className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-neutral-400"
          >
            <LoadingOutlined />
          </div>
        ))}
      </div>

      <Upload
        className="mt-3 block"
        showUploadList={false}
        accept="image/*"
        multiple
        disabled={value.length >= maxCount}
        beforeUpload={(file, fileList) => {
          // antd calls this once per file; handle the whole selection on the first call.
          if (file === fileList[0]) void uploadBatch(fileList as unknown as File[])
          return false
        }}
      >
        <Button icon={<UploadOutlined />} loading={uploadingCount > 0} disabled={value.length >= maxCount}>
          {value.length ? 'Add More Images' : 'Upload Images'}
        </Button>
      </Upload>
      <p className="mt-1 text-xs text-neutral-500">
        Select several at once. The first image is the main one; use the arrows to reorder. {value.length}/{maxCount}
      </p>
    </div>
  )
}
