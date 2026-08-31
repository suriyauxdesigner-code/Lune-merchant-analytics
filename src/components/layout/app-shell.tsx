import * as React from "react"
import { Outlet, useLocation } from "react-router-dom"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Menu, X } from "lucide-react"
import { Sidebar } from "./sidebar"

function ScrollToTop({ containerRef }: { containerRef: React.RefObject<HTMLElement | null> }) {
  const { pathname } = useLocation()
  React.useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 })
  }, [pathname, containerRef])
  return null
}

export function AppShell() {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const mainRef = React.useRef<HTMLElement | null>(null)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted/30">
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      <DialogPrimitive.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/40 md:hidden" />
          <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 h-full w-[264px] md:hidden animate-fade-in">
            <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
            <div className="relative h-full">
              <Sidebar collapsed={false} onToggle={() => {}} mobile />
              <DialogPrimitive.Close className="absolute right-3 top-4 flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
                <X className="size-4" />
              </DialogPrimitive.Close>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center border-b border-border bg-card px-4 md:hidden">
          <button onClick={() => setMobileOpen(true)} className="flex size-9 items-center justify-center rounded-[var(--radius-sm)] text-foreground hover:bg-muted">
            <Menu className="size-5" />
          </button>
          <span className="ml-2 text-base font-bold">Lune</span>
        </header>
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <ScrollToTop containerRef={mainRef} />
          <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
