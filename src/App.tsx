import { useReducer } from "react"
import Inputs from "./components/Inputs"
import Container from "./components/ResolutionBlocks"
import { displayDataReducer, initialDisplayDataState } from "../src/reducers/displayDataReducer"

function App() {
  const [displayData, dispatch] = useReducer(displayDataReducer, initialDisplayDataState)

  return (
    <>
      <Inputs displayData={displayData} dispatch={dispatch} />
      <Container dispatch={dispatch} />
    </>
  )
}

export default App
