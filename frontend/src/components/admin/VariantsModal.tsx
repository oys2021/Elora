import { useState } from 'react'
import { Modal, Table, Button, Form, Input, InputNumber, Select, Popconfirm, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { productVariantFormSchema, type ProductVariant } from '../../schemas/productVariant'
import {
  useProductVariants,
  useCreateProductVariant,
  useUpdateProductVariant,
  useDeleteProductVariant,
} from '../../queries/productVariants'
import { zodErrorToFields } from '../../utils/zodToAntdFields'
import { HAIR_COLORS } from '../../utils/hairColors'
import ColorSwatch from '../common/ColorSwatch'

interface VariantsModalProps {
  open: boolean
  onClose: () => void
  productId: string | null
  productName?: string
}

export default function VariantsModal({ open, onClose, productId, productName }: VariantsModalProps) {
  const { data: variants = [], isLoading } = useProductVariants(productId ?? undefined)
  const createVariant = useCreateProductVariant()
  const updateVariant = useUpdateProductVariant()
  const deleteVariant = useDeleteProductVariant()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ProductVariant | null>(null)
  const [form] = Form.useForm()

  const openAdd = () => {
    setEditing(null)
    form.resetFields()
    setFormOpen(true)
  }

  const openEdit = (variant: ProductVariant) => {
    setEditing(variant)
    form.setFieldsValue(variant)
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!productId) return
    const raw = await form.validateFields()
    const result = productVariantFormSchema.safeParse({ ...raw, productId })
    if (!result.success) {
      form.setFields(zodErrorToFields(result.error))
      return
    }

    try {
      if (editing) {
        await updateVariant.mutateAsync({ id: editing.id, values: result.data })
        message.success('Variant updated')
      } else {
        await createVariant.mutateAsync(result.data)
        message.success('Variant added')
      }
      setFormOpen(false)
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const columns: ColumnsType<ProductVariant> = [
    { title: 'SKU', dataIndex: 'sku' },
    { title: 'Length', render: (_, record) => record.lengthOption ?? '—' },
    { title: 'Density', render: (_, record) => record.densityOption ?? '—' },
    {
      title: 'Colour',
      render: (_, record) => (record.colorOption ? <ColorSwatch name={record.colorOption} /> : '—'),
    },
    { title: 'Stock', dataIndex: 'stockQuantity' },
    { title: 'Price (GHS)', dataIndex: 'price', render: (price: number) => price.toFixed(2) },
    {
      title: 'Actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm
            title="Delete this variant?"
            onConfirm={() => deleteVariant.mutate({ id: record.id, productId: record.productId })}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <>
      <Modal title={`Variants — ${productName ?? ''}`} open={open} onCancel={onClose} footer={null} width={800}>
        <div className="mb-4 flex justify-end">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAdd}
            className="!border-none !bg-[#b97a8c] hover:!bg-[#a56b7d]"
          >
            Add Variant
          </Button>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={variants}
          loading={isLoading}
          pagination={false}
          scroll={{ x: true }}
        />
      </Modal>

      <Modal
        title={editing ? 'Edit Variant' : 'Add Variant'}
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onOk={handleSubmit}
        confirmLoading={createVariant.isPending || updateVariant.isPending}
        okText={editing ? 'Save' : 'Add'}
        okButtonProps={{ className: '!border-none !bg-[#b97a8c] hover:!bg-[#a56b7d]' }}
      >
        <Form form={form} layout="vertical">
          {editing && (
            <p className="mb-4 text-sm text-gray-500">
              SKU: <span className="font-medium text-gray-700">{editing.sku}</span> (auto-generated)
            </p>
          )}
          <Form.Item name="price" label="Price (GHS)">
            <InputNumber className="!w-full" min={0} />
          </Form.Item>
          <Form.Item name="lengthOption" label="Length">
            <Input placeholder="e.g. 16 Inch" />
          </Form.Item>
          <Form.Item name="densityOption" label="Density">
            <Input placeholder="e.g. 250 Density 13x4" />
          </Form.Item>
          <Form.Item name="colorOption" label="Colour">
            <Select
              allowClear
              showSearch
              placeholder="Select a colour"
              optionFilterProp="value"
              options={[
                // Keep an old free-text colour selectable while editing.
                ...(editing?.colorOption && !HAIR_COLORS.some((c) => c.name === editing.colorOption)
                  ? [{ value: editing.colorOption, label: <ColorSwatch name={editing.colorOption} /> }]
                  : []),
                ...HAIR_COLORS.map((c) => ({
                  value: c.name,
                  label: <ColorSwatch name={c.name} hex={c.hex} />,
                })),
              ]}
            />
          </Form.Item>
          <Form.Item name="stockQuantity" label="Stock Quantity" initialValue={0}>
            <InputNumber className="!w-full" min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
