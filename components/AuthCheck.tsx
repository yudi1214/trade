"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/api"

interface AuthCheckProps {
  children: React.ReactNode
}

export function AuthCheck({ children }: AuthCheckProps) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = authService.isAuthenticated()

      if (!isAuthenticated) {
        router.push("/login")
      } else {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [router])

  if (isChecking) {
    return null // ou um componente de loading
  }

  return <>{children}</>
}

