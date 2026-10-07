import type { MessageDict } from "../../i18n/types"

export const form = {
  // Form + validation summary
  submit: "Submit",
  submitFailed: "The form could not be submitted.",
  errorSummaryTitle: {
    one: "There is 1 problem with this form",
    other: "There are {count} problems with this form",
  },
  errorSummaryHint: "Fix the highlighted fields and try again.",
  // Buttons
  opensInNewTab: "(opens in a new tab)",
  // Label
  optional: "(optional)",
  // Save bar
  unsavedChanges: "Unsaved changes",
  noChanges: "No changes yet",
  changeCount: { one: "1 unsaved change", other: "{count} unsaved changes" },
  changeTo: "{field} changes to {value}",
  changeCleared: "{field} is cleared",
  showChanges: "Show changes",
  discard: "Discard",
  saveSucceeded: "Changes saved",
  saveFailed: "Your changes were not saved. Please try again.",
  leaveTitle: "Leave this page?",
  leaveMessage: "You have unsaved changes. Leave anyway?",
  leave: "Leave",
  stay: "Stay on page",
  // Autosave indicator
  autosaveIdle: "No unsaved changes",
  autosaveSaving: "Saving…",
  autosaveSaved: "Saved",
  autosaveSavedJustNow: "Saved just now",
  autosaveSavedAgo: "Saved {time}",
  autosaveError: "Couldn’t save changes",
  // Repeating group
  addItem: "Add item",
  itemLabel: "Item {index}",
  removeItem: "Remove item {index}",
  moveItemUp: "Move item {index} up",
  moveItemDown: "Move item {index} down",
  itemAdded: "Item {index} added",
  itemRemoved: "Item {index} removed",
  itemMoved: "Item moved to position {index}",
  noItems: "No items yet",
  maxItems: { one: "Up to 1 item", other: "Up to {count} items" },
  minItems: { one: "At least 1 item", other: "At least {count} items" },
  // Inline edit
  edit: "Edit {label}",
  emptyValue: "Empty",
  saveEdit: "Save",
  cancelEdit: "Cancel",
  inlineEditHint: "Press Enter to save or Escape to cancel.",
  inlineEditHintMultiline: "Press Ctrl+Enter to save or Escape to cancel.",
  inlineEditFailed: "Couldn’t save. Please try again.",
  inlineEditSaved: "{label} saved",
} satisfies MessageDict
