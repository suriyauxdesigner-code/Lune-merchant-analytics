import { NavLink } from "react-router-dom"
import { LayoutGrid, Store, BarChart3, Settings, ChevronsUpDown, PanelLeft, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { MERCHANT } from "@/lib/data"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const NAV_ITEMS = [
  { to: "/campaigns", label: "Campaign", icon: LayoutGrid },
  { to: "/brands", label: "Brands", icon: Store },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar({ collapsed, onToggle, mobile = false }: { collapsed: boolean; onToggle: () => void; mobile?: boolean }) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-card transition-[width] duration-200",
        collapsed && !mobile ? "w-[76px]" : "w-[264px]"
      )}
    >
      <div className={cn("flex h-[72px] items-center justify-between border-b border-border px-5", collapsed && !mobile && "px-4")}>
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">L</div>
          {(!collapsed || mobile) && <span className="text-lg font-bold text-foreground truncate">Lune</span>}
        </div>
        {!mobile && (
          <button onClick={onToggle} className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-muted-foreground hover:bg-muted">
            <PanelLeft className="size-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium transition-colors",
                    collapsed && !mobile && "justify-center px-0",
                    isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="size-[18px] shrink-0" />
                {(!collapsed || mobile) && <span className="truncate">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn("flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] p-2 text-left hover:bg-muted", collapsed && !mobile && "justify-center")}>
              <Avatar className="size-8">
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              {(!collapsed || mobile) && (
                <>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{MERCHANT.contactEmail}</span>
                  <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <div className="px-2.5 py-1.5">
              <p className="text-sm font-medium truncate">{MERCHANT.name}</p>
              <p className="text-xs text-muted-foreground truncate">{MERCHANT.contactEmail}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
