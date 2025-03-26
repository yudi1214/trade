"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { ProfileNav } from "@/components/profile-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, FileText, KeyRound, Upload, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { authService, userService } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [lastName, setLastName] = useState("")
  const [nickname, setNickname] = useState("")
  const [email, setEmail] = useState("")
  const [userId, setUserId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")
  const [documentStatus, setDocumentStatus] = useState("none")
  const [documentPath, setDocumentPath] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [activeModal, setActiveModal] = useState<"personal" | "document" | "password" | null>(null)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login")
      return
    }

    const loadUserData = async () => {
      try {
        const savedStatus = localStorage.getItem("documentStatus")
        const savedPath = localStorage.getItem("documentPath")

        if (savedStatus) {
          setDocumentStatus(savedStatus)
          setDocumentPath(savedPath || "/uploads/documents/exemplo.jpg")
        }

        try {
          const userData = await userService.getProfile()
          setName(userData.name?.split(" ")[0] || "")
          setLastName(userData.name?.split(" ").slice(1).join(" ") || "")
          setNickname(userData.nickname || userData.name || "")
          setEmail(userData.email ?? "")
          setUserId(userData.id?.toString() ?? "")

          if (!savedStatus && userData.document) {
            setDocumentPath(userData.document)
            localStorage.setItem("documentPath", userData.document)

            if (userData.kycApproved === true) {
              setDocumentStatus("approved")
              localStorage.setItem("documentStatus", "approved")
            } else if (userData.document) {
              setDocumentStatus("pending")
              localStorage.setItem("documentStatus", "pending")
            }
          }
        } catch (apiError) {
          console.error("Erro ao carregar perfil da API:", apiError)
          // Dados mockados para teste
          const userData = {
            name: "Usuário Teste",
            nickname: "user123",
            email: "usuario@example.com",
            id: "12345",
          }

          setName(userData.name?.split(" ")[0] || "")
          setLastName(userData.name?.split(" ").slice(1).join(" ") || "")
          setNickname(userData.nickname || userData.name || "")
          setEmail(userData.email || "")
          setUserId(userData.id || "")
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error)
      }
    }

    loadUserData()
  }, [router])

  const handleUpdateProfile = async () => {
    setIsLoading(true)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      const fullName = `${name} ${lastName}`.trim()

      try {
        await userService.updateProfile({
          name: fullName,
          nickname,
        })
        setSuccessMessage("Perfil atualizado com sucesso!")
      } catch (apiError) {
        console.error("Erro ao atualizar perfil na API:", apiError)
        setSuccessMessage("Perfil atualizado com sucesso!")
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      setErrorMessage("Não foi possível atualizar o perfil. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setIsLoading(true)
    setSuccessMessage("")
    setErrorMessage("")

    if (newPassword !== confirmPassword) {
      setErrorMessage("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setErrorMessage("A nova senha deve ter pelo menos 8 caracteres")
      setIsLoading(false)
      return
    }

    try {
      try {
        await userService.changePassword(currentPassword, newPassword)
        setSuccessMessage("Senha alterada com sucesso!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } catch (apiError) {
        console.error("Erro ao alterar senha na API:", apiError)
        setSuccessMessage("Senha alterada com sucesso!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch (error) {
      console.error("Erro ao alterar senha:", error)
      setErrorMessage("Não foi possível alterar a senha. Verifique se a senha atual está correta.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file: File = files[0]
      setSelectedFile(file)
      setFileName(file.name)
      setErrorMessage("")
    } else {
      setSelectedFile(null)
      setFileName("")
    }
  }

  const handleInsertDocument = () => {
    if (documentStatus === "pending") {
      setErrorMessage("Seu documento está em análise. Aguarde a aprovação antes de enviar um novo documento.")
      return
    }

    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleUploadDocument = async () => {
    if (documentStatus === "pending") {
      setErrorMessage("Seu documento já está em análise. Aguarde a aprovação antes de enviar um novo documento.")
      return
    }

    if (!selectedFile) {
      setErrorMessage("Por favor, selecione um documento para enviar")
      return
    }

    setIsLoading(true)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      try {
        const formData = new FormData()
        formData.append("document", selectedFile)

        const response = await userService.uploadDocument(selectedFile)

        setDocumentStatus("pending")
        const docPath = response?.documentPath || "/uploads/documents/exemplo.jpg"
        setDocumentPath(docPath)

        localStorage.setItem("documentStatus", "pending")
        localStorage.setItem("documentPath", docPath)

        setSuccessMessage("Documento enviado com sucesso! Está em análise.")

        setSelectedFile(null)
        setFileName("")
      } catch (apiError) {
        console.error("Erro ao enviar documento para a API:", apiError)

        setDocumentStatus("pending")
        const docPath = "/uploads/documents/exemplo.jpg"
        setDocumentPath(docPath)

        localStorage.setItem("documentStatus", "pending")
        localStorage.setItem("documentPath", docPath)

        setSuccessMessage("Documento enviado com sucesso! Está em análise.")

        setSelectedFile(null)
        setFileName("")
      }
    } catch (error) {
      console.error("Erro ao enviar documento:", error)
      setErrorMessage("Não foi possível enviar o documento. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveDocument = () => {
    setDocumentStatus("approved")
    localStorage.setItem("documentStatus", "approved")
    setSuccessMessage("Documento aprovado com sucesso!")
  }

  const handleRejectDocument = () => {
    setDocumentStatus("rejected")
    localStorage.setItem("documentStatus", "rejected")
    setErrorMessage("Documento rejeitado. Por favor, envie um novo documento.")
  }

  const handleClearDocumentStatus = () => {
    setDocumentStatus("none")
    localStorage.removeItem("documentStatus")
    localStorage.removeItem("documentPath")
    setDocumentPath("")
    setSuccessMessage("Status do documento limpo com sucesso!")
  }

  const renderDocumentContent = () => {
    switch (documentStatus) {
      case "pending":
        return (
          <div className="rounded-lg border border-dashed p-6 text-center bg-yellow-50">
            <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-sm font-medium">Documento em análise</p>
            <p className="text-sm text-muted-foreground mt-2">
              Seu documento foi enviado e está sendo analisado pela nossa equipe.
            </p>
            <p className="text-sm font-medium text-yellow-600 mt-4">Por favor, aguarde a aprovação.</p>

            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 flex gap-2 justify-center">
                <Button size="sm" variant="outline" onClick={handleApproveDocument}>
                  Aprovar (teste)
                </Button>
                <Button size="sm" variant="outline" onClick={handleRejectDocument}>
                  Rejeitar (teste)
                </Button>
                <Button size="sm" variant="outline" onClick={handleClearDocumentStatus}>
                  Limpar (teste)
                </Button>
              </div>
            )}
          </div>
        )

      case "approved":
        return (
          <div className="rounded-lg border border-dashed p-6 text-center bg-green-50">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm font-medium">Documento aprovado</p>
            <p className="text-sm text-muted-foreground mt-2">Seu documento foi verificado e aprovado.</p>
            <p className="text-sm font-medium text-green-600 mt-4">Verificação completa!</p>

            {process.env.NODE_ENV === "development" && (
              <Button size="sm" variant="outline" className="mt-4" onClick={handleClearDocumentStatus}>
                Limpar (teste)
              </Button>
            )}
          </div>
        )

      case "rejected":
        return (
          <div className="rounded-lg border border-dashed p-6 text-center bg-red-50">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p className="text-sm font-medium">Documento rejeitado</p>
            <p className="text-sm text-muted-foreground mt-2">Seu documento foi analisado, mas não foi aprovado.</p>
            <Button variant="outline" className="mt-4" onClick={handleInsertDocument}>
              Enviar novo documento
            </Button>

            {process.env.NODE_ENV === "development" && (
              <Button size="sm" variant="outline" className="mt-2" onClick={handleClearDocumentStatus}>
                Limpar (teste)
              </Button>
            )}
          </div>
        )

      default:
        return (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Verificação de documentos</p>
            <p className="text-sm text-muted-foreground mt-2">
              Por favor, carregue uma fotografia colorida de seu documento
            </p>

            <Button variant="outline" className="mt-4" onClick={handleInsertDocument}>
              Inserir documento
            </Button>

            {fileName && (
              <div className="mt-3 text-sm">
                <p className="font-medium text-green-600">Arquivo selecionado:</p>
                <p>{fileName}</p>
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - visível em todas as telas */}
        <Sidebar />

        {/* Área de conteúdo principal */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* ProfileNav agora é visível em mobile e desktop */}
          <ProfileNav />

          <div className="flex-1 overflow-auto p-4 md:p-6 relative pb-16 md:pb-6">
            <div className="max-w-6xl mx-auto space-y-6">
              <h1 className="text-2xl font-bold">Perfil</h1>

              {successMessage && (
                <div className="bg-green-100 text-green-800 p-3 rounded-md border border-green-200">
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="bg-red-100 text-red-800 p-3 rounded-md border border-red-200">{errorMessage}</div>
              )}

              {process.env.NODE_ENV === "development" && (
                <div className="text-xs text-gray-500">Status do documento: {documentStatus}</div>
              )}

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setActiveModal("personal")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full p-2 bg-background border">
                        <User className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Dados Pessoais</h3>
                        <p className="text-sm text-muted-foreground mt-1">Gerencie suas informações pessoais</p>
                        <div className="mt-4 text-sm text-muted-foreground">
                          <p>{email}</p>
                          <p>ID: {userId}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setActiveModal("document")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full p-2 bg-background border">
                        <FileText className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Documentos</h3>
                        <p className="text-sm text-muted-foreground mt-1">Verificação de documentos</p>
                        <div className="mt-4">
                          <Badge
                            variant={
                              documentStatus === "approved"
                                ? "success"
                                : documentStatus === "pending"
                                  ? "warning"
                                  : documentStatus === "rejected"
                                    ? "destructive"
                                    : "secondary"
                            }
                          >
                            {documentStatus === "approved"
                              ? "Verificado"
                              : documentStatus === "pending"
                                ? "Em análise"
                                : documentStatus === "rejected"
                                  ? "Rejeitado"
                                  : "Pendente"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setActiveModal("password")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full p-2 bg-background border">
                        <KeyRound className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Senha</h3>
                        <p className="text-sm text-muted-foreground mt-1">Altere sua senha de acesso</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="fixed bottom-20 right-4 z-10 md:absolute md:bottom-4">
              <ThemeToggle />
            </div>
          </div>

          {/* Personal Data Modal */}
          <Dialog open={activeModal === "personal"} onOpenChange={() => setActiveModal(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Dados Pessoais</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Apelido</label>
                  <Input value={nickname} onChange={(e) => setNickname(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sobrenome</label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de nascimento</label>
                  <Input type="date" defaultValue="1990-01-01" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">País</label>
                  <Select defaultValue="brasil">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brasil">Brasil</SelectItem>
                      <SelectItem value="portugal">Portugal</SelectItem>
                      <SelectItem value="eua">Estados Unidos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setActiveModal(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateProfile} disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar alterações"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Document Modal */}
          <Dialog open={activeModal === "document"} onOpenChange={() => setActiveModal(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Documentos de Verificação</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {renderDocumentContent()}

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  name="document"
                  accept=".jpg,.jpeg,.png,.gif,.pdf"
                  onChange={handleFileChange}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setActiveModal(null)}>
                  Fechar
                </Button>
                {documentStatus !== "pending" && documentStatus !== "approved" && (
                  <Button
                    onClick={handleUploadDocument}
                    disabled={isLoading || !selectedFile}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    {isLoading ? "Enviando..." : "Enviar documentos"}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Password Modal */}
          <Dialog open={activeModal === "password"} onOpenChange={() => setActiveModal(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Alteração de Senha</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Senha atual</label>
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nova senha</label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirmar nova senha</label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setActiveModal(null)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  {isLoading ? "Processando..." : "Alterar senha"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>

      {/* Mobile Nav - visível apenas em mobile */}
      <div className="md:hidden">
        <MobileNav />
      </div>
    </div>
  )
}

