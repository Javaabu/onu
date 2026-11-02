# @javaabu/onu

## 0.2.1

### Patch Changes

- a1a7ad9: `WysiwygEditor` and `BlockEditor` no longer throw when they unmount with a dialog open.
- 15b4633: `KanbanBoard` no longer widens the page when its columns overflow.
- 2771d3e: `NavTabs` no longer scrolls the page to itself when it mounts below the fold; it scrolls only its own list.
- ce06e79: `StatusBadge`, `IconText`, `Countdown`, `BottomSheet`, `SlideOver`, `ProgressBar`, `Hero` and `MapLegendSwatch` rename size `md` to `default`.

## 0.2.0

### Minor Changes

- 56ae1f7: More components accept rest props and `ref` on their root and a `classNames` slot map, and `BackToTop`, `ConditionalLink` and `LinkButton` gain `asChild`.
- 18ad3c8: `Tip`, `PopoverPanel` and `ActionMenu` take `side="top" | "bottom" | "start" | "end"`; `left` and `right` are gone.
- 2c8e899: `ActionMenu` takes `name` (the trigger becomes "Actions for {name}" and confirmations default to "Delete {name}?") and listing-style items (`destructive`, `permitted`, `separator`, `confirm: true`, async `onSelect`), so `RecordAction[]` works as `items`. `RowActions` is removed: use `<ActionMenu name={…} items={actions}>` (`trashActions` stays). ActionMenu now renders nothing when no item is visible, and its default ⋯ trigger is 44px on touch screens; the row ⋯ button's `data-slot` is `action-menu-trigger` (was `row-actions`). Behaviour changes: ActionMenu confirmations open once the menu has closed and return focus to the trigger, and without a `ConfirmProvider` they show a styled `ConfirmDialog` instead of `window.confirm`. Listing confirmations (row menus, record header actions, bulk actions) now render with `ConfirmDialog`: destructive ones show its warning icon, a failed action's error shows in the dialog, and the dialog's `data-slot` is `confirm-dialog` (was `listing-confirm`).
- 2c8e899: `Autocomplete` takes `showToggleButton` (a chevron that opens the full list), `showCustomOption` ("Use “…”" for unmatched text), `autoHighlight`, `emptyMessage` and a controllable `open`/`defaultOpen`/`onOpenChange`; `onValueChange` now also gets the picked option (or `null` for typed text), `renderOption` gets `selected`, and suggestions may carry `keywords` (so `ChoiceOption`s fit). `EditableSelect` is removed: use `<Autocomplete showToggleButton showCustomOption autoHighlight suggestions={…}>`. Picking writes the suggestion's `value`, so map `ChoiceOption`s with `{ ...o, value: o.label }` to write the label; pass `emptyMessage` and `renderOption` for the old empty text and check mark. Behaviour changes: Autocomplete (and TagsInput suggestions) now match static lists with `Intl.Collator` like the select components, so "male" finds "Malé" and `keywords` match; Enter no longer picks a disabled suggestion.
- 2c8e899: `Callout` takes an `appearance`: `"box"` (default, unchanged) or the inline `"plain"`, `"subtle"` and `"bordered"` notices, which use `role="note"` and leave out title, actions and dismiss. `Notice` and `NoticeProps` are removed: use `<Callout appearance="plain" variant="info">` (Notice's `tone` is `variant`, with `neutral` as `default`; its `variant` is `appearance`). `noticeVariants` is renamed `calloutInlineVariants`, keyed by `variant` and `appearance`. The `notice` data-slot and `data-tone` are gone: inline callouts have `data-slot="callout"` and `data-variant`.
- 2c8e899: New `CategoryChart` in `@javaabu/onu/charts` draws category data as lines, areas or bars with `variant`: `"line"` (default), `"area"` or `"bar"`. Its props are a union on `variant`, so the line options (`curve`, `dots`, `connectNulls`, `dashedSeries`) and the bar options (`orientation`, `radius`) are only accepted for their own variant. `LineChart` and `BarChart` are removed: use `<CategoryChart variant="line">` (the default) or `<CategoryChart variant="bar">`, with the same props, data slots, summaries and data tables. `LineChart`'s `area` prop is gone: use `variant="area"`. `LineChartProps` and `BarChartProps` are now `CategoryChartLineProps` and `CategoryChartBarProps`, and `LineCurve` is `CategoryChartCurve`.
- 2c8e899: `CommentThread` takes `variant` (`"thread"` or `"list"`), `replies` (show Reply buttons), `composerPosition` (`"bottom"` or `"top"`) and `labels` to change its strings. `variant="list"` is a flat, bordered list of internal notes: note strings, no Reply buttons and the box on top by default. `Notes`, `NotesProps` and `NoteData` are removed: use `<CommentThread variant="list" comments={…}>` with `CommentData` (author `id` is required). `onAdd` gets `(body, null)`, and as in the thread only the author may delete unless you pass `canDelete`. The `notes` and `note` data-slots are now `comment-thread` and `comment`.
- 91ae81d: `ActionMenu` takes `openOn="context"`: the same `items` open as a context menu on `children` (right-click, long press on touch screens, or the Menu key / Shift+F10), with `asChild` to use the child as the area and `disabled` to turn it off. Confirmations, `name` and record actions now work in context menus too. `disabled` also disables the dropdown's trigger. `ContextActionMenu` and `ContextActionMenuProps` are removed: use `<ActionMenu openOn="context" items={items} asChild>{area}</ActionMenu>`. The area's `data-slot` is `action-menu-area` (was `context-action-menu-trigger`) and the menu's is `action-menu-content` (was `context-action-menu-content`). When no item is visible the area stays and right-click shows the browser's menu. The `ContextMenu` primitive parts are still exported.
- 91ae81d: `DateCalendar` takes `events` (`DateCalendarEvent[]`: `{ id?, date, title, tone?, href? }`), shown as up to `maxDots` dots under each day and counted in the day's accessible name, and `readOnly`, which turns off selection so that clicking a day lists its events underneath in a polite live region (`showEventList={false}` hides the list). `size="sm"` makes it compact, and `onDayClick` now also gets the day's events: `(date, modifiers, events)`. `MiniCalendar`, `MiniCalendarProps`, `MiniCalendarEvent` and `MiniCalendarEventTone` are removed: use `<DateCalendar readOnly size="sm" events={events} />` with `DateCalendarEvent` and `DateCalendarEventTone`. Its `onDayClick(date, events)` is `onDayClick(date, modifiers, events)`, and `classNames.calendar` / `list` / `dot` are `className` / `classNames.eventList` / `classNames.dot`. The `mini-calendar*` data-slots are now `date-calendar`, `date-calendar-dot` and `date-calendar-events`. The `display.events` and `display.eventsOn` strings move to `date.events` and `date.eventsOn`.
- 2c8e899: `DatePicker` takes a `mode`: `"single"` (default), `"multiple"`, `"week"`, `"month"` or `"year"`, with `value` and `onChange` typed for each. `MultipleDatePicker`, `WeekPicker`, `MonthPicker` and `YearPicker` are removed: use `<DatePicker mode="multiple">`, `mode="week"`, `mode="month"` or `mode="year"`. Week mode now accepts `disabledDates`. `DatePickerProps` is now a union of `DatePickerSingleProps`, `DatePickerMultipleProps`, `DatePickerWeekProps` and `DatePickerPeriodProps` (month and year).
- 58942bd: `DocumentDownload` is folded into `AttachmentPreview`, with no alias left behind. `AttachmentPreview` gains `versions` (one download button per language version, named "Download {name} in {language}"), `description` (a line under the name) and the `description` and `versions` class-name keys. The `DocumentVersion` type now comes from `attachment-preview`; `DocumentDownloadProps` is removed. `title`/`titleText` become `name`, `href` becomes `downloadUrl` (or `url` to allow opening and previewing), and `fileName` becomes the `name`.

  ```tsx
  // Before
  <DocumentDownload title="Public Services Act" versions={[{ lang: "dv", href: "/act-dv.pdf" }, { lang: "en", href: "/act-en.pdf" }]} />
  <DocumentDownload title="Tender form" href="/tender.docx" fileName="tender-form.docx" size={56_000} />

  // After
  <AttachmentPreview name="Public Services Act" versions={[{ lang: "dv", href: "/act-dv.pdf" }, { lang: "en", href: "/act-en.pdf" }]} />
  <AttachmentPreview name="tender-form.docx" description="Tender form" downloadUrl="/tender.docx" size={56_000} />
  ```

- 2c8e899: `InstantFileUpload` is removed: `FileInput` uploads files itself when given `upload` or `url`. Replace `<InstantFileUpload url="/api/uploads" … />` with `<FileInput url="/api/uploads" … />`; the `FileInput` props (`aria-label`, `buttonLabel`, `accept`, `maxSize`, `multiple`, …), `upload`, `uploadOptions`, `name`, `getValue`, `onUploaded`, `onError` and `onItemsChange` keep their names, `ref` still points at the `<input>`, and `classNames.progress` becomes `classNames.list`. `defaultUploadValue` is still exported. Compared with `InstantFileUpload`, `maxFiles` counts files already uploaded, a removal is announced ("a.pdf removed"), files can be dropped and pasted, and without `multiple` a new file replaces the uploaded one instead of being blocked until it is removed.
- 59758bb: `EmailInput` and `UrlInput` are folded into `TextInput`, with no aliases left behind. `TextInput type="email"` and `type="url"` set the matching `inputMode` and `autoComplete`, turn off auto-capitalisation, autocorrect and spell check, are always `dir="ltr"`, and ignore `thaana` / `thaanaToggle`. A URL without a scheme gets `https://` on blur; the new `urlProtocol` prop (`string | false`, default `"https://"`) replaces `UrlInput`'s `defaultProtocol`. `normalizeUrl` is now exported from `text-input`. The `showIcon` prop is gone: pass the icon as `startAddon`. `EmailInputProps` and `UrlInputProps` are removed.

  ```tsx
  // Before
  <EmailInput showIcon />
  <UrlInput defaultProtocol={false} />

  // After
  <TextInput type="email" startAddon={<Icon name="mail" />} />
  <TextInput type="url" urlProtocol={false} />
  ```

- 91ae81d: `DropzoneUploader` is merged into `FileInput` and removed. `FileInput` takes `appearance="dropzone"` for the large drop area, and both appearances now take dropped and pasted files (`pasteFromDocument` too), uploads with a progress list (`upload` / `url` / `uploadOptions`, `getValue`, `onUploaded`, `onError`, `onItemsChange`), files already on the server in `value` / `defaultValue` with `onValueChange`, hidden inputs for stored ids under `name`, `onFilesAdded`, and removal announcements. The `react-dropzone` dependency is dropped: the native file input now covers the drop zone too, so it is the zone's only tab stop and carries the label.

  Replace

  ```tsx
  <DropzoneUploader url="/api/uploads" maxFiles={6} description="Images, up to 8 MB" />
  <DropzoneUploader appearance="input" multiple={false} inputProps={{ "aria-label": "Slip" }} url="/api/uploads" />
  ```

  with

  ```tsx
  <FileInput appearance="dropzone" multiple url="/api/uploads" maxFiles={6} description="Images, up to 8 MB" />
  <FileInput aria-label="Slip" url="/api/uploads" />
  ```

  - `multiple` defaults to `false` on `FileInput` (it was `true` on `DropzoneUploader`): add `multiple` to keep several files. The drop zone and an uploader always add files; without an uploader the compact input needs `append` to add instead of replace.
  - `appearance="input"` is the default; `inputProps` go directly on `FileInput`, and `inputRef` becomes `ref` (which points at the `<input>`; the root `div` ref is gone).
  - `DropzoneFile` → `FileInputEntry`, `DropzoneUploaderProps` → `FileInputProps`, `DropzoneInputProps` is removed, `dropzoneVariants` → `fileInputVariants({ appearance: "dropzone", size })`. `UploadedFile` and `defaultUploadValue` are unchanged.
  - `classNames.zone` → `classNames.trigger` (and `classNames.root` for the compact input's root); `icon`, `title`, `description`, `button`, `list` and `errors` are unchanged.
  - `data-slot="dropzone-uploader"` / `"instant-file-upload"` → `data-slot="file-input"` with `data-appearance`; `data-slot="dropzone"` → `data-slot="file-input-trigger"`.
  - The "Browse files" button is now part of the input's label instead of a separate `<button>`; tests that query `getByRole("button", { name: "Browse files" })` should use `getByLabelText("Browse files")` (or the field's label).
  - With an uploader, a `required` field no longer sets the native `required` attribute (the files go to the server, not the form); `aria-required` stays. Picking also stops once `maxFiles` is reached, as with `append`.

- 2c8e899: `FileInput` takes `showLimits` (the limits hint and live count), and with `append` it stops picking once `maxFiles` is reached. `MultipleFileInput` is removed: use `<FileInput append showLimits>`.
- 91ae81d: `Tabs` works as filter tabs above a listing: an item without `content` renders no panel, and `controls` (the listing's id) becomes its tab's `aria-controls` (without `controls` the attribute is left out, so no tab points at a missing panel). `countAppearance="pill"` shows counts as grey pills in the brand colour on the active tab. `FilterTabs`, `FilterTabsProps` and `FilterTab` are removed: use `<Tabs variant="line" countAppearance="pill" listLabel="Filter by status" controls={listId} items={tabs} value={…} onValueChange={…} />` with `TabItem` (`tabs` is now `items`, `classNames.tab` is `classNames.trigger`, and the list label is `listLabel`, no longer "Filter by status" by default). `ListingPage`'s `tabs` now takes `TabItem[]`. Other changes to `Tabs`: a count is a separate word in the tab's name ("Activity (12)", was "Activity(12)"), a horizontal `line` list draws its hairline under the whole row, and its scroller no longer adds bottom padding.
- da4edb1: `FormContainer` is folded into `Card`, with no alias left behind. `Card` gains `width` (`sm`, `md`, `lg`, `xl`, `full`: full width up to that maximum and centred, and the footer buttons stack full width when the card is narrow), `media` (above the title), `centered` (a centred header without its bottom line, for auth pages), `variant="plain"` (no surface or padding), `headingLevel={1}` and the `media` class-name key. Card never imports the form module: wrap it in a `Form`, or render the form as the card with `asChild`. `FormContainerProps` and `formContainerVariants` are removed. The auth forms render on `Card` and accept its props (they were `FormContainer` props). Note that `Card`'s `headingLevel` defaults to `3`; `FormContainer`'s was `2`.

  ```tsx
  // Before
  <FormContainer title="New staff member" width="lg" footer={<SubmitButton>Invite</SubmitButton>}>
    …
  </FormContainer>

  // After
  <Card title="New staff member" headingLevel={2} width="lg" footer={<SubmitButton>Invite</SubmitButton>}>
    …
  </Card>
  ```

- 700efb1: `ImageSelect` is folded into `RadioGroup` as `variant="image"`, with no alias left behind. Options take `image: { src, alt }` (so does `Radio`); `minItemWidth` (default `8rem`) and `aspectRatio` (`square`, `video`, `portrait` or a number) are new `RadioGroup` props for that variant, and all four arrow keys move between tiles. `ImageSelect`, `ImageSelectProps` and `ImageOption` are removed. Its `multiple` mode is gone (nothing used it), and `showLabels={false}` becomes `classNames={{ label: "sr-only" }}`. `radioImageVariants` and the `RadioImageAspect` type are exported.

  ```tsx
  // Before
  <ImageSelect options={[{ value: "reef", label: "Reef", src: "/reef.jpg", alt: "" }]} aspectRatio="video" />

  // After
  <RadioGroup variant="image" options={[{ value: "reef", label: "Reef", image: { src: "/reef.jpg", alt: "" } }]} aspectRatio="video" />
  ```

- 2c8e899: `ListView` takes `layout`: `"list"` (default) or `"grid"` (a responsive grid of cards, with `minItemWidth`), matching the listing view values. `GridView` is removed: use `<ListView layout="grid">`.
- 91ae81d: `NumberInput` takes a unit and a stepper. `UnitInput` is removed: use `<NumberInput unit="kg" />` or `<NumberInput units={[{ value: "m", label: "m" }, { value: "km", label: "km" }]} defaultUnit="km" unitName="distance_unit" />`; the unit props keep their names (`unit`, `units`, `unitValue`, `defaultUnit`, `onUnitChange`, `unitName`, `unitLabel`, `unitPosition`, `classNames.unit` / `classNames.unitTrigger`), so replacing the component name is enough, and `UnitOption` is now `NumberInputUnitOption`. `QuantityStepper` is removed: use `<NumberInput stepper value={qty} onValueChange={setQty} min={1} max={20} />`, with `size`, `repeatDelay`, `repeatInterval` and `classNames.decrement` / `classNames.increment` as before. With `stepper` the value is a `number` (never empty: `min` defaults to `0`, `defaultValue` to `min`, and clearing falls back to `min`); `quantityStepperVariants` is now `numberInputVariants`, and the buttons' `data-slot`s are `number-input-decrement` / `number-input-increment`. A unit and the stepper can be combined, and `startAddon` / `endAddon` sit beside the unit. The types are `NumberInputFieldProps` and `NumberInputStepperProps` (`NumberInputProps` is their union).
- 49167c9: `PeriodComparisonChart` is folded into a `comparison` prop on `TimeSeriesChart` (steps are dates) and `CategoryChart` (steps are categories such as days of the week), with no alias left behind. The chart's first series is the current period and `comparison.previousKey` the previous one; the previous period is dashed (muted bars with `variant="bar"`), headline totals with a `DeltaIndicator` sit above the chart, and the data table gets a "Change" column. `currentLabel`, `previousLabel`, `aggregate`, `positiveIsGood` and `hideTotals` move into `comparison`. `PeriodComparisonChartProps` and the `chart.typePeriodComparison` string are removed; `rowChange` and the new `ChartComparison` type are exported from `@javaabu/onu/charts`.

  ```tsx
  // Before
  <PeriodComparisonChart title="Costs" variant="bar" data={rows} categoryKey="month" currentLabel="2026" previousLabel="2025" positiveIsGood={false} />

  // After
  <CategoryChart
    title="Costs"
    variant="bar"
    data={rows}
    categoryKey="month"
    comparison={{ previousKey: "previous", currentLabel: "2026", previousLabel: "2025", positiveIsGood: false }}
  />
  ```

- 91ae81d: `SaveBar` takes `layout="floating"`: only the Save button, floating at the bottom of the screen while the form's main submit button (or `target`) is scrolled out of view, with `target`, `forceVisible` and the new `classNames.save`. `FloatingSubmit` is removed: use `<SaveBar layout="floating" saveLabel="Submit" />` inside the form, with `className` for the old `classNames.root` and `classNames.save` for `classNames.button`. Compared with `FloatingSubmit`, the button has the save icon and "Save" by default, can call `onSave` instead of submitting, finds the form named by `form` when it sits outside it, and, given `changes` or `dirty`, stays disabled until something changed and warns before leaving with unsaved changes.
- 2c8e899: Searchable select now covers multi-select, quick-create and dependent selects. `SearchableSelect` accepts `onCreate`/`renderCreateDialog` and `parentValue`/`parentLabel` (with `options` as a map or function of the parent value), and with `multiple` it shows "Select all" and a clear button by default. `ApiSelect` accepts `parentValue`, `parentLabel` and `parentParam`. `MultiSelect` is removed: use `<SearchableSelect multiple>`. `QuickCreateSelect` is removed: use `<SearchableSelect onCreate>` (or `renderCreateDialog`). `DependentSelect` is removed: use `<SearchableSelect parentValue>` for local options, or `<ApiSelect parentValue url parentParam>` / `<ApiSelect parentValue fetcher>` for remote ones (`loadOptions(parent, ctx)` becomes a `fetcher` that reads the parent from scope).
- 2c8e899: `ViewSwitcher` is removed: use `<SegmentedControl iconOnly size="sm" aria-label={t("listing.view")} options={useListingViewOptions()}>`. The new `useListingViewOptions(views?)` hook returns the built-in table, list, grid and board views with translated labels and icons; `ListingView` stays and `ViewOption` is removed. Icon-only segments show their label as a tooltip and are at least 44px wide on touch screens.
- 2c8e899: `SensitiveInput` takes `masked` (default `true`; `false` shows the value as is, with no reveal button and the page direction unless `dir` is passed) and `mono` (default `true`). `CopyInput` is removed: use `<SensitiveInput masked={false}>`, adding `mono={false}` where the value is not a code (`CopyInput` was not monospace by default).
- 2c8e899: The skeleton presets gain `SkeletonField`, shaped like a form field (`control`, `showLabel`, `help`, `labelLayout`, `label` for the screen-reader text) and following the stacked/inline label layout. `PlaceholderInput` is removed: use `<SkeletonField>` (its `label` boolean is `showLabel`, its `srLabel` is `label`, and the data-slot is `skeleton-field`).
- 91ae81d: `SortableList` takes `columns` instead of `renderItem` for a table layout on shadcn `Table`: each row's drag handle (with `aria-keyshortcuts`, Alt+↑/↓) sits in the first column under a "Reorder" header, and `aria-label` names the table through a visually hidden caption. `SortableListColumn` is exported, `classNames` gains `table`, and list handles now carry `aria-keyshortcuts` too. `ReorderableTable`, `ReorderableTableProps` and `ReorderableColumn` are removed: use `<SortableList aria-label="Ferry route stops" items={rows} getName={…} onReorder={…} columns={columns} />` (`rows` is now `items`, `caption` is `aria-label`, and `classNames.row` is `classNames.item`). Table rows now also get Move up / Move down buttons beside the handle, the non-drag alternative SortableList already had (`moveButtons={false}` for just the handle). The table wrapper's `data-slot` is `sortable-list` with `data-layout="table"` (was `reorderable-table`), and rows are `sortable-item`.
- 2c8e899: `Tabs` takes `narrow` (`"select"` or `"scroll"`): with `orientation="vertical"` it lays the list out beside the panel, settings-style, and turns it into a select or a horizontal scroller in narrow containers. `TabItem` gains `description`, `badge` and `textLabel`, and `classNames` gains `select`. `StackedTabs`, `StackedTabsProps` and `StackedTabItem` are removed: use `<Tabs orientation="vertical" narrow="select" items={…}>` with `TabItem` (`mobile` is now `narrow`).
- 91ae81d: `Timeline` is also an activity feed. Entries take an `actor` (`{ name, avatar? }`): the avatar is the marker and the name starts the title. New props: `groupByDay` (Today / Yesterday / date headings, with `dayFormat`), `title` (an `h2` that names it), `emptyText`, and `hasMore` / `onLoadMore` / `loadingMore` for a "Load more" button. With any of these, or with no items, the root is a labelled `<section>` holding the lists. `timeFormat="relative"` now renders `RelativeDate` ("1 hour ago", exact time on hover and focus, kept up to date), `now` accepts a string or timestamp, `description` renders in a `<div>`, and `classNames` gains `group`, `heading`, `empty` and `loadMore`. `ActivityFeed`, `ActivityFeedProps`, `ActivityItem`, `ActivityGroup` and `groupActivityByDay` are removed: use `<Timeline groupByDay timeFormat="relative" title="Activity" items={items} hasMore={…} onLoadMore={…} />` with `TimelineItem` (an item's `action` is `title`, `timestamp` is `time`, `detail` is `description`), `TimelineGroup` and `groupTimelineByDay`, which keeps the items' order (pass them newest first). There is no default heading: pass `title` to get one. The `display.activity`, `display.today`, `display.yesterday`, `display.loadMore` and `display.noActivity` strings are replaced by `layout.today`, `layout.yesterday`, `layout.loadMore` and `layout.noActivity`.
- 2c8e899: `TopNav` items take `columns` and `featured`: an item with columns opens a wide multi-column panel (a mega menu), and panel links take part in the active state and show badges. `classNames` gains `panel`, `column` and `panelLink`. `MegaMenu`, `MegaMenuProps` and `MegaMenuItem` are removed: use `<TopNav items={[{ …, columns: […] }]}>` with `TopNavItem`, and `classNames.panelLink` instead of `classNames.link`. `MegaMenuColumn` and `MegaMenuLink` are renamed `TopNavColumn` and `TopNavLink`. On phones, each titled column is its own collapsible section in TopNav's drawer.
- a2d7f1e: Every component that reports a value now uses `onValueChange(value)`; `onChange` only ever means the native event. `FileInput` loses `onChange(files)` (use `onValueChange(entries)`), and `onReject` always takes an array.
- c4de3d5: `react-hook-form` and `@tanstack/react-query` are now peer dependencies. `getOnuQueryClient` is gone: the fallback client belongs to each `OnuProvider`, and `invalidateApiOptions` takes the client first.
- b76ac6f: The accessible name of a root region is `label` everywhere (`CommandPalette` and `OverlayMenu` `title`, `TopNav` `navLabel`, `Tabs` `listLabel`), and the minimum query length is `minChars` everywhere (`CommandPalette` `minQueryLength`, `PlaceSearchBox` `minLength`).
- 324d0e8: Onu now requires React 19; React 18 is no longer in the peer range.
- 7b4c01c: `AppSwitcher` and its `AppSwitcherProps` and `AppSwitcherApp` types are removed, with the `layout.apps` and `layout.switchApp` strings. `AppSidebar`'s `header` slot is unchanged; put an `ActionMenu` of the suite's apps next to the logo:

  ```tsx
  <AppSidebar
    header={
      <div className="gap-2 flex items-center justify-between">
        <Logo src="/logo.svg" alt="" text="Atoll Records" />
        <ActionMenu
          align="start"
          trigger={
            <Button variant="ghost" size="icon" aria-label="Switch app">
              <Icon name="grid" />
            </Button>
          }
          items={[
            { type: "label", label: "Atoll apps" },
            { label: "Records", href: "/records", icon: "file-text" },
            { label: "Calendar", href: "/calendar", icon: "calendar" },
          ]}
        />
      </div>
    }
  />
  ```

- f78af77: Removed the unused `Combobox` primitive from `@javaabu/onu/primitives`, and with it the `@base-ui/react` dependency.
- d4f949e: `CookieConsent`, `useCookieConsent`, `readCookieConsent`, `openCookiePreferences`, `COOKIE_CONSENT_STORAGE_KEY` and their types are removed, with the `display.cookie*` strings: no Maldivian requirement asks for a consent banner and no sample page used one. When a project needs one, compose `AnnouncementBar` and `Modal` with `Switch`es, and store the choice in the app:

  ```tsx
  <AnnouncementBar id="cookies" variant="neutral" href="/privacy" linkText="Cookie policy">
    We use essential cookies to make this site work.{" "}
    <Button size="sm" variant="link" onClick={() => setOpen(true)}>
      Preferences
    </Button>
  </AnnouncementBar>

  <Modal
    open={open}
    onOpenChange={setOpen}
    title="Cookie preferences"
    footer={<Button onClick={() => save(choices)}>Save preferences</Button>}
  >
    <Switch label="Strictly necessary" checked disabled />
    <Switch label="Analytics" checked={choices.analytics} onCheckedChange={(analytics) => setChoices({ ...choices, analytics })} />
  </Modal>
  ```

- b3c6e1a: `EditableDataGrid`, `EditableDataGridProps` and `EditableColumn` are removed, with the `listing.editCell`, `listing.cell*` and `listing.gridInstructions` strings. Use `RepeatingGroup` for editable rows (line items) and `InlineEdit` for a single cell in a `DataTable`; a spreadsheet-style grid needs a dedicated grid library.

  ```tsx
  <RepeatingGroup label="Items" name="items" value={items} onChange={setItems} createItem={() => ({ name: "", qty: 1 })}>
    {({ item, name }) => (
      <FormField label="Item" name={name("name")}>
        <TextInput defaultValue={item.name} />
      </FormField>
    )}
  </RepeatingGroup>

  <DataTable
    data={users}
    columns={[
      {
        id: "name",
        header: "Name",
        cell: (u) => <InlineEdit label="Name" defaultValue={u.name} onSave={(name) => api.patch(`/users/${u.id}`, { name })} />,
      },
    ]}
  />
  ```

- a354074: `EfaasButton`, `EfaasLogo`, `PaymentMethodSelector`, `BmlTransferLogo` and `BmlConnectLogo` are removed, with their types, `EFAAS_LOGO_VARIANTS` and the `auth.efaas*`, `choice.paymentMethod` and `choice.bml*` strings. Provider branding follows each provider's own guidelines and assets, so it belongs in the app.

  `SignInForm`'s `efaas` slot is renamed `sso` (data slot `auth-sso`): `<SignInForm sso={<LinkButton href="/login/efaas" variant="outline" className="w-full">Sign in with eFaas</LinkButton>} />`. For a payment choice, use a card radio group:

  ```tsx
  <RadioGroup
    variant="card"
    options={[
      { value: "bml-transfer", label: "Bank transfer", description: "…", media: <img src={bmlLogo} alt="" /> },
      { value: "bml-connect", label: "Card", description: "…", media: <Icon name="credit-card" /> },
    ]}
  />
  ```

- dd65007: The `@javaabu/onu/query-builder` entry is removed, with `FilterConditionBuilder`, its types, the re-exported `formatQuery` and the `listing.*` condition-builder strings. `react-querybuilder` is no longer an optional peer dependency; uninstall it unless the app uses it directly. `FilterPanel` with `ApiSelect` and the date pickers is the Javaabu filtering pattern:

  ```tsx
  <FilterPanel
    filters={[
      {
        type: "custom",
        key: "island",
        label: "Island",
        render: ({ id, value, onChange }) => (
          <ApiSelect id={id} url="/api/islands" multiple value={value} onChange={onChange} />
        ),
      },
      { type: "date-range", key: "created", label: "Submitted" },
    ]}
    value={state.filters}
    onApply={state.setFilters}
  />
  ```

- 91ae81d: `FilterSubmit` (and `FilterSubmitProps`) is removed. Its Reset only called `onReset`, so end a server-rendered filter form with the buttons themselves: `<SubmitButton processing={loading} startIcon="filter">{t("listing.filterSubmit")}</SubmitButton>` and `<Button variant="ghost" onClick={onReset}>{t("listing.filterReset")}</Button>` (or a `LinkButton` to the unfiltered URL); `form`, `disabled` and `className` go on each button. `FilterPanel` (including `variant="form"`) already has its own Reset and Filter buttons and is unchanged; see "Server-rendered filter forms" on its docs page.
- bd1eb80: `KeyboardKey`, `KeyboardKeyProps`, `KeyPlatform`, `detectPlatform` and `formatShortcut` are removed, with the `display.key*` strings. `ActionMenu` and `CommandPalette` keep formatting their own `shortcut` hints. To show keys in text, use the `Kbd` primitive:

  ```tsx
  import { Kbd, KbdGroup } from "@javaabu/onu/primitives"

  ;<p>
    Press{" "}
    <KbdGroup>
      <Kbd>Ctrl</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>{" "}
    to search.
  </p>
  ```

- 91ae81d: `LastEditedBy` and `LastEditedByProps` are removed: they were too app-specific for the design system. Compose `UserAvatar` and `RelativeDate` instead:

  ```tsx
  <div className="gap-2 text-sm flex items-center text-muted-foreground">
    <UserAvatar name={user.name} src={user.avatar} size="xs" decorative />
    <span>
      Last edited by <span className="font-medium text-foreground">{user.name}</span> ·{" "}
      <RelativeDate value={updatedAt} />
    </span>
  </div>
  ```

  The `display.lastEditedBy` string is removed.

- 7e42f63: `MapNavigation`, `MapNavigationProps` and `NavigationStop` are removed from `@javaabu/onu/maps`, with the `map.*` navigation strings: turn-by-turn directions belong in the Google Maps app. Show the line with `MapRoute` and link out from a `LocationCard`, which has an "Open in Google Maps" link:

  ```tsx
  <MapRoute value={route} disabled label="Ferry route" />
  <LocationCard title="Hulhumalé ferry terminal" position={{ lat: 4.2105, lng: 73.5401 }} />
  ```

- 7e27609: `MasonryGrid`, `MasonryGridProps`, `masonryGridVariants` and `masonryColumnClasses` are removed: masonry is a Tailwind recipe, not a component. `Gallery layout="masonry"` is unchanged. For other content, use CSS columns on a plain container:

  ```tsx
  <div className="sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4 columns-1 [&>*]:break-inside-avoid">
    {posts.map((post) => (
      <Card key={post.id} title={post.title}>
        {post.excerpt}
      </Card>
    ))}
  </div>
  ```

- 5a333a3: `MenuBar` and its `MenuBarProps`, `MenuBarMenu` and `MenuBarEntry` types are removed: desktop-application menus do not appear in web admin panels or portals. If a screen really needs one, compose the `Menubar` primitive:

  ```tsx
  import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@javaabu/onu/primitives"

  ;<Menubar>
    <MenubarMenu>
      <MenubarTrigger>File</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onSelect={save}>Save</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  </Menubar>
  ```

- 91ae81d: `PrintButton`, `BackButton`, `PrintButtonProps` and `BackButtonProps` are removed: they were too app-specific for the design system. Use `Button` and `LinkButton`:

  ```tsx
  <Button variant="outline" startIcon="print" className="print:hidden" onClick={() => window.print()}>
    Print
  </Button>
  <LinkButton variant="ghost" startIcon="back" href="/applications" className="print:hidden">
    Back
  </LinkButton>
  <Button variant="ghost" startIcon="back" className="print:hidden" onClick={() => history.back()}>
    Back
  </Button>
  ```

  For an icon-only button, use `size="icon"` with an `aria-label` and `<Icon name="print" />` as the child. The `display.print` string is removed.

- e48f431: The shadcn `resizable` primitive leaves `@javaabu/onu/primitives`: `ResizablePanelGroup`, `ResizablePanel` and `ResizableHandle` are removed, and `react-resizable-panels` is no longer a dependency. Nothing in Onu used them. An app that needs resizable panes can install `react-resizable-panels` and add shadcn's `resizable` component itself.
- 91ae81d: `ThaanaInput` and `ThaanaTextarea` (and their `ThaanaInputProps` / `ThaanaTextareaProps` types) are removed: use `<TextInput thaana thaanaToggle />` and `<Textarea thaana thaanaToggle />`. Keyboard options go in `thaana` as before (`<TextInput thaana={{ keymap: "typewriter" }} thaanaToggle />`); drop `thaanaToggle` for Thaana typing without the toggle button. The docs page and demo are folded into `TextInput`, `Textarea` and the Thaana input guide. `ThaanaToggle` and `useThaanaInput` are unchanged.
- 91ae81d: `UsageMeter` and `UsageMeterProps` are removed: they were too app-specific for the design system. Build the quota bar from `ProgressBar` and a link:

  ```tsx
  <div className="gap-2 pt-3 grid border-t border-shell-border">
    <ProgressBar size="sm" label="Storage" value={1284} max={2000} showValue classNames={{ track: "bg-shell-weak" }} />
    <div className="gap-2 text-xs flex items-center justify-between">
      <ConditionalLink href="/billing" className="text-primary hover:underline">
        Get more space
      </ConditionalLink>
      <span className="text-muted-foreground">v5.0.42</span>
    </div>
  </div>
  ```

  Pass `color="warning"` or `color="destructive"` to `ProgressBar` yourself when the quota is nearly full.

- ebb8254: Shared helpers move to `src/lib` and `src/hooks` with one behaviour each: `toArray` and the `initials` media export are gone, `normalizeUrl` returns `string | null`, the editor's `Callout` node is now `CalloutNode`, `CommandPalette` debounces by 300 ms, and the auth forms use `PasswordInput`.
- d3399b3: `Tag`, `SkeletonText`, `Modal` and `UserAvatar` rename size `md` to `default`. `NumberInput` is now `h-8` like every other field, and `TextInput` gains the same `size` prop.
- 2d504ab: One severity scale, `tone`: `neutral`, `info`, `success`, `warning`, `danger`. `Callout`, `AnnouncementBar` and `NotificationCenter` items rename `variant` to `tone`, `destructive` and `error` become `danger`, and `default` becomes `neutral` (also on `IconText`). `AnnouncementBar` gains `success` and `danger`. `Button` keeps `variant="destructive"`.
- 4d2b26b: `LanguageSwitcher` and `RepeatingGroup` gain `defaultValue`, `Callout`, `FilterPanel` and `Lightbox` gain `defaultOpen`, and `Lightbox` `open` and `onOpenChange` become optional with `index` controlled only when it is passed.

### Patch Changes

- 7b32cb8: `Label`, `HelpText`, `RequiredMarker` and `FieldErrors` are now documented on the `FormField` page, under "Building blocks", instead of a page each. The components are unchanged. A docs page can list the components it covers in its `covers` front matter; `docs/index.json` carries the list, and `onu_get_doc` finds the page by any of those names (`onu_get_doc("HelpText")` returns the FormField page).
- 0f54e89: Docs: an installation page with requirements and per-entry peer dependencies, complete Props tables, and corrected stale text.
- ca42386: Removed four optional peers nothing imports: `@tiptap/extension-link`, `@tiptap/extension-drag-handle-react`, `@tiptap/extension-code-block-lowlight` and `lowlight`.
- e7503ac: The editors' image alt text field now follows the editor's `thaana` prop.
- a439052: `ReportingPeriodPicker`: each period-type tab is now sized to its label, so a long label ("Custom range") no longer spills out of its tab, and the calendar and the quarter and year grids are centred under the tab row instead of sitting against its start edge.
- c0b9a84: `DialogFooter`'s close button, the `useConfirm` `window.confirm` fallback and a `ValidationError` without a message no longer show hard-coded English.
- f96bcc7: The move, switch account and inline edit labels are now whole translated sentences with a placeholder, instead of two strings joined together.
- 9d44964: Remove unused locale keys, give Dhivehi separate words for clear and delete, and announce applied filters and cleared selections to screen readers.
- cc03f37: `NavigationMenu` content slides in from the logical side, so its motion follows the reading direction in RTL.
- 8302a59: New `--onu-overlay` token for the dim behind dialogs, sheets and drawers (`bg-overlay`). The app shell classes use the shell token utilities instead of hex fallbacks.
- 148a695: Fix axe violations in three primitives: `Calendar` week numbers, the `role="list"` on `ItemGroup`, and `CommandSeparator` inside its listbox.
- 1895bd4: The Inertia and Next.js guide no longer links to starter templates, which are gone from the repository.
- 178e966: `SegmentedControl`'s `name` prop is now part of its type.
- 1a13337: `Countdown`, `RelativeDate`, `Timeline`, `PublishBox` and `SidebarMenuSkeleton` render the same markup on the server and the client's first render. `SidebarMenuSkeleton` takes an `index` to vary its width.
- 46ec8a5: The vertical `Carousel` arrows point the right way in RTL, and `KanbanBoard`'s column count is real screen reader text instead of an `aria-label` on a `span`.
- 85509ba: Faruma and MV Faseyha now load from `tailwind.css` and `styles.css`, so Thaana text works without the optional font pack.
- bf91ce2: The toast close button is now 24 px, and 44 px on touch screens.

## 0.1.0

### Minor Changes

- e1e00f6: Accessibility foundations: `VisuallyHidden` (screen-reader-only content, with `asChild` and a `focusable` mode for skip links), `LiveRegion` (an `aria-live` region, visually hidden by default, with `politeness`, `atomic`, `role` and `visible`) and an announcer: `useAnnouncer()` returns `{ announce, clear, message, region }` for a component's own live region, and `announce(message, { politeness })` speaks through a page-wide region from anywhere. Repeating the same message is announced again. Onu's own components now use them instead of private copies: the data table, editable grid, sortable list, reorderable table, Kanban board, dual listbox, quick-create selects, map components, and the inputs and media components that announced through a hidden region (tags, slug, sensitive and copy inputs, suggestions, Thaana toggle, QR code, QR scanner and signature pad). Announcements now set `aria-atomic="true"` everywhere, and map announcements of a repeated message are read again.
- 595acb3: Docs for AI assistants. The package now ships `llms.txt` (the rules for writing Onu code, then every component, hook and guide with one line on what it is for), `llms-full.txt` (every page in one file) and `docs/<group>/<name>.md` (one Markdown page per component, plus `docs/index.json`), so assistants read the docs of the installed version from `node_modules/@javaabu/onu`. New package `@javaabu/onu-mcp`: an MCP server with `onu_get_rules`, `onu_list_components`, `onu_get_doc` and `onu_search_docs`, reading the project's installed docs and falling back to its own copy. See the new "AI assistants" and "Rules for AI assistants" guides.
- 7db0f26: Brand assets for Maldivian payments and sign-in (R16.7, R16.8). New `BmlTransferLogo` and `BmlConnectLogo`: BML's official logos (the BML mark, and the BML Connect logo with the Visa, Mastercard and American Express marks) as accessible inline SVG components with per-instance gradient ids; the BML Connect wordmark falls back to a bold system sans-serif when Gilroy is not loaded and always runs left to right. `PaymentMethodSelector` now shows these logos for BML Transfer and BML Connect on a white tile (light and dark mode) instead of placeholder icons; project-defined methods keep the neutral placeholder. New `EfaasButton`: "Sign in with eFaas" / "Register with eFaas" (English and Dhivehi) in the eFaas colours (blue `#164998`, black `#333333`, white), Poppins Medium / Mv Waheed when loaded, rounded or square corners, icon-only and loading states, as a plain link (`href`) or a button; pass the eFaas icon from eFaas's brand kit as `logo`.
- 66fea37: Setting `--onu-primary` now re-brands the whole UI, not just buttons. The neutral tokens (`accent`, `secondary`, `muted`, `border`, `input` and the sidebar ones) are tinted with a little of the primary colour, and brand-coloured states use it: the active sidebar item (with a bar on sub-items), tab underlines, selected table rows, the current pagination page, calendar ranges and today, nav pills and stacked tabs, outline and ghost button hovers, pressed toggles, command items and text selection. Dark-mode `primary-subtle` is stronger so it shows on cards, and scoped `data-onu-theme` sections inside dark mode now get the lifted dark primary. Turn the tint down or off with `--onu-tint` (e.g. `0%`) or `data-onu-tint="none"`; setting a token such as `--onu-accent` still replaces it, and the untinted values are available as `--onu-neutral-*`. The light `muted-foreground` is slightly darker (`oklch(0.5 0 0)`) to keep AA contrast on tinted surfaces.
- b0a15d7: Thaana fonts are now bundled. `@javaabu/onu/fonts.css` ships Faruma (Dhivehi text) and MV Faseyha (Dhivehi headings and bold, the new `--onu-font-thaana-bold` token) as `woff2` files subset to Thaana, about 12 kB each, loaded only when a page shows Thaana text. They replace MV Waheed, which was referenced but never bundled, in the default font stacks, the PDF export and the typed signature font.
- 45ec6ed: Charts: add `ChartAnimationProvider` (and export `useChartAnimation`) to turn animation off for every Onu chart in an area, e.g. for print, kiosks or screenshot tests. Tooltips now also stop animating under `prefers-reduced-motion`, so every Onu chart passes `isAnimationActive={false}` to all its Recharts elements when reduced motion is preferred. The visual regression spec emulates reduced motion and loads fonts before charts render, so chart screenshots are stable.
- e7de10b: Charts: gradient fills, on by default. Areas (`LineChart` and `TimeSeriesChart` areas, stacked areas, `Sparkline`, `StatTile` sparklines) fade from the series colour to almost clear at the baseline, bars (`BarChart` vertical, horizontal and stacked, `TimeSeriesChart` bars, `PeriodComparisonChart` bars) run from a lighter base to the full colour (mirrored for negative values and for horizontal bars in RTL), and the `PeriodComparisonChart` line variant gets a soft wash under the current period. Gradients use the series colour, so they follow the theme and `--onu-primary`, have ids unique per chart instance, and fall back to solid in forced-colours mode. Turn them off with `gradient={false}` on a chart (`sparklineGradient` on `StatTile`) or for an area with the new `ChartStyleProvider gradient={false}`; `useChartGradient` is exported for custom charts. Pie and donut slices stay solid. Tooltip and legend swatches stay solid when a series is filled with a gradient.
- 672865d: Charts (`@javaabu/onu/charts`): BarChart, LineChart, PieChart, TimeSeriesChart, PeriodComparisonChart, Sparkline, StatTile/StatTiles, DeltaIndicator and MapChart, plus the shadcn chart primitives and locale-aware formatters (`formatMVR`, `useChartFormat`).
- fd269fe: New `@javaabu/onu/export` entry: `exportRows({ format, rows, columns, filename, title, scope })` and `useExportRows()` build CSV, Excel or PDF files in the browser, so `ExportMenu` / `ListingPage` can export without a server in one line (`onExport={(format) => exportRows({ format, rows, columns })}`). Columns take a header, an accessor (key, dotted path or function) and an optional type (`text`, `number`, `currency`, `date`, `datetime`, `boolean`) and formatter. CSV is UTF-8 with a BOM, RFC 4180 quoted and guarded against formula injection. Excel uses the optional `write-excel-file` peer (loaded on first use), keeps numbers numeric and dates as dates, and writes right-to-left sheets for Dhivehi. PDF opens the print dialog with a paginated, escaped table document (title, scope, generated date, repeated header row, page numbers, `dir`/`lang`, Onu fonts), so Thaana renders correctly. Per-format helpers (`toCsv`, `buildExcelSheet`, `toExcelBlob`, `buildPrintDocument`, `printHtml`, …) are exported too.
- 7dd220a: Display and feedback components: DescriptionList, StatusBadge, Tag, UserAvatar, UserAvatarGroup, KeyboardKey, Callout, Notice, AnnouncementBar, CookieConsent, Toaster/toast, ConditionalLink, ConditionalDisplay, PublishBox, LastEditedBy, RelativeDate, Countdown, ActivityFeed, CommentThread, Notes, IconText, ShareButtons, PrintButton/BackButton, MiniCalendar, ContentCard and error pages (403, 404, 500, 503). Adds the `cookie`, `megaphone`, `message` and `wrench` semantic icons.
- 1d39453: `DropzoneUploader`: controlled `value` / `onValueChange` and `defaultValue` for its file list, so an edit page can show files already saved on the record (`{ id, name, size?, type?, url?, thumbnailUrl? }`), let the user remove them, and submit the kept ids as hidden inputs. With an uploader, finished uploads are added to the value (`{ id, name, size, type, file, response }`); without one, picked `File`s are. Existing files count toward `maxFiles`; removing a file moves focus back to the Browse button and is announced. New types `DropzoneFile` and `UploadedFile`. Without the new props the uploader behaves as before, except that with `multiple={false}` and an uploader, a finished upload now replaces the previous one instead of listing both.
- 21f3a3d: eFaas logos: new `EfaasLogo` with all 22 official logos from eFaas's brand kit (`variant={1…22}`, plus `EFAAS_LOGO_VARIANTS` describing each), and `EfaasButton` takes `logoVariant` to switch between them. By default the button now shows the official icon made for its colour (15 on blue, 14 on black, 9 on white). Icon marks sit before the label; logos with a wordmark replace the visible label, which stays the accessible name. The icon marks are bundled; the wordmark logos load on first use (~40 kB compressed).
- 8daf873: Files and media: FileInput, MultipleFileInput, InstantFileUpload, DropzoneUploader, UploadProgress (with `useUploadQueue` and an XHR uploader that understands Laravel JSON errors), AdditionalFilesUpload, ImageInput, MediaLister, Carousel (dots, autoplay with pause, RTL), AttachmentPreview, DocumentDownload, VideoEmbed and FileIcon; and in `@javaabu/onu/media`: ImageCropper, AvatarUpload, Lightbox, Gallery and MediaPlayer.
- a9a17c2: Form scaffolding: `Form` (Laravel 422 and react-hook-form support, error summary, focus on the first invalid field), `ValidationSummary`, `FormGroup`, `Fieldset` / `FormSection`, `Label`, `FormContainer`, `RepeatingGroup`, `InlineEdit`, `AutosaveIndicator` + `useAutosave`, `SaveBar` + `useUnsavedChangesGuard`, `FloatingSubmit`, `SubmitButton`, `Button` (loading, icons, success/warning), `LinkButton`, `ButtonGroup` and the auth forms (`SignInForm`, `RegisterForm`, `ForgotPasswordForm`, `ResetPasswordForm`).
- 8a01ae3: Form, listing and layout fixes:

  - Textarea keeps its character counter in LTR order on RTL pages; SegmentedControl never truncates labels and scrolls sideways when space runs out.
  - File names use `dir="auto"` and sizes read left-to-right in MediaLister, AttachmentPreview, DocumentDownload, FileInput and file rows.
  - SaveBar keeps inside the main column (mirrored in RTL) and reads "No changes yet" when clean.
  - The unsaved-changes guard covers hash-router links and, where the Navigation API exists, Back/Forward (new `interceptHistory` option).
  - `describeChanges` is typed per key; auth forms pass every named field to `onSubmit` (`AuthFormValues`) and use the transparent divider.
  - Nav items match on path and query; AppSidebar parent badges sit before the chevron.
  - Card pads content placed straight inside it (`padded={false}` opts out).
  - DataTable selection checkboxes are 24px targets.
  - ListingPage with custom `children` keeps pagination and adds a Sort by menu; state equal to `defaultState` stays out of the URL.
  - New `useFormatFilter`, `useActiveFilterLabels` and `formatFilterLabel`; new `useFormatDate`, `useFormatNumber` and `useFormatCurrency`.
  - TreeView shows partly selected parents and gains opt-in `selectionPropagation` (`propagateTreeSelection` exported).

- 6c57d2f: New portal building blocks (R3.7): `Hero` (heading, lead text, actions, search slot, media or a background image under a token-coloured scrim) and `FeatureGrid` (icon, title, description and link per item, with container-query columns). Adds a fluid type scale (R3.4): `text-fluid-sm` … `text-fluid-5xl` utilities built on `clamp()`, overridable with `--onu-text-fluid-*`, with taller line heights for Thaana. `cn()` merges the fluid utilities as font sizes.
- fe354c8: Smaller single-component bundles: `<Icon>` no longer imports the full Lucide map (~250 icons). `OnuProvider` supplies the default set through the icon context, and components with fixed glyphs (Button's loading spinner, Spinner, the shadcn primitives' close buttons, chevrons and checks) pass their Lucide icon as the new `fallback` prop, so they keep working outside `OnuProvider` and `OnuProvider icons` overrides still win. Importing only `Button` drops from 20.7 kB to 11.9 kB (brotli), `FormField` + `TextInput` from 37.2 kB to 28.2 kB. The `Icon` exported from the package root still resolves every name anywhere. Outside `OnuProvider`, names chosen at runtime inside components (e.g. `<Button startIcon="add">`) now show the generic icon. Wrap your app in `OnuProvider`, as the installation guide says.
- 401d096: First release of Onu: shadcn/ui based components with RTL, Dhivehi and Thaana keyboard support, one-variable theming, dark mode and density modes.
- 20d1b66: Smaller, faster builds: code highlighting uses `shiki/core` with the JavaScript regex engine and a curated, lazily loaded language set (add more with the new `registerCodeLanguage` / `registerCodeTheme`), instead of Shiki's full ~300-language bundle and WebAssembly; type declarations are generated with TypeScript 7 (about 3.5x faster and no Node heap limit), and Vite no longer computes gzip sizes during builds.
- 94c29eb: Listing pages: `DataTable` (TanStack Table v9), `ListingPage`, `useListingState` (URL state, §25.6 paging/selection rules), `FilterPanel`, `ActiveFilterChips`, `FilterTabs`, `FilterSubmit`, `SearchBox`, `SearchResults`, `Pagination` (Laravel paginator / API resource aware), `PerPage`, `BulkActionBar`, `RowActions`, `RecordActionsMenu`, `EmptyState`, `ExportMenu`, `ColumnVisibility`, `ViewSwitcher`, `ListView`, `GridView`, `LoadMore`, `KanbanBoard`, `SortableList`, `ReorderableTable`, `TreeView`, `EditableDataGrid`, and `FilterConditionBuilder` in the new `@javaabu/onu/query-builder` entry.
- 4cf1c3b: Overlays and loading components: Modal, ConfirmDialog (with `useConfirm()` / `confirm()` and `ConfirmProvider`), SlideOver, BottomSheet, PopoverPanel, Tip, ActionMenu, ContextActionMenu, CommandPalette, Spinner, SkeletonText/Card/Table, PlaceholderInput, LoadingOverlay, PageProgress (`pageProgress`, `usePageProgress`) and ProgressBar. Fixes the double-flipped submenu chevron in RTL for the dropdown and context menu primitives.
- 51a5877: New default look for the app shell and page layout (ProtonAnt): Proton Mail's shell around Ant Design's content.

  - `AppLayout` is a white content panel with a 12px rounded top-start corner and a 1px shell line, on the app shell colour (`variant="panel"`, the default; `variant="flat"` keeps the previous look). New `background="layout"` (Ant's layout grey for dashboards of cards) and `breadcrumbs` (shown in the page header band, or above the content). `useAppLayout()` is exported.
  - `AppHeader` defaults to `variant="shell"` inside a panel layout: the shell colour, 60px, a wide 40px rounded search, 36px quiet icon buttons and a square account avatar (avatar only below 768px). Outside a panel layout the default is unchanged.
  - `AppSidebar` defaults to `surface="shell"` inside a panel layout: Proton's 36px items with grey hover and active states, brand count pills (`badgeTone: "neutral"` for plain totals), coloured folders and labels (`NavItem.color` tints the icon or shows a dot), and a new `action` slot for a full-width 44px call to action. `Sidebar` gets a `surface` prop.
  - New `UsageMeter` (a quota bar with "used / total", a link and a note for the sidebar footer) and `AppSwitcher` (Proton's app grid menu).
  - `PageTitle` is Ant's PageHeader band for an `h1` inside a panel layout: breadcrumbs (defaulting to the layout's), title with `subtitle` and `tags`, actions, description with key `figures`, extra `content`, and a `tabs` row with an ink bar. `variant="band" | "plain"`; `breadcrumbs` also accepts a `BreadcrumbsItem[]`.
  - `ListingPage` gets the Ant ProTable layout (`variant="card"`, the default inside a panel layout): the header band with the status tabs, an optional inline query form (`queryFilters` or `queryForm`) and the list in a table card with `tableTitle` and tools. `FilterPanel` gets `variant="form"` (labelled fields in a grid with Reset, Filter and Expand).
  - `StatTile` is Ant Pro's ChartCard: a 30px regular-weight figure, a `tip` info button, a 46px `chart` slot and a footer row under a line.
  - `Card` follows Ant: 24px padding, a 1px border line without shadow, and a 56px header row with its own bottom line; `padded={false}` now removes all padding. `NavTabs` line tabs and `Breadcrumbs` follow Ant too.
  - The shell reads new semantic tokens (`--shell`, `--shell-foreground`, `--shell-border`, `--shell-field`, `--shell-hover`, `--shell-active`, `--shell-weak`, `--layout`) with Proton's values as fallbacks.

- 7486eb5: New default look (ProtonAnt): tokens and content controls. The default brand is Proton purple `#6d4aff`; greys are Ant Design's plain neutrals (`--onu-tint` now defaults to `0%`; set it to `100%` for the brand-tinted greys); body text is 14px on a 22px line; `--onu-radius` is 6px (cards and popups 8px, tags 4px). New tokens: `--onu-shell*` (the Proton app shell: `#f5f4f2` light, `#16141c` dark), `--onu-layout`, `--onu-preset-{blue,cyan,green,red,gold}` (with `-border` and `-foreground`), `--onu-shadow-popup`, `--onu-font-size` and `--onu-line-height`, plus the derived Ant-style colour steps `--primary-1` … `--primary-8` (Tailwind `bg-primary-1` …, `bg-shell`, `bg-layout`, `bg-preset-green`, `shadow-popup`). Controls follow Ant Design: 32px buttons with 14px regular text (`outline` is Ant's default button with a brand hover; new `dashed` variant; `destructive` is solid), fields with `#d9d9d9` borders, a brand border on hover and a brand border and glow on focus, a 44 × 22 switch, menus with 32px items and the popup shadow, line tabs with an ink bar and count pills, an Ant table (grey header with split lines, 12px 16px cells, selected rows in `--primary-1`), `StatusBadge` and `Tag` as bordered preset-colour tags (`Tag` gains an optional `color` prop), and `Pagination` with numbered pages by default (`numbered={false}` restores Previous / Next) and the page-size changer after the pages.
- 86ec7a5: Add `QrCode` to `@javaabu/onu/media`: a QR code generator that encodes with `uqr` and renders a themed SVG (`currentColor`, `tone` variant), with error-correction levels, quiet zone, a centre logo that forces level H, an accessible label, and optional PNG/SVG download and copy buttons with English and Dhivehi labels.
- 2f966b5: `SearchResults`: new `onShowMore(groupId, group)` shows more results of a group on the same page. Groups with more results than shown (`total`, or the new `hasMore`) get a **Show more** button instead of the `moreHref` link, with a loading state (return a promise or set the group's `loadingMore`), focus moved to the first newly revealed result, and polite announcements of the loaded count or a failure. Without the callback the link behaves as before. `classNames.more` styles the link or button.
- 88e8031: Smaller bundles: components bring only the English text they use, `OnuProvider` no longer bundles Dhivehi or the Lucide icon map, and every entry point has a size budget.

  Measured with all dependencies except React, minified and brotli-compressed (gzip in brackets):

  | Import                                                | Before           | After          |
  | ----------------------------------------------------- | ---------------- | -------------- |
  | `Button`                                              | 12.0 kB (13.5)   | 12.1 kB (13.6) |
  | `FormField` + `TextInput`                             | 28.4 kB (32.7)   | 16.0 kB (18.2) |
  | `Modal`                                               | 36.6 kB (41.7)   | 24.3 kB (27.5) |
  | `Select`                                              | 50.8 kB (57.7)   | 38.5 kB (43.3) |
  | `DataTable`                                           | 81.7 kB (93.9)   | 73.0 kB (83.6) |
  | `OnuProvider`                                         | 36.6 kB (45.5)   | 1.3 kB (1.4)   |
  | `OnuProvider` + 8 form components (with `DatePicker`) | 111.3 kB (132.9) | 81.4 kB (95.0) |
  - **English text per component.** Each component registers the English namespaces it uses (`common`, `form`, `listing`, …), so a text field no longer carries the strings of the data table, map and editor. `t("namespace.key")`, `OnuProvider messages` overrides and custom locales work as before; missing strings still fall back to English.
  - **Dhivehi on demand.** Import it from the new `@javaabu/onu/locales/dv` entry and pass the object, `<OnuProvider locale={dv}>`, to bundle it with your app. `locale="dv"` still works: it now loads Dhivehi as a separate chunk the first time it is needed (direction and `lang` switch at once; strings show in English until the chunk arrives). `import { dv } from "@javaabu/onu"` keeps working.
  - **Default icon set on demand.** `OnuProvider` loads the Lucide map (~250 icons) as a separate chunk the first time an icon is chosen by name at runtime (e.g. `<Button startIcon="add">`), rendering a same-sized empty placeholder until then. Apps that only use fixed glyphs never download it. Pass `icons={lucideIconMap}` to bundle it up front.
  - **No date-fns in components without dates.** `OnuProvider`'s default English locale no longer includes date-fns's `en-US` locale (date-fns formats in English by default), so text fields and dialogs stay free of date-fns.
  - **Size budgets.** `size-limit` now checks every `package.json` export (core scenarios, primitives, thaana, locales/dv, charts, maps, editor, calendar, media, query-builder, export, the icon adapters and the CSS files), and CI runs it.

  Type changes for apps: `OnuLocale.messages` may be partial and `OnuLocale.dateFns` is optional (`undefined` means English). Code that reads `useOnu().locale.dateFns` should handle `undefined`, which date-fns treats as `en-US`. The exported `en` locale still has every string and `dateFns: enUS`; `OnuProvider`'s default English no longer does, so if your own code calls `t()` with a key from a namespace none of your components use, pass `locale={en}` or add the string with `messages`.

- 10f02af: TimeSeriesChart: new `variant` (`"line" | "area" | "bar"`) and `stacked` props for stacked areas and stacked bars on the time axis. The data table, summary and RTL mirroring work as before.

### Patch Changes

- 2b6d8a3: `AppSidebar`: a collapsed parent item now expands when `currentHref` moves into one of its pages (it used to stay as it was first rendered), and a `badgeTone: "neutral"` count is read by screen readers as the number alone instead of "N new". On phones the sidebar drawer focuses itself when it opens rather than its first field, so a filter or search field at the top no longer brings up the on-screen keyboard.
- adfa0cf: CodeBlock: Shiki token colours are adjusted to at least 4.5:1 contrast on the code background (and on highlighted lines) in light and dark mode. The default GitHub themes' keyword red and comment grey fell short of WCAG AA. `highlightCode` returns the adjusted colours too.
- 4c7a33b: Editor and BlockRenderer: lists and quotes now get the direction of their first strong character instead of `dir="auto"` (which the browser resolved to LTR because every paragraph inside has its own `dir`), so bullets, numbers and the quote border sit on the right of Dhivehi text. The direction updates while typing and is included in `getHTML()`.
- d172ef0: Editor and BlockRenderer: tables now take the direction of their first strong text, like lists and quotes. The table and its scroll wrapper get the resolved `dir` (in `BlockRenderer`, `getHTML()` and, updated while typing, both editors), so a Dhivehi table puts its first column on the right even on an English page. Table cells align to their logical start. An explicit `dir` in the content still wins; a table with no strong text yet stays `dir="auto"`.
- 4ea0754: FormField no longer grows past its grid or flex column when a control holds long content (such as a long file name); its root now has `min-w-0`.
- 252f581: FullCalendar: the agenda view no longer overflows by 10,000px in RTL (FullCalendar's off-screen list header is now hidden in place), and month events clip inside their day cell on phones.
- d784354: Maps (Google adapter), found by running the adapter against the real Maps JavaScript API:

  - `MapPolygon` / `MapRoute`: the initial value is no longer wiped when it is loaded into terra-draw (terra-draw reported its `clear()` as the user deleting every shape).
  - terra-draw now starts once the map has a projection, instead of throwing `Cannot read properties of null (reading 'addEventListener')` when it loaded before the map was ready.
  - Shapes stay on the map when the drawing tone changes (e.g. picking another zone type).
  - Maps keep their camera when they switch between light and dark, instead of jumping back to the initial centre and zoom.
  - Clustered markers use `PinElement` directly and `gmp-click`, removing Google's deprecation warnings.

- 1d02e1d: `applyListingState` returns every matching row when `perPage` is `Infinity` (it returned none), so "export all rows" exports work.
- c2a21e8: The keyless map preview merges clusters whose buttons would overlap, so cluster targets keep WCAG 2.5.8 spacing.
- 8f2aa7c: Maps: an empty Map ID (for example an unset CI secret passed through as `""`) now counts as no Map ID, so Google maps fall back to `DEMO_MAP_ID` and advanced markers keep working. `staticMapUrl` (and `LocationCard`'s thumbnail) no longer sends `DEMO_MAP_ID` to the Static Maps API.
- fea252e: Maps: LiveMap pans to the selected marker when `selectedId` changes from outside the map (without turning on follow mode). LiveMap, RouteStopEditor, MapRoute, MapPolygon and MapReplay fit their points when no `center`/`zoom` is given — also when the points load after the first render — in both the Google adapter and the keyless preview; a single point is centred at zoom 15 instead of zooming all the way in. `MapView`'s `bounds` is now fitted once, as soon as it is set.
- d7b93da: Touch target fixes on phones (WCAG 2.5.8): `MediaPlayer` hides the seek buttons in narrow players (under 24rem, like the volume slider) and keeps the timeline at least 4rem wide, so the timeline no longer collapses under the time display; the arrow keys still seek. The card `ListingPage` toolbar keeps the search box at least 14rem wide (or the full row) and wraps the tools below it, instead of squeezing the search to a sliver.
- 73b3297: `SidebarProvider` (and so `AppLayout`) now includes a `TooltipProvider`, as upstream shadcn does, so `AppSidebar` no longer crashes with "`Tooltip` must be used within `TooltipProvider`" in apps that don't add one.
- ceac3a3: `StatTile` steps its figure down in narrow tiles (container query) so long values such as currency amounts stay on one line.
