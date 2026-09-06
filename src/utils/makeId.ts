let nextId = 1

// Sequential ids are enough here: they only need to be unique within one
// page load, and they stay readable in React DevTools and tests.
export function makeId(): string {
  return 'm' + nextId++
}
