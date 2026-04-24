import { RiSettings3Line } from "@remixicon/react"

import { PagePlaceholder } from "@/components/layout/page-placeholder"

export default function SettingsPage() {
  return (
    <PagePlaceholder
      title="Settings"
      subtitle="Company settings move into Administrative → Settings in Phase F."
      icon={RiSettings3Line}
    >
      Head to Administrative → Settings from the sidebar for the rebuilt company preferences.
    </PagePlaceholder>
  )
}
