import { useState } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Select, Switch, Tag, Popconfirm, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, EditOutlined, DeleteOutlined, TagsOutlined } from '@ant-design/icons'
import { productFormSchema, type Product } from '../../schemas/product'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../../queries/products'
import { useCategories } from '../../queries/categories'
import { zodErrorToFields } from '../../utils/zodToAntdFields'
import VariantsModal from '../../components/admin/VariantsModal'
import MultiImageUpload from '../../components/admin/MultiImageUpload'

export default function AdminProducts() {
  const { data: products = [], isLoading } = useProducts()
  const { data: categories = [] } = useCategories()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form] = Form.useForm()
  const [imageUploading, setImageUploading] = useState(false)

  const [variantsProduct, setVariantsProduct] = useState<Product | null>(null)

  const openAdd = () => {
    setEditing(null)
    form.resetFields()
    setImageUploading(false)
    setModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    form.setFieldsValue({ ...product, imageUrls: product.imageUrls })
    setImageUploading(false)
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    if (imageUploading) {
      message.warning('Please wait for the images to finish uploading')
      return
    }
    const raw = await form.validateFields()
    const result = productFormSchema.safeParse({ ...raw, imageUrls: raw.imageUrls ?? [] })
    if (!result.success) {
      form.setFields(zodErrorToFields(result.error))
      return
    }

    try {
      if (editing) {
        await updateProduct.mutateAsync({ id: editing.id, values: result.data })
        message.success('Product updated')
      } else {
        const created = await createProduct.mutateAsync(result.data)
        message.success('Product added. Add at least one variant to make it live.')
        setVariantsProduct(created)
      }
      setModalOpen(false)
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const columns: ColumnsType<Product> = [
    {
      title: 'Product',
      dataIndex: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          {record.imageUrls[0] && (
            <img src={record.imageUrls[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
          )}
          <span className="font-medium text-neutral-900">{record.name}</span>
        </div>
      ),
    },
    { title: 'Category', render: (_, record) => record.Category?.name ?? '—' },
    { title: 'Price (GHS)', dataIndex: 'basePrice', render: (price: number) => price.toFixed(2) },
    {
      title: 'Status',
      render: (_, record) =>
        record.variantCount === 0 ? (
          <Tag color="orange">Needs a variant</Tag>
        ) : record.isOutOfStock ? (
          <Tag color="red">Out of stock (flagged)</Tag>
        ) : record.totalStock === 0 ? (
          <Tag color="red">Out of stock</Tag>
        ) : (
          <Tag color="green">Live</Tag>
        ),
    },
    { title: 'Slug', dataIndex: 'slug' },
    {
      title: 'Homepage',
      render: (_, record) => (
        <div className="flex flex-wrap gap-1">
          {record.isFeatured && <Tag color="blue">For You</Tag>}
          {record.isBestseller && <Tag color="gold">Bestseller</Tag>}
          {!record.isFeatured && !record.isBestseller && '—'}
        </div>
      ),
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button size="small" icon={<TagsOutlined />} onClick={() => setVariantsProduct(record)}>
            Variants ({record.variantCount})
          </Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete this product?" onConfirm={() => deleteProduct.mutate(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} loading={deleteProduct.isPending} />
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-xl font-semibold text-neutral-900">Products</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAdd}
          className="!border-none !bg-[#b97a8c] hover:!bg-[#a56b7d]"
        >
          Add Product
        </Button>
      </div>

      <Table
        className="mt-6"
        rowKey="id"
        columns={columns}
        dataSource={products}
        loading={isLoading}
        pagination={{ pageSize: 8 }}
        scroll={{ x: true }}
      />

      <Modal
        title={editing ? 'Edit Product' : 'Add Product'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={createProduct.isPending || updateProduct.isPending}
        okButtonProps={{
          className: '!border-none !bg-[#b97a8c] hover:!bg-[#a56b7d]',
          disabled: imageUploading,
        }}
        okText={editing ? 'Save' : 'Add'}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="categoryId" label="Category">
            <Select
              placeholder="Select a category"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>
          <Form.Item name="name" label="Name">
            <Input placeholder="e.g. Body Wave Lace Front Wig" />
          </Form.Item>
          {/* <Form.Item name="slug" label="Slug" extra="Lowercase letters, numbers, and hyphens only">
            <Input placeholder="e.g. body-wave-lace-front-wig" />
          </Form.Item> */}
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="basePrice" label="Base Price (GHS)">
            <InputNumber className="!w-full" min={0} />
          </Form.Item>
          <Form.Item name="imageUrls" label="Images" extra={imageUploading ? 'Uploading images…' : undefined}>
            <MultiImageUpload folder="elora/products" onUploadingChange={setImageUploading} />
          </Form.Item>
          <Form.Item name="isFeatured" label="Show in 'For You'" valuePropName="checked" initialValue={false}>
            <Switch />
          </Form.Item>
          <Form.Item name="isBestseller" label="Show in 'Bestsellers'" valuePropName="checked" initialValue={false}>
            <Switch />
          </Form.Item>
          <Form.Item
            name="isOutOfStock"
            label="Flag as Out of Stock"
            valuePropName="checked"
            initialValue={false}
            extra="Overrides variant stock — customers can't buy this product while it's on, even if variants still show stock."
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <VariantsModal
        open={!!variantsProduct}
        onClose={() => setVariantsProduct(null)}
        productId={variantsProduct?.id ?? null}
        productName={variantsProduct?.name}
      />
    </div>
  )
}
