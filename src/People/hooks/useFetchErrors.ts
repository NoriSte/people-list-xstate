import { useSelector } from '@xstate/react'
import { useMachine } from '../../peopleMachine/MachineRoot'

export function useFetchErrors() {
  return useSelector(useMachine(), state => state.context.fetchErrors)
}
