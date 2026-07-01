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
exports.default = Webhooks;
const react_1 = __importStar(require("react"));
const api_client_react_1 = require("@workspace/api-client-react");
const react_query_1 = require("@tanstack/react-query");
const lucide_react_1 = require("lucide-react");
const date_fns_1 = require("date-fns");
const use_toast_1 = require("@/hooks/use-toast");
const EVENT_LABELS = {
    "job.all": {
        label: "All Events",
        description: "Fired on job completion and failure",
        color: "text-violet-400 bg-violet-400/10 border-violet-400/20",
    },
    "job.done": {
        label: "Job Completed",
        description: "Fired when a job finishes successfully",
        color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    },
    "job.failed": {
        label: "Job Failed",
        description: "Fired when a job encounters an error",
        color: "text-red-400 bg-red-400/10 border-red-400/20",
    },
};
function Webhooks() {
    const { data, isLoading } = (0, api_client_react_1.useListWebhooks)();
    const createWebhook = (0, api_client_react_1.useCreateWebhook)();
    const deleteWebhook = (0, api_client_react_1.useDeleteWebhook)();
    const testWebhook = (0, api_client_react_1.useTestWebhook)();
    const queryClient = (0, react_query_1.useQueryClient)();
    const { toast } = (0, use_toast_1.useToast)();
    const [showForm, setShowForm] = (0, react_1.useState)(false);
    const [url, setUrl] = (0, react_1.useState)("");
    const [event, setEvent] = (0, react_1.useState)("job.all");
    const [label, setLabel] = (0, react_1.useState)("");
    const [testingId, setTestingId] = (0, react_1.useState)(null);
    const [deletingId, setDeletingId] = (0, react_1.useState)(null);
    const webhooks = data?.webhooks ?? [];
    function invalidate() {
        queryClient.invalidateQueries({ queryKey: (0, api_client_react_1.getListWebhooksQueryKey)() });
    }
    async function handleCreate(e) {
        e.preventDefault();
        if (!url.trim())
            return;
        createWebhook.mutate({ data: { url: url.trim(), event, label: label.trim() || undefined } }, {
            onSuccess: () => {
                toast({ title: "Webhook registered", description: url.trim() });
                setUrl("");
                setLabel("");
                setEvent("job.all");
                setShowForm(false);
                invalidate();
            },
            onError: (err) => {
                const msg = err instanceof Error ? err.message : "Invalid URL";
                toast({ title: "Failed to register webhook", description: msg, variant: "destructive" });
            },
        });
    }
    async function handleDelete(id) {
        setDeletingId(id);
        deleteWebhook.mutate({ id }, {
            onSuccess: () => {
                toast({ title: "Webhook removed" });
                invalidate();
            },
            onError: () => {
                toast({ title: "Failed to remove webhook", variant: "destructive" });
            },
            onSettled: () => setDeletingId(null),
        });
    }
    async function handleTest(id) {
        setTestingId(id);
        testWebhook.mutate({ id }, {
            onSuccess: (result) => {
                if (result.ok) {
                    toast({ title: "Test delivered", description: `Status ${result.statusCode}` });
                }
                else {
                    toast({
                        title: "Test failed",
                        description: result.statusCode ? `Status ${result.statusCode}` : "No response",
                        variant: "destructive",
                    });
                }
                invalidate();
            },
            onError: () => {
                toast({ title: "Test delivery failed", variant: "destructive" });
            },
            onSettled: () => setTestingId(null),
        });
    }
    return (<div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Webhooks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Get notified when your render jobs complete or fail.
          </p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <lucide_react_1.Plus className="w-4 h-4"/>
          Add Webhook
        </button>
      </div>

      {/* Payload preview */}
      <div className="mb-6 rounded-xl border border-border/50 bg-card/30 p-4">
        <p className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">Example Payload</p>
        <pre className="text-xs text-foreground/80 font-mono overflow-x-auto whitespace-pre-wrap">
        {`{
  "event": "job.done",
  "timestamp": "2026-06-25T22:00:00.000Z",
  "job": {
    "id": "uuid",
    "prompt": "A drone flying over...",
    "status": "done",
    "progress": 100,
    "duration": 10
  }
}`}
        </pre>
      </div>

      {/* Add form */}
      {showForm && (<form onSubmit={handleCreate} className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
          <p className="text-sm font-medium text-foreground">New Webhook</p>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Endpoint URL</label>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-server.com/hook" required className="w-full bg-background/60 border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"/>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Label (optional)</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Slack notification" className="w-full bg-background/60 border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"/>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Trigger on</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(EVENT_LABELS).map((ev) => (<button key={ev} type="button" onClick={() => setEvent(ev)} className={`text-left px-3 py-2 rounded-lg border text-xs font-medium transition-all ${event === ev
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 bg-background/40 text-muted-foreground hover:border-border"}`}>
                  <span className="block font-semibold">{EVENT_LABELS[ev].label}</span>
                  <span className="block mt-0.5 opacity-70">{EVENT_LABELS[ev].description}</span>
                </button>))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={createWebhook.isPending} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {createWebhook.isPending ? "Registering..." : "Register"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors">
              Cancel
            </button>
          </div>
        </form>)}

      {/* List */}
      {isLoading ? (<div className="space-y-3">
          {[1, 2].map((i) => (<div key={i} className="h-20 rounded-xl bg-card/30 border border-border/40 animate-pulse"/>))}
        </div>) : webhooks.length === 0 ? (<div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted/20 flex items-center justify-center mb-4">
            <lucide_react_1.Webhook className="w-6 h-6 text-muted-foreground"/>
          </div>
          <p className="text-sm font-medium text-foreground">No webhooks yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add an endpoint to get notified when jobs complete.
          </p>
        </div>) : (<div className="space-y-3">
          {webhooks.map((hook) => {
                const meta = EVENT_LABELS[hook.event] ?? EVENT_LABELS["job.all"];
                const isTesting = testingId === hook.id;
                const isDeleting = deletingId === hook.id;
                return (<div key={hook.id} className="rounded-xl border border-border/40 bg-card/30 p-4 flex items-start gap-4 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {hook.label && (<span className="text-sm font-medium text-foreground">{hook.label}</span>)}
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${meta.color}`}>
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground truncate">{hook.url}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {hook.lastFiredAt ? (<>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <lucide_react_1.Clock className="w-3 h-3"/>
                          {(0, date_fns_1.formatDistanceToNow)(new Date(hook.lastFiredAt), { addSuffix: true })}
                        </span>
                        {hook.lastStatusCode != null && (<span className={`flex items-center gap-1 text-xs ${hook.lastStatusCode >= 200 && hook.lastStatusCode < 300 ? "text-emerald-400" : "text-red-400"}`}>
                            {hook.lastStatusCode >= 200 && hook.lastStatusCode < 300
                                ? <lucide_react_1.CheckCircle2 className="w-3 h-3"/>
                                : <lucide_react_1.XCircle className="w-3 h-3"/>}
                            {hook.lastStatusCode}
                          </span>)}
                      </>) : (<span className="text-xs text-muted-foreground/60">Never fired</span>)}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleTest(hook.id)} disabled={isTesting} title="Send test ping" className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50">
                    <lucide_react_1.Zap className="w-4 h-4"/>
                  </button>
                  <button onClick={() => handleDelete(hook.id)} disabled={isDeleting} title="Remove webhook" className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50">
                    <lucide_react_1.Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              </div>);
            })}
        </div>)}
    </div>);
}
