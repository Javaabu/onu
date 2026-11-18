---
"@javaabu/onu": patch
---

A controlled `useThaanaInput({ enabled })` no longer drifts out of step when the Thaana shortcut is pressed and the parent keeps the value: the field keeps typing Thaana while it shows `dir="rtl"`. `attachThaanaKeyboard`'s `onToggle` now receives the requested state and leaves the change to you (call `setEnabled`); without `onToggle` the shortcut still flips the mode itself.
