import { NavLink, Outlet, useLocation } from 'react-router-dom'
import AuthGate from './components/AuthGate'

export default function App(){
  const loc = useLocation()
  return (
    <AuthGate>
      <div className="min-h-screen flex flex-col">
        <header className="border-b bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="text-xl font-semibold">Buildaly — Project Tracker</div>
            <nav className="flex gap-3 text-sm">
              <NavLink to="/" className={({isActive}) => `px-3 py-1.5 rounded-lg ${isActive ? 'bg-black text-white' : 'hover:bg-zinc-100'}`}>דשבורד</NavLink>
              <NavLink to="/development" className={({isActive}) => `px-3 py-1.5 rounded-lg ${isActive ? 'bg-devBlue text-white' : 'hover:bg-zinc-100'}`}>יזמות</NavLink>
              <NavLink to="/execution" className={({isActive}) => `px-3 py-1.5 rounded-lg ${isActive ? 'bg-execOrange text-white' : 'hover:bg-zinc-100'}`}>קבלנות ביצוע</NavLink>
            </nav>
          </div>
        </header>
        <main className="flex-1"><Outlet /></main>
        <footer className="border-t bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 text-xs text-zinc-500">מצב: {loc.pathname}</div>
        </footer>
      </div>
    </AuthGate>
  )
}
