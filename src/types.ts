// ---------------------------------------------------------------
// DOMAIN

export type Employment = 'employee' | 'contractor'

export type People = {
  id: number
  name: string
  salary: number
  country: string
  jobTitle: string
  currency: string
  employment: Employment
}

export type Filter = {
  query: string
  employment: Employment[]
}

export type FetchError = { errorMessage: string }

export type FetchResponse = { people: People[] }
