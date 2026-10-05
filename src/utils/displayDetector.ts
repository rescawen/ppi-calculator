import { getEstimatedScreenSizes } from "./catalog"

export interface DetectedDisplay {
  horizontal: number
  vertical: number
  diagonal: number
  deviceLabel?: string
  isInternal?: boolean
  screenLabel?: string
  confidence: "unique" | "confirmed_internal" | "confirmed_external" | "catalog" | "fallback_96ppi"
}

// Known globally unique native resolutions (e.g. Apple Silicon Liquid Retina)
const UNIQUE_HARDWARE_SIGNATURES: Record<
  string,
  { diagonal: number; label: string; platform?: "macos" | "any" }
> = {
  "3024x1964": { diagonal: 14.2, label: "MacBook Pro 14″", platform: "macos" },
  "3456x2234": { diagonal: 16.2, label: "MacBook Pro 16″", platform: "macos" },
  "2560x1664": { diagonal: 13.6, label: "MacBook Air 13.6″", platform: "macos" },
  "2880x1864": { diagonal: 15.3, label: "MacBook Air 15.3″", platform: "macos" },
  "4480x2520": { diagonal: 23.5, label: "iMac 24″ 4.5K", platform: "macos" },
  "6016x3384": { diagonal: 32.0, label: "Apple Pro Display XDR 32″ / 6K" },
}

// Standard common PC / monitor horizontal resolution grids
const STANDARD_RESOLUTIONS = [
  { h: 1920, v: 1080 },
  { h: 2560, v: 1440 },
  { h: 3840, v: 2160 },
  { h: 2560, v: 1600 },
  { h: 1920, v: 1200 },
  { h: 1366, v: 768 },
  { h: 1280, v: 720 },
  { h: 1280, v: 800 },
  { h: 1440, v: 900 },
  { h: 1680, v: 1050 },
  { h: 3440, v: 1440 },
  { h: 5120, v: 1440 },
  { h: 5120, v: 2880 },
]

/**
 * Reconciles browser zoom vs OS display scaling to extract the real hardware resolution.
 * screen.width is constant in CSS pixels across browser zoom levels.
 * window.devicePixelRatio conflates OS scaling * browser page zoom.
 */
function resolveNormalizedResolution(
  cssWidth: number,
  cssHeight: number,
  dpr: number,
  isMac: boolean,
): { horizontal: number; vertical: number } {
  // Ensure orientation order: horizontal >= vertical
  const [w, h] = cssWidth >= cssHeight ? [cssWidth, cssHeight] : [cssHeight, cssWidth]

  // 1. On macOS, Retina displays use a strict 2x pixel doubling factor
  if (isMac) {
    const retinaH = Math.round(w * 2)
    const retinaV = Math.round(h * 2)
    const retinaKey = `${retinaH}x${retinaV}`

    // Check if 2x matches any unique Apple Silicon panel
    if (UNIQUE_HARDWARE_SIGNATURES[retinaKey]) {
      return { horizontal: retinaH, vertical: retinaV }
    }

    // Check for macOS scaled modes with notch (e.g. 14" MBP "More Space": 1800x1169)
    const ratio = w / h
    if (Math.abs(ratio - 3024 / 1964) < 0.005) {
      return { horizontal: 3024, vertical: 1964 }
    }
    if (Math.abs(ratio - 3456 / 2234) < 0.005) {
      return { horizontal: 3456, vertical: 2234 }
    }
  }

  // 2. Direct multiplication check
  const rawH = Math.round(w * dpr)
  const rawV = Math.round(h * dpr)
  const directMatch = STANDARD_RESOLUTIONS.find((res) => res.h === rawH && res.v === rawV)
  if (directMatch) {
    return { horizontal: directMatch.h, vertical: directMatch.v }
  }

  // 3. Grid test against standard OS display scaling factors (1x, 1.25x, 1.5x, 1.75x, 2x)
  // This neutralizes browser zoom (e.g., 110%, 125%) distorting screen.width * dpr
  const candidateScales = [1.0, 1.25, 1.5, 1.75, 2.0, 2.5]
  for (const scale of candidateScales) {
    const candidateH = Math.round(w * scale)
    const candidateV = Math.round(h * scale)
    const gridMatch = STANDARD_RESOLUTIONS.find((res) => res.h === candidateH && res.v === candidateV)
    if (gridMatch) {
      return { horizontal: gridMatch.h, vertical: gridMatch.v }
    }
  }

  // 4. Fallback to raw scaled values if no standard grid matched
  return { horizontal: rawH || w, vertical: rawV || h }
}

export type WindowManagementPermissionState = PermissionState | "unsupported"

/**
 * Checks the current permission state for the Window Management API.
 * Returns 'granted', 'prompt', 'denied', or 'unsupported'.
 */
export async function getWindowManagementPermissionState(): Promise<WindowManagementPermissionState> {
  if (typeof window === "undefined" || !("getScreenDetails" in window)) {
    return "unsupported"
  }
  if (typeof navigator !== "undefined" && "permissions" in navigator) {
    try {
      const status = await navigator.permissions.query({
        name: "window-management" as PermissionName,
      })
      return status.state
    } catch {
      try {
        const fallbackStatus = await navigator.permissions.query({
          name: "window-placement" as PermissionName,
        })
        return fallbackStatus.state
      } catch {
        return "unsupported"
      }
    }
  }
  return "unsupported"
}

/**
 * Subscribes to changes in the Window Management permission state (e.g. when toggled in browser settings).
 */
export async function subscribeToPermissionChange(
  callback: (state: WindowManagementPermissionState) => void,
): Promise<(() => void) | null> {
  if (typeof window === "undefined" || !("getScreenDetails" in window)) {
    return null
  }
  if (typeof navigator !== "undefined" && "permissions" in navigator) {
    try {
      const status = await navigator.permissions.query({
        name: "window-management" as PermissionName,
      })
      const listener = () => callback(status.state)
      status.addEventListener("change", listener)
      return () => status.removeEventListener("change", listener)
    } catch {
      try {
        const fallbackStatus = await navigator.permissions.query({
          name: "window-placement" as PermissionName,
        })
        const listener = () => callback(fallbackStatus.state)
        fallbackStatus.addEventListener("change", listener)
        return () => fallbackStatus.removeEventListener("change", listener)
      } catch {
        return null
      }
    }
  }
  return null
}

/**
 * Detects the user's current display configuration.
 */
export async function detectCurrentDisplay(options?: {
  requestPermission?: boolean
}): Promise<DetectedDisplay | null> {
  if (typeof window === "undefined" || typeof window.screen === "undefined") {
    return null
  }

  let isInternal: boolean | undefined
  let screenLabel: string | undefined
  let width = window.screen.width
  let height = window.screen.height
  const dpr = window.devicePixelRatio || 1

  let canQueryScreenDetails = Boolean(options?.requestPermission)

  // In passive/silent mode, check if permission was already granted previously so we can read details without prompting
  if (!canQueryScreenDetails && typeof navigator !== "undefined" && "permissions" in navigator) {
    try {
      const status = await navigator.permissions.query({
        name: "window-management" as PermissionName,
      })
      if (status.state === "granted") {
        canQueryScreenDetails = true
      }
    } catch {
      // Permission query unsupported, continue with standard screen properties
    }
  }

  // 1. Try Window Management API (Chrome, Edge 100+)
  if ("getScreenDetails" in window && canQueryScreenDetails) {
    try {
      // Race getScreenDetails with a timeout. If the user is prompted to grant permission,
      // allow ample time (25s) for the prompt interaction, while keeping a short timeout (1.2s)
      // for silent background queries.
      // @ts-expect-error Window Management API
      const screenDetailsPromise = window.getScreenDetails()
      const timeoutMs = options?.requestPermission ? 25000 : 1200
      const screenDetails = await Promise.race([
        screenDetailsPromise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
      ])
      if (screenDetails && typeof screenDetails === "object" && "currentScreen" in screenDetails) {
        const current = screenDetails.currentScreen
        if (current) {
          isInternal = current.isInternal
          screenLabel = current.label
          width = current.width || width
          height = current.height || height
        }
      }
    } catch {
      // Permission dismissed or unsupported, continue with standard screen properties
    }
  }

  const isMac =
    typeof navigator !== "undefined" &&
    (/Macintosh|Mac OS X/i.test(navigator.userAgent) || navigator.platform === "MacIntel") &&
    navigator.maxTouchPoints === 0

  const { horizontal, vertical } = resolveNormalizedResolution(width, height, dpr, isMac)
  const key = `${horizontal}x${vertical}`

  // 2. Check Globally Unique Hardware Signatures
  const uniqueMatch = UNIQUE_HARDWARE_SIGNATURES[key]
  if (uniqueMatch && (!uniqueMatch.platform || (uniqueMatch.platform === "macos" && isMac))) {
    return {
      horizontal,
      vertical,
      diagonal: uniqueMatch.diagonal,
      deviceLabel: uniqueMatch.label,
      isInternal: true,
      screenLabel,
      confidence: "unique",
    }
  }

  // 3. Handle 2560x1600 (Guard against generalizing to 13.3" for external monitors)
  if (horizontal === 2560 && vertical === 1600) {
    if (isInternal === true || screenLabel?.toLowerCase().includes("built-in")) {
      return {
        horizontal: 2560,
        vertical: 1600,
        diagonal: 13.3,
        deviceLabel: "MacBook Pro/Air 13.3″ (Built-in)",
        isInternal: true,
        screenLabel,
        confidence: "confirmed_internal",
      }
    }

    if (isInternal === false) {
      return {
        horizontal: 2560,
        vertical: 1600,
        diagonal: 30.0,
        deviceLabel: screenLabel || "External 30″ Monitor",
        isInternal: false,
        screenLabel,
        confidence: "confirmed_external",
      }
    }

    // When provenance is unknown, check whether platform is a Mac laptop
    const defaultDiagonal = isMac ? 13.3 : 30.0
    return {
      horizontal: 2560,
      vertical: 1600,
      diagonal: defaultDiagonal,
      deviceLabel: isMac ? "2560×1600 (Likely 13.3″ MacBook)" : "2560×1600 (Likely 30″ Monitor)",
      screenLabel,
      confidence: "catalog",
    }
  }

  // 4. Handle 3840x2160 LG UltraFine 4K (24MD4KL) identification via screenLabel
  if (horizontal === 3840 && vertical === 2160) {
    if (screenLabel && /(?:LG.*UltraFine|UltraFine|24MD4KL|LG.*24)/i.test(screenLabel)) {
      return {
        horizontal: 3840,
        vertical: 2160,
        diagonal: 23.7,
        deviceLabel: "LG 24MD4KL (UltraFine 4K 23.7″)",
        isInternal: false,
        screenLabel,
        confidence: "confirmed_external",
      }
    }
  }

  // 5. Check Device Catalog for known estimates
  const estimates = getEstimatedScreenSizes(horizontal, vertical)
  if (estimates.length > 0) {
    return {
      horizontal,
      vertical,
      diagonal: estimates[0],
      screenLabel,
      confidence: "catalog",
    }
  }

  // 5. Fallback to 96 PPI baseline estimate
  const REFERENCE_PPI = 96
  const fallbackDiagonal = parseFloat(
    Math.sqrt((horizontal / REFERENCE_PPI) ** 2 + (vertical / REFERENCE_PPI) ** 2).toFixed(1),
  )

  return {
    horizontal,
    vertical,
    diagonal: fallbackDiagonal,
    screenLabel,
    confidence: "fallback_96ppi",
  }
}
