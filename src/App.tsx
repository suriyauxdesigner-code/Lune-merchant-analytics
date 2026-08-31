import { Routes, Route, Navigate } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppShell } from "@/components/layout/app-shell"
import CampaignsList from "@/pages/campaigns-list"
import BrandsList from "@/pages/brands-list"
import Settings from "@/pages/settings"
import AnalyticsOverview from "@/pages/analytics/overview"
import BrandAnalytics from "@/pages/analytics/brand-analytics"
import CampaignAnalytics from "@/pages/analytics/campaign-analytics"

export default function App() {
  return (
    <TooltipProvider delayDuration={150}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/analytics" replace />} />
          <Route path="/campaigns" element={<CampaignsList />} />
          <Route path="/brands" element={<BrandsList />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/analytics" element={<AnalyticsOverview />} />
          <Route path="/analytics/brands/:brandId" element={<BrandAnalytics />} />
          <Route path="/analytics/campaigns/:campaignId" element={<CampaignAnalytics />} />
        </Route>
        <Route path="*" element={<Navigate to="/analytics" replace />} />
      </Routes>
    </TooltipProvider>
  )
}
