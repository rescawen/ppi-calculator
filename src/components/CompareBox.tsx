import { DisplayDataState } from "../reducers/displayDataReducer"
import { borderClasses } from "../utils/utils"

interface CompareBoxProps {
  compareHistory: DisplayDataState[]
}

export default function CompareBox({ compareHistory }: CompareBoxProps) {
  if (compareHistory.length === 0) {
    return null
  }

  return (
    // TODO: 1. make this to work on responsive design.
    //       2. make modal to pop this open for more comprehensive comparison
    //       3. same resolution for different screen size.
    //       4. same ppi for different screen size.
    //       5. same screen size, different resolution/ppi toggle.

    <div className={`m-1.5 border-gray-300 ${borderClasses} overflow-x-auto`}>
      <table className="border-collapse border border-gray-300 w-full table-fixed">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-1 w-40 max-w-40">Device</th>
            <th className="border border-gray-300 px-2 py-1">(H)</th>
            <th className="border border-gray-300 px-2 py-1">(V)</th>
            <th className="border border-gray-300 px-2 py-1">(D)</th>
            <th className="border border-gray-300 px-2 py-1">PPI</th>
          </tr>
        </thead>
        <tbody>
          {compareHistory.map((item, index) => (
            <tr key={index} className="hover:bg-gray-200">
              <td className="border border-gray-300 px-2 py-1 truncate">{item.label ?? ""}</td>
              <td className="border border-gray-300 px-2 py-1">{item.resolution.horizontal}</td>
              <td className="border border-gray-300 px-2 py-1">{item.resolution.vertical}</td>
              <td className="border border-gray-300 px-2 py-1">{item.diagonal}</td>
              <td className="border border-gray-300 px-2 py-1">{item.pixelPerInch}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
