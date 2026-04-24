import Link from "next/link"
import { RiCarLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function VehicleNotFound() {
  return (
    <Empty className="mt-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <RiCarLine />
        </EmptyMedia>
        <EmptyTitle>Vehicle not found</EmptyTitle>
        <EmptyDescription>
          This vehicle either doesn&apos;t exist or belongs to another company.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href="/inventory">Back to inventory</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
