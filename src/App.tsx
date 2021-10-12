import { MachineRoot } from './peopleMachine'
import { PeopleRoot } from './People'
import './styles.css'

function Title() {
  return (
    <div className="App">
      <h1>XState - People lists</h1>
      <p>Please, check out the README.md</p>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Title />
      <MachineRoot>
        <PeopleRoot />
      </MachineRoot>
    </>
  )
}

// TODO:
// [x] add simple react app
// [x] fix TS errors
// [x] add debounce
// [ ] add tests (in progress)
// [ ] document everyghing

// debugging
/*
const service = interpret(peopleMachine).onTransition(state => {
  console.log(state.value, state.context)
})

service.start()

service.send('START')
// service.send('TOGGLE')
*/
