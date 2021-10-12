import type { Employment } from '../../types'

import { useEffect, useState } from 'react'
import { useSelector } from '@xstate/react'

import { useMachine } from '../../peopleMachine/MachineRoot'

const noEmployments: Employment[] = []
const employeesOnly: Employment[] = ['employee']
const contractorsOnly: Employment[] = ['contractor']
const allEmployments: Employment[] = ['employee', 'contractor']

function getEmployment(employees: boolean, contractors: boolean) {
  if (employees && contractors) return allEmployments
  else if (contractors) return contractorsOnly
  else if (employees) return employeesOnly
  else return noEmployments
}

export function useFilters() {
  const service = useMachine()
  const { send } = service

  const machineFilter = useSelector(service, state => {
    return state.context.filter
  })

  const [query, setQuery] = useState(machineFilter.query)
  const [employees, setEmployees] = useState(() => machineFilter.employment.includes('employee'))
  const [contractors, setContractors] = useState(() =>
    machineFilter.employment.includes('contractor'),
  )

  // commit the query to the machine
  useEffect(() => {
    send({ type: 'SET_QUERY', query })
  }, [send, query])

  // commit the employment to the machine
  useEffect(() => {
    send({ type: 'SET_EMPLOYMENT', employment: getEmployment(employees, contractors) })
  }, [send, employees, contractors])

  return {
    query,
    setQuery,
    employees,
    contractors,
    setEmployees,
    setContractors,
  }
}
