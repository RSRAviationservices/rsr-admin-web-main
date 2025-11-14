import { GalleryVerticalEnd } from 'lucide-react'

import { LoginForm } from './forms/LoginForm'

import { FooterStrip } from '@/components/common/FooterStrip'

export default function AuthPage() {
  return (
    <div className="bg-stone-50 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex items-center justify-center rounded-lg bg-primary p-3 text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <h1 className="text-xl font-bold">RSR Aviation Admin Panel</h1>
        </div>
        <LoginForm />
      </div>
      <FooterStrip />
    </div>
  )
}
