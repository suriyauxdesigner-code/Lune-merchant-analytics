import * as React from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangeSelect } from "./date-range-select"
import { BRANDS } from "@/lib/data"
import { CHANNEL_LABEL, STATUS_LABEL, type CampaignFilters } from "@/lib/analytics-utils"
import type { CampaignStatus, Channel } from "@/lib/types"

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
  const [moreOpen, setMoreOpen] = React.useState(false)

  const moreCount = [filters.channel !== "all", filters.status !== "all"].filter(Boolean).length
  const activeCount = moreCount + (filters.brandId !== "all" ? 1 : 0) + (filters.campaignQuery.trim() !== "" ? 1 : 0)

  const clear = () => onChange({ ...filters, brandId: "all", channel: "all", status: "all", campaignQuery: "" })

  const channelSelect = (
    <Select value={filters.channel} onValueChange={(channel) => onChange({ ...filters, channel: channel as Channel | "all" })}>
      <SelectTrigger>
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
  )

  const statusSelect = (
    <Select value={filters.status} onValueChange={(status) => onChange({ ...filters, status: status as CampaignStatus | "all" })}>
      <SelectTrigger>
        <SelectValue placeholder="All statuses" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All statuses</SelectItem>
        {(Object.keys(STATUS_LABEL) as CampaignStatus[]).map((s) => (
          <SelectItem key={s} value={s}>
            {STATUS_LABEL[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  return (
    <div className="mb-8 flex flex-wrap items-center gap-2">
      <DateRangeSelect
        value={filters.dateRange}
        customRange={filters.customRange}
        onChange={(dateRange, customRange) => onChange({ ...filters, dateRange, customRange })}
      />

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

      <Popover open={moreOpen} onOpenChange={setMoreOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="size-3.5" />
            More filters
            {moreCount > 0 && <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">{moreCount}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Channel</p>
              {channelSelect}
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Status</p>
              {statusSelect}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={clear}>
          <X className="size-3.5" />
          Clear
        </Button>
      )}
    </div>
  )
}
