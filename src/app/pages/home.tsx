import App from "../../App"
import { createDisplayDataState, initialDisplayDataState } from "../../reducers/displayDataReducer"
import { parseDisplayParams } from "../../utils/displayParams"

export const Home = ({ request }: { request: Request }) => {
  const displayParams = parseDisplayParams(new URL(request.url).search)
  const initialDisplayData = displayParams
    ? createDisplayDataState(displayParams.horizontal, displayParams.vertical, displayParams.diagonal)
    : initialDisplayDataState

  return <App initialDisplayData={initialDisplayData} />
}
