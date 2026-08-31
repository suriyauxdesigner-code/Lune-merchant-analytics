import * as React from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const activeCount = [
    filters.brandId !== "all",
    filters.channel !== "all",
    filters.status !== "all",
    filters.campaignQuery.trim() !== "",
  ].filter(Boolean).length

  const clear = () => onChange({ ...filters, brandId: "all", channel: "all", status: "all", campaignQuery: "" })

  const dateControl = (
    <DateRangeSelect
      value={filters.dateRange}
      customRange={filters.customRange}
      onChange={(dateRange, customRange) => onChange({ ...filters, dateRange, customRange })}
    />
  )

  const campaignSearch = showCampaignSearch && (
    <div className="relative w-full sm:w-[190px]">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={filters.campaignQuery}
        onChange={(e) => onChange({ ...filters, campaignQuery: e.target.value })}
        placeholder="Search campaign"
        className="pl-8"
      />
    </div>
  )

  const brandControl = showBrand && (
    <Select value={filters.brandId} onValueChange={(brandId) => onChange({ ...filters, brandId: brandId as CampaignFilters["brandId"] })}>
      <SelectTrigger className="w-full sm:w-[168px]">
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
  )

  const channelControl = (
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
  )

  const statusControl = (
    <Select value={filters.status} onValueChange={(status) => onChange({ ...filters, status: status as CampaignStatus | "all" })}>
      <SelectTrigger className="w-full sm:w-[168px]">
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
    <div className="mb-6">
      {/* Desktop / tablet: inline row */}
      <div className="hidden flex-wrap items-center gap-2.5 sm:flex">
        {dateControl}
        {campaignSearch}
        {brandControl}
        {channelControl}
        {statusControl}
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={clear}>
            <X className="size-3.5" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Mobile: collapsible */}
      <div className="sm:hidden">
        <div className="flex items-center gap-2.5">
          {dateControl}
          <Button variant="outline" size="default" className="gap-2" onClick={() => setMobileOpen((o) => !o)}>
            <SlidersHorizontal className="size-4" />
            Filters
            {activeCount > 0 && <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">{activeCount}</span>}
          </Button>
        </div>
        {mobileOpen && (
          <div className="mt-3 flex flex-col gap-2.5 rounded-[var(--radius)] border border-border bg-card p-3">
            {campaignSearch}
            {brandControl}
            {channelControl}
            {statusControl}
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={clear}>
                <X className="size-3.5" />
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
