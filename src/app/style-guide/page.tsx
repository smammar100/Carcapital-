"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemMedia, ItemSeparator, ItemTitle } from "@/components/ui/item"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger } from "@/components/ui/menubar"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Toaster } from "@/components/ui/sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { type ChartConfig } from "@/components/ui/chart"

// ─── helpers ──────────────────────────────────────────────────────────────────

const navSections = [
  { id: "typography", label: "Typography" },
  { id: "colours", label: "Colours" },
  { id: "accordion", label: "Accordion" },
  { id: "alert", label: "Alert" },
  { id: "alert-dialog", label: "Alert Dialog" },
  { id: "aspect-ratio", label: "Aspect Ratio" },
  { id: "avatar", label: "Avatar" },
  { id: "badge", label: "Badge" },
  { id: "breadcrumb", label: "Breadcrumb" },
  { id: "button", label: "Button" },
  { id: "button-group", label: "Button Group" },
  { id: "calendar", label: "Calendar" },
  { id: "card", label: "Card" },
  { id: "carousel", label: "Carousel" },
  { id: "chart", label: "Chart" },
  { id: "checkbox", label: "Checkbox" },
  { id: "collapsible", label: "Collapsible" },
  { id: "command", label: "Command" },
  { id: "context-menu", label: "Context Menu" },
  { id: "dialog", label: "Dialog" },
  { id: "drawer", label: "Drawer" },
  { id: "dropdown-menu", label: "Dropdown Menu" },
  { id: "empty", label: "Empty" },
  { id: "field", label: "Field" },
  { id: "hover-card", label: "Hover Card" },
  { id: "input", label: "Input" },
  { id: "input-group", label: "Input Group" },
  { id: "input-otp", label: "Input OTP" },
  { id: "item", label: "Item" },
  { id: "kbd", label: "Kbd" },
  { id: "menubar", label: "Menubar" },
  { id: "native-select", label: "Native Select" },
  { id: "navigation-menu", label: "Navigation Menu" },
  { id: "pagination", label: "Pagination" },
  { id: "popover", label: "Popover" },
  { id: "progress", label: "Progress" },
  { id: "radio-group", label: "Radio Group" },
  { id: "resizable", label: "Resizable" },
  { id: "scroll-area", label: "Scroll Area" },
  { id: "select", label: "Select" },
  { id: "separator", label: "Separator" },
  { id: "sheet", label: "Sheet" },
  { id: "skeleton", label: "Skeleton" },
  { id: "slider", label: "Slider" },
  { id: "sonner", label: "Sonner" },
  { id: "spinner", label: "Spinner" },
  { id: "switch", label: "Switch" },
  { id: "table", label: "Table" },
  { id: "tabs", label: "Tabs" },
  { id: "textarea", label: "Textarea" },
  { id: "toggle", label: "Toggle" },
  { id: "toggle-group", label: "Toggle Group" },
  { id: "tooltip", label: "Tooltip" },
]

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 space-y-5">
      <div>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <Separator className="mt-2" />
      </div>
      <div>{children}</div>
    </section>
  )
}

function Swatch({ label, className }: { label: string; className: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={`h-12 w-full rounded-md border border-border ${className}`} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

// ─── chart data ───────────────────────────────────────────────────────────────

const barData = [
  { month: "Jan", sales: 42 },
  { month: "Feb", sales: 65 },
  { month: "Mar", sales: 57 },
  { month: "Apr", sales: 73 },
  { month: "May", sales: 89 },
  { month: "Jun", sales: 95 },
]

const lineData = [
  { month: "Jan", avg: 18500 },
  { month: "Feb", avg: 19200 },
  { month: "Mar", avg: 18900 },
  { month: "Apr", avg: 21000 },
  { month: "May", avg: 22500 },
  { month: "Jun", avg: 23100 },
]

const barConfig: ChartConfig = {
  sales: { label: "Vehicles Sold", color: "var(--chart-1)" },
}

const lineConfig: ChartConfig = {
  avg: { label: "Avg Price", color: "var(--chart-2)" },
}

const tableData = [
  { name: "Honda Civic", year: 2021, price: "$22,500", status: "Available" },
  { name: "Toyota Corolla", year: 2020, price: "$19,800", status: "Sold" },
  { name: "Ford Mustang", year: 2022, price: "$38,900", status: "Available" },
  { name: "Chevrolet Tahoe", year: 2019, price: "$44,200", status: "Reserved" },
  { name: "Mazda CX-5", year: 2023, price: "$31,000", status: "Available" },
]

const scrollItems = [
  "Honda Civic 2021", "Toyota Corolla 2020", "Ford Mustang 2022",
  "Chevrolet Tahoe 2019", "Mazda CX-5 2023", "Nissan Altima 2021",
  "Hyundai Tucson 2022", "Kia Sorento 2020", "Volkswagen Golf 2021",
  "Subaru Outback 2022",
]

// ─── page ─────────────────────────────────────────────────────────────────────

export default function StyleGuidePage() {
  const { setTheme, theme } = useTheme()
  const [sliderValue, setSliderValue] = useState([40])
  const [calDate, setCalDate] = useState<Date | undefined>(new Date())
  const [otpValue, setOtpValue] = useState("")

  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      {/* ── sticky header ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-semibold leading-none">Style Guide</p>
              <p className="text-xs text-muted-foreground mt-0.5">Car Capital Design System</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <i className={`ri-${theme === "dark" ? "sun" : "moon"}-line`} />
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </Button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-10">

        {/* ── left nav ── */}
        <aside className="hidden lg:block w-44 shrink-0">
          <nav className="sticky top-20">
            <ScrollArea className="h-[calc(100vh-6rem)]">
              <ul className="space-y-0.5 pr-4 pb-8">
                {navSections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </nav>
        </aside>

        {/* ── main content ── */}
        <main className="min-w-0 flex-1 space-y-14">

          {/* ── TYPOGRAPHY ── */}
          <Section id="typography" title="Typography">
            <div className="space-y-4 max-w-2xl">
              <div className="space-y-2">
                {(["text-4xl font-extrabold", "text-3xl font-bold", "text-2xl font-semibold", "text-xl font-semibold", "text-lg font-medium", "text-base font-medium"] as const).map((cls, i) => (
                  <p key={i} className={`${cls} tracking-tight leading-tight`}>Heading {i + 1} — The quick brown fox</p>
                ))}
              </div>
              <Separator />
              <p className="text-base leading-7">Body — Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <p className="text-sm leading-6 text-muted-foreground">Small / Muted — Supporting text for descriptions, captions, and secondary information.</p>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Label / Overline — Section labels and category text</p>
              <blockquote className="border-l-2 border-primary pl-4 italic text-muted-foreground text-sm">
                "Great design is not just what it looks like and feels like. Design is how it works."
              </blockquote>
              <div className="flex flex-wrap gap-2 items-center">
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">inline code</code>
                <Kbd>⌘</Kbd>
                <KbdGroup>
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                </KbdGroup>
                <Kbd>Enter</Kbd>
              </div>
            </div>
          </Section>

          {/* ── COLOURS ── */}
          <Section id="colours" title="Colours">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              <Swatch label="Background" className="bg-background" />
              <Swatch label="Foreground" className="bg-foreground" />
              <Swatch label="Primary" className="bg-primary" />
              <Swatch label="Primary FG" className="bg-primary-foreground" />
              <Swatch label="Secondary" className="bg-secondary" />
              <Swatch label="Accent" className="bg-accent" />
              <Swatch label="Muted" className="bg-muted" />
              <Swatch label="Muted FG" className="bg-muted-foreground" />
              <Swatch label="Destructive" className="bg-destructive" />
              <Swatch label="Border" className="bg-border" />
              <Swatch label="Card" className="bg-card border" />
              <Swatch label="Ring" className="bg-ring" />
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">Chart Palette</p>
              <div className="grid grid-cols-5 gap-3 max-w-sm">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Swatch key={n} label={`Chart ${n}`} className={`bg-chart-${n}`} />
                ))}
              </div>
            </div>
          </Section>

          {/* ── ACCORDION ── */}
          <Section id="accordion" title="Accordion">
            <Accordion type="single" collapsible className="w-full max-w-lg">
              <AccordionItem value="a1">
                <AccordionTrigger>What documents do I need?</AccordionTrigger>
                <AccordionContent>A valid driver's licence, last 2 pay slips, and a recent utility bill for address verification.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="a2">
                <AccordionTrigger>How long does approval take?</AccordionTrigger>
                <AccordionContent>Most applications receive a decision within 2 hours during business hours.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="a3">
                <AccordionTrigger>Can I trade in my vehicle?</AccordionTrigger>
                <AccordionContent>Yes. We accept trade-ins and provide a valuation as part of your application. The value is applied to reduce your loan amount.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </Section>

          {/* ── ALERT ── */}
          <Section id="alert" title="Alert">
            <div className="space-y-3 max-w-lg">
              <Alert>
                <i className="ri-information-line" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>Your application has been submitted and is under review.</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <i className="ri-error-warning-line" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>We couldn't verify your identity. Please check your details and try again.</AlertDescription>
              </Alert>
            </div>
          </Section>

          {/* ── ALERT DIALOG ── */}
          <Section id="alert-dialog" title="Alert Dialog">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete listing</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete the listing and all associated data. This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Section>

          {/* ── ASPECT RATIO ── */}
          <Section id="aspect-ratio" title="Aspect Ratio">
            <div className="grid grid-cols-3 gap-4 max-w-lg">
              {(["16/9", "4/3", "1/1"] as const).map((ratio) => (
                <div key={ratio}>
                  <AspectRatio ratio={eval(ratio)} className="bg-muted rounded-md overflow-hidden">
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{ratio}</div>
                  </AspectRatio>
                </div>
              ))}
            </div>
          </Section>

          {/* ── AVATAR ── */}
          <Section id="avatar" title="Avatar">
            <div className="flex flex-wrap items-end gap-6">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="size-16">
                  <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">With image</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Avatar className="size-16"><AvatarFallback>JD</AvatarFallback></Avatar>
                <span className="text-xs text-muted-foreground">Initials</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-2 items-center">
                  {(["size-8", "size-10", "size-12", "size-16"] as const).map((s, i) => (
                    <Avatar key={i} className={s}><AvatarFallback className="text-xs">{["SM", "MD", "LG", "XL"][i]}</AvatarFallback></Avatar>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">Sizes</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex -space-x-3">
                  {["AB", "CD", "EF", "GH"].map((i) => (
                    <Avatar key={i} className="size-10 border-2 border-background"><AvatarFallback className="text-xs">{i}</AvatarFallback></Avatar>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">Stacked</span>
              </div>
            </div>
          </Section>

          {/* ── BADGE ── */}
          <Section id="badge" title="Badge">
            <div className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </Section>

          {/* ── BREADCRUMB ── */}
          <Section id="breadcrumb" title="Breadcrumb">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="#">Home</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink href="#">Listings</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink href="#">Sedans</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>Honda Civic 2022</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </Section>

          {/* ── BUTTON ── */}
          <Section id="button" title="Button">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">Variants</p>
                <div className="flex flex-wrap gap-3">
                  {(["default", "secondary", "outline", "ghost", "destructive", "link"] as const).map((v) => (
                    <Button key={v} variant={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">Sizes</p>
                <div className="flex flex-wrap gap-3 items-center">
                  <Button size="lg">Large</Button>
                  <Button size="default">Default</Button>
                  <Button size="sm">Small</Button>
                  <Button size="xs">X-Small</Button>
                  <Button size="icon"><i className="ri-star-line" /></Button>
                  <Button size="icon-sm"><i className="ri-star-line" /></Button>
                  <Button size="icon-xs"><i className="ri-star-line" /></Button>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">States</p>
                <div className="flex flex-wrap gap-3">
                  <Button>Active</Button>
                  <Button disabled>Disabled</Button>
                  <Button variant="outline" disabled>Outline Disabled</Button>
                </div>
              </div>
            </div>
          </Section>

          {/* ── BUTTON GROUP ── */}
          <Section id="button-group" title="Button Group">
            <div className="space-y-4">
              <ButtonGroup>
                <Button variant="outline">All</Button>
                <Button variant="outline">Sedans</Button>
                <Button variant="outline">SUVs</Button>
                <Button variant="outline">Trucks</Button>
              </ButtonGroup>
              <ButtonGroup>
                <ButtonGroupText>$</ButtonGroupText>
                <Button variant="outline">Min</Button>
                <ButtonGroupSeparator />
                <Button variant="outline">Max</Button>
              </ButtonGroup>
              <ButtonGroup orientation="vertical">
                <Button variant="outline">List view</Button>
                <Button variant="outline">Grid view</Button>
                <Button variant="outline">Map view</Button>
              </ButtonGroup>
            </div>
          </Section>

          {/* ── CALENDAR ── */}
          <Section id="calendar" title="Calendar">
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">Single</p>
                <Calendar mode="single" selected={calDate} onSelect={setCalDate} className="rounded-md border border-border" />
              </div>
            </div>
          </Section>

          {/* ── CARD ── */}
          <Section id="card" title="Card">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>2022 Honda Civic</CardTitle>
                  <CardDescription>Sedan · 28,000 km</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">$22,500</p>
                  <p className="text-sm text-muted-foreground mt-1">Excellent condition, one owner</p>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button size="sm">View</Button>
                  <Button size="sm" variant="outline">Save</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Finance Calculator</CardTitle>
                  <CardDescription>Estimate your repayments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {[["Loan amount", "$18,000"], ["Term", "60 months"], ["Rate", "6.9% p.a."], ["Est. repayment", "$354/mo"]].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter><Button className="w-full">Apply Now</Button></CardFooter>
              </Card>
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
                  <i className="ri-car-line text-4xl text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground text-center">No saved vehicles yet. Browse listings to add favourites.</p>
                  <Button variant="outline" size="sm">Browse</Button>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ── CAROUSEL ── */}
          <Section id="carousel" title="Carousel">
            <Carousel className="w-full max-w-lg" opts={{ loop: true }}>
              <CarouselContent>
                {["2022 Honda Civic — $22,500", "2021 Toyota Corolla — $19,800", "2020 Ford Mustang — $38,900", "2019 Chevrolet Tahoe — $44,200"].map((label, i) => (
                  <CarouselItem key={i} className="basis-1/2">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-4">
                        <div className="text-center">
                          <i className="ri-car-line text-3xl text-muted-foreground/40 mb-2 block" />
                          <p className="text-xs text-muted-foreground leading-snug">{label}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </Section>

          {/* ── CHART ── */}
          <Section id="chart" title="Chart">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Sales</CardTitle>
                  <CardDescription>Vehicles sold Jan – Jun 2024</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={barConfig} className="h-48 w-full">
                    <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="sales" fill="var(--chart-1)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Average Sale Price</CardTitle>
                  <CardDescription>Trend Jan – Jun 2024</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={lineConfig} className="h-48 w-full">
                    <LineChart data={lineData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line dataKey="avg" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ── CHECKBOX ── */}
          <Section id="checkbox" title="Checkbox">
            <div className="flex flex-col gap-3">
              {[["terms", "I agree to the terms and conditions", true, false],
                ["newsletter", "Subscribe to newsletter", false, false],
                ["disabled", "Disabled option", false, true]].map(([id, label, checked, disabled]) => (
                <div key={String(id)} className="flex items-center gap-2">
                  <Checkbox id={String(id)} defaultChecked={Boolean(checked)} disabled={Boolean(disabled)} />
                  <Label htmlFor={String(id)} className={disabled ? "text-muted-foreground" : ""}>{String(label)}</Label>
                </div>
              ))}
            </div>
          </Section>

          {/* ── COLLAPSIBLE ── */}
          <Section id="collapsible" title="Collapsible">
            <Collapsible className="w-full max-w-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Advanced filters</span>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon-sm"><i className="ri-arrow-down-s-line" /></Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-2">
                <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">Colour</div>
                <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">Transmission</div>
                <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">Body type</div>
              </CollapsibleContent>
            </Collapsible>
          </Section>

          {/* ── COMMAND ── */}
          <Section id="command" title="Command">
            <Command className="rounded-md border border-border max-w-sm shadow-sm">
              <CommandInput placeholder="Search vehicles or commands…" />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Listings">
                  <CommandItem>Honda Civic 2022</CommandItem>
                  <CommandItem>Toyota Corolla 2021</CommandItem>
                  <CommandItem>Ford Mustang 2022</CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Actions">
                  <CommandItem>Apply for Finance</CommandItem>
                  <CommandItem>Book a Test Drive</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </Section>

          {/* ── CONTEXT MENU ── */}
          <Section id="context-menu" title="Context Menu">
            <ContextMenu>
              <ContextMenuTrigger className="flex h-24 w-64 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                Right-click here
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuLabel>Vehicle Actions</ContextMenuLabel>
                <ContextMenuSeparator />
                <ContextMenuItem>Save listing</ContextMenuItem>
                <ContextMenuItem>Share</ContextMenuItem>
                <ContextMenuItem>Compare</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem className="text-destructive">Report</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </Section>

          {/* ── DIALOG ── */}
          <Section id="dialog" title="Dialog">
            <Dialog>
              <DialogTrigger asChild><Button variant="outline">Open Dialog</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Finance Application</DialogTitle>
                  <DialogDescription>You're about to submit a finance application for a 2022 Honda Civic at $22,500. This will perform a soft credit check.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Full Name</Label>
                    <Input placeholder="John Smith" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input type="email" placeholder="john@example.com" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Submit Application</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Section>

          {/* ── DRAWER ── */}
          <Section id="drawer" title="Drawer">
            <Drawer>
              <DrawerTrigger asChild><Button variant="outline">Open Drawer</Button></DrawerTrigger>
              <DrawerContent>
                <DrawerHeader className="text-left">
                  <DrawerTitle>Filter Vehicles</DrawerTitle>
                  <DrawerDescription>Narrow down your search using the filters below.</DrawerDescription>
                </DrawerHeader>
                <div className="px-4 space-y-4">
                  <div className="space-y-1.5"><Label>Make</Label><Input placeholder="e.g. Toyota" /></div>
                  <div className="space-y-1.5"><Label>Body type</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>
                        {["Sedan", "SUV", "Hatchback", "Ute"].map((t) => <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DrawerFooter>
                  <Button>Apply filters</Button>
                  <DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </Section>

          {/* ── DROPDOWN MENU ── */}
          <Section id="dropdown-menu" title="Dropdown Menu">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Options <i className="ri-arrow-down-s-line ml-1" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Listing actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Save listing</DropdownMenuItem>
                <DropdownMenuItem>Share</DropdownMenuItem>
                <DropdownMenuItem>Compare</DropdownMenuItem>
                <DropdownMenuItem>Book test drive</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Report listing</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Section>

          {/* ── EMPTY ── */}
          <Section id="empty" title="Empty">
            <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
              <Empty className="rounded-md border border-dashed border-border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <i className="ri-car-line" />
                  </EmptyMedia>
                  <EmptyTitle>No vehicles found</EmptyTitle>
                  <EmptyDescription>Try adjusting your filters or search again.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button size="sm" variant="outline">Clear filters</Button>
                </EmptyContent>
              </Empty>
              <Empty className="rounded-md border border-dashed border-border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <i className="ri-bookmark-line" />
                  </EmptyMedia>
                  <EmptyTitle>No saved listings</EmptyTitle>
                  <EmptyDescription>Save vehicles to compare and revisit later.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button size="sm">Browse listings</Button>
                </EmptyContent>
              </Empty>
            </div>
          </Section>

          {/* ── FIELD ── */}
          <Section id="field" title="Field">
            <div className="max-w-sm space-y-5">
              <FieldGroup>
                <Field>
                  <FieldLabel>Full Name</FieldLabel>
                  <FieldDescription>As it appears on your driver's licence.</FieldDescription>
                  <Input placeholder="John Smith" />
                </Field>
                <Field>
                  <FieldLabel>Email Address</FieldLabel>
                  <Input type="email" placeholder="john@example.com" />
                </Field>
                <Field data-invalid="true">
                  <FieldLabel>Mobile Number</FieldLabel>
                  <Input placeholder="+61 400 000 000" aria-invalid />
                  <FieldError>Please enter a valid Australian mobile number.</FieldError>
                </Field>
              </FieldGroup>
              <FieldSet>
                <FieldLegend>Notification Preferences</FieldLegend>
                <div className="flex flex-col gap-2">
                  {["Email updates", "SMS alerts", "Push notifications"].map((label) => (
                    <div key={label} className="flex items-center gap-2">
                      <Checkbox id={label} />
                      <Label htmlFor={label}>{label}</Label>
                    </div>
                  ))}
                </div>
              </FieldSet>
            </div>
          </Section>

          {/* ── HOVER CARD ── */}
          <Section id="hover-card" title="Hover Card">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="link" className="p-0">@carcapital</Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarFallback>CC</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Car Capital</h4>
                    <p className="text-xs text-muted-foreground">Australia's leading car finance marketplace. Get pre-approved in minutes.</p>
                    <p className="text-xs text-muted-foreground">Joined January 2020</p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </Section>

          {/* ── INPUT ── */}
          <Section id="input" title="Input">
            <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
              <div className="space-y-1.5"><Label>Default</Label><Input placeholder="Search vehicles…" /></div>
              <div className="space-y-1.5"><Label>With value</Label><Input defaultValue="Honda Civic" /></div>
              <div className="space-y-1.5"><Label>Disabled</Label><Input disabled placeholder="Not editable" /></div>
              <div className="space-y-1.5"><Label>Invalid</Label><Input aria-invalid placeholder="Bad value" /></div>
              <div className="space-y-1.5"><Label>Password</Label><Input type="password" defaultValue="secret123" /></div>
              <div className="space-y-1.5"><Label>Number</Label><Input type="number" placeholder="0" /></div>
            </div>
          </Section>

          {/* ── INPUT GROUP ── */}
          <Section id="input-group" title="Input Group">
            <div className="space-y-4 max-w-sm">
              <div className="space-y-1.5">
                <Label>Price range</Label>
                <InputGroup>
                  <InputGroupAddon><i className="ri-money-dollar-circle-line text-muted-foreground" /></InputGroupAddon>
                  <InputGroupInput placeholder="Min price" />
                </InputGroup>
              </div>
              <div className="space-y-1.5">
                <Label>Search with action</Label>
                <InputGroup>
                  <InputGroupAddon><i className="ri-search-line text-muted-foreground" /></InputGroupAddon>
                  <InputGroupInput placeholder="Search listings…" />
                  <InputGroupButton asChild>
                    <Button size="sm" variant="ghost"><i className="ri-close-line" /></Button>
                  </InputGroupButton>
                </InputGroup>
              </div>
              <div className="space-y-1.5">
                <Label>Domain</Label>
                <InputGroup>
                  <InputGroupInput placeholder="yourname" />
                  <InputGroupAddon align="inline-end" className="text-muted-foreground">.carcapital.com.au</InputGroupAddon>
                </InputGroup>
              </div>
            </div>
          </Section>

          {/* ── INPUT OTP ── */}
          <Section id="input-otp" title="Input OTP">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Verification code</Label>
                <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                {otpValue && <p className="text-xs text-muted-foreground">Entered: {otpValue}</p>}
              </div>
            </div>
          </Section>

          {/* ── ITEM ── */}
          <Section id="item" title="Item">
            <ItemGroup className="max-w-sm border border-border rounded-md overflow-hidden divide-y divide-border">
              {tableData.slice(0, 3).map((row) => (
                <Item key={row.name} variant="default">
                  <ItemMedia>
                    <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                      <i className="ri-car-line text-muted-foreground" />
                    </div>
                  </ItemMedia>
                  <ItemContent>
                    <ItemHeader>
                      <ItemTitle>{row.name}</ItemTitle>
                      <ItemDescription>{row.year}</ItemDescription>
                    </ItemHeader>
                  </ItemContent>
                  <ItemActions>
                    <Badge variant={row.status === "Available" ? "default" : "secondary"}>{row.status}</Badge>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          </Section>

          {/* ── KBD ── */}
          <Section id="kbd" title="Kbd">
            <div className="flex flex-wrap gap-4 items-center">
              <Kbd>Enter</Kbd>
              <Kbd>Escape</Kbd>
              <KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>
              <KbdGroup><Kbd>Ctrl</Kbd><Kbd>Shift</Kbd><Kbd>P</Kbd></KbdGroup>
              <KbdGroup><Kbd>⌥</Kbd><Kbd>↑</Kbd></KbdGroup>
            </div>
          </Section>

          {/* ── MENUBAR ── */}
          <Section id="menubar" title="Menubar">
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>New Listing <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
                  <MenubarItem>Save <MenubarShortcut>⌘S</MenubarShortcut></MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Export</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>Undo <MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
                  <MenubarItem>Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut></MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Find <MenubarShortcut>⌘F</MenubarShortcut></MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>List</MenubarItem>
                  <MenubarItem>Grid</MenubarItem>
                  <MenubarItem>Map</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </Section>

          {/* ── NATIVE SELECT ── */}
          <Section id="native-select" title="Native Select">
            <div className="flex flex-wrap gap-6">
              <div className="space-y-1.5">
                <Label>State</Label>
                <NativeSelect>
                  <NativeSelectOption value="">Select state…</NativeSelectOption>
                  {["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"].map((s) => (
                    <NativeSelectOption key={s} value={s}>{s}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-1.5">
                <Label>Small</Label>
                <NativeSelect size="sm">
                  <NativeSelectOption>All years</NativeSelectOption>
                  {[2024, 2023, 2022, 2021, 2020].map((y) => (
                    <NativeSelectOption key={y} value={String(y)}>{y}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            </div>
          </Section>

          {/* ── NAVIGATION MENU ── */}
          <Section id="navigation-menu" title="Navigation Menu">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Buy</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-2 p-4 w-64">
                      {["Search listings", "Browse by make", "Browse by body type", "Featured deals"].map((item) => (
                        <li key={item}>
                          <NavigationMenuLink className="block rounded px-3 py-1.5 text-sm hover:bg-muted transition-colors" href="#">
                            {item}
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Finance</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-2 p-4 w-64">
                      {["Get pre-approved", "Finance calculator", "Rates & fees", "Trade-in valuation"].map((item) => (
                        <li key={item}>
                          <NavigationMenuLink className="block rounded px-3 py-1.5 text-sm hover:bg-muted transition-colors" href="#">
                            {item}
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink className="px-4 py-2 text-sm hover:underline" href="#">About</NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </Section>

          {/* ── PAGINATION ── */}
          <Section id="pagination" title="Pagination">
            <Pagination>
              <PaginationContent>
                <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
                <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>
                <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
                <PaginationItem><PaginationEllipsis /></PaginationItem>
                <PaginationItem><PaginationLink href="#">12</PaginationLink></PaginationItem>
                <PaginationItem><PaginationNext href="#" /></PaginationItem>
              </PaginationContent>
            </Pagination>
          </Section>

          {/* ── POPOVER ── */}
          <Section id="popover" title="Popover">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Set price range</Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Price range</p>
                  <div className="flex gap-2">
                    <Input placeholder="Min" type="number" className="w-24" />
                    <Input placeholder="Max" type="number" className="w-24" />
                  </div>
                  <Button size="sm" className="w-full">Apply</Button>
                </div>
              </PopoverContent>
            </Popover>
          </Section>

          {/* ── PROGRESS ── */}
          <Section id="progress" title="Progress">
            <div className="space-y-4 max-w-sm">
              {[[65, "Application complete", "h-2"], [25, "Documents uploaded", "h-1.5"], [90, "Credit check", "h-3"]].map(([val, label, cls]) => (
                <div key={String(label)} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{String(label)}</span>
                    <span>{String(val)}%</span>
                  </div>
                  <Progress value={Number(val)} className={String(cls)} />
                </div>
              ))}
            </div>
          </Section>

          {/* ── RADIO GROUP ── */}
          <Section id="radio-group" title="Radio Group">
            <RadioGroup defaultValue="any" className="flex flex-col gap-2">
              {[["any", "Any fuel type"], ["petrol", "Petrol"], ["diesel", "Diesel"], ["electric", "Electric"], ["hybrid", "Hybrid"]].map(([v, l]) => (
                <div key={v} className="flex items-center gap-2">
                  <RadioGroupItem value={String(v)} id={`r-${v}`} />
                  <Label htmlFor={`r-${v}`}>{String(l)}</Label>
                </div>
              ))}
            </RadioGroup>
          </Section>

          {/* ── RESIZABLE ── */}
          <Section id="resizable" title="Resizable">
            <div className="space-y-3 max-w-lg">
              <ResizablePanelGroup orientation="horizontal" className="min-h-28 rounded-md border border-border">
                <ResizablePanel defaultSize={25} minSize={15}>
                  <div className="flex h-full items-center justify-center p-3 text-xs text-muted-foreground">Nav</div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50}>
                  <div className="flex h-full items-center justify-center p-3 text-xs text-muted-foreground">Main</div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={25} minSize={15}>
                  <div className="flex h-full items-center justify-center p-3 text-xs text-muted-foreground">Panel</div>
                </ResizablePanel>
              </ResizablePanelGroup>
              <ResizablePanelGroup orientation="vertical" className="min-h-28 rounded-md border border-border">
                <ResizablePanel defaultSize={50}>
                  <div className="flex h-full items-center justify-center p-3 text-xs text-muted-foreground">Top</div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50}>
                  <div className="flex h-full items-center justify-center p-3 text-xs text-muted-foreground">Bottom</div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </Section>

          {/* ── SCROLL AREA ── */}
          <Section id="scroll-area" title="Scroll Area">
            <ScrollArea className="h-48 w-64 rounded-md border border-border">
              <div className="p-4 space-y-2">
                {scrollItems.map((item) => (
                  <div key={item} className="text-sm py-1.5 border-b border-border last:border-0 text-muted-foreground">{item}</div>
                ))}
              </div>
            </ScrollArea>
          </Section>

          {/* ── SELECT ── */}
          <Section id="select" title="Select">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-1.5 w-48">
                <Label>Vehicle type</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["Sedan", "SUV", "Hatchback", "Ute", "Van", "Coupe"].map((t) => (
                      <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 w-48">
                <Label>Disabled</Label>
                <Select disabled>
                  <SelectTrigger><SelectValue placeholder="Unavailable" /></SelectTrigger>
                  <SelectContent><SelectItem value="x">-</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </Section>

          {/* ── SEPARATOR ── */}
          <Section id="separator" title="Separator">
            <div className="space-y-4 max-w-xs">
              <div className="space-y-1">
                <p className="text-sm font-medium">Car Capital</p>
                <p className="text-sm text-muted-foreground">Finance made simple.</p>
              </div>
              <Separator />
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>Privacy</span>
                <Separator orientation="vertical" className="h-4" />
                <span>Terms</span>
                <Separator orientation="vertical" className="h-4" />
                <span>Contact</span>
              </div>
            </div>
          </Section>

          {/* ── SHEET ── */}
          <Section id="sheet" title="Sheet">
            <div className="flex flex-wrap gap-3">
              {(["right", "left", "bottom"] as const).map((side) => (
                <Sheet key={side}>
                  <SheetTrigger asChild><Button variant="outline">From {side}</Button></SheetTrigger>
                  <SheetContent side={side}>
                    <SheetHeader>
                      <SheetTitle>Filter listings</SheetTitle>
                      <SheetDescription>Narrow down vehicles by your preferences.</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4 px-4">
                      <div className="space-y-1.5"><Label>Make</Label><Input placeholder="e.g. Toyota" /></div>
                      <div className="space-y-1.5"><Label>Max Price</Label><Input type="number" placeholder="50000" /></div>
                      <Button className="w-full mt-2">Apply</Button>
                    </div>
                  </SheetContent>
                </Sheet>
              ))}
            </div>
          </Section>

          {/* ── SKELETON ── */}
          <Section id="skeleton" title="Skeleton">
            <div className="space-y-5 max-w-sm">
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-36 w-full rounded-md" />
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-20 rounded-md" />
                <Skeleton className="h-20 rounded-md" />
                <Skeleton className="h-20 rounded-md" />
              </div>
            </div>
          </Section>

          {/* ── SLIDER ── */}
          <Section id="slider" title="Slider">
            <div className="space-y-6 max-w-sm">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label>Max price</Label>
                  <span className="text-muted-foreground">${(sliderValue[0] * 1000).toLocaleString()}</span>
                </div>
                <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
              </div>
              <div className="space-y-2">
                <Label>Year range</Label>
                <Slider defaultValue={[2015, 2023]} min={2000} max={2024} step={1} />
              </div>
              <div className="space-y-2">
                <Label>Disabled</Label>
                <Slider defaultValue={[50]} disabled />
              </div>
            </div>
          </Section>

          {/* ── SONNER ── */}
          <Section id="sonner" title="Sonner">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => toast("Application submitted successfully.")}>Default</Button>
              <Button variant="outline" onClick={() => toast.success("Finance approved! We'll be in touch shortly.")}>Success</Button>
              <Button variant="outline" onClick={() => toast.error("Something went wrong. Please try again.")}>Error</Button>
              <Button variant="outline" onClick={() => toast.warning("Your session is about to expire.")}>Warning</Button>
              <Button variant="outline" onClick={() => toast.info("New listings matching your search are available.")}>Info</Button>
              <Button variant="outline" onClick={() => toast.loading("Processing your application…")}>Loading</Button>
              <Button variant="outline" onClick={() => toast("Document uploaded", { description: "Registration.pdf has been added to your application.", action: { label: "View", onClick: () => {} } })}>With action</Button>
            </div>
          </Section>

          {/* ── SPINNER ── */}
          <Section id="spinner" title="Spinner">
            <div className="flex flex-wrap items-center gap-6">
              {(["size-4", "size-6", "size-8", "size-10"] as const).map((s) => (
                <div key={s} className="flex flex-col items-center gap-2">
                  <Spinner className={s} />
                  <span className="text-xs text-muted-foreground">{s}</span>
                </div>
              ))}
              <div className="flex flex-col items-center gap-2">
                <Button disabled><Spinner className="mr-2" />Processing…</Button>
                <span className="text-xs text-muted-foreground">In button</span>
              </div>
            </div>
          </Section>

          {/* ── SWITCH ── */}
          <Section id="switch" title="Switch">
            <div className="space-y-3 max-w-xs">
              {[["Push notifications", true], ["SMS updates", false], ["Disabled", false, true]].map(([label, checked, disabled]) => (
                <div key={String(label)} className="flex items-center justify-between">
                  <Label className={disabled ? "text-muted-foreground" : ""}>{String(label)}</Label>
                  <Switch defaultChecked={Boolean(checked)} disabled={Boolean(disabled)} />
                </div>
              ))}
            </div>
          </Section>

          {/* ── TABLE ── */}
          <Section id="table" title="Table">
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{row.year}</TableCell>
                      <TableCell>{row.price}</TableCell>
                      <TableCell>
                        <Badge variant={row.status === "Available" ? "default" : row.status === "Sold" ? "destructive" : "secondary"}>
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Section>

          {/* ── TABS ── */}
          <Section id="tabs" title="Tabs">
            <Tabs defaultValue="overview" className="max-w-lg">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="specs">Specs</TabsTrigger>
                <TabsTrigger value="finance">Finance</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">Vehicle condition report, seller details, and full listing history.</p>
                <div className="flex flex-wrap gap-2">
                  {["1 Owner", "Service History", "No Accidents", "RWC Included"].map((b) => <Badge key={b} variant="secondary">{b}</Badge>)}
                </div>
              </TabsContent>
              <TabsContent value="specs" className="mt-4">
                <div className="grid grid-cols-2 gap-y-2 text-sm max-w-xs">
                  {[["Engine", "2.0L 4-cyl"], ["Trans.", "CVT"], ["Drive", "FWD"], ["Economy", "7.2L/100km"], ["Seats", "5"], ["Colour", "Sonic Grey"]].map(([k, v]) => (
                    <>
                      <span key={`k-${k}`} className="text-muted-foreground">{k}</span>
                      <span key={`v-${k}`} className="font-medium">{v}</span>
                    </>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="finance" className="mt-4">
                <p className="text-sm text-muted-foreground">Get pre-approved and know your budget before you shop. From 5.9% p.a.</p>
              </TabsContent>
              <TabsContent value="history" className="mt-4">
                <p className="text-sm text-muted-foreground">Full PPSR check, odometer history, and previous registration details.</p>
              </TabsContent>
            </Tabs>
          </Section>

          {/* ── TEXTAREA ── */}
          <Section id="textarea" title="Textarea">
            <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
              <div className="space-y-1.5">
                <Label>Default</Label>
                <Textarea placeholder="Tell us about your vehicle needs…" rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label>Disabled</Label>
                <Textarea disabled placeholder="Not editable" rows={3} />
              </div>
            </div>
          </Section>

          {/* ── TOGGLE ── */}
          <Section id="toggle" title="Toggle">
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">Default</p>
                <div className="flex gap-1">
                  {(["ri-bold", "ri-italic", "ri-underline", "ri-strikethrough"] as const).map((icon) => (
                    <Toggle key={icon} aria-label={icon}><i className={icon} /></Toggle>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">Outline</p>
                <div className="flex gap-1">
                  {(["ri-align-left", "ri-align-center", "ri-align-right", "ri-align-justify"] as const).map((icon) => (
                    <Toggle key={icon} variant="outline" aria-label={icon}><i className={icon} /></Toggle>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">Disabled</p>
                <Toggle disabled aria-label="Disabled"><i className="ri-lock-line" /></Toggle>
              </div>
            </div>
          </Section>

          {/* ── TOGGLE GROUP ── */}
          <Section id="toggle-group" title="Toggle Group">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">Single</p>
                <ToggleGroup type="single" defaultValue="grid">
                  <ToggleGroupItem value="list" aria-label="List view"><i className="ri-list-unordered" /></ToggleGroupItem>
                  <ToggleGroupItem value="grid" aria-label="Grid view"><i className="ri-grid-line" /></ToggleGroupItem>
                  <ToggleGroupItem value="map" aria-label="Map view"><i className="ri-map-pin-line" /></ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">Multiple</p>
                <ToggleGroup type="multiple" variant="outline">
                  <ToggleGroupItem value="sedan">Sedan</ToggleGroupItem>
                  <ToggleGroupItem value="suv">SUV</ToggleGroupItem>
                  <ToggleGroupItem value="ute">Ute</ToggleGroupItem>
                  <ToggleGroupItem value="van">Van</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </Section>

          {/* ── TOOLTIP ── */}
          <Section id="tooltip" title="Tooltip">
            <div className="flex flex-wrap gap-4">
              {[["Save listing", "ri-bookmark-line"], ["Share", "ri-share-line"], ["Compare", "ri-git-compare-line"], ["Report", "ri-flag-line"]].map(([label, icon]) => (
                <Tooltip key={String(label)}>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon"><i className={String(icon)} /></Button>
                  </TooltipTrigger>
                  <TooltipContent><p>{String(label)}</p></TooltipContent>
                </Tooltip>
              ))}
            </div>
          </Section>

        </main>
      </div>

      <footer className="border-t border-border mt-16">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between text-xs text-muted-foreground">
          <span>Car Capital Design System</span>
          <span>shadcn/ui · Tailwind CSS v4 · Remix Icons</span>
        </div>
      </footer>
    </div>
  )
}
