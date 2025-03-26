"use client"

import { TrendingUp, MessageCircle, User, MoreHorizontal, Copy } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"

export function Sidebar() {
  const { theme, setTheme } = useTheme()
  
  return (
    <div className="w-20 border-r flex flex-col items-center py-4">
      <Link href="/trade">
        <button className="rounded-full mb-4 h-12 w-12 flex items-center justify-center hover:bg-muted">
          <TrendingUp className="h-6 w-6" />
        </button>
      </Link>
      
      <Link href="/copy">
        <button className="rounded-full mb-4 h-12 w-12 flex items-center justify-center hover:bg-muted">
          <Copy className="h-6 w-6" />
        </button>
      </Link>
      
      <Link href="/chat">
        <button className="rounded-full mb-4 h-12 w-12 flex items-center justify-center hover:bg-muted">
          <MessageCircle className="h-6 w-6" />
        </button>
      </Link>
      
      <Link href="/profile">
        <button className="rounded-full mb-4 h-12 w-12 flex items-center justify-center hover:bg-muted">
          <User className="h-6 w-6" />
        </button>
      </Link>
      
      <div className="dropdown">
        <button className="rounded-full mb-4 h-12 w-12 flex items-center justify-center hover:bg-muted">
          <MoreHorizontal className="h-6 w-6" />
        </button>
      </div>
      
      {/* ThemeToggle na parte inferior */}
      <div className="mt-auto mb-4">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full h-12 w-12 flex items-center justify-center border hover:bg-muted"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="dark:hidden h-6 w-6"
          >
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>
            <path d="m4.93 4.93 1.41 1.41"></path>
            <path d="m17.66 17.66 1.41 1.41"></path>
            <path d="M2 12h2"></path>
            <path d="M20 12h2"></path>
            <path d="m6.34 17.66-1.41 1.41"></path>
            <path d="m19.07 4.93-1.41 1.41"></path>
          </svg>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="hidden dark:block h-6 w-6"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
          </svg>
        </button>
      </div>
    </div>
  )
}