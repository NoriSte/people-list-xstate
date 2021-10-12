// ---------------------------------------------------------------

import type { People, Filter, Employment, FetchError } from '../types'

// ---------------------------------------------------------------
// CONTEXT
export type Context = {
  /**
   * The filter used for the last fetch
   */
  filter: Filter
  /**
   * The filter of the next, debounced, fetch if any
   */
  debounceFilter: Filter | undefined
  /**
   * If the machine is fetching or not
   */
  fetching: boolean
  /**
   *  The data returned from the last fetch
   */
  people: [] | People[]
  /**
   * The queue of errors of the last fetches, emptied when the latest fetch succeeded
   */
  fetchErrors: [] | FetchError[]
}

/**
 * Initially, the state machine doesn't contain any data bu the default filter.
 */
export type InitialContext = {
  filter: Filter
  debounceFilter: undefined
  fetching: false
  people: []
  fetchErrors: []
}

/**
 * When the next fetch is debounced, the next filter is stored in `debounceFilter`
 */
export type DebounceFetchContext = {
  debounceFilter: Filter
}

/**
 * During the fetch, the context includes the `filter` passed to the server and a `fetching` indicator.
 */
type FetchContext = {
  filter: Filter
  fetching: true
}

/**
 * When the fetch succeed, the data are stored and the errors reset.
 */
type SuccessContext = {
  people: People[]
  filter: Filter
  fetchErrors: []
  fetching: false
}

/**
 * In case of errors, the data are reset and the list of the last errors are stored.
 */
type FailureContext = {
  people: []
  filter: Filter
  fetchErrors: FetchError[]
  fetching: false
}

// ---------------------------------------------------------------
// EVENTS
export type Events = InternalEvents | ExternalEvents | UserEvents

// INTERNAL EVENTS
/**
 * Internal events, helpful for typing purposes.
 */
type InternalEvents = InternalFetchSuccessEvent | InternalFetchFailureEvent
export type InternalFetchSuccessEvent = {
  type: 'SUCCESS'
  data: { people: People[] }
}
export type InternalFetchFailureEvent = { type: 'FAILURE'; data: FetchError }

// EXTERNAL EVENTS
/**
 * All the events triggered by the consumer but not necessarily directly by the user.
 */
type ExternalEvents = StartEvent
export type StartEvent = { type: 'START' }

// USER EVENTS
/**
 * All the events triggered mostly by user inputs.
 */
type UserEvents = RetryEvent | SetQueryEvent | SetEmploymentEvent
export type RetryEvent = { type: 'RETRY' }
export type SetQueryEvent = { type: 'SET_QUERY'; query: string }
export type SetEmploymentEvent = { type: 'SET_EMPLOYMENT'; employment: Employment[] }

// ---------------------------------------------------------------
// STATES
/**
 * All the possible states of the machine.
 */
export type States =
  // INITIAL STATE
  | { value: 'idle'; context: Context & InitialContext }

  // SUCCESS STATE
  | { value: 'success'; context: Context & SuccessContext }

  // FETCH STATES
  | { value: 'fetch'; context: Context & FetchContext }
  | { value: 'debounceFetch'; context: Context & DebounceFetchContext }

  // FAILURE STATE
  | { value: 'failure'; context: Context & FailureContext }
