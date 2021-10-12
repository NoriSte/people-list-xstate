import type { ChangeEvent } from 'react'
import { useCallback } from 'react'

type Props = {
  query: string
  employees: boolean
  contractors: boolean

  setQuery: (value: string) => void
  setEmployees: (value: boolean) => void
  setContractors: (value: boolean) => void
}

export function Filters(props: Props) {
  const { query, setQuery, employees, contractors, setEmployees, setContractors } = props

  const onEmployeesChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setEmployees(e.target.checked),
    [setEmployees],
  )
  const onContractorsChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setContractors(e.target.checked),
    [setContractors],
  )
  const onQueryChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
    [setContractors],
  )

  return (
    <div>
      Employees <input type="checkbox" checked={employees} onChange={onEmployeesChange} />
      Contactors <input type="checkbox" checked={contractors} onChange={onContractorsChange} />
      <input type="text" value={query} placeholder="Search..." onChange={onQueryChange} />
    </div>
  )
}
