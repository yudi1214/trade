"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export function AuthDebugger() {
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    const storedToken = localStorage.getItem("token")
    setToken(storedToken)
    setIsAuthenticated(!!storedToken)
  }

  const clearToken = () => {
    localStorage.removeItem("token")
    checkAuth()
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Auth Debugger</span>
          <Button variant="ghost" size="sm" onClick={checkAuth}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Status:</p>
            <p className={`font-mono ${isAuthenticated ? "text-green-500" : "text-red-500"}`}>
              {isAuthenticated ? "Autenticado" : "Não autenticado"}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium">Token:</p>
            <div className="bg-muted p-2 rounded overflow-auto max-h-24">
              <p className="font-mono text-xs break-all">{token || "Nenhum token encontrado"}</p>
            </div>
          </div>

          <Button variant="destructive" onClick={clearToken} disabled={!isAuthenticated}>
            Limpar Token
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

