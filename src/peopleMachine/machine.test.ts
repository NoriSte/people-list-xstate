// const fakeServer = jest.genMockFromModule('../fakeServer')

import type { People, FetchError } from '../types'
import { interpret } from 'xstate'
import { machine, initialContext } from './machine'

// ----------------------------------------------
// MOCK DATA ------------------------------------
const annHenry: People = {
  id: 1,
  name: 'Ann Henry',
  jobTitle: 'Product manager',
  country: 'Germany',
  salary: 120000,
  currency: 'EUR',
  employment: 'employee',
}
const vittoriaJanson: People = {
  id: 2,
  name: 'Vittoria Janson',
  jobTitle: 'Pianist',
  country: 'Italy',
  salary: 70000,
  currency: 'EUR',
  employment: 'contractor',
}

const error = { errorMessage: 'Failure' }

const defaultFetchData: People[] = [{ ...annHenry }, { ...vittoriaJanson }]

// --------------------------------------------
// TESTING UTILS ------------------------------
// A generic `wait` utility
function awaitTimeout(timeout: number) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

/**
 * Allow programmatically control the external events that impact the machine.
 * In particular: `resolveFetchMock` and `rejectFetchMock` allow controlling the behavior
 * of the mocked external service that fetches the people.
 */
function createMockedMachine(debounceDelay: number = 500) {
  const fetchMock = jest.fn(() => () => {
    // see resolveFetchMock and rejectFetchMock
  })

  const machineMock = machine.withConfig({
    services: { fetchPeople: fetchMock },
    // speed up the delay of the machine' debounce
    delays: { debounceDelay },
  })

  const service = interpret(machineMock).start()

  const resolveFetchMock = (people: People[]) => {
    service.send({ type: 'SUCCESS', data: { people } })
  }
  const rejectFetchMock = (error: FetchError) => {
    service.send({ type: 'FAILURE', data: error })
  }

  const waitDebouncedFetch = () => awaitTimeout(debounceDelay)

  return {
    service,
    fetchMock,
    machineMock,
    rejectFetchMock,
    resolveFetchMock,
    waitDebouncedFetch,
  }
}

// --------------------------------------------
// TESTS --------------------------------------
describe('People machine', () => {
  describe('Initial state', () => {
    it('When created, should do nothing', () => {
      // ARRANGE
      const { service, fetchMock } = createMockedMachine()

      // ASSERT
      expect(service.state).toMatchObject({
        value: 'idle',
        context: initialContext,
      })
      expect(fetchMock).toHaveBeenCalledTimes(0)
    })

    it('When started, should fetch the data', () => {
      // ARRANGE
      const { service, fetchMock } = createMockedMachine()

      // ACT
      service.send({ type: 'START' })

      // ASSERT
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(service.state).toMatchObject({ value: 'fetch', context: { fetching: true } })
    })
  })

  describe('First fetch', () => {
    it('When the fetch resolves, should store the data', () => {
      // ARRANGE
      const { service, resolveFetchMock } = createMockedMachine()

      // ACT
      service.send({ type: 'START' })
      resolveFetchMock(defaultFetchData)

      // ASSERT
      expect(service.state).toMatchObject({
        value: 'success',
        context: { people: defaultFetchData, fetching: false },
      })
    })

    it('When the fetch rejects, should store the error', () => {
      // ARRANGE
      const { service, rejectFetchMock } = createMockedMachine()

      // ACT
      service.send({ type: 'START' })
      rejectFetchMock(error)

      // ASSERT
      expect(service.state).toMatchObject({
        value: 'failure',
        context: { fetching: false, fetchErrors: [error] },
      })
    })

    it('When the fetch rejects twice, should store all the errors', () => {
      // ARRANGE
      const { service, rejectFetchMock } = createMockedMachine()

      // ACT
      service.send({ type: 'START' })
      rejectFetchMock(error)
      service.send({ type: 'RETRY' })
      rejectFetchMock(error)

      // ASSERT
      expect(service.state).toMatchObject({
        value: 'failure',
        context: { fetching: false, fetchErrors: [error, error] },
      })
    })
  })

  describe('Querying', () => {
    it('When the query is set, should debounce the next fetch', async () => {
      // ARRANGE
      const { service, fetchMock, resolveFetchMock, waitDebouncedFetch } = createMockedMachine(1)

      // ACT
      service.send({ type: 'START' })
      resolveFetchMock(defaultFetchData)
      service.send({ type: 'SET_QUERY', query: 'Ann Henry' })

      // ASSERT
      expect(fetchMock).toHaveBeenCalledTimes(1)
      await waitDebouncedFetch()
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('When the query is set, should pass the query to the next fetch', async () => {
      // ARRANGE
      const query = 'Ann Henry'
      const filteredFetchData = [annHenry]
      const { service, fetchMock, resolveFetchMock, waitDebouncedFetch } = createMockedMachine(1)

      // ACT
      service.send({ type: 'START' })
      resolveFetchMock(defaultFetchData)
      service.send({ type: 'SET_QUERY', query })
      await waitDebouncedFetch()
      resolveFetchMock(filteredFetchData)

      // ASSERT
      expect(fetchMock).toHaveBeenLastCalledWith(
        // machine' context
        expect.objectContaining({ filter: expect.objectContaining({ query }) }),
        // machine' states and invokeMeta, useless for the purpose of the tests
        expect.anything(),
        expect.anything(),
      )
      expect(service.state).toMatchObject({
        value: 'success',
        context: { people: filteredFetchData, fetching: false },
      })
    })

    it('When retrying, should retry with the last query', async () => {
      // ARRANGE
      const query = 'Ann Henry'
      const { service, fetchMock, rejectFetchMock, resolveFetchMock, waitDebouncedFetch } =
        createMockedMachine(1)

      // ACT
      service.send({ type: 'START' })
      resolveFetchMock(defaultFetchData)
      service.send({ type: 'SET_QUERY', query })
      await waitDebouncedFetch()
      rejectFetchMock(error)
      service.send({ type: 'RETRY' })
      await waitDebouncedFetch()

      // ASSERT
      expect(fetchMock).toHaveBeenLastCalledWith(
        // machine' context
        expect.objectContaining({ filter: expect.objectContaining({ query }) }),
        // machine' states and invokeMeta, useless for the purpose of the tests
        expect.anything(),
        expect.anything(),
      )
    })
  })
})
