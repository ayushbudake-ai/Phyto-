import { Outlet } from 'react-router-dom'
import { Navbar } from './navbar'
import { Footer } from './footer'
import { ChatBot } from '../../features/chatbot/ChatBot'

export function AppLayout() {
  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-phyto-cream via-white to-phyto-sage/40">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-8 md:px-8">
        <Outlet />
      </main>
      <Footer />
      <ChatBot />
    </div>
  )
}

