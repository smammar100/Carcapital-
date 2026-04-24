import { RiFileTextLine } from "@remixicon/react"

import { PagePlaceholder } from "@/components/layout/page-placeholder"

export default function ApplicationsPage() {
  return (
    <PagePlaceholder
      title="Applications"
      subtitle="Finance applications are being folded into Invoicing for Phase F."
      icon={RiFileTextLine}
    >
      This page is temporarily parked while the invoicing rebuild lands. Its content will return as
      part of the Sales → Invoicing module.
    </PagePlaceholder>
  )
}
