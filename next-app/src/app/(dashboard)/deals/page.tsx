import { RiShoppingBag3Line } from "@remixicon/react"

import { PagePlaceholder } from "@/components/layout/page-placeholder"

export default function DealsPage() {
  return (
    <PagePlaceholder
      title="Deals"
      subtitle="Rebuilding as the Sales → Pipeline kanban in Phase D."
      icon={RiShoppingBag3Line}
    >
      The deals workspace is being reshaped into the new Sales pipeline. Watch this space.
    </PagePlaceholder>
  )
}
