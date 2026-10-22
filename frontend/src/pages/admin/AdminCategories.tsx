import { useState } from 'react'
import { Table, Button, Modal, Form, Input, Popconfirm, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { categoryFormSchema, type Category } from '../../schemas/category'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../queries/categories'
import { zodErrorToFields } from '../../utils/zodToAntdFields'
import ImageUpload from '../../components/admin/ImageUpload'

export default function AdminCategories() {
  const { data: categories = [], isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form] = Form.useForm()
  const [imageUploading, setImageUploading] = useState(false)

  const openAdd = () => {
    setEditing(null)
    form.resetFields()
    setImageUploading(false)
    setModalOpen(true)
  }

  const openEdit = (category: Category) => {
    setEditing(category)
    form.setFieldsValue(category)
    setImageUploading(false)
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    if (imageUploading) {
      message.warning('Please wait for the image to finish uploading')
      return
    }
    const raw = await form.validateFields()
    const result = categoryFormSchema.safeParse(raw)
    if (!result.success) {
      form.setFields(zodErrorToFields(result.error))
      return
    }

    const values = { ...result.data, imageUrl: result.data.imageUrl || undefined }

    try {
      if (editing) {
        await updateCategory.mutateAsync({ id: editing.id, values })
        message.success('Category updated')
      } else {
        await createCategory.mutateAsync(values)
        message.success('Category added')
      }
      setModalOpen(false)
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const columns: ColumnsType<Category> = [
    {
      title: 'Category',
      dataIndex: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          {record.imageUrl && (
            <img src={record.imageUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
          )}
          <span className="font-medium text-neutral-900">{record.name}</span>
        </div>
      ),
    },
    { title: 'Slug', dataIndex: 'slug' },
    {
      title: 'Actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete this category?" onConfirm={() => deleteCategory.mutate(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} loading={deleteCategory.isPending} />
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Categories</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAdd}
          className="!border-none !bg-[#b97a8c] hover:!bg-[#a56b7d]"
        >
          Add Category
        </Button>
      </div>

      <Table
        className="mt-6"
        rowKey="id"
        columns={columns}
        dataSource={categories}
        loading={isLoading}
        pagination={false}
      />

      <Modal
        title={editing ? 'Edit Category' : 'Add Category'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={createCategory.isPending || updateCategory.isPending}
        okButtonProps={{
          className: '!border-none !bg-[#b97a8c] hover:!bg-[#a56b7d]',
          disabled: imageUploading,
        }}
        okText={editing ? 'Save' : 'Add'}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name">
            <Input placeholder="e.g. Wigs" />
          </Form.Item>
          {/* <Form.Item name="slug" label="Slug" extra="Lowercase letters, numbers, and hyphens only">
            <Input placeholder="e.g. wigs" />
          </Form.Item> */}
          <Form.Item name="imageUrl" label="Image" extra={imageUploading ? 'Uploading image…' : undefined}>
            <ImageUpload folder="elora/categories" onUploadingChange={setImageUploading} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
