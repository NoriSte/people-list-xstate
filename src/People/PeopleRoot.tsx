import { getServiceStatus } from './utils/getServiceStatus'

import { useFetchErrors } from './hooks/useFetchErrors'
import { useStartMachine } from './hooks/useStartMachine'

import { NoService } from './components/NoService'

import { People } from './People'

export function PeopleRoot() {
  const serviceStatus = getServiceStatus(useFetchErrors())

  useStartMachine()

  switch (serviceStatus) {
    case 'noService':
      return <NoService />

    default:
      return <People />
  }
}
