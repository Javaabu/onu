import * as React from "react"
import { fireEvent, screen } from "@testing-library/react"
import { Bar, BarChart } from "recharts"
import { describe, expect, it } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "./alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "./alert-dialog"
import { AspectRatio } from "./aspect-ratio"
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "./avatar"
import { Badge } from "./badge"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb"
import { Button } from "./button"
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "./button-group"
import { Calendar } from "./calendar"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./carousel"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "./chart"
import { Checkbox } from "./checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command"
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "./context-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog"
import { DirectionProvider, useDirection } from "./direction"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "./drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "./empty"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "./field"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card"
import { Input } from "./input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "./input-group"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "./input-otp"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "./item"
import { Kbd, KbdGroup } from "./kbd"
import { Label } from "./label"
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "./menubar"
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "./native-select"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./navigation-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover"
import { Progress } from "./progress"
import { RadioGroup, RadioGroupItem } from "./radio-group"
import { ScrollArea, ScrollBar } from "./scroll-area"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select"
import { Separator } from "./separator"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "./sheet"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "./sidebar"
import { Skeleton } from "./skeleton"
import { Slider } from "./slider"
import { Spinner } from "./spinner"
import { Switch } from "./switch"
import { Toaster } from "./sonner"
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import { Textarea } from "./textarea"
import { Toggle } from "./toggle"
import { ToggleGroup, ToggleGroupItem } from "./toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"

interface Smoke {
  /** A `data-slot` (or other selector) that must be in the document once rendered. */
  selector: string
  render: () => React.ReactElement
  /** Opens what only opens on an event. */
  act?: () => void
}

function CurrentDirection() {
  return <output aria-label="Direction">{useDirection()}</output>
}

const slot = (name: string) => `[data-slot=${name}]`

// One entry per file in src/ui. Overlays are rendered open so their parts are scanned too.
const primitives: Record<string, Smoke> = {
  accordion: {
    selector: slot("accordion-content"),
    render: () => (
      <Accordion type="single" defaultValue="a" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>Delivery</AccordionTrigger>
          <AccordionContent>Three days</AccordionContent>
        </AccordionItem>
      </Accordion>
    ),
  },
  alert: {
    selector: slot("alert-action"),
    render: () => (
      <Alert>
        <AlertTitle>Saved</AlertTitle>
        <AlertDescription>Your changes were saved.</AlertDescription>
        <AlertAction>
          <Button size="sm">Undo</Button>
        </AlertAction>
      </Alert>
    ),
  },
  "alert-dialog": {
    selector: slot("alert-dialog-media"),
    render: () => (
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>!</AlertDialogMedia>
            <AlertDialogTitle>Delete the file?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
  },
  "aspect-ratio": {
    selector: slot("aspect-ratio"),
    render: () => (
      <AspectRatio ratio={16 / 9}>
        <p>Video</p>
      </AspectRatio>
    ),
  },
  avatar: {
    selector: slot("avatar-group-count"),
    render: () => (
      <AvatarGroup>
        <Avatar>
          <AvatarImage src="a.png" alt="Aisha" />
          <AvatarFallback>AM</AvatarFallback>
          <AvatarBadge />
        </Avatar>
        <AvatarGroupCount>+3</AvatarGroupCount>
      </AvatarGroup>
    ),
  },
  badge: { selector: slot("badge"), render: () => <Badge variant="secondary">New</Badge> },
  breadcrumb: {
    selector: slot("breadcrumb-page"),
    render: () => (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#home">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Report</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    ),
  },
  button: { selector: slot("button"), render: () => <Button variant="outline">Save</Button> },
  "button-group": {
    selector: slot("button-group-separator"),
    render: () => (
      <ButtonGroup>
        <ButtonGroupText>Sort</ButtonGroupText>
        <Button variant="outline">Name</Button>
        <ButtonGroupSeparator />
        <Button variant="outline">Date</Button>
      </ButtonGroup>
    ),
  },
  calendar: { selector: slot("calendar"), render: () => <Calendar captionLayout="dropdown" showWeekNumber /> },
  card: {
    selector: slot("card-footer"),
    render: () => (
      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
          <CardDescription>Your plan</CardDescription>
          <CardAction>
            <Button size="sm">Edit</Button>
          </CardAction>
        </CardHeader>
        <CardContent>Free</CardContent>
        <CardFooter>Renews soon</CardFooter>
      </Card>
    ),
  },
  carousel: {
    selector: slot("carousel-item"),
    render: () => (
      <Carousel>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    ),
  },
  chart: {
    selector: slot("chart"),
    render: () => (
      <ChartContainer config={{ sales: { label: "Sales", color: "var(--chart-1)" } }}>
        <BarChart width={300} height={200} data={[{ month: "Jan", sales: 3 }]} accessibilityLayer={false}>
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="sales" />
        </BarChart>
      </ChartContainer>
    ),
  },
  checkbox: { selector: slot("checkbox"), render: () => <Checkbox aria-label="Agree" defaultChecked /> },
  collapsible: {
    selector: slot("collapsible-content"),
    render: () => (
      <Collapsible defaultOpen>
        <CollapsibleTrigger>More</CollapsibleTrigger>
        <CollapsibleContent>Details</CollapsibleContent>
      </Collapsible>
    ),
  },
  command: {
    selector: slot("command-shortcut"),
    render: () => (
      <Command label="Commands">
        <CommandInput aria-label="Search commands" />
        <CommandList>
          <CommandEmpty>Nothing found</CommandEmpty>
          <CommandGroup heading="Files">
            <CommandItem>
              Open
              <CommandShortcut>O</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandItem>Close</CommandItem>
        </CommandList>
      </Command>
    ),
  },
  "command-dialog": {
    selector: slot("command-input"),
    render: () => (
      <CommandDialog open title="Commands" description="Search for a command">
        <Command>
          <CommandInput aria-label="Search commands" />
          <CommandList>
            <CommandItem>Open</CommandItem>
          </CommandList>
        </Command>
      </CommandDialog>
    ),
  },
  "context-menu": {
    selector: slot("context-menu-content"),
    act: () => {
      fireEvent.contextMenu(screen.getByText("Right click here"))
    },
    render: () => (
      <ContextMenu>
        <ContextMenuTrigger>Right click here</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuLabel>File</ContextMenuLabel>
            <ContextMenuItem>
              Open
              <ContextMenuShortcut>O</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked>Pinned</ContextMenuCheckboxItem>
          <ContextMenuRadioGroup value="a">
            <ContextMenuRadioItem value="a">Name</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
          <ContextMenuSub open>
            <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Email</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    ),
  },
  dialog: {
    selector: slot("dialog-footer"),
    render: () => (
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit</DialogTitle>
            <DialogDescription>Change your details.</DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    ),
  },
  direction: {
    selector: "output",
    render: () => (
      <DirectionProvider dir="rtl">
        <CurrentDirection />
      </DirectionProvider>
    ),
  },
  drawer: {
    selector: slot("drawer-content"),
    render: () => (
      <Drawer open>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
            <DrawerDescription>Narrow the list.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button>Apply</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    ),
  },
  "dropdown-menu": {
    selector: slot("dropdown-menu-content"),
    render: () => (
      <DropdownMenu open>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>File</DropdownMenuLabel>
            <DropdownMenuItem>
              Open
              <DropdownMenuShortcut>O</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked>Pinned</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="a">
            <DropdownMenuRadioItem value="a">Name</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSub open>
            <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Email</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  empty: {
    selector: slot("empty-content"),
    render: () => (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Spinner />
          </EmptyMedia>
          <EmptyTitle>No files</EmptyTitle>
          <EmptyDescription>Upload one to start.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>Upload</Button>
        </EmptyContent>
      </Empty>
    ),
  },
  field: {
    selector: slot("field-error"),
    render: () => (
      <FieldSet>
        <FieldLegend>Profile</FieldLegend>
        <FieldDescription>About you.</FieldDescription>
        <FieldGroup>
          <Field data-invalid>
            <FieldLabel htmlFor="smoke-name">Name</FieldLabel>
            <Input id="smoke-name" aria-invalid />
            <FieldError errors={[{ message: "Required" }, { message: "Too short" }]} />
          </Field>
          <FieldSeparator>or</FieldSeparator>
          <Field orientation="horizontal">
            <Checkbox id="smoke-terms" aria-labelledby="smoke-terms-title" />
            <FieldContent>
              <FieldTitle id="smoke-terms-title">Terms</FieldTitle>
              <FieldDescription>Read them first.</FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>
    ),
  },
  "hover-card": {
    selector: slot("hover-card-content"),
    render: () => (
      <HoverCard open>
        <HoverCardTrigger href="#profile">Aisha</HoverCardTrigger>
        <HoverCardContent>Joined in 2024</HoverCardContent>
      </HoverCard>
    ),
  },
  input: { selector: slot("input"), render: () => <Input aria-label="Name" /> },
  "input-group": {
    selector: slot("input-group-addon"),
    render: () => (
      <>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput aria-label="Site" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton>Check</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupTextarea aria-label="Notes" />
          <InputGroupAddon align="block-end">
            <InputGroupText>0 of 100</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </>
    ),
  },
  "input-otp": {
    selector: slot("input-otp-slot"),
    render: () => (
      <InputOTP maxLength={2} aria-label="Code">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>
    ),
  },
  item: {
    selector: slot("item-footer"),
    render: () => (
      <ItemGroup>
        <Item variant="outline" size="sm">
          <ItemHeader>Recent</ItemHeader>
          <ItemMedia variant="icon">
            <Spinner />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Report</ItemTitle>
            <ItemDescription>Updated today</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm">Open</Button>
          </ItemActions>
          <ItemFooter>2 pages</ItemFooter>
        </Item>
        <ItemSeparator />
        <Item asChild>
          <a href="#next">Next</a>
        </Item>
      </ItemGroup>
    ),
  },
  kbd: {
    selector: slot("kbd-group"),
    render: () => (
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    ),
  },
  label: {
    selector: slot("label"),
    render: () => (
      <>
        <Label htmlFor="smoke-label">Name</Label>
        <Input id="smoke-label" />
      </>
    ),
  },
  menubar: {
    selector: slot("menubar-content"),
    render: () => (
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarGroup>
              <MenubarLabel>Recent</MenubarLabel>
              <MenubarItem>
                Open
                <MenubarShortcut>O</MenubarShortcut>
              </MenubarItem>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarCheckboxItem checked>Pinned</MenubarCheckboxItem>
            <MenubarRadioGroup value="a">
              <MenubarRadioItem value="a">Name</MenubarRadioItem>
            </MenubarRadioGroup>
            <MenubarSub open>
              <MenubarSubTrigger>Share</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Email</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    ),
  },
  "native-select": {
    selector: slot("native-select"),
    render: () => (
      <NativeSelect aria-label="Island">
        <NativeSelectOptGroup label="North">
          <NativeSelectOption value="a">Addu</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
    ),
  },
  "navigation-menu": {
    selector: slot("navigation-menu-content"),
    render: () => (
      <NavigationMenu defaultValue="docs">
        <NavigationMenuList>
          <NavigationMenuItem value="docs">
            <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#start">Start</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    ),
  },
  pagination: {
    selector: slot("pagination-link"),
    render: () => (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#1" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#2" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#3" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    ),
  },
  popover: {
    selector: slot("popover-description"),
    render: () => (
      <Popover open>
        <PopoverAnchor />
        <PopoverTrigger>Details</PopoverTrigger>
        <PopoverContent aria-label="Details">
          <PopoverHeader>
            <PopoverTitle>Details</PopoverTitle>
            <PopoverDescription>More about this.</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    ),
  },
  progress: { selector: slot("progress"), render: () => <Progress value={40} aria-label="Upload" /> },
  "radio-group": {
    selector: slot("radio-group-item"),
    render: () => (
      <RadioGroup defaultValue="a" aria-label="Plan">
        <RadioGroupItem value="a" aria-label="Free" />
      </RadioGroup>
    ),
  },
  "scroll-area": {
    selector: slot("scroll-area"),
    render: () => (
      <ScrollArea tabIndex={0} aria-label="List">
        <p>Long content</p>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    ),
  },
  select: {
    selector: slot("select-content"),
    render: () => (
      <Select open defaultValue="a">
        <SelectTrigger aria-label="Island">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>North</SelectLabel>
            <SelectItem value="a">Addu</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectItem value="b">Baa</SelectItem>
        </SelectContent>
      </Select>
    ),
  },
  separator: { selector: slot("separator"), render: () => <Separator /> },
  sheet: {
    selector: slot("sheet-footer"),
    render: () => (
      <Sheet open>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Where to next?</SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <Button>Go</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    ),
  },
  sidebar: {
    selector: slot("sidebar-menu-sub-button"),
    render: () => (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <SidebarInput aria-label="Search" />
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Pages</SidebarGroupLabel>
              <SidebarGroupAction aria-label="Add page">+</SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive tooltip="Home">
                      Home
                    </SidebarMenuButton>
                    <SidebarMenuAction aria-label="More">…</SidebarMenuAction>
                    <SidebarMenuBadge>3</SidebarMenuBadge>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#child">Child</SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>Footer</SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <SidebarTrigger />
        </SidebarInset>
      </SidebarProvider>
    ),
  },
  skeleton: { selector: slot("skeleton"), render: () => <Skeleton /> },
  slider: { selector: slot("slider"), render: () => <Slider aria-label="Volume" defaultValue={[30]} /> },
  sonner: { selector: "[aria-label^=Notifications]", render: () => <Toaster /> },
  spinner: { selector: slot("spinner"), render: () => <Spinner /> },
  switch: { selector: slot("switch"), render: () => <Switch aria-label="Wi-Fi" defaultChecked /> },
  table: {
    selector: slot("table-footer"),
    render: () => (
      <Table>
        <TableCaption>Invoices</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Number</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>1</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    ),
  },
  tabs: {
    selector: slot("tabs-content"),
    render: () => (
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Numbers</TabsContent>
      </Tabs>
    ),
  },
  textarea: { selector: slot("textarea"), render: () => <Textarea aria-label="Notes" /> },
  toggle: { selector: slot("toggle"), render: () => <Toggle aria-label="Bold">B</Toggle> },
  "toggle-group": {
    selector: slot("toggle-group-item"),
    render: () => (
      <ToggleGroup type="single" defaultValue="a" aria-label="Align">
        <ToggleGroupItem value="a">Start</ToggleGroupItem>
        <ToggleGroupItem value="b">End</ToggleGroupItem>
      </ToggleGroup>
    ),
  },
  tooltip: {
    selector: slot("tooltip-content"),
    render: () => (
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Help</TooltipTrigger>
          <TooltipContent>More information</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
}

// Every primitive renders and is axe-clean in both directions (`./primitives` is a public entry).
describe.each(directions)("primitives in %s", (dir) => {
  it.each(Object.keys(primitives))("%s", async (name) => {
    const { selector, render, act } = primitives[name]!
    renderWithOnu(render(), { dir })
    act?.()
    expect(document.querySelector(selector)).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
