import Link from "next/link"
import { RiUserStarLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function LeadNotFound() {
  return (
    <Empty className="mt-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <RiUserStarLine />
        </EmptyMedia>
        <EmptyTitle>Lead not found</EmptyTitle>
        <EmptyDescription>
          This lead either doesn&apos;t exist or belongs to another company.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href="/leads">Back to leads</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
