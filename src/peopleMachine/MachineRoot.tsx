import type { ReactElement } from 'react'
import type { Interpreter } from 'xstate'
import type { Context, Events, States } from './types'

import { useInterpret } from '@xstate/react'
import { createContext, useContext } from 'react'
import { machine } from './machine'

const MachineContext = createContext<Interpreter<Context, any, Events, States> | undefined>(
  undefined,
)

interface Props {
  children: ReactElement
}

// The machine is exposed to all the children of `MachineRoot`
export function MachineRoot(props: Props) {
  const service = useInterpret(machine, { devTools: process.env.NODE_ENV === 'development' })
  return <MachineContext.Provider value={service}>{props.children}</MachineContext.Provider>
}

// Used by every component that needs to access the running machine. It hides the React Context, easing future refactors.
export function useMachine() {
  const service = useContext(MachineContext)
  if (!service) {
    throw new Error('Missing MachineRoot')
  }
  return service
}
