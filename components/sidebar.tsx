"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Scale, FileText, BarChart3, Shield, Settings, Home, Database } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Overview", href: "/", icon: Home },
  { name: "Predict", href: "/predict", icon: FileText },
  { name: "Models", href: "/models", icon: Database },
  { name: "Comparison", href: "/comparison", icon: BarChart3 },
  { name: "Fairness", href: "/fairness", icon: Shield },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col">
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">LegalPredict</h1>
            <p className="text-xs text-muted-foreground">ECtHR Classifier</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="px-3 py-2 rounded-lg bg-secondary/50">
          <p className="text-xs text-muted-foreground">Model Status</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm text-foreground">LegalBERT Ready</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
