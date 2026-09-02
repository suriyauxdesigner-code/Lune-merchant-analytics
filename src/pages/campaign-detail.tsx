import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ChevronLeft,
  ChevronDown,
  X,
  Eye,
  Percent,
  Target,
  Hourglass,
  Wallet,
  ArrowDownToLine,
  ShieldCheck,
  CalendarDays,
  Building2,
  Store,
  CreditCard,
  Clock,
  Megaphone as MegaphoneIcon,
  Landmark,
} from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { BrandLogoTile } from "@/components/shared/brand-logo-tile"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PillToggle } from "@/components/analytics/pill-toggle"
import { DetailGrid } from "@/components/analytics/detail-grid"
import { MerchantIdList } from "@/components/shared/merchant-id-list"
import { campaignById, brandById } from "@/lib/data"
import { formatAed, formatDate, cn } from "@/lib/utils"
import { durationLabel, CHANNEL_LABEL } from "@/lib/analytics-utils"
import { campaignGoal, holdPeriodDays } from "@/lib/mock-performance"

type PreviewMode = "card" | "detail"
const PREVIEW_OPTIONS: { value: PreviewMode; label: string }[] = [
  { value: "card", label: "Card" },
  { value: "detail", label: "Detail" },
]

/**
 * Campaign Detail — "What is this campaign and how is it configured?" A read view of the
 * campaign's own configuration (goal, cashback terms, dates, merchant/distribution setup) and
 * how it renders to shoppers. This is NOT Campaign Analytics — it has no performance numbers.
 * For "how did this campaign perform", that page is reached from Brand Analytics, not from here.
 */
export default function CampaignDetail() {
  const { campaignId = "" } = useParams()
  const navigate = useNavigate()
  const campaign = campaignById(campaignId)
  const brand = campaign ? brandById(campaign.brandId) : undefined
  const [openSection, setOpenSection] = React.useState<"details" | "merchant" | "distribution" | null>("details")
  const [previewMode, setPreviewMode] = React.useState<PreviewMode>("detail")

  if (!campaign || !brand) {
    return <EmptyState icon={<MegaphoneIcon className="size-6" />} title="Campaign not found" description="This campaign doesn't exist in the sample dataset." />
  }

  function toggleSection(key: "details" | "merchant" | "distribution") {
    setOpenSection((cur) => (cur === key ? null : key))
  }

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: "Campaign", to: "/campaigns" }, { label: campaign.name }]}
        title={
          <>
            <Button variant="ghost" size="icon" className="size-9 shrink-0" onClick={() => navigate("/campaigns")}>
              <ChevronLeft className="size-4" />
            </Button>
            <BrandLogoTile initials={brand.logoInitials} color={brand.logoColor} />
            {campaign.name}
            <StatusBadge status={campaign.status} />
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <CollapsibleSection title="Campaign Details" open={openSection === "details"} onToggle={() => toggleSection("details")}>
            <DetailGrid
              items={[
                { icon: <Building2 className="size-4" />, label: "Brand", value: brand.name },
                { icon: <Percent className="size-4" />, label: "Cashback", value: `${campaign.cashbackPercentage}%` },
                { icon: <Target className="size-4" />, label: "Campaign goal", value: campaignGoal(campaign) },
                { icon: <Wallet className="size-4" />, label: "Campaign budget", value: formatAed(campaign.budget) },
                { icon: <Hourglass className="size-4" />, label: "Hold period", value: `${holdPeriodDays(campaign)} days` },
                { icon: <ArrowDownToLine className="size-4" />, label: "Minimum spend", value: campaign.minimumSpend ? formatAed(campaign.minimumSpend) : "No minimum" },
                { icon: <Clock className="size-4" />, label: "Duration", value: durationLabel(campaign) },
                { icon: <ShieldCheck className="size-4" />, label: "Cashback cap", value: `${formatAed(campaign.cashbackCap)} per transaction` },
                { icon: <CalendarDays className="size-4" />, label: "Start date", value: formatDate(campaign.startDate) },
                { icon: <CalendarDays className="size-4" />, label: "End date", value: campaign.endDate ? formatDate(campaign.endDate) : "Till budget exhausted" },
              ]}
              columns={2}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Merchant Details" open={openSection === "merchant"} onToggle={() => toggleSection("merchant")} contentClassName="p-0">
            <MerchantIdList merchantIds={brand.merchantIds} />
          </CollapsibleSection>

          <CollapsibleSection title="Distribution" open={openSection === "distribution"} onToggle={() => toggleSection("distribution")}>
            <DetailGrid
              items={[
                { icon: <Landmark className="size-4" />, label: "Distribution bank", value: campaign.distributionBank },
                { icon: <Store className="size-4" />, label: "Channel", value: CHANNEL_LABEL[campaign.channel] },
              ]}
            />
          </CollapsibleSection>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Eye className="size-4 text-muted-foreground" />
              What shoppers will see
            </span>
            <PillToggle value={previewMode} onChange={setPreviewMode} options={PREVIEW_OPTIONS} />
          </div>
          <ShopperPreview campaign={campaign} brand={brand} mode={previewMode} />
        </div>
      </div>
    </div>
  )
}

function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
  contentClassName,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
  contentClassName?: string
}) {
  return (
    <Card>
      <button onClick={onToggle} className="flex w-full items-center justify-between p-5 text-left">
        <span className="text-base font-semibold text-foreground">{title}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && <CardContent className={cn("pt-0", contentClassName)}>{children}</CardContent>}
    </Card>
  )
}

function ShopperPreview({ campaign, brand, mode }: { campaign: NonNullable<ReturnType<typeof campaignById>>; brand: NonNullable<ReturnType<typeof brandById>>; mode: PreviewMode }) {
  const holdDays = holdPeriodDays(campaign)
  const steps = [
    { icon: Store, title: `Shop at any ${brand.name} stores & Online`, description: "Shop seamlessly both online and in-store." },
    { icon: CreditCard, title: "Pay with your linked bank card", description: "Use your eligible card at checkout." },
    { icon: Clock, title: "Cashback credited on next statement", description: `Appears within ${holdDays} days of purchase date.` },
  ]
  const terms = [
    `Maximum cashback of ${formatAed(campaign.cashbackCap)} per transaction`,
    campaign.minimumSpend ? `Minimum spend of ${formatAed(campaign.minimumSpend)} per transaction` : "No minimum spend required",
    "Gift card and store credit purchases do not qualify",
    "Available at participating locations only",
  ]

  return (
    <div className="mx-auto w-full max-w-[300px] rounded-[2.25rem] border-[8px] border-neutral-900 bg-neutral-900 shadow-xl">
      <div className="relative min-h-[520px] overflow-hidden rounded-[1.5rem] bg-card">
        <div className="absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-neutral-900" />
        <div className="p-3 pt-8">
          <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">{brand.name}</span>
              <X className="size-4 opacity-80" />
            </div>
            <p className="mt-4 text-[15px] font-bold leading-snug">{campaign.name}</p>
            {mode === "detail" && (
              <p className="mt-1.5 text-xs leading-relaxed opacity-90">
                Enjoy a special {campaign.cashbackPercentage}% cashback on your next {brand.name} purchase with our exclusive offer!
              </p>
            )}

            {mode === "detail" && (
              <div className="mt-5 space-y-3">
                <p className="text-xs font-semibold">How to get cashback</p>
                {steps.map((step) => (
                  <div key={step.title} className="flex items-start gap-2.5">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <step.icon className="size-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium leading-snug">{step.title}</p>
                      <p className="text-[11px] leading-snug opacity-80">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {mode === "detail" && (
              <div className="mt-5 space-y-1.5">
                <p className="text-xs font-semibold">Terms &amp; Conditions</p>
                <ul className="space-y-1">
                  {terms.map((t) => (
                    <li key={t} className="flex items-start gap-1.5 text-[11px] leading-snug opacity-80">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-white/70" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button className="mt-5 w-full rounded-full bg-white/15 py-2.5 text-xs font-semibold">Activate Cashback</button>
          </div>
        </div>
      </div>
    </div>
  )
}
