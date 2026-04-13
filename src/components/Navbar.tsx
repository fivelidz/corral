import { Link, useLocation } from 'react-router-dom'
import { Home, Search, PlusSquare, User, Flame, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'

const NAV = [
  { to: '/',         icon: Home,       label: 'Feed'    },
  { to: '/discover', icon: Search,     label: 'Discover'},
  { to: '/create',   icon: PlusSquare, label: 'Post'    },
  { to: '/heat',     icon: Flame,      label: 'Heat'    },
  { to: '/profile',  icon: User,       label: 'Profile' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const { user }     = useAuth()
  const { theme, toggle } = useTheme()

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold tracking-tight text-primary">
            corral
          </Link>
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="rounded-full p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user && (
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
                {user.email?.[0].toUpperCase() ?? '?'}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card">
        <div className="mx-auto flex max-w-2xl items-center justify-around px-2 py-2">
          {NAV.map(({ to, icon: Icon, label }) => {
            const active = pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
