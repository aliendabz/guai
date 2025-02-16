import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";
const Switch = React.forwardRef(({ className, ...props }, ref) => (_jsx(SwitchPrimitives.Root, { className: cn("peer h-5 w-9 rounded-full bg-secondary ring-offset-background data-[state=checked]:bg-primary data-[state=checked]:ring-offset-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 transition-transform duration-200", className), ...props, ref: ref, children: _jsx(SwitchPrimitives.Thumb, { className: cn("pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg transition-transform duration-200 data-[state=checked]:translate-x-0") }) })));
Switch.displayName = SwitchPrimitives.Root.displayName;
export { Switch };
