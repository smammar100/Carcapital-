import { RiFlowChart } from "@remixicon/react"

import { PagePlaceholder } from "@/components/layout/page-placeholder"

export default function PipelinePage() {
  return (
    <PagePlaceholder
      title="Pipeline"
      subtitle="The lead pipeline moves to the new Sales → Pipeline route in Phase D."
      icon={RiFlowChart}
    />
  )
}
