"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface CheckboxProps {
  checked?: boolean | "indeterminate"
  onCheckedChange?: (checked: boolean) => void
  className?: string
}

export function Checkbox({ checked, onCheckedChange, className }: CheckboxProps) {
  const isChecked = checked === true || checked === "indeterminate";
  
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isChecked}
      onClick={() => onCheckedChange?.(!isChecked)}
      className={cn(
        "flex size-5 items-center justify-center rounded-full border transition-all duration-150 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[#ff6a1a]/20 shadow-sm",
        isChecked
          ? "scale-105"
          : "hover:scale-102",
        className
      )}
      style={{
        backgroundColor: isChecked ? '#ff6a1a' : '#ffffff',
        borderColor: isChecked ? '#ff6a1a' : '#d4d4d8',
        color: isChecked ? '#ffffff' : 'transparent',
      }}
    >
      {checked === "indeterminate" ? (
        <span className="h-1 w-2.5 rounded-sm bg-white" />
      ) : isChecked ? (
        <Check className="size-3.5 stroke-[4] text-white" />
      ) : null}
    </button>
  )
}
