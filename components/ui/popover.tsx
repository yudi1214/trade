"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface PopoverProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const PopoverContext = React.createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}>({
  open: false,
  setOpen: () => {},
})

export function Popover({ open, onOpenChange, children }: PopoverProps) {
  const [internalOpen, setInternalOpen] = React.useState(open || false)

  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    },
    [isControlled, onOpenChange],
  )

  return (
    <PopoverContext.Provider value={{ open: isOpen, setOpen: handleOpenChange }}>{children}</PopoverContext.Provider>
  )
}

interface PopoverTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export function PopoverTrigger({ asChild, ...props }: PopoverTriggerProps) {
  const { open, setOpen } = React.useContext(PopoverContext)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(e)
    setOpen(!open)
  }

  if (asChild) {
    return React.cloneElement(props.children as React.ReactElement, {
      onClick: handleClick,
      "aria-expanded": open,
      "aria-haspopup": true,
    })
  }

  return <button type="button" aria-expanded={open} aria-haspopup={true} {...props} onClick={handleClick} />
}

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end"
  sideOffset?: number
}

export function PopoverContent({ className, align = "center", sideOffset = 4, ...props }: PopoverContentProps) {
  const { open, setOpen } = React.useContext(PopoverContext)
  const contentRef = React.useRef<HTMLDivElement>(null)

  // Close when clicking outside
  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node) && open) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={contentRef}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "absolute top-full mt-2",
        {
          "left-0": align === "start",
          "left-1/2 -translate-x-1/2": align === "center",
          "right-0": align === "end",
        },
        className,
      )}
      {...props}
    />
  )
}

