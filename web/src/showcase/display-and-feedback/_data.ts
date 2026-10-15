/** Mock data shared by the Display and feedback demos. */

export const people = [
  { id: 1, name: "Aishath Shiuna", status: "online" as const },
  { id: 2, name: "Ahmed Ali", status: "busy" as const },
  { id: 3, name: "މަރިޔަމް ޒާހިރާ", status: "away" as const },
  { id: 4, name: "Mohamed Naseem" },
  { id: 5, name: "ފާޠިމަތު ރަޝީދާ" },
  { id: 6, name: "Ibrahim Waheed" },
  { id: 7, name: "Hawwa Shazna" },
]

export const minutesAgo = (n: number) => new Date(Date.now() - n * 60_000)
export const daysFromNow = (n: number) => new Date(Date.now() + n * 86_400_000)
