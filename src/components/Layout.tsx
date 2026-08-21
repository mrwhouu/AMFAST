import type { ReactNode } from 'react'
import { TopBar } from './TopBar'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="mx-auto max-w-[1320px] px-6 pb-20">{children}</div>
    </div>
  )
}
