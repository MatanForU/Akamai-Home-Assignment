import { useState, type ReactNode } from "react";

type TooltipSide = "top" | "bottom" | "left" | "right";

const POSITION_CLASSES: Record<TooltipSide, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const ARROW_CLASSES: Record<TooltipSide, string> = {
  top: "-bottom-[3px] left-1/2 -translate-x-1/2",
  bottom: "-top-[3px] left-1/2 -translate-x-1/2",
  left: "-right-[3px] top-1/2 -translate-y-1/2",
  right: "-left-[3px] top-1/2 -translate-y-1/2",
};

export function Tooltip({
  label,
  children,
  side = "top",
}: {
  label: string;
  children: ReactNode;
  side?: TooltipSide;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute z-20 whitespace-nowrap rounded-[8px] bg-slate-900 px-2 py-1 text-[11px] font-medium text-white shadow-md animate-scale-up dark:bg-slate-100 dark:text-slate-900 ${POSITION_CLASSES[side]}`}
        >
          {label}
          <span className={`absolute h-1.5 w-1.5 rotate-45 bg-slate-900 dark:bg-slate-100 ${ARROW_CLASSES[side]}`} />
        </span>
      )}
    </span>
  );
}
