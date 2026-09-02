import { useParams, useNavigate, Link } from "react-router-dom"
import { ChevronLeft, Globe, Instagram, Facebook, Twitter, Music2, Receipt, ShoppingBag, Wallet, Store as StoreIcon, BarChart3 } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCard } from "@/components/shared/section-card"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MerchantIdList } from "@/components/shared/merchant-id-list"
import { DetailGrid } from "@/components/analytics/detail-grid"
import { brandById } from "@/lib/data"
import { formatAed, formatDate, formatNumber } from "@/lib/utils"

const SOCIAL_LINKS = (slug: string) => [
  { platform: "Instagram", icon: Instagram, label: `instagram.com/${slug}`, href: `https://instagram.com/${slug}` },
  { platform: "Facebook", icon: Facebook, label: `facebook.com/${slug}`, href: `https://facebook.com/${slug}` },
  { platform: "X (Twitter)", icon: Twitter, label: `x.com/${slug}`, href: `https://x.com/${slug}` },
  { platform: "TikTok", icon: Music2, label: `tiktok.com/${slug}`, href: `https://tiktok.com/${slug}` },
]

/**
 * Brand Detail — the brand's profile record: business snapshot, social presence, and linked
 * Merchant IDs/terminals. This is onboarding/account information, not performance data — for
 * GMV, ROI, campaigns and customer insight, see Brand Analytics ("View Analytics" above).
 */
export default function BrandDetail() {
  const { brandId = "" } = useParams()
  const navigate = useNavigate()
  const brand = brandById(brandId)

  if (!brand) {
    return <EmptyState icon={<StoreIcon className="size-6" />} title="Brand not found" description="This brand doesn't exist in the sample dataset." />
  }

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: "Brands", to: "/brands" }, { label: brand.name }]}
        title={
          <>
            <Button variant="ghost" size="icon" className="size-9 shrink-0" onClick={() => navigate("/brands")}>
              <ChevronLeft className="size-4" />
            </Button>
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-border text-[11px] font-bold text-white" style={{ backgroundColor: brand.logoColor }}>
              {brand.logoInitials}
            </div>
            {brand.name}
          </>
        }
        meta={
          <a href={`https://${brand.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-foreground">
            <Globe className="size-3.5" />
            {brand.website}
          </a>
        }
        actions={
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <Link to={`/analytics/brands/${brand.id}`}>
              <BarChart3 className="size-3.5" />
              View Analytics
            </Link>
          </Button>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Brand Overview</TabsTrigger>
          <TabsTrigger value="merchant-details">Merchant Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Business Snapshot" description="Self-reported baseline for this brand">
              <DetailGrid
                items={[
                  { icon: <Receipt className="size-4" />, label: "Average transaction value", value: formatAed(brand.businessSnapshot.avgTransactionValue) },
                  { icon: <ShoppingBag className="size-4" />, label: "Average monthly orders", value: formatNumber(brand.businessSnapshot.avgMonthlyOrders) },
                  { icon: <Wallet className="size-4" />, label: "Monthly marketing budget", value: formatAed(brand.businessSnapshot.monthlyMarketingBudget) },
                ]}
              />
            </SectionCard>
            <SectionCard title="Social Links" description="This brand's linked social profiles">
              <div className="space-y-4">
                {SOCIAL_LINKS(brand.slug).map((link) => (
                  <a key={link.platform} href={link.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm hover:opacity-80">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
                      <link.icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-foreground">{link.platform}</p>
                      <p className="text-primary">{link.label}</p>
                    </div>
                  </a>
                ))}
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="merchant-details">
          <SectionCard title="Merchant Details" description="View this brand's linked accounts" contentClassName="px-0 pb-0">
            <MerchantIdList merchantIds={brand.merchantIds} />
          </SectionCard>
          <p className="mt-3 text-xs text-muted-foreground">Added on {formatDate(brand.addedOn)}</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
