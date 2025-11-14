import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { useLoginMutation } from '@/api/queries/auth.query'

const loginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().min(1, { message: 'Password is required.' })
})

export type LoginFormValues = z.infer<typeof loginSchema>

export function useLoginForm() {
  const loginMutation = useLoginMutation()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' }
  })

  function onSubmit(values: LoginFormValues) {
    loginMutation.mutate(values)
  }

  return {
    form,
    onSubmit,
    isPending: loginMutation.isPending
  }
}
