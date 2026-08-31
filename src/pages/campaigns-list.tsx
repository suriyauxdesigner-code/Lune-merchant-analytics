import { PageHeader } from "@/components/shared/page-header"
import { SectionCard } from "@/components/shared/section-card"
import { CampaignTable } from "@/components/analytics/campaign-table"
import { Button } from "@/components/ui/button"
import { CAMPAIGNS, MERCHANT } from "@/lib/data"
import { BarChart3 } from "lucide-react"
import { Link } from "react-router-dom"

export default function CampaignsList() {
  return (
    <div>
      <PageHeader
        title={`Hello ${MERCHANT.name.split(" ")[0]}`}
        description="Track your live campaigns performance."
        actions={
          <Button variant="outline" asChild>
            <Link to="/analytics">
              <BarChart3 className="size-4" />
              View Analytics
            </Link>
          </Button>
        }
      />
      <SectionCard title="All Campaigns" description="Click a campaign to open its analytics" contentClassName="px-4 pb-5 sm:px-5">
        <CampaignTable campaigns={CAMPAIGNS} />
      </SectionCard>
    </div>
  )
}
