import { useState } from 'react'
import { Button } from 'antd'
import { useAuth } from '../../context/AuthContext'
import { useReviews, useCreateReview } from '../../queries/reviews'
import type { ReviewFormValues } from '../../schemas/review'
import StarRating from '../common/StarRating'
import WriteReviewModal from './WriteReviewModal'
import AuthModal from '../layout/AuthModal'

export default function ReviewsSection({ productId }: { productId: string }) {
  const { user } = useAuth()
  const { data, isLoading } = useReviews(productId)
  const createReview = useCreateReview(productId)

  const [modalOpen, setModalOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const reviews = data?.reviews ?? []
  const averageRating = data?.averageRating ?? 0
  const reviewCount = data?.reviewCount ?? 0

  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }))
  const totalForBreakdown = reviewCount || 1

  const handleWriteReviewClick = () => {
    if (!user) {
      setAuthModalOpen(true)
      return
    }
    setModalOpen(true)
  }

  const handleSubmitReview = (values: ReviewFormValues) => createReview.mutateAsync(values)

  return (
    <section id="reviews" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Customer Reviews</h2>
        <Button className="!rounded-full" onClick={handleWriteReviewClick}>
          Write a Review
        </Button>
      </div>

      {reviewCount > 0 ? (
        <div className="flex flex-col gap-8 rounded-xl bg-neutral-50 p-6 sm:flex-row sm:items-center">
          <div className="flex shrink-0 flex-col items-center gap-1 sm:w-40">
            <span className="text-4xl font-semibold text-neutral-900">{averageRating.toFixed(1)}</span>
            <StarRating value={averageRating} />
            <span className="text-xs text-neutral-500">
              {reviewCount} verified review{reviewCount === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex-1 space-y-1.5">
            {ratingBreakdown.map((row) => (
              <div key={row.stars} className="flex items-center gap-2 text-xs text-neutral-600">
                <span className="w-8 shrink-0">{row.stars}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${(row.count / totalForBreakdown) * 100}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-neutral-400">{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        !isLoading && (
          <p className="text-sm text-neutral-500">No reviews yet — be the first to review this product.</p>
        )
      )}

      <div className="mt-8 divide-y divide-neutral-100">
        {reviews.map((review) => (
          <div key={review.id} className="py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-sm font-medium text-neutral-600">
                {(review.User?.name ?? '?').charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">{review.User?.name ?? 'Anonymous'}</p>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <StarRating value={review.rating} />
                  {review.createdAt && (
                    <span>
                      {new Date(review.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {review.comment && <p className="mt-2 text-sm text-neutral-700">{review.comment}</p>}
          </div>
        ))}
      </div>

      <WriteReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitReview}
        submitting={createReview.isPending}
      />
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </section>
  )
}
