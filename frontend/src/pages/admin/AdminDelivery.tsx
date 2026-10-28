import { useState } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Select, Switch, Popconfirm, Alert, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { zodErrorToFields } from '../../utils/zodToAntdFields'
import {
  deliveryZoneFormSchema,
  deliveryModeValues,
  deliveryModeLabels,
  type DeliveryZone,
} from '../../schemas/deliveryZone'
import {
  useDeliveryZones,
  useCreateDeliveryZone,
  useUpdateDeliveryZone,
  useDeleteDeliveryZone,
} from '../../queries/deliveryZones'

export default function AdminDelivery() {
  const { data: zones = [], isLoading } = useDeliveryZones({ all: true })
  const createZone = useCreateDeliveryZone()
  const updateZone = useUpdateDeliveryZone()
  const deleteZone = useDeleteDeliveryZone()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<DeliveryZone | null>(null)
  const [form] = Form.useForm()

  const openAdd = () => {
    setEditing(null)
    form.resetFields()
    setFormOpen(true)
  }

  const openEdit = (zone: DeliveryZone) => {
    setEditing(zone)
    form.setFieldsValue(zone)
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    const raw = await form.validateFields()
    const result = deliveryZoneFormSchema.safeParse(raw)
    if (!result.success) {
      form.setFields(zodErrorToFields(result.error))
      return
    }

    try {
      if (editing) {
        await updateZone.mutateAsync({ id: editing.id, values: result.data })
        message.success('Delivery rate updated')
      } else {
        await createZone.mutateAsync(result.data)
        message.success('Delivery location added')
      }
      setFormOpen(false)
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const columns: ColumnsType<DeliveryZone> = [
    { title: 'Location', dataIndex: 'location' },
    { title: 'First Kg (GHS)', render: (_, record) => record.firstKgPrice.toFixed(2) },
    { title: 'Extra Kg (GHS)', render: (_, record) => record.extraKgPrice.toFixed(2) },
    { title: 'Delivery Duration', dataIndex: 'deliveryDuration' },
    { title: 'Delivery Mode', render: (_, record) => deliveryModeLabels[record.deliveryMode] },
    {
      title: 'Active',
      render: (_, record) => (
        <Switch
          checked={record.isActive}
          onChange={(isActive) =>
            updateZone.mutate(
              { id: record.id, values: { isActive } },
              { onError: () => message.error('Could not update this location') },
            )
          }
        />
      ),
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm
            title="Delete this delivery location?"
            onConfirm={() =>
              deleteZone.mutate(record.id, { onError: () => message.error('Could not delete this location') })
            }
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-xl font-semibold text-neutral-900">Delivery Rates</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAdd}
          className="!border-none !bg-[#b97a8c] hover:!bg-[#a56b7d]"
        >
          Add Location
        </Button>
      </div>

      <Alert
        className="mt-4"
        type="info"
        showIcon
        message="This is the delivery fee rate card customers see at checkout."
        description={
          <ul className="m-0 list-disc pl-5">
            <li>Customers choosing "Delivery" pick one of these locations, and the First Kg price is added to their order total.</li>
            <li>Turn off "Active" to hide a location from checkout without deleting it.</li>
            <li>Choosing "Pick Up" at checkout skips delivery fees entirely.</li>
          </ul>
        }
      />

      <Table
        className="mt-6"
        rowKey="id"
        columns={columns}
        dataSource={zones}
        loading={isLoading}
        pagination={false}
        scroll={{ x: true }}
        locale={{ emptyText: 'No delivery locations yet.' }}
      />

      <Modal
        title={editing ? 'Edit Delivery Location' : 'Add Delivery Location'}
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onOk={handleSubmit}
        confirmLoading={createZone.isPending || updateZone.isPending}
        okText={editing ? 'Save' : 'Add'}
        okButtonProps={{ className: '!border-none !bg-[#b97a8c] hover:!bg-[#a56b7d]' }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="location" label="Location" rules={[{ required: true }]}>
            <Input placeholder="e.g. Accra, Tema" />
          </Form.Item>
          <Form.Item name="firstKgPrice" label="First Kg Price (GHS)" rules={[{ required: true }]}>
            <InputNumber className="!w-full" min={0} />
          </Form.Item>
          <Form.Item name="extraKgPrice" label="Extra Kg Price (GHS)" initialValue={0}>
            <InputNumber className="!w-full" min={0} />
          </Form.Item>
          <Form.Item name="deliveryDuration" label="Delivery Duration" rules={[{ required: true }]}>
            <Input placeholder="e.g. Next Day, 48 Hours, Thursdays" />
          </Form.Item>
          <Form.Item name="deliveryMode" label="Delivery Mode" initialValue="DOOR_TO_DOOR">
            <Select options={deliveryModeValues.map((mode) => ({ value: mode, label: deliveryModeLabels[mode] }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
