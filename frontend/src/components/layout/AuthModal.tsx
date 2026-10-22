import { useState } from 'react'
import { Modal, Button, Tabs, Form, Input, Alert, message } from 'antd'
import { UserOutlined, MailOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useAuth, AuthError } from '../../context/AuthContext'
import { loginFormSchema, registerFormSchema, forgotPasswordFormSchema } from '../../schemas/auth'
import { zodErrorToFields } from '../../utils/zodToAntdFields'

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

const primaryButton = '!border-none !bg-[#b97a8c] hover:!bg-[#a56b7d]'

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { login, register, forgotPassword } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [showForgot, setShowForgot] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [loginForm] = Form.useForm()
  const [registerForm] = Form.useForm()
  const [forgotForm] = Form.useForm()

  const close = () => {
    setFormError(null)
    setShowForgot(false)
    setForgotSent(false)
    loginForm.resetFields()
    registerForm.resetFields()
    forgotForm.resetFields()
    onClose()
  }

  const handleServerError = (err: unknown, form: typeof loginForm) => {
    if (err instanceof AuthError) {
      if (err.fields) {
        form.setFields(Object.entries(err.fields).map(([name, msg]) => ({ name, errors: [msg] })))
      }
      // Wrong password, rate limit, etc. have no field to attach to.
      if (!err.fields || err.code !== 'VALIDATION_ERROR') setFormError(err.message)
    } else {
      setFormError('Could not reach the server. Please try again.')
    }
  }

  const handleLogin = async () => {
    setFormError(null)
    const result = loginFormSchema.safeParse(loginForm.getFieldsValue())
    if (!result.success) {
      loginForm.setFields(zodErrorToFields(result.error))
      return
    }
    setSubmitting(true)
    try {
      await login(result.data)
      message.success('Welcome back')
      close()
    } catch (err) {
      handleServerError(err, loginForm)
    } finally {
      setSubmitting(false)
    }
  }

  const handleForgotPassword = async () => {
    setFormError(null)
    const result = forgotPasswordFormSchema.safeParse(forgotForm.getFieldsValue())
    if (!result.success) {
      forgotForm.setFields(zodErrorToFields(result.error))
      return
    }
    setSubmitting(true)
    try {
      await forgotPassword(result.data.email)
      // Same outcome whether or not the email is registered — see AuthContext.
      setForgotSent(true)
    } catch (err) {
      handleServerError(err, forgotForm)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async () => {
    setFormError(null)
    const result = registerFormSchema.safeParse(registerForm.getFieldsValue())
    if (!result.success) {
      registerForm.setFields(zodErrorToFields(result.error))
      return
    }
    const { confirmPassword: _confirm, ...values } = result.data
    setSubmitting(true)
    try {
      await register(values)
      message.success('Account created. Welcome to Elora!')
      close()
    } catch (err) {
      handleServerError(err, registerForm)
    } finally {
      setSubmitting(false)
    }
  }

  if (showForgot) {
    return (
      <Modal open={open} onCancel={close} footer={null} centered width={400} destroyOnHidden>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              setShowForgot(false)
              setForgotSent(false)
              setFormError(null)
            }}
            className="mb-3 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900"
          >
            <ArrowLeftOutlined className="text-[10px]" />
            Back to log in
          </button>

          <h2 className="text-center text-xl font-semibold text-neutral-900">Reset your password</h2>

          {forgotSent ? (
            <div className="mt-4 text-center text-sm text-neutral-600">
              <p>
                If an account exists for that email, we've sent a link to reset the password. The link expires in 1
                hour.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 mt-1 text-center text-sm text-neutral-500">
                Enter your account's email and we'll send a link to reset your password.
              </p>
              <Form form={forgotForm} layout="vertical" onFinish={handleForgotPassword} requiredMark={false}>
                <Form.Item name="email" label="Email">
                  <Input prefix={<MailOutlined />} autoComplete="email" placeholder="you@email.com" />
                </Form.Item>
                {formError && <Alert type="error" showIcon message={formError} className="mb-4" />}
                <Button block size="large" type="primary" htmlType="submit" loading={submitting} className={primaryButton}>
                  Send reset link
                </Button>
              </Form>
            </>
          )}
        </div>
      </Modal>
    )
  }

  return (
    <Modal open={open} onCancel={close} footer={null} centered width={400} destroyOnHidden>
      <div className="pt-2">
        <h2 className="text-center text-xl font-semibold text-neutral-900">Welcome to Elora</h2>
        <p className="mb-2 mt-1 text-center text-sm text-neutral-500">
          Log in or sign up to track orders and save favourites
        </p>

        <Tabs
          centered
          activeKey={tab}
          onChange={(key) => {
            setTab(key as 'login' | 'register')
            setFormError(null)
          }}
          items={[
            {
              key: 'login',
              label: 'Log in',
              children: (
                <Form form={loginForm} layout="vertical" onFinish={handleLogin} requiredMark={false}>
                  <Form.Item name="identifier" label="Username or email">
                    <Input prefix={<UserOutlined />} autoComplete="username" placeholder="yourname or you@email.com" />
                  </Form.Item>
                  <Form.Item name="password" label="Password">
                    <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
                  </Form.Item>
                  <button
                    type="button"
                    onClick={() => {
                      setFormError(null)
                      setShowForgot(true)
                    }}
                    className="-mt-3 mb-4 block text-xs text-neutral-500 underline hover:text-neutral-900"
                  >
                    Forgot password?
                  </button>
                  {formError && tab === 'login' && <Alert type="error" showIcon message={formError} className="mb-4" />}
                  <Button block size="large" type="primary" htmlType="submit" loading={submitting} className={primaryButton}>
                    Log in
                  </Button>
                </Form>
              ),
            },
            {
              key: 'register',
              label: 'Sign up',
              children: (
                <Form form={registerForm} layout="vertical" onFinish={handleRegister} requiredMark={false}>
                  <Form.Item name="username" label="Username">
                    <Input prefix={<UserOutlined />} autoComplete="username" placeholder="e.g. ama_k" />
                  </Form.Item>
                  <Form.Item name="email" label="Email">
                    <Input prefix={<MailOutlined />} autoComplete="email" placeholder="you@email.com" />
                  </Form.Item>
                  <Form.Item name="password" label="Password" extra="At least 8 characters">
                    <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
                  </Form.Item>
                  <Form.Item name="confirmPassword" label="Confirm password">
                    <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
                  </Form.Item>
                  {formError && tab === 'register' && (
                    <Alert type="error" showIcon message={formError} className="mb-4" />
                  )}
                  <Button block size="large" type="primary" htmlType="submit" loading={submitting} className={primaryButton}>
                    Create account
                  </Button>
                </Form>
              ),
            },
          ]}
        />
      </div>
    </Modal>
  )
}
