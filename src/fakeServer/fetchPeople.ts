import type { FetchResponse, People, Filter } from '../types'
import { db } from './db'

function filterPeople(people: People[], filter: Filter): People[] {
  const query = filter.query.toLowerCase()

  return people.filter(p => {
    return filter.employment.includes(p.employment) && p.name.toLowerCase().includes(query)
  })
}

export function fetchPeople(filter: Filter) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const load = new Promise<FetchResponse>((resolve, reject) => {
    timeoutId = setTimeout(() => {
      resolve({ people: filterPeople(db.people, filter) })
    }, 500)
  })

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }

  return { load, cancel }
}
