import { PageHeader } from "@/components/shared/page-header"
import { SectionCard } from "@/components/shared/section-card"
import { MERCHANT } from "@/lib/data"

export default function Settings() {
  return (
    <div>
      <PageHeader title="Settings" description="Merchant profile and account preferences." />
      <SectionCard title="Merchant Profile" description="Region and currency are inherited from your merchant account and can't be edited here.">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Merchant name</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{MERCHANT.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Contact email</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{MERCHANT.contactEmail}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Region</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{MERCHANT.region}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Currency</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{MERCHANT.currency}</dd>
          </div>
        </dl>
      </SectionCard>
    </div>
  )
}
