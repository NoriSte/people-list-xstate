import type { FetchError } from '../../types'

export function getServiceStatus(fetchErrors: FetchError[]) {
  return fetchErrors.length > 0 ? (fetchErrors.length > 2 ? 'noService' : 'failed') : 'working'
}
