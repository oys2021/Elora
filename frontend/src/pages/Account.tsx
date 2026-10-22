import { Avatar, Button } from 'antd'
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import FloatingActions from '../components/common/FloatingActions'

const addresses = [
  { label: 'Home', detail: '14 Street, Dome Pillar 2, Accra, Ghana' },
  { label: 'Work', detail: '3rd Floor, Silver Star Tower, Airport City, Accra' },
]

export default function Account() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex items-center gap-4">
          <Avatar size={64} icon={<UserOutlined />} className="!bg-neutral-900" />
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Ama Owusu</h1>
            <p className="text-sm text-neutral-500">Member since March 2026</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-neutral-200 p-5">
          <h2 className="mb-4 text-sm font-semibold text-neutral-900">Personal Information</h2>
          <div className="space-y-3 text-sm text-neutral-700">
            <div className="flex items-center gap-2">
              <UserOutlined className="text-neutral-400" />
              <span>Ama Owusu</span>
            </div>
            <div className="flex items-center gap-2">
              <MailOutlined className="text-neutral-400" />
              <span>ama.owusu@example.com</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneOutlined className="text-neutral-400" />
              <span>+233 24 123 4567</span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-neutral-200 p-5">
          <h2 className="mb-4 text-sm font-semibold text-neutral-900">Saved Addresses</h2>
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address.label} className="flex items-start gap-2 text-sm text-neutral-700">
                <EnvironmentOutlined className="mt-0.5 text-neutral-400" />
                <div>
                  <p className="font-medium text-neutral-900">{address.label}</p>
                  <p className="text-neutral-500">{address.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button size="large" className="!mt-8 !rounded-full">
          Sign Out
        </Button>
      </main>

      <Footer />
      <FloatingActions />
    </div>
  )
}
