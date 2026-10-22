import type { ZodError } from 'zod'

export function zodErrorToFields(error: ZodError) {
  return error.issues.map((issue) => ({
    name: issue.path,
    errors: [issue.message],
  }))
}
