import Inputs from './components/Inputs'
import Container from './components/Container'
// import { borderClasses } from './utils/utils'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      {/* <div className={`grid grid-cols-1 sm:grid-cols-2 ~w-full/1/4 sm:max-w-md lg:max-w-lg p-2 m-2 ${borderClasses}`}> */}
      <Inputs />
      {/* </div> */}
      <Container />
      {/* <div>
        <a href="https://vitejs.dev" target="_blank">
        </a>
        <a href="https://react.dev" target="_blank">
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
    </>
  )
}

export default App
