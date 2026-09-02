import { Routes, Route, Navigate } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppShell } from "@/components/layout/app-shell"
import CampaignsList from "@/pages/campaigns-list"
import BrandsList from "@/pages/brands-list"
import Settings from "@/pages/settings"
import BrandAnalytics from "@/pages/analytics/brand-analytics"
import CampaignAnalytics from "@/pages/analytics/campaign-analytics"
import { BRANDS } from "@/lib/data"

// Analytics is brand-scoped — the merchant always works within a single brand's context, never
// a cross-brand comparison. "/analytics" lands on that brand's analytics, defaulting to the first.
const DEFAULT_ANALYTICS_PATH = `/analytics/brands/${BRANDS[0].id}`

export default function App() {
  return (
    <TooltipProvider delayDuration={150}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to={DEFAULT_ANALYTICS_PATH} replace />} />
          <Route path="/campaigns" element={<CampaignsList />} />
          <Route path="/brands" element={<BrandsList />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/analytics" element={<Navigate to={DEFAULT_ANALYTICS_PATH} replace />} />
          <Route path="/analytics/brands/:brandId" element={<BrandAnalytics />} />
          <Route path="/analytics/campaigns/:campaignId" element={<CampaignAnalytics />} />
        </Route>
        <Route path="*" element={<Navigate to={DEFAULT_ANALYTICS_PATH} replace />} />
      </Routes>
    </TooltipProvider>
  )
}
