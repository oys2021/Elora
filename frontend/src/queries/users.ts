import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import { adminUserListResponseSchema } from '../schemas/user'

interface UsersFilter {
  search?: string
  page?: number
  limit?: number
}

export function useUsers({ search, page = 1, limit = 10 }: UsersFilter = {}) {
  return useQuery({
    queryKey: ['users', { search, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (search) params.set('search', search)
      const json = await apiClient.get(`/users?${params.toString()}`)
      return adminUserListResponseSchema.parse(json)
    },
    select: (parsed) => ({ users: parsed.data, meta: parsed.meta }),
    // Keep the old rows on screen while the next page or search loads.
    placeholderData: keepPreviousData,
  })
}
