import { useState } from 'react'
import { Modal, Input, Button, message } from 'antd'
import { CheckCircleFilled } from '@ant-design/icons'
import StarRating from '../common/StarRating'
import type { ReviewFormValues } from '../../schemas/review'

interface WriteReviewModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: ReviewFormValues) => Promise<unknown>
  submitting?: boolean
}

export default function WriteReviewModal({ open, onClose, onSubmit, submitting }: WriteReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const canSubmit = rating > 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    try {
      await onSubmit({ rating, comment: comment.trim() || undefined })
      setSubmitted(true)
      setTimeout(onClose, 1600)
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Could not submit your review')
    }
  }

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={420} destroyOnHidden>
      {submitted ? (
        <div className="flex items-center gap-2 py-2 text-sm text-neutral-800">
          <CheckCircleFilled className="text-lg text-emerald-600" />
          Thank you! Your review has been posted.
        </div>
      ) : (
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Share Your Experience</h2>

          <div className="mt-4">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-neutral-500">Your Rating</p>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>

          <div className="mt-4">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-neutral-500">
              Your Review (optional)
            </p>
            <Input.TextArea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others what you think about this product..."
              rows={4}
            />
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              type="primary"
              size="large"
              disabled={!canSubmit}
              loading={submitting}
              onClick={handleSubmit}
              className={`!rounded-full !border-none ${
                canSubmit ? '!bg-rose-300 hover:!bg-rose-400' : '!bg-rose-100 !text-white/70'
              }`}
            >
              Submit Review
            </Button>
            <Button size="large" onClick={onClose} className="!rounded-full">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
