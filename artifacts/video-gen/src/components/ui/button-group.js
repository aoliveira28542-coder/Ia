"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buttonGroupVariants = void 0;
exports.ButtonGroup = ButtonGroup;
exports.ButtonGroupSeparator = ButtonGroupSeparator;
exports.ButtonGroupText = ButtonGroupText;
const react_slot_1 = require("@radix-ui/react-slot");
const class_variance_authority_1 = require("class-variance-authority");
const utils_1 = require("@/lib/utils");
const separator_1 = require("@/components/ui/separator");
const buttonGroupVariants = (0, class_variance_authority_1.cva)("flex w-fit items-stretch has-[>[data-slot=button-group]]:gap-2 [&>*]:focus-visible:relative [&>*]:focus-visible:z-10 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1", {
    variants: {
        orientation: {
            horizontal: "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none",
            vertical: "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none",
        },
    },
    defaultVariants: {
        orientation: "horizontal",
    },
});
exports.buttonGroupVariants = buttonGroupVariants;
function ButtonGroup({ className, orientation, ...props }) {
    return (<div role="group" data-slot="button-group" data-orientation={orientation} className={(0, utils_1.cn)(buttonGroupVariants({ orientation }), className)} {...props}/>);
}
function ButtonGroupText({ className, asChild = false, ...props }) {
    const Comp = asChild ? react_slot_1.Slot : "div";
    return (<Comp className={(0, utils_1.cn)("bg-muted shadow-xs flex items-center gap-2 rounded-md border px-4 text-sm font-medium [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none", className)} {...props}/>);
}
function ButtonGroupSeparator({ className, orientation = "vertical", ...props }) {
    return (<separator_1.Separator data-slot="button-group-separator" orientation={orientation} className={(0, utils_1.cn)("bg-input relative !m-0 self-stretch data-[orientation=vertical]:h-auto", className)} {...props}/>);
}
