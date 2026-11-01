import { describe, expect, it } from "vitest"

import { getInitials } from "./initials"

describe("getInitials", () => {
  it.each([
    ["Ahmed Ali", "AA"],
    ["aishath shiuna mohamed", "AM"],
    ["Mariyam", "M"],
    ["  Ibrahim  (Ibbe)  Rasheed ", "IR"],
    ["Mr. Hassan Manik", "MM"],
    ["އަޙްމަދު ޢަލީ", "އަޢަ"],
    ["މަރިޔަމް", "މަ"],
    ["", ""],
    [null, ""],
    ["123 !!", ""],
  ])("%s → %s", (name, expected) => {
    expect(getInitials(name)).toBe(expected)
  })

  it("respects max", () => {
    expect(getInitials("Ahmed Ali", 1)).toBe("A")
  })
})
