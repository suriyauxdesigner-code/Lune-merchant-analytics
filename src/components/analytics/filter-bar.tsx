import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangeSelect } from "./date-range-select"
import { BRANDS } from "@/lib/data"
import { CHANNEL_LABEL, STATUS_LABEL, type CampaignFilters } from "@/lib/analytics-utils"
import type { CampaignStatus, Channel } from "@/lib/types"

// Only statuses relevant to a performance filter — Pending Approval, Scheduled, and Rejected
// campaigns don't have performance to filter by.
const FILTERABLE_STATUSES: CampaignStatus[] = ["active", "completed"]

export function FilterBar({
  filters,
  onChange,
  showBrand = true,
  showCampaignSearch = false,
}: {
  filters: CampaignFilters
  onChange: (next: CampaignFilters) => void
  showBrand?: boolean
  showCampaignSearch?: boolean
}) {
  const activeCount =
    (filters.brandId !== "all" ? 1 : 0) + (filters.channel !== "all" ? 1 : 0) + (filters.status !== "all" ? 1 : 0) + (filters.campaignQuery.trim() !== "" ? 1 : 0)

  const clear = () => onChange({ ...filters, brandId: "all", channel: "all", status: "all", campaignQuery: "" })

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
      {/* Search → brand (if shown) → channel → status */}
      <div className="flex flex-wrap items-center gap-2">
        {showCampaignSearch && (
          <div className="relative w-full max-w-[220px] sm:w-[180px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.campaignQuery}
              onChange={(e) => onChange({ ...filters, campaignQuery: e.target.value })}
              placeholder="Search campaign"
              className="pl-8"
            />
          </div>
        )}

        {showBrand && (
          <Select value={filters.brandId} onValueChange={(brandId) => onChange({ ...filters, brandId: brandId as CampaignFilters["brandId"] })}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="All brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All brands</SelectItem>
              {BRANDS.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={filters.channel} onValueChange={(channel) => onChange({ ...filters, channel: channel as Channel | "all" })}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All channels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All channels</SelectItem>
            {(Object.keys(CHANNEL_LABEL) as Channel[]).map((c) => (
              <SelectItem key={c} value={c}>
                {CHANNEL_LABEL[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(status) => onChange({ ...filters, status: status as CampaignStatus | "all" })}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {FILTERABLE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeCount > 0 && (
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={clear}>
            <X className="size-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Date range — a separate control, not nested inside the filter group */}
      <DateRangeSelect
        value={filters.dateRange}
        customRange={filters.customRange}
        onChange={(dateRange, customRange) => onChange({ ...filters, dateRange, customRange })}
      />
    </div>
  )
}
