import { useCallback } from 'react'
import { useMachine } from '../../peopleMachine/MachineRoot'

export function useRetry() {
  const service = useMachine()
  const { send } = service

  return useCallback(() => {
    send({ type: 'RETRY' })
  }, [send])
}
