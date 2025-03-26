"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: React.ReactNode
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(({ className, src, alt, fallback, ...props }, ref) => {
  const [hasError, setHasError] = React.useState(false)

  // Função para gerar uma cor de fundo baseada no nome
  const getColorFromName = (name = "") => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ]

    // Usar a soma dos códigos ASCII das letras para escolher uma cor
    const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[sum % colors.length]
  }

  // Obter iniciais do nome
  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div
      ref={ref}
      className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    >
      {src && !hasError ? (
        <img
          src={src || "/placeholder.svg"}
          alt={alt || "Avatar"}
          className="h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center ${getColorFromName(alt)} text-white font-medium`}
        >
          {fallback || getInitials(alt) || "?"}
        </div>
      )}
    </div>
  )
})
Avatar.displayName = "Avatar"

const AvatarImage = ({ src, alt, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return (
    <img src={src || "/placeholder.svg"} alt={alt} className={cn("h-full w-full object-cover", className)} {...props} />
  )
}
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("flex h-full w-full items-center justify-center bg-muted", className)} {...props}>
      {children}
    </div>
  )
}
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }

