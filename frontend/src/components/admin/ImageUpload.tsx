import { useState } from 'react'
import { Upload, Button, message } from 'antd'
import { UploadOutlined, CloseOutlined } from '@ant-design/icons'
import { uploadImage } from '../../api/upload'
import { imageSizeError } from '../../utils/imageValidation'

interface ImageUploadProps {
  value?: string
  onChange?: (url: string) => void
  folder?: string
  onUploadingChange?: (uploading: boolean) => void
}

export default function ImageUpload({ value, onChange, folder, onUploadingChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (file: File) => {
    setUploading(true)
    onUploadingChange?.(true)
    try {
      const url = await uploadImage(file, folder)
      onChange?.(url)
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      onUploadingChange?.(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {value && (
        <div className="relative">
          <img src={value} alt="" className="h-14 w-14 rounded-lg object-cover" />
          <button
            type="button"
            onClick={() => onChange?.('')}
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white"
          >
            <CloseOutlined style={{ fontSize: 10 }} />
          </button>
        </div>
      )}
      <Upload
        showUploadList={false}
        accept="image/*"
        beforeUpload={(file) => {
          const error = imageSizeError(file)
          if (error) {
            message.error(error)
            return false
          }
          handleUpload(file)
          return false
        }}
      >
        <Button icon={<UploadOutlined />} loading={uploading}>
          {value ? 'Change Image' : 'Upload Image'}
        </Button>
      </Upload>
    </div>
  )
}
