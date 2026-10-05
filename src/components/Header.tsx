import { useEffect, useState } from "react"
import { borderClasses } from "../utils/utils"
import { Dispatch } from "react"
import { Action, DisplayDataState } from "../reducers/displayDataReducer"
import {
  detectCurrentDisplay,
  getWindowManagementPermissionState,
  subscribeToPermissionChange,
  WindowManagementPermissionState,
} from "../utils/displayDetector"

interface HeaderProps {
  dispatch: Dispatch<Action>
  defaultDisplayData: DisplayDataState
}

export default function Header({ dispatch, defaultDisplayData }: HeaderProps) {
  const [copySuccess, setCopySuccess] = useState<boolean>(false)
  const [isDetecting, setIsDetecting] = useState<boolean>(false)
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false)
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false)
  const [showDisableModal, setShowDisableModal] = useState<boolean>(false)
  const [isWaitingForBrowserPermission, setIsWaitingForBrowserPermission] = useState<boolean>(false)
  const [permissionState, setPermissionState] = useState<WindowManagementPermissionState>("unsupported")

  const buttonClasses = `${borderClasses} px-1 bg-gray-200 cursor-pointer hover:text-gray-500`

  useEffect(() => {
    getWindowManagementPermissionState().then(setPermissionState)
    let unsubscribe: (() => void) | null = null
    subscribeToPermissionChange((newState) => {
      setPermissionState(newState)
    }).then((unsub) => {
      unsubscribe = unsub
    })
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const runDetection = async (requestPermission: boolean) => {
    setIsDetecting(true)
    try {
      const detected = await detectCurrentDisplay({ requestPermission })
      const updatedState = await getWindowManagementPermissionState()
      setPermissionState(updatedState)
      if (detected) {
        dispatch({
          type: "SET_ALL",
          payload: {
            resolution: { horizontal: detected.horizontal, vertical: detected.vertical },
            diagonal: detected.diagonal,
          },
        })
      }
    } finally {
      setIsDetecting(false)
    }
  }

  const handleDetectScreen = async () => {
    const permState = await getWindowManagementPermissionState()
    setPermissionState(permState)
    if (permState === "prompt") {
      setShowPermissionModal(true)
      return
    }
    const shouldRequest =
      permState === "granted" || (typeof window !== "undefined" && "getScreenDetails" in window && permState !== "denied")
    await runDetection(shouldRequest)
  }

  const handleConfirmPermission = async () => {
    setIsWaitingForBrowserPermission(true)
    try {
      await runDetection(true)
      setShowPermissionModal(false)
    } finally {
      setIsWaitingForBrowserPermission(false)
    }
  }

  const handleSkipPermission = async () => {
    setShowPermissionModal(false)
    await runDetection(false)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000) // Reset success message after 2 seconds
    } catch (err) {
      console.error("Failed to copy URL:", err)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showPermissionModal && !isWaitingForBrowserPermission) {
          setShowPermissionModal(false)
        }
        setShowInfoModal(false)
        setShowDisableModal(false)
      }
    }
    if (showInfoModal || showPermissionModal || showDisableModal) {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [showInfoModal, showPermissionModal, showDisableModal, isWaitingForBrowserPermission])

  return (
    <>
      <div className="mx-2 mt-1 flex items-center gap-1">
        <span className="font-bold">PPI Calculator</span>
        <button
          className={buttonClasses}
          onClick={handleDetectScreen}
          title="Detect current display resolution and size"
        >
          {isDetecting ? "Detecting..." : "Detect Screen"}
        </button>
        {permissionState === "granted" && (
          <button
            type="button"
            className={`${buttonClasses} text-gray-700`}
            onClick={() => setShowDisableModal(true)}
            title="How to disable 'Manage windows on all your displays' permission"
          >
            Disable Permission
          </button>
        )}
        <button
          type="button"
          className={`${buttonClasses} px-1.5 font-bold text-gray-700`}
          onClick={() => setShowInfoModal(true)}
          title="How screen auto-detection works"
          aria-label="How screen auto-detection works"
        >
          ?
        </button>
        <button
          className={buttonClasses}
          onClick={() => {
            dispatch({
              type: "SET_ALL",
              payload: { resolution: defaultDisplayData.resolution, diagonal: defaultDisplayData.diagonal },
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

      {showPermissionModal && (
        <dialog
          open
          aria-labelledby="permission-modal-title"
          className="fixed inset-0 z-50 flex h-full w-full max-h-none max-w-none items-center justify-center bg-black/50 p-4 border-0"
        >
          <button
            type="button"
            className="fixed inset-0 h-full w-full cursor-default border-0 bg-transparent p-0"
            onClick={() => {
              if (!isWaitingForBrowserPermission) setShowPermissionModal(false)
            }}
            aria-label="Close modal overlay"
            tabIndex={-1}
          />
          <div
            className={`relative z-10 max-w-lg w-full bg-white p-5 shadow-2xl ${borderClasses}`}
          >
            <div className="flex items-center justify-between border-b border-gray-300 pb-2">
              <h2 id="permission-modal-title" className="text-base font-bold">
                Display Identification Permission
              </h2>
              <button
                type="button"
                className="text-gray-500 hover:text-black cursor-pointer text-xl font-bold px-1"
                onClick={() => {
                  if (!isWaitingForBrowserPermission) setShowPermissionModal(false)
                }}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs text-gray-700">
              <div className="rounded border border-blue-200 bg-blue-50 p-3 text-blue-950">
                <div className="font-semibold text-sm text-blue-900">
                  Why does your browser ask to &ldquo;Manage windows on all your displays&rdquo;?
                </div>
                <p className="mt-1 leading-relaxed">
                  Web browsers bundle monitor hardware queries (EDID model names) under the <strong>Window Management API</strong>. Even though the browser uses that generic system label, this calculator only queries your monitor&rsquo;s identity to calculate its physical diagonal size and PPI.
                </p>
              </div>

              <div>
                <span className="font-bold text-gray-900 text-sm">What we query:</span>
                <ul className="mt-1 list-disc list-inside space-y-1 pl-1">
                  <li>
                    <strong>Monitor model name (EDID):</strong> e.g., <em>&ldquo;LG UltraFine&rdquo;</em>, <em>&ldquo;Dell UltraSharp&rdquo;</em>. This identifies your exact diagonal (e.g. 23.7″ vs 27″ for 4K).
                  </li>
                  <li>
                    <strong>Screen type:</strong> Distinguishes whether your screen is an internal laptop display or an external desktop monitor.
                  </li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-2">
                <span className="font-bold text-gray-900">What we never do:</span>
                <ul className="mt-1 list-disc list-inside space-y-1 pl-1 text-gray-600">
                  <li>We never open, move, resize, or manage any of your windows.</li>
                  <li>We never access window contents, browsing history, or personal data.</li>
                </ul>
              </div>

              {isWaitingForBrowserPermission && (
                <div className="flex items-center gap-2 rounded border border-amber-300 bg-amber-50 p-3 text-amber-900 animate-pulse">
                  <span className="text-base">⏳</span>
                  <div>
                    <strong>Waiting for browser prompt...</strong>
                    <div className="text-[11px] text-amber-800">
                      Please click <strong>&ldquo;Allow&rdquo;</strong> in the browser prompt near your address bar above.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 pt-3">
              <button
                type="button"
                className={`${borderClasses} px-2 py-1 bg-gray-100 hover:bg-gray-200 text-xs cursor-pointer disabled:opacity-50`}
                onClick={handleSkipPermission}
                disabled={isWaitingForBrowserPermission}
              >
                Detect without Permission
              </button>
              <button
                type="button"
                className={`${borderClasses} px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 font-semibold text-xs cursor-pointer disabled:opacity-50`}
                onClick={handleConfirmPermission}
                disabled={isWaitingForBrowserPermission}
              >
                {isWaitingForBrowserPermission ? "Waiting for browser..." : "Allow in Browser & Detect"}
              </button>
            </div>
          </div>
        </dialog>
      )}

      {showDisableModal && (
        <dialog
          open
          aria-labelledby="disable-modal-title"
          className="fixed inset-0 z-50 flex h-full w-full max-h-none max-w-none items-center justify-center bg-black/50 p-4 border-0"
        >
          <button
            type="button"
            className="fixed inset-0 h-full w-full cursor-default border-0 bg-transparent p-0"
            onClick={() => setShowDisableModal(false)}
            aria-label="Close modal overlay"
            tabIndex={-1}
          />
          <div
            className={`relative z-10 max-w-lg w-full bg-white p-5 shadow-2xl ${borderClasses}`}
          >
            <div className="flex items-center justify-between border-b border-gray-300 pb-2">
              <h2 id="disable-modal-title" className="text-base font-bold">
                How to Disable Display Permission
              </h2>
              <button
                type="button"
                className="text-gray-500 hover:text-black cursor-pointer text-xl font-bold px-1"
                onClick={() => setShowDisableModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs text-gray-700">
              <div className="rounded border border-amber-200 bg-amber-50 p-3 text-amber-950">
                <div className="font-semibold text-sm text-amber-900">
                  Why can&rsquo;t websites disable this directly with code?
                </div>
                <p className="mt-1 leading-relaxed">
                  Web browser security intentionally prevents web pages from revoking or clearing their own permissions via JavaScript. Only you can revoke permissions using your browser&rsquo;s address bar controls.
                </p>
              </div>

              <div>
                <span className="font-bold text-gray-900 text-sm">To disable or reset this permission in Chrome:</span>
                <ol className="mt-2 list-decimal list-inside space-y-2 pl-1 leading-relaxed">
                  <li>
                    In your browser&rsquo;s address bar at the top, click the <strong>Page Controls / Tune icon</strong> (🎛️ or lock icon) to the left of the URL.
                  </li>
                  <li>
                    Find <strong>&ldquo;Manage windows on all your displays&rdquo;</strong> in the menu.
                  </li>
                  <li>
                    Click the toggle to turn it <strong>Off</strong> (or click <strong>&ldquo;Reset permissions&rdquo;</strong>).
                  </li>
                </ol>
              </div>

              <div className="rounded border border-gray-200 bg-gray-50 p-2 text-gray-600">
                <p>
                  <em>Live sync:</em> This page actively listens for permission changes. As soon as you toggle it off in your address bar, this page will update automatically!
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end border-t border-gray-200 pt-3">
              <button
                type="button"
                className={buttonClasses}
                onClick={() => setShowDisableModal(false)}
              >
                Got it
              </button>
            </div>
          </div>
        </dialog>
      )}

      {showInfoModal && (
        <dialog
          open
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex h-full w-full max-h-none max-w-none items-center justify-center bg-black/50 p-4 border-0"
        >
          <button
            type="button"
            className="fixed inset-0 h-full w-full cursor-default border-0 bg-transparent p-0"
            onClick={() => setShowInfoModal(false)}
            aria-label="Close modal overlay"
            tabIndex={-1}
          />
          <div
            className={`relative z-10 max-w-lg w-full bg-white p-5 shadow-2xl ${borderClasses}`}
          >
            <div className="flex items-center justify-between border-b border-gray-300 pb-2">
              <h2 id="modal-title" className="text-base font-bold">How Screen Auto-Detection Works</h2>
              <button
                type="button"
                className="text-gray-500 hover:text-black cursor-pointer text-xl font-bold px-1"
                onClick={() => setShowInfoModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="mt-3 space-y-3 text-sm text-gray-700 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <h3 className="font-semibold text-black">1. Physical Resolution & Zoom Normalization</h3>
                <p>
                  Browsers report screen sizes in CSS pixels, while <code className="bg-gray-100 px-1 rounded">devicePixelRatio</code> combines both your OS display scaling (Retina/HiDPI) and browser page zoom (Ctrl +/-). The calculator reconciles these values against standard display grids (1×, 1.25×, 1.5×, 2×) to prevent browser zoom from distorting your detected resolution.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-black">2. Monitor Model Identification (Window Management API)</h3>
                <p>
                  Standard web pages cannot query a ruler for physical screen inches. When permitted, the browser reads your monitor's system display name from OS/EDID settings (e.g. <em>LG UltraFine</em>, <em>Dell UltraSharp</em>) to identify the exact physical diagonal (e.g. 23.7″ 4K vs 27″ 4K).
                </p>
                <p className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 border border-gray-200 rounded">
                  <strong>Why does Chrome ask to &ldquo;Manage windows on all your displays&rdquo;?</strong> The browser groups monitor model queries under the Window Management permission umbrella. We only read your monitor&rsquo;s display label and internal/external status; we never manage, open, or move your windows.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-black">3. Unique Hardware Signatures</h3>
                <p>
                  Bespoke panels—such as Apple Silicon notched Liquid Retina displays (14.2″ MacBook Pro at 3024×1964, 16.2″ at 3456×2234, 13.6″ at 2560×1664)—have globally unique aspect ratios and are identified with 100% precision.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-black">4. Ambiguity Guarding (e.g. 2560×1600)</h3>
                <p>
                  Ambiguous resolutions that exist across both laptops and external monitors are guarded: built-in displays resolve to 13.3″ (MacBook), external monitors resolve to 30″, and unconfirmed setups offer interactive candidate suggestions.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-black">5. Device Catalog & 96 PPI Baseline</h3>
                <p>
                  Other displays are matched against our curated device catalog. Novel or unlisted resolutions fall back to the standard 96 PPI baseline estimate.
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end border-t border-gray-200 pt-3">
              <button
                type="button"
                className={buttonClasses}
                onClick={() => setShowInfoModal(false)}
              >
                Got it
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  )
}
