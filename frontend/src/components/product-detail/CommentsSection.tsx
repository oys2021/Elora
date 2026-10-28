import { useState } from 'react'
import { Button, Input, message } from 'antd'
import { useAuth } from '../../context/AuthContext'
import { useComments, useCreateComment } from '../../queries/comments'
import AuthModal from '../layout/AuthModal'
import ShowMore from '../common/ShowMore'

export default function CommentsSection({ productId }: { productId: string }) {
  const { user } = useAuth()
  const pages = useComments(productId)
  const comments = pages.data?.pages.flatMap((p) => p.data) ?? []
  const totalComments = pages.data?.pages[0]?.meta?.total ?? comments.length
  const isLoading = pages.isLoading
  const createComment = useCreateComment(productId)

  const [body, setBody] = useState('')
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const handleSubmit = async () => {
    if (!user) {
      setAuthModalOpen(true)
      return
    }
    if (!body.trim()) return
    try {
      await createComment.mutateAsync({ body: body.trim() })
      setBody('')
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Could not post your comment')
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h2 className="mb-6 text-lg font-semibold text-neutral-900">Questions &amp; Comments</h2>

      <div className="flex gap-3">
        <Input.TextArea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onClick={() => !user && setAuthModalOpen(true)}
          placeholder={user ? 'Ask a question or leave a comment...' : 'Sign in to leave a comment'}
          rows={2}
          className="flex-1"
        />
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={createComment.isPending}
          className="!self-end !rounded-full !border-none !bg-rose-300 hover:!bg-rose-400"
        >
          Post
        </Button>
      </div>

      <div className="mt-6 divide-y divide-neutral-100">
        {!isLoading && comments.length === 0 && (
          <p className="py-4 text-sm text-neutral-500">No comments yet.</p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-600">
                {(comment.User?.name ?? '?').charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">{comment.User?.name ?? 'Anonymous'}</p>
                {comment.createdAt && (
                  <p className="text-xs text-neutral-400">
                    {new Date(comment.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-neutral-700">{comment.body}</p>
          </div>
        ))}
      </div>

      {comments.length > 0 && (
        <ShowMore
          shown={comments.length}
          total={totalComments}
          noun="comments"
          hasMore={!!pages.hasNextPage}
          loading={pages.isFetchingNextPage}
          onClick={() => pages.fetchNextPage()}
        />
      )}

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </section>
  )
}
