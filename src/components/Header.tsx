import { useState } from "react"
import { borderClasses } from "../utils/utils"
import { Dispatch } from "react"
import { Action, initialDisplayDataState } from "../reducers/displayDataReducer"

interface HeaderProps {
  dispatch: Dispatch<Action>
}

export default function Header({ dispatch }: HeaderProps) {
  const [copySuccess, setCopySuccess] = useState<boolean>(false)

  const buttonClasses = `${borderClasses} px-1 bg-gray-200 cursor-pointer hover:text-gray-500`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000) // Reset success message after 2 seconds
    } catch (err) {
      console.error("Failed to copy URL:", err)
    }
  }

  return (
    <div className="mx-2 mt-1 flex items-center gap-1">
      <span className="font-bold">PPI Calculator</span>
      <button
        className={buttonClasses}
        onClick={() => {
          dispatch({
            type: "SET_ALL",
            payload: { resolution: initialDisplayDataState.resolution, diagonal: initialDisplayDataState.diagonal },
          })
        }}
      >
        Reset
      </button>
      <button className={`${buttonClasses} flex items-center gap-1`} onClick={copyToClipboard}>
        {copySuccess ? (
          <>
            Copied!
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              <path d="M13 15l2 2 4-4" strokeWidth="2"></path>
            </svg>
          </>
        ) : (
          <>
            Copy
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </>
        )}
      </button>
    </div>
  )
}
