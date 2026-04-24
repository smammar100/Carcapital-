import { RiToolsLine } from "@remixicon/react"

import { PagePlaceholder } from "@/components/layout/page-placeholder"

export default function JobsPage() {
  return (
    <PagePlaceholder
      title="Jobs"
      subtitle="Splitting into Maintenance (internal) and Service / Workshop (external) in Phase C."
      icon={RiToolsLine}
    >
      Pick Maintenance from the sidebar for internal stock prep, or Service for walk-in workshop jobs.
    </PagePlaceholder>
  )
}
