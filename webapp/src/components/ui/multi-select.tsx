import React, { useState, useRef, useEffect } from "react"
import { Check, ChevronDown, X, Search } from "lucide-react"
import { cn } from "../../lib/utils"
import { Badge } from "./badge"

export interface Option {
  label: string
  value: string
  description?: string
}

interface MultiSelectProps {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  className?: string
  multiple?: boolean
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  label,
  error,
  disabled = false,
  className,
  multiple = true,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase()) ||
    option.description?.toLowerCase().includes(search.toLowerCase())
  )

  const toggleOption = (optionValue: string) => {
    if (multiple) {
      const newValue = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue]
      onChange(newValue)
    } else {
      onChange([optionValue])
      setIsOpen(false)
    }
  }

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter((v) => v !== optionValue))
  }

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  return (
    <div className={cn("grid gap-1.5", className)} ref={containerRef}>
      {label && <label className="text-sm font-semibold text-muted-foreground">{label}</label>}
      
      <div className="relative">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "flex min-h-[42px] w-full cursor-pointer items-center justify-between gap-1.5 rounded-lg border bg-surface px-3 py-2 text-sm transition-all shadow-sm",
            isOpen ? "border-primary ring-2 ring-primary/10" : "border-border",
            error ? "border-danger ring-danger/10" : "border-border",
            disabled && "cursor-not-allowed opacity-50 bg-muted/5"
          )}
        >
          <div className="flex flex-wrap gap-1.5 items-center flex-1">
            {value.length > 0 ? (
              multiple ? (
                value.map((val) => {
                  const option = options.find((o) => o.value === val)
                  return (
                    <Badge
                      key={val}
                      variant="primary"
                      className="flex items-center gap-1 pr-1"
                    >
                      {option?.label || val}
                      <button
                        type="button"
                        onClick={(e) => removeOption(val, e)}
                        className="rounded-full hover:bg-primary-foreground/20 p-0"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  )
                })
              ) : (
                <span className="font-semibold text-foreground">
                  {options.find(o => o.value === value[0])?.label || value[0]}
                </span>
              )
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {value.length > 0 && !disabled && (
              <X 
                className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" 
                onClick={clearSelection}
              />
            ) }
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
          </div>
        </div>

        {isOpen && (
          <div className="absolute top-full z-50 mt-1 w-full rounded-lg border border-border bg-surface p-1 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center border-b border-border/50 px-2 py-2">
              <Search className="mr-2 h-4 w-4 text-muted-foreground" />
              <input
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            <div className="max-h-[240px] overflow-y-auto p-1 custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value)
                  return (
                    <div
                      key={option.value}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleOption(option.value)
                      }}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-muted/5",
                        isSelected && "bg-primary/5 text-primary"
                      )}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold">{option.label}</span>
                        {option.description && (
                          <span className="text-[11px] text-muted-foreground font-medium">{option.description}</span>
                        )}
                      </div>
                      {multiple ? (
                        <div className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border border-border transition-all",
                          isSelected ? "bg-primary border-primary text-primary-foreground" : "bg-transparent"
                        )}>
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                      ) : (
                        isSelected && <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="px-2 py-6 text-center text-sm text-muted-foreground italic">
                  No matches found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {error && <p className="text-[11px] font-bold text-danger">{error}</p>}
    </div>
  )
}
