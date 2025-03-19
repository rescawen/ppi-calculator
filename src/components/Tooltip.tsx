import {
  Tooltip as RadixTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipArrow,
} from "@radix-ui/react-tooltip" // Import necessary components

type TooltipProps = {
  content: React.ReactNode // Define the content prop
  children: React.ReactNode // Define the children prop
}

export const Tooltip = ({ content, children }: TooltipProps) => {
  return (
    <TooltipProvider>
      <RadixTooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <span className="relative">
            {children}
            <span className="absolute -bottom-0 left-1 right-0 bg-transparent border-b border-dashed border-gray-400" />
          </span>
        </TooltipTrigger>
        {/** There is a bug with how z-index: auto, which is the default property of radix-ui.
         * When there are two tooltips on top of each other, the tooltip of the top one pops below on top of the trigger on the bottom. */}
        <TooltipContent className="rounded bg-gray-900 px-2 py-1 text-sm font-normal text-white shadow-lg z-10">
          {content}
          <TooltipArrow className="fill-current text-gray-900" />
        </TooltipContent>
      </RadixTooltip>
    </TooltipProvider>
  )
}

// Below is AI generated code for clicking to get tooltip for mobile devices.

// import {
//    Tooltip as RadixTooltip,
//    TooltipContent,
//    TooltipProvider,
//    TooltipTrigger,
//    TooltipArrow,
//  } from "@radix-ui/react-tooltip" // Import necessary components
//  import { useState, useEffect, useRef } from "react" // Import React hooks

//  type TooltipProps = {
//    content: React.ReactNode // Define the content prop
//    children: React.ReactNode // Define the children prop
//    mobileClickable?: boolean // Optional prop to enable click behavior on mobile
//  }

//  export const Tooltip = ({ content, children, mobileClickable = true }: TooltipProps) => {
//    const [open, setOpen] = useState(false)
//    const triggerRef = useRef<HTMLSpanElement>(null)

//    // Handle click outside to close tooltip on mobile
//    useEffect(() => {
//      if (!mobileClickable) return

//      const handleClickOutside = (event: Event) => {
//        if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
//          setOpen(false)
//        }
//      }

//      document.addEventListener("mousedown", handleClickOutside)
//      document.addEventListener("touchstart", handleClickOutside)

//      return () => {
//        document.removeEventListener("mousedown", handleClickOutside)
//        document.removeEventListener("touchstart", handleClickOutside)
//      }
//    }, [mobileClickable])

//    // Handle click/tap on mobile
//    const handleTriggerInteraction = () => {
//      if (mobileClickable) {
//        setOpen((prev) => !prev)
//      }
//    }

//    return (
//      <TooltipProvider>
//        <RadixTooltip
//          open={mobileClickable ? open : undefined}
//          onOpenChange={mobileClickable ? setOpen : undefined}
//          delayDuration={0}
//        >
//          <TooltipTrigger asChild>
//            <span className="relative cursor-pointer" onClick={handleTriggerInteraction} ref={triggerRef}>
//              {children}
//              <span className="absolute -bottom-0 left-1 right-0 bg-transparent border-b border-dashed border-gray-400" />
//            </span>
//          </TooltipTrigger>
//          {/** There is a bug with how z-index: auto, which is the default property of radix-ui.
//           * When there are two tooltips on top of each other, the tooltip of the top one pops below on top of the trigger on the bottom. */}
//          <TooltipContent
//            className="rounded bg-gray-900 px-2 py-1 text-sm font-normal text-white shadow-lg z-10"
//            side="top"
//            sideOffset={5}
//          >
//            {content}
//            <TooltipArrow className="fill-current text-gray-900" />
//          </TooltipContent>
//        </RadixTooltip>
//      </TooltipProvider>
//    )
//  }
