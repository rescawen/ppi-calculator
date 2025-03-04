import {
  Tooltip as RadixTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipArrow,
} from "@radix-ui/react-tooltip" // Import necessary components

interface TooltipProps {
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
        <TooltipContent className="rounded bg-gray-900 px-2 py-1 text-sm text-white shadow-lg z-10">
          {content}
          <TooltipArrow className="fill-current text-gray-900" />
        </TooltipContent>
      </RadixTooltip>
    </TooltipProvider>
  )
}
