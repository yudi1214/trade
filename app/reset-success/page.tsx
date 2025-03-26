"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ResetSuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-medium text-slate-800">Senha Redefinida</h1>
          <p className="text-slate-500 text-sm mt-2 mb-6">
            Sua senha foi redefinida com sucesso. Agora você pode fazer login com sua nova senha.
          </p>

          <Button 
            onClick={() => router.push("/login")} 
            className="w-full h-12 bg-blue-500 hover:bg-blue-600"
          >
            Voltar para Login
          </Button>
        </div>
      </div>
    </div>
  )
}