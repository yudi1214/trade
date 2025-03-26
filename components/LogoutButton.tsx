"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { authService } from "@/lib/api"
import { useRouter } from "next/navigation"

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "icon" | "default" | "sm" | "lg"
  className?: string
}

export function LogoutButton({ variant = "ghost", size = "default", className = "" }: LogoutButtonProps) {
  const router = useRouter()

  const handleLogout = () => {
    authService.logout()
    router.push("/login")
  }

  return (
    <Button variant={variant} size={size} onClick={handleLogout} className={className}>
      <LogOut className="h-4 w-4 mr-2" />
      Sair
    </Button>
  )
}

