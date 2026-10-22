import { useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { Form, Input, Button, Alert } from 'antd'
import { LockOutlined, CheckOutlined } from '@ant-design/icons'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import FloatingActions from '../components/common/FloatingActions'
import { useAuth, AuthError } from '../context/AuthContext'
import { resetPasswordFormSchema } from '../schemas/auth'
import { zodErrorToFields } from '../utils/zodToAntdFields'

// Reached from the link in the (currently dummy/console-logged) password
// reset email — see backend/src/services/dummyEmail.service.js. The token
// lives in the URL's query string: /reset-password?token=...
export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const navigate = useNavigate()
  const { resetPassword } = useAuth()

  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    if (!token) return
    setFormError(null)
    const result = resetPasswordFormSchema.safeParse(form.getFieldsValue())
    if (!result.success) {
      form.setFields(zodErrorToFields(result.error))
      return
    }
    setSubmitting(true)
    try {
      await resetPassword({ token, password: result.data.password })
      setDone(true)
    } catch (err) {
      setFormError(
        err instanceof AuthError ? err.message : 'Could not reach the server. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        {!token ? (
          <div className="text-center">
            <h1 className="text-xl font-semibold text-neutral-900">Invalid reset link</h1>
            <p className="mt-2 text-sm text-neutral-500">
              This link is missing its reset code. Request a new one from the sign-in menu.
            </p>
            <Link to="/" className="mt-6 inline-block rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800">
              Back to Home
            </Link>
          </div>
        ) : done ? (
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-white">
              <CheckOutlined className="text-xl" />
            </div>
            <h1 className="mt-4 text-xl font-semibold text-neutral-900">Password changed</h1>
            <p className="mt-2 text-sm text-neutral-500">You're signed in with your new password.</p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-6 rounded-full bg-[#b97a8c] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#a56b7d]"
            >
              Continue to Elora
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-center text-xl font-semibold text-neutral-900">Set a new password</h1>
            <p className="mb-6 mt-1 text-center text-sm text-neutral-500">
              Choose a new password for your account.
            </p>
            <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
              <Form.Item name="password" label="New password" extra="At least 8 characters">
                <Input.Password prefix={<LockOutlined />} autoComplete="new-password" size="large" />
              </Form.Item>
              <Form.Item name="confirmPassword" label="Confirm new password">
                <Input.Password prefix={<LockOutlined />} autoComplete="new-password" size="large" />
              </Form.Item>
              {formError && <Alert type="error" showIcon message={formError} className="mb-4" />}
              <Button
                block
                size="large"
                type="primary"
                htmlType="submit"
                loading={submitting}
                className="!border-none !bg-[#b97a8c] hover:!bg-[#a56b7d]"
              >
                Reset password
              </Button>
            </Form>
          </>
        )}
      </main>

      <Footer />
      <FloatingActions />
    </div>
  )
}
