"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = Item;
exports.ItemMedia = ItemMedia;
exports.ItemContent = ItemContent;
exports.ItemActions = ItemActions;
exports.ItemGroup = ItemGroup;
exports.ItemSeparator = ItemSeparator;
exports.ItemTitle = ItemTitle;
exports.ItemDescription = ItemDescription;
exports.ItemHeader = ItemHeader;
exports.ItemFooter = ItemFooter;
const React = __importStar(require("react"));
const react_slot_1 = require("@radix-ui/react-slot");
const class_variance_authority_1 = require("class-variance-authority");
const utils_1 = require("@/lib/utils");
const separator_1 = require("@/components/ui/separator");
function ItemGroup({ className, ...props }) {
    return (<div role="list" data-slot="item-group" className={(0, utils_1.cn)("group/item-group flex flex-col", className)} {...props}/>);
}
function ItemSeparator({ className, ...props }) {
    return (<separator_1.Separator data-slot="item-separator" orientation="horizontal" className={(0, utils_1.cn)("my-0", className)} {...props}/>);
}
const itemVariants = (0, class_variance_authority_1.cva)("group/item [a]:hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-ring/50 [a]:transition-colors flex flex-wrap items-center rounded-md border border-transparent text-sm outline-none transition-colors duration-100 focus-visible:ring-[3px]", {
    variants: {
        variant: {
            default: "bg-transparent",
            outline: "border-border",
            muted: "bg-muted/50",
        },
        size: {
            default: "gap-4 p-4 ",
            sm: "gap-2.5 px-4 py-3",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
function Item({ className, variant = "default", size = "default", asChild = false, ...props }) {
    const Comp = asChild ? react_slot_1.Slot : "div";
    return (<Comp data-slot="item" data-variant={variant} data-size={size} className={(0, utils_1.cn)(itemVariants({ variant, size, className }))} {...props}/>);
}
const itemMediaVariants = (0, class_variance_authority_1.cva)("flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:translate-y-0.5 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none", {
    variants: {
        variant: {
            default: "bg-transparent",
            icon: "bg-muted size-8 rounded-sm border [&_svg:not([class*='size-'])]:size-4",
            image: "size-10 overflow-hidden rounded-sm [&_img]:size-full [&_img]:object-cover",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});
function ItemMedia({ className, variant = "default", ...props }) {
    return (<div data-slot="item-media" data-variant={variant} className={(0, utils_1.cn)(itemMediaVariants({ variant, className }))} {...props}/>);
}
function ItemContent({ className, ...props }) {
    return (<div data-slot="item-content" className={(0, utils_1.cn)("flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none", className)} {...props}/>);
}
function ItemTitle({ className, ...props }) {
    return (<div data-slot="item-title" className={(0, utils_1.cn)("flex w-fit items-center gap-2 text-sm font-medium leading-snug", className)} {...props}/>);
}
function ItemDescription({ className, ...props }) {
    return (<p data-slot="item-description" className={(0, utils_1.cn)("text-muted-foreground line-clamp-2 text-balance text-sm font-normal leading-normal", "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4", className)} {...props}/>);
}
function ItemActions({ className, ...props }) {
    return (<div data-slot="item-actions" className={(0, utils_1.cn)("flex items-center gap-2", className)} {...props}/>);
}
function ItemHeader({ className, ...props }) {
    return (<div data-slot="item-header" className={(0, utils_1.cn)("flex basis-full items-center justify-between gap-2", className)} {...props}/>);
}
function ItemFooter({ className, ...props }) {
    return (<div data-slot="item-footer" className={(0, utils_1.cn)("flex basis-full items-center justify-between gap-2", className)} {...props}/>);
}
