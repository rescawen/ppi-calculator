import { type DisplayDataState, roundToTwoDecimals } from "../reducers/displayDataReducer"

export type CompareHistoryItem = DisplayDataState & {
  label: string
}

type CompareBoxProps = {
  compareHistory: CompareHistoryItem[]
}

export default function CompareBox({ compareHistory }: CompareBoxProps) {
  if (compareHistory.length === 0) {
    return null
  }

  const compareSlots = Array.from({ length: 4 }, (_, index) => compareHistory[index])
  const rows = [
    { label: "Horizontal", getValue: (item: CompareHistoryItem) => item.resolution.horizontal },
    { label: "Vertical", getValue: (item: CompareHistoryItem) => item.resolution.vertical },
    { label: "Diagonal", getValue: (item: CompareHistoryItem) => item.diagonal },
    { label: "PPI", getValue: (item: CompareHistoryItem) => roundToTwoDecimals(item.pixelPerInch) },
  ]

  return (
    <aside
      className="m-2 w-full max-w-4xl self-start overflow-x-auto xl:flex-1"
      aria-label="Recently compared devices"
      data-testid="compare-box"
    >
      <table className="w-full table-fixed border-collapse text-left text-sm">
        <colgroup>
          <col className="w-28" />
          {compareSlots.map((item, index) => (
            <col
              key={item ? `${item.resolution.horizontal}x${item.resolution.vertical}-${item.diagonal}-${item.label}` : index}
            />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className="border border-gray-300 px-2 py-1 font-semibold">
              <span className="sr-only">Metric</span>
            </th>
            {compareSlots.map((item, index) => (
              <th
                key={item ? `${item.resolution.horizontal}x${item.resolution.vertical}-${item.diagonal}-${item.label}` : index}
                className="truncate border border-gray-300 px-2 py-1 font-semibold"
                title={item?.label}
              >
                {item?.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th className="border border-gray-300 px-2 py-1 font-semibold">{row.label}</th>
              {compareSlots.map((item, index) => (
                <td
                  key={
                    item
                      ? `${row.label}-${item.resolution.horizontal}x${item.resolution.vertical}-${item.diagonal}-${item.label}`
                      : `${row.label}-${index}`
                  }
                  className="border border-gray-300 px-2 py-1"
                >
                  {item ? row.getValue(item) : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </aside>
  )
}
