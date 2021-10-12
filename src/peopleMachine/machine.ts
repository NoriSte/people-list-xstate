import type { Events, States, Context, InitialContext } from './types'
import { fetchPeople } from '../fakeServer'

import { assign, createMachine } from 'xstate'

import { inspect } from '@xstate/inspect'

if (process.env.NODE_ENV === 'development') {
  inspect({
    url: 'https://statecharts.io/inspect',
    iframe: false,
  })
}

export const initialContext: InitialContext = {
  people: [],
  filter: {
    query: '',
    employment: ['employee', 'contractor'],
  },
  debounceFilter: undefined,
  fetchErrors: [],
  fetching: false,
}

export const machine = createMachine<Context, Events, States>(
  {
    id: 'people',
    strict: true,
    initial: 'idle',
    context: initialContext,
    states: {
      // INITIAL STATE
      // The machine start still, allowing external control over the first fetch
      idle: { on: { START: 'fetch' } },

      // FETCH STATES
      debounceFetch: {
        on: {
          // Changing the filters reset the debounce
          SET_QUERY: { actions: 'setQuery', target: 'debounceFetch' },
          SET_EMPLOYMENT: { actions: 'setEmployment', target: 'debounceFetch' },
        },
        after: {
          debounceDelay: {
            target: 'fetch',
            actions: ['swapNextFilter'],
          },
        },
      },
      fetch: {
        on: {
          // Changing the filters reset the debounce and cancel the previous fetch, if any
          SET_QUERY: { actions: 'setQuery', target: 'debounceFetch' },
          SET_EMPLOYMENT: { actions: 'setEmployment', target: 'debounceFetch' },

          // Fetch completion management
          SUCCESS: { actions: 'setSuccessData', target: 'success' },
          FAILURE: { actions: 'setErrorData', target: 'failure' },
        },
        entry: 'setFetchingData',
        invoke: { src: 'fetchPeople' },
      },

      // SUCCESS STATE
      success: {
        on: {
          // Changing the filters start the debounced fetch
          SET_QUERY: { actions: 'setQuery', target: 'debounceFetch' },
          SET_EMPLOYMENT: { actions: 'setEmployment', target: 'debounceFetch' },
        },
      },

      // ERROR STATE
      failure: {
        on: {
          // After a failure, retying with the same filter happens immediately
          RETRY: { target: 'fetch' },

          // Changing the filters start the debounced fetch
          SET_QUERY: { actions: 'setQuery', target: 'debounceFetch' },
          SET_EMPLOYMENT: { actions: 'setEmployment', target: 'debounceFetch' },
        },
      },
    },
  },

  {
    services: {
      // Fetch the new people and return a cancellation method, useful for subsequent, debounced, fetches
      fetchPeople: context => send => {
        const { load, cancel } = fetchPeople(context.filter)
        load
          .then(data => send({ type: 'SUCCESS', data }))
          .catch((error: any) =>
            send({
              type: 'FAILURE',
              data: !!error.errorMessage
                ? { errorMessage: error.errorMessage }
                : { errorMessage: error.stack },
            }),
          )

        return cancel
      },
    },

    actions: {
      // Reset the previous fetch data and store the last fetched data
      setSuccessData: assign({
        people: (_ctx, event) => (event.type === 'SUCCESS' ? event.data.people : []),
        fetchErrors: _ctx => [],
        fetching: _ctx => false,
      }),

      // Reset the previous fetch data and piles up the received error
      setErrorData: assign({
        people: _ctx => [],
        fetchErrors: (ctx, event) => [
          ...ctx.fetchErrors,
          ...(event.type === 'FAILURE' ? [event.data] : []),
        ],
        fetching: _ctx => false,
      }),

      // Store that the machine is fetching
      setFetchingData: assign({
        fetching: _ctx => true,
      }),

      // Change the filters of the next fetch
      setEmployment: assign({
        debounceFilter: (ctx, event) => {
          const prev = ctx.debounceFilter || ctx.filter
          const next =
            event.type === 'SET_EMPLOYMENT' ? { ...prev, employment: event.employment } : prev

          return next
        },
      }),
      setQuery: assign({
        debounceFilter: (ctx, event) => {
          const prev = ctx.debounceFilter || ctx.filter
          const next = event.type === 'SET_QUERY' ? { ...prev, query: event.query } : prev

          return next
        },
      }),

      // Empty the debounced filter and set the one to be used for fetching the new data
      swapNextFilter: assign({
        filter: ctx => {
          // TODO: how to tell XState that the context contains the debounceFilter?
          if (!ctx.debounceFilter) throw new Error('Missing ctx.debounceFilter')

          return ctx.debounceFilter
        },
        debounceFilter: ctx => undefined,
      }),
    },

    delays: {
      debounceDelay: () => 500,
    },
  },
)
