import { useNavigate } from "react-router-dom"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCard } from "@/components/shared/section-card"
import { BrandLogoTile } from "@/components/shared/brand-logo-tile"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BRANDS, campaignsForBrand } from "@/lib/data"
import { formatDate } from "@/lib/utils"

export default function BrandsList() {
  const navigate = useNavigate()
  return (
    <div>
      <PageHeader title="Brands" description="Manage brand profiles and onboarding details." />
      <SectionCard title="Brands" description="Click a brand to view its profile" contentClassName="px-4 pb-5 sm:px-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Total Campaigns</TableHead>
              <TableHead>Live Campaigns</TableHead>
              <TableHead>Added on</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {BRANDS.map((brand) => {
              const campaigns = campaignsForBrand(brand.id)
              const live = campaigns.filter((c) => c.status === "active").length
              return (
                <TableRow key={brand.id} className="cursor-pointer" onClick={() => navigate(`/brands/${brand.id}`)}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <BrandLogoTile initials={brand.logoInitials} color={brand.logoColor} size="sm" />
                      <span className="font-medium text-foreground">{brand.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-primary">{brand.website}</TableCell>
                  <TableCell className="text-foreground">{campaigns.length}</TableCell>
                  <TableCell className="text-foreground">{live}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(brand.addedOn)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </SectionCard>
    </div>
  )
}
