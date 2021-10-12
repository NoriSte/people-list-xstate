import { useSelector } from '@xstate/react'
import { useMachine } from '../../peopleMachine/MachineRoot'

export function usePeople() {
  return useSelector(useMachine(), state => state.context.people)
}
