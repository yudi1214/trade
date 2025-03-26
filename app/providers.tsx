"use client"

import type React from "react"

import { ThemeProvider } from "next-themes"
import { AssetProvider } from "../components/asset-tabs"
import { AuthProvider } from "@/contexts/AuthContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <AssetProvider>{children}</AssetProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

