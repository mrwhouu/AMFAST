import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function TopBar() {
  const { profile, signOut } = useAuth()
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:flex-nowrap sm:gap-4 sm:px-6 sm:py-5">
      <Link to="/" className="flex items-center gap-3">
        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-navy to-navy-deep font-display text-base font-bold text-gold-soft shadow-card">
          AM
        </div>
        <div className="leading-tight">
          <div className="font-display text-[16px] font-semibold tracking-[.2px] sm:text-[18px]">
            AMfast Förvaltningsportal
          </div>
          <div className="hidden text-[11.5px] tracking-wide text-muted sm:block">
            AMfast Fastighetsförvaltning AB
          </div>
        </div>
      </Link>
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <div className="hidden items-center gap-[7px] rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-[11.5px] text-muted md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-green shadow-[0_0_0_3px_var(--color-green-soft)]" />
          Data per {today}
        </div>
        {profile?.role === 'admin' && (
          <Link
            to="/admin"
            className="rounded-full border border-line px-3 py-1.5 text-[12.5px] font-semibold text-ink-soft hover:border-navy"
          >
            Admin
          </Link>
        )}
        <div className="hidden text-right leading-tight sm:block">
          <div className="text-[12.5px] font-semibold">{profile?.full_name ?? '—'}</div>
          <div className="text-[11px] capitalize text-muted">{profile?.role}</div>
        </div>
        <button
          onClick={() => signOut()}
          className="rounded-full border border-line px-3 py-1.5 text-[12.5px] font-semibold text-ink-soft hover:border-wine hover:text-wine"
        >
          Logga ut
        </button>
      </div>
    </div>
  )
}
