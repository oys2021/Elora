import { useState } from 'react'
import { message } from 'antd'
import { HeartOutlined, HeartFilled } from '@ant-design/icons'
import { useAuth } from '../../context/AuthContext'
import { useFavorites, useAddFavorite, useRemoveFavorite } from '../../queries/favorites'
import AuthModal from '../layout/AuthModal'

interface FavoriteButtonProps {
  productId: string
  className?: string
}

export default function FavoriteButton({ productId, className }: FavoriteButtonProps) {
  const { user } = useAuth()
  const { data: favorites = [] } = useFavorites({ enabled: !!user })
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const isFavorited = favorites.some((f) => f.productId === productId)
  const isPending = addFavorite.isPending || removeFavorite.isPending

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      setAuthModalOpen(true)
      return
    }

    const mutation = isFavorited ? removeFavorite : addFavorite
    mutation.mutate(productId, {
      onError: (err) => message.error(err instanceof Error ? err.message : 'Something went wrong'),
    })
  }

  return (
    <>
      <button
        type="button"
        aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        onClick={handleClick}
        disabled={isPending}
        className={className}
      >
        {isFavorited ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
      </button>
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}
