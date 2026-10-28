import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import { paymentResultResponseSchema } from '../schemas/order'

// Where checkout remembers which payment it sent the customer off to, so the
// result page still works if Paystack returns without the reference.
export const PENDING_PAYMENT_KEY = 'elora-pending-payment'

// Sends the code a mobile money network asked for (OTP / voucher).
export function useSubmitPaymentOtp() {
  return useMutation({
    mutationFn: async (values: { reference: string; otp: string }) => {
      const json = await apiClient.post('/payments/paystack/submit-otp', values)
      return paymentResultResponseSchema.parse(json).data
    },
  })
}

// Asks the backend to check a Paystack payment. The backend confirms with
// Paystack itself; nothing the browser says is trusted.
export function useVerifyPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (reference: string) => {
      const json = await apiClient.post('/payments/paystack/verify', { reference })
      return paymentResultResponseSchema.parse(json).data
    },
    onSuccess: (result) => {
      if (result.status === 'PAID') queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
