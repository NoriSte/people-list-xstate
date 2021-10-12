import { useRetry } from './hooks/useRetry'
import { usePeople } from './hooks/usePeople'
import { useFilters } from './hooks/useFilters'
import { useFetchErrors } from './hooks/useFetchErrors'

import { Filters } from './components/Filters'
import { PeopleList } from './components/PeopleList'
import { FetchError } from './components/FetchError'

import { getServiceStatus } from './utils/getServiceStatus'

export function People() {
  const retry = useRetry()
  const people = usePeople()
  const filters = useFilters()
  const fetchErrors = useFetchErrors()
  const serviceStatus = getServiceStatus(fetchErrors)

  return (
    <>
      {serviceStatus === 'failed' && <FetchError onRetry={retry} />}
      <Filters {...filters} />
      <PeopleList people={people} />
    </>
  )
}
