import { useState } from 'react'
import { Table, Button, Upload, Switch, Input, Popconfirm, Alert, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  UploadOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import { uploadImage } from '../../api/upload'
import { imageSizeError, splitBySize } from '../../utils/imageValidation'
import { BANNER_LINK_MESSAGE, isValidBannerLink, type Banner } from '../../schemas/banner'
import {
  useBanners,
  useCreateBanner,
  useUpdateBanner,
  useReorderBanners,
  useDeleteBanner,
} from '../../queries/banners'

const FOLDER = 'elora/banners'

// Saves when the admin leaves the field, and puts the old value back if the
// link is rejected. The key changes after a save so the field re-reads the row.
function LinkCell({ banner, onSave }: { banner: Banner; onSave: (link: string) => Promise<void> }) {
  const [version, setVersion] = useState(0)

  const commit = async (raw: string) => {
    const value = raw.trim()
    if (value === (banner.linkUrl ?? '')) return
    if (!isValidBannerLink(value)) {
      message.error(BANNER_LINK_MESSAGE)
      setVersion((v) => v + 1)
      return
    }
    try {
      await onSave(value)
      message.success('Link saved')
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Could not save the link')
    } finally {
      setVersion((v) => v + 1)
    }
  }

  return (
    <Input
      key={`${banner.id}-${banner.updatedAt}-${version}`}
      defaultValue={banner.linkUrl ?? ''}
      placeholder="Optional, e.g. /products"
      onBlur={(e) => commit(e.target.value)}
      onPressEnter={(e) => e.currentTarget.blur()}
    />
  )
}

export default function AdminBanners() {
  const { data: banners = [], isLoading } = useBanners({ all: true })
  const createBanner = useCreateBanner()
  const updateBanner = useUpdateBanner()
  const reorderBanners = useReorderBanners()
  const deleteBanner = useDeleteBanner()

  const [uploadingCount, setUploadingCount] = useState(0)
  const [replacingId, setReplacingId] = useState<string | null>(null)

  // Upload every chosen image (in parallel), then create one banner per image
  // one after another, so they land in the order they were selected.
  const addBanners = async (files: File[]) => {
    const { ok: sized, errors: sizeErrors } = splitBySize(files)
    sizeErrors.forEach((error) => message.error(error))
    if (!sized.length) return

    setUploadingCount(sized.length)
    try {
      const results = await Promise.allSettled(sized.map((file) => uploadImage(file, FOLDER)))
      let added = 0
      for (const result of results) {
        if (result.status !== 'fulfilled') continue
        await createBanner.mutateAsync({ imageUrl: result.value })
        added += 1
      }
      const failed = results.length - added
      if (added) message.success(`${added} banner${added === 1 ? '' : 's'} added`)
      if (failed) message.error(`${failed} image${failed === 1 ? '' : 's'} failed to upload`)
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Could not add the banners')
    } finally {
      setUploadingCount(0)
    }
  }

  const replaceImage = async (banner: Banner, file: File) => {
    const error = imageSizeError(file)
    if (error) {
      message.error(error)
      return
    }
    setReplacingId(banner.id)
    try {
      const imageUrl = await uploadImage(file, FOLDER)
      await updateBanner.mutateAsync({ id: banner.id, values: { imageUrl } })
      message.success('Banner image changed')
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Could not change the image')
    } finally {
      setReplacingId(null)
    }
  }

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= banners.length) return
    const ids = banners.map((b) => b.id)
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    reorderBanners.mutate(ids, { onError: () => message.error('Could not reorder the banners') })
  }

  const columns: ColumnsType<Banner> = [
    {
      title: 'Order',
      width: 90,
      render: (_, __, index) => (
        <div className="flex items-center gap-1">
          <span className="w-4 text-sm text-neutral-500">{index + 1}</span>
          <Button
            size="small"
            aria-label="Move up"
            icon={<ArrowUpOutlined />}
            disabled={index === 0 || reorderBanners.isPending}
            onClick={() => move(index, -1)}
          />
          <Button
            size="small"
            aria-label="Move down"
            icon={<ArrowDownOutlined />}
            disabled={index === banners.length - 1 || reorderBanners.isPending}
            onClick={() => move(index, 1)}
          />
        </div>
      ),
    },
    {
      title: 'Banner',
      render: (_, record) => (
        <img
          src={record.imageUrl}
          alt=""
          className={`h-16 w-40 rounded-lg object-cover ${record.isActive ? '' : 'opacity-40'}`}
        />
      ),
    },
    {
      title: 'Link (where it goes when clicked)',
      width: 260,
      render: (_, record) => (
        <LinkCell
          banner={record}
          onSave={async (linkUrl) => {
            await updateBanner.mutateAsync({ id: record.id, values: { linkUrl } })
          }}
        />
      ),
    },
    {
      title: 'Shown',
      width: 90,
      render: (_, record) => (
        <Switch
          checked={record.isActive}
          onChange={(isActive) =>
            updateBanner.mutate(
              { id: record.id, values: { isActive } },
              { onError: () => message.error('Could not update the banner') },
            )
          }
        />
      ),
    },
    {
      title: 'Actions',
      width: 220,
      render: (_, record) => (
        <div className="flex gap-2">
          <Upload
            showUploadList={false}
            accept="image/*"
            beforeUpload={(file) => {
              void replaceImage(record, file)
              return false
            }}
          >
            <Button size="small" icon={<SwapOutlined />} loading={replacingId === record.id}>
              Change image
            </Button>
          </Upload>
          <Popconfirm
            title="Delete this banner?"
            onConfirm={() =>
              deleteBanner.mutate(record.id, { onError: () => message.error('Could not delete the banner') })
            }
          >
            <Button size="small" danger icon={<DeleteOutlined />} aria-label="Delete banner" />
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-xl font-semibold text-neutral-900">Homepage Banners</h1>
        <Upload
          showUploadList={false}
          accept="image/*"
          multiple
          disabled={uploadingCount > 0}
          beforeUpload={(file, fileList) => {
            // antd calls this once per file; handle the whole selection on the first call.
            if (file === fileList[0]) void addBanners(fileList as unknown as File[])
            return false
          }}
        >
          <Button
            type="primary"
            icon={<UploadOutlined />}
            loading={uploadingCount > 0}
            className="!border-none !bg-[#b97a8c] hover:!bg-[#a56b7d]"
          >
            {uploadingCount > 0 ? `Uploading ${uploadingCount}…` : 'Add Banners'}
          </Button>
        </Upload>
      </div>

      <Alert
        className="mt-4"
        type="info"
        showIcon
        message="These are the slides at the top of the home page."
        description={
          <ul className="m-0 list-disc pl-5">
            <li>They rotate every 5 seconds, in the order shown here. Use the arrows to reorder.</li>
            <li>
              Use wide images, about <strong>1920 × 700 px</strong> (JPG or WebP, under 500 KB). Keep the important
              part of the picture in the middle, because the edges are cropped on small screens.
            </li>
            <li>Turn off "Shown" to hide a banner without deleting it.</li>
            <li>If there are no banners here, the site's default slides are shown instead.</li>
          </ul>
        }
      />

      <Table
        className="mt-6"
        rowKey="id"
        columns={columns}
        dataSource={banners}
        loading={isLoading}
        pagination={false}
        scroll={{ x: true }}
        locale={{ emptyText: 'No banners yet. The default slides are being shown on the home page.' }}
      />
    </div>
  )
}
