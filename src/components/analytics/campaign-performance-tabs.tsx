import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CampaignComparisonTable } from "./campaign-comparison-table"
import { ChannelPerformanceTable } from "./channel-performance-table"
import type { Campaign } from "@/lib/types"

/** One consolidated Campaign Performance section — campaign-level and channel-level detail live behind tabs instead of two stacked tables. */
export function CampaignPerformanceTabs({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <Tabs defaultValue="campaign">
      <TabsList className="mb-5">
        <TabsTrigger value="campaign">By Campaign</TabsTrigger>
        <TabsTrigger value="channel">By Channel</TabsTrigger>
      </TabsList>

      <TabsContent value="campaign">
        <CampaignComparisonTable campaigns={campaigns} />
      </TabsContent>

      <TabsContent value="channel">
        <ChannelPerformanceTable campaigns={campaigns} />
      </TabsContent>
    </Tabs>
  )
}
