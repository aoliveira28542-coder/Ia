"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobStatusBadge = JobStatusBadge;
const lucide_react_1 = require("lucide-react");
function JobStatusBadge({ status }) {
    switch (status) {
        case "queued":
            return (<div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border">
          <lucide_react_1.CircleDashed className="w-3.5 h-3.5"/>
          Queued
        </div>);
        case "processing":
            return (<div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium border border-primary/30 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
          <lucide_react_1.Loader2 className="w-3.5 h-3.5 animate-spin"/>
          Processing
        </div>);
        case "done":
            return (<div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
          <lucide_react_1.CheckCircle2 className="w-3.5 h-3.5"/>
          Completed
        </div>);
        case "failed":
            return (<div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
          <lucide_react_1.XCircle className="w-3.5 h-3.5"/>
          Failed
        </div>);
        case "cancelled":
            return (<div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium border border-border">
          <lucide_react_1.Ban className="w-3.5 h-3.5"/>
          Cancelled
        </div>);
        default:
            return null;
    }
}
