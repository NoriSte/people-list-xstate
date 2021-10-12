import { useEffect } from 'react'
import { useMachine } from '../../peopleMachine/MachineRoot'

export function useStartMachine() {
  const { send } = useMachine()

  useEffect(() => {
    send({ type: 'START' })
  }, [send])
}
