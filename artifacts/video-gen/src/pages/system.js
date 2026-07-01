"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = System;
const react_query_1 = require("@tanstack/react-query");
const api_client_react_1 = require("@workspace/api-client-react");
const lucide_react_1 = require("lucide-react");
const date_fns_1 = require("date-fns");
function System() {
    const { data, isLoading, dataUpdatedAt } = (0, react_query_1.useQuery)({
        ...(0, api_client_react_1.getGetSystemStatusQueryOptions)(),
        refetchInterval: 3000,
    });
    const isOnline = data?.worker === "online";
    return (<div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">System</h1>
        <p className="text-sm text-muted-foreground mt-1">Worker health and queue observability.</p>
      </div>

      {/* Worker status banner */}
      <div className={`rounded-xl border p-5 flex items-center gap-4 ${isOnline
            ? "border-emerald-500/20 bg-emerald-500/5"
            : "border-red-500/20 bg-red-500/5"}`}>
        <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`}/>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${isOnline ? "text-emerald-400" : "text-red-400"}`}>
            WORKER {isLoading ? "..." : isOnline ? "ONLINE" : "OFFLINE"}
          </p>
          {data?.lastHeartbeat && (<p className="text-xs text-muted-foreground mt-0.5">
              Last heartbeat {(0, date_fns_1.formatDistanceToNow)(new Date(data.lastHeartbeat), { addSuffix: true })}
            </p>)}
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Uptime</p>
          <p className="text-sm font-mono font-medium text-foreground">{data?.uptime ?? "—"}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Queued" value={data?.queue ?? 0} icon={<lucide_react_1.Clock className="w-4 h-4"/>} color="text-muted-foreground" isLoading={isLoading}/>
        <StatCard label="Processing" value={data?.processing ?? 0} icon={<lucide_react_1.Activity className="w-4 h-4"/>} color="text-primary" isLoading={isLoading} highlight={!!data?.processing}/>
        <StatCard label="Failed" value={data?.failed ?? 0} icon={<lucide_react_1.AlertTriangle className="w-4 h-4"/>} color={data?.failed ? "text-red-400" : "text-muted-foreground"} isLoading={isLoading}/>
        <StatCard label="Memory" value={data ? `${data.memoryMB} MB` : "—"} icon={<lucide_react_1.Cpu className="w-4 h-4"/>} color="text-muted-foreground" isLoading={isLoading}/>
      </div>

      {/* Current jobs */}
      <div className="rounded-xl border border-border/40 bg-card/30 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Jobs</p>
          {data && (<span className="text-xs text-muted-foreground">{data.currentJobIds.length} / {data.concurrency} slots</span>)}
        </div>
        {data && data.currentJobIds.length > 0 ? (<div className="space-y-2">
            {data.currentJobIds.map((jobId) => (<div key={jobId} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"/>
                <p className="text-sm font-mono text-foreground">{jobId}</p>
              </div>))}
          </div>) : (<div className="flex items-center gap-2 text-muted-foreground/60">
            <lucide_react_1.CheckCircle2 className="w-4 h-4"/>
            <p className="text-sm">No jobs processing right now</p>
          </div>)}
      </div>

      {/* Live indicator */}
      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground/50">
        <lucide_react_1.RefreshCw className="w-3 h-3"/>
        <span>Auto-refreshes every 3s</span>
        {dataUpdatedAt > 0 && (<span>· Updated {(0, date_fns_1.formatDistanceToNow)(new Date(dataUpdatedAt), { addSuffix: true })}</span>)}
      </div>
    </div>);
}
function StatCard({ label, value, icon, color, isLoading, highlight, }) {
    return (<div className={`rounded-xl border p-4 bg-card/30 ${highlight ? "border-primary/30" : "border-border/40"}`}>
      <div className={`flex items-center gap-1.5 mb-3 ${color}`}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      {isLoading ? (<div className="h-7 w-12 rounded bg-muted/30 animate-pulse"/>) : (<p className={`text-2xl font-mono font-semibold ${color}`}>{value}</p>)}
    </div>);
}
