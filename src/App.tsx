import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'

import Index         from '@/pages/Index'
import Login         from '@/pages/Login'
import Discover      from '@/pages/Discover'
import CreateEvent   from '@/pages/CreateEvent'
import EventDetail   from '@/pages/EventDetail'
import Profile       from '@/pages/Profile'
import Notifications from '@/pages/Notifications'
import Agent         from '@/pages/Agent'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter basename="/corral">
            <Routes>
              <Route path="/"            element={<Index />} />
              <Route path="/login"       element={<Login />} />
              <Route path="/discover"    element={<Discover />} />
              <Route path="/create"      element={<CreateEvent />} />
              <Route path="/event/:id"   element={<EventDetail />} />
              <Route path="/profile"     element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/agent"       element={<Agent />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
