import type { People } from '../../types'

type Props = {
  people: People[]
}

export function PeopleList(props: Props) {
  const { people } = props

  return (
    <ul>
      {people.map(p => (
        <li key={p.id}>
          {p.name} - {p.employment}
        </li>
      ))}
    </ul>
  )
}
