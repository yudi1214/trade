"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"

export function ProfileNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/deposit", label: "Depósito" },
    { href: "/withdraw", label: "Retirada" },
    { href: "/transactions", label: "Transações" },
    { href: "/operations", label: "Operações" },
    { href: "/profile", label: "Perfil" },
    { href: "/tournament", label: "Torneio" },
    { href: "/copytrader", label: "Copy" },
  ]

  return (
    <div className="border-b bg-background">
      <div className="flex justify-between items-center px-4">
        <nav className="flex overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-3 min-w-max text-sm transition-colors hover:text-foreground
            ${pathname === item.href ? "text-foreground" : "text-muted-foreground"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 border rounded-md">
            <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
            <span className="font-medium">$10000.00</span>
            <span className="text-muted-foreground text-sm">DEMO</span>
          </div>
        </div>
      </div>
    </div>
  )
}

