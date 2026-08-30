import type { ReactNode } from 'react'
import { TopBar } from './TopBar'
import { HelpAssistant } from './HelpAssistant'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="mx-auto max-w-[1320px] px-4 pb-20 sm:px-6">{children}</div>
      <HelpAssistant />
    </div>
  )
}
