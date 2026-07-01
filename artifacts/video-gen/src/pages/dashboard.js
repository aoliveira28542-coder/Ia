"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Dashboard;
const react_1 = __importDefault(require("react"));
const api_client_react_1 = require("@workspace/api-client-react");
const react_query_1 = require("@tanstack/react-query");
const zod_1 = require("zod");
const react_hook_form_1 = require("react-hook-form");
const zod_2 = require("@hookform/resolvers/zod");
const use_toast_1 = require("@/hooks/use-toast");
const wouter_1 = require("wouter");
const date_fns_1 = require("date-fns");
const lucide_react_1 = require("lucide-react");
const job_status_badge_1 = require("@/components/job-status-badge");
const form_1 = require("@/components/ui/form");
const textarea_1 = require("@/components/ui/textarea");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const select_1 = require("@/components/ui/select");
const progress_1 = require("@/components/ui/progress");
const formSchema = zod_1.z.object({
    prompt: zod_1.z.string().min(5, "Prompt must be at least 5 characters.").max(500, "Prompt is too long."),
    duration: zod_1.z.string(),
    resolution: zod_1.z.string()
});
function Dashboard() {
    const { toast } = (0, use_toast_1.useToast)();
    // Refetch every 3s to get real-time updates for processing/queued
    const { data, isLoading } = (0, react_query_1.useQuery)({
        ...(0, api_client_react_1.getListJobsQueryOptions)(),
        refetchInterval: 3000,
    });
    const createJob = (0, api_client_react_1.useCreateJob)();
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_2.zodResolver)(formSchema),
        defaultValues: {
            prompt: "",
            duration: "4",
            resolution: "1920x1080",
        },
    });
    function onSubmit(values) {
        const [width, height] = values.resolution.split('x').map(n => parseInt(n, 10));
        const duration = parseInt(values.duration, 10);
        createJob.mutate({
            data: {
                prompt: values.prompt,
                duration,
                resolutionWidth: width,
                resolutionHeight: height
            }
        }, {
            onSuccess: () => {
                toast({
                    title: "Job queued",
                    description: "Your rendering job has been added to the queue.",
                });
                form.reset();
            },
            onError: () => {
                toast({
                    title: "Failed to queue job",
                    description: "An unknown error occurred",
                    variant: "destructive"
                });
            }
        });
    }
    const jobs = data?.jobs || [];
    const activeJobs = jobs.filter(j => j.status === 'processing' || j.status === 'queued').slice(0, 5);
    const stats = {
        total: jobs.length,
        processing: jobs.filter(j => j.status === 'processing').length,
        queued: jobs.filter(j => j.status === 'queued').length,
        completed: jobs.filter(j => j.status === 'done').length,
    };
    return (<div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Workspace</h1>
          <p className="text-muted-foreground">Submit prompts and monitor your render queue.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <card_1.CardContent className="p-6 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Total Jobs</span>
              <lucide_react_1.Activity className="w-4 h-4 text-muted-foreground"/>
            </div>
            <span className="text-3xl font-mono font-medium">{stats.total}</span>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card className="bg-card/50 border-border/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none"/>
          <card_1.CardContent className="p-6 flex flex-col justify-center relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-primary">In Progress</span>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"/>
            </div>
            <span className="text-3xl font-mono font-medium text-primary">{stats.processing}</span>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <card_1.CardContent className="p-6 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Queued</span>
              <lucide_react_1.Clock className="w-4 h-4 text-muted-foreground"/>
            </div>
            <span className="text-3xl font-mono font-medium">{stats.queued}</span>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <card_1.CardContent className="p-6 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Completed</span>
              <lucide_react_1.Sparkles className="w-4 h-4 text-emerald-500/70"/>
            </div>
            <span className="text-3xl font-mono font-medium">{stats.completed}</span>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* New Job Form */}
        <card_1.Card className="col-span-1 lg:col-span-1 bg-card/80 border-border/60 shadow-2xl backdrop-blur-md h-fit">
          <card_1.CardHeader>
            <card_1.CardTitle className="text-xl">New Render</card_1.CardTitle>
            <card_1.CardDescription>Configure parameters for the AI model</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <form_1.Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <form_1.FormField control={form.control} name="prompt" render={({ field }) => (<form_1.FormItem>
                      <form_1.FormLabel className="text-foreground/80">Cinematic Prompt</form_1.FormLabel>
                      <form_1.FormControl>
                        <textarea_1.Textarea placeholder="A futuristic city at night, neon lights reflecting on wet pavement, cinematic lighting, 8k resolution..." className="resize-none h-32 bg-background/50 border-border/50 focus-visible:ring-primary/50 text-sm" {...field}/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>)}/>
                
                <div className="grid grid-cols-2 gap-4">
                  <form_1.FormField control={form.control} name="duration" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel className="text-foreground/80 flex items-center gap-1.5"><lucide_react_1.Clock className="w-3.5 h-3.5"/> Duration</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger className="bg-background/50 border-border/50">
                              <select_1.SelectValue placeholder="Select length"/>
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            <select_1.SelectItem value="2">2 seconds</select_1.SelectItem>
                            <select_1.SelectItem value="4">4 seconds</select_1.SelectItem>
                            <select_1.SelectItem value="8">8 seconds</select_1.SelectItem>
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                  
                  <form_1.FormField control={form.control} name="resolution" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel className="text-foreground/80 flex items-center gap-1.5"><lucide_react_1.Image className="w-3.5 h-3.5"/> Resolution</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger className="bg-background/50 border-border/50">
                              <select_1.SelectValue placeholder="Select res"/>
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            <select_1.SelectItem value="1920x1080">1080p (16:9)</select_1.SelectItem>
                            <select_1.SelectItem value="1080x1920">1080p (9:16)</select_1.SelectItem>
                            <select_1.SelectItem value="2560x1440">1440p (16:9)</select_1.SelectItem>
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                </div>

                <button_1.Button type="submit" disabled={createJob.isPending} className="w-full mt-4 group relative overflow-hidden transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"/>
                  {createJob.isPending ? (<><lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/> Enqueueing...</>) : (<><lucide_react_1.Play className="mr-2 h-4 w-4 fill-current"/> Submit to Render Farm</>)}
                </button_1.Button>
              </form>
            </form_1.Form>
          </card_1.CardContent>
        </card_1.Card>

        {/* Active Jobs Queue */}
        <card_1.Card className="col-span-1 lg:col-span-2 bg-transparent border-none shadow-none">
          <card_1.CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
            <div>
              <card_1.CardTitle className="text-xl">Active Queue</card_1.CardTitle>
              <card_1.CardDescription>Real-time render progress</card_1.CardDescription>
            </div>
            <button_1.Button variant="outline" size="sm" asChild className="border-border/50 hover:bg-white/5">
              <wouter_1.Link href="/jobs">View History</wouter_1.Link>
            </button_1.Button>
          </card_1.CardHeader>
          <card_1.CardContent className="px-0 space-y-3">
            {isLoading ? (<div className="space-y-3">
                {[1, 2, 3].map(i => (<div key={i} className="h-24 rounded-lg bg-card/40 border border-border/30 animate-pulse"/>))}
              </div>) : activeJobs.length === 0 ? (<div className="h-48 rounded-lg border border-dashed border-border/50 flex flex-col items-center justify-center text-muted-foreground bg-card/20">
                <lucide_react_1.Sparkles className="w-8 h-8 mb-3 opacity-50"/>
                <p>No active renders.</p>
                <p className="text-sm opacity-70">Submit a prompt to start building.</p>
              </div>) : (activeJobs.map(job => (<wouter_1.Link key={job.id} href={`/jobs/${job.id}`} className="block group">
                  <div className="p-4 rounded-lg bg-card/40 border border-border/50 hover:border-primary/50 hover:bg-card/60 transition-all duration-300 relative overflow-hidden">
                    {job.status === 'processing' && (<div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 animate-pulse pointer-events-none"/>)}
                    
                    <div className="flex justify-between items-start mb-3 relative z-10">
                      <div className="flex items-center gap-3">
                        <job_status_badge_1.JobStatusBadge status={job.status}/>
                        <span className="text-xs font-mono text-muted-foreground">{job.id.substring(0, 8)}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {(0, date_fns_1.formatDistanceToNow)(new Date(job.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground/90 line-clamp-1 mb-4 relative z-10">
                      "{job.prompt}"
                    </p>
                    
                    {job.status === 'processing' && (<div className="space-y-1.5 relative z-10">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-primary">Rendering</span>
                          <span className="text-primary">{job.progress}%</span>
                        </div>
                        <progress_1.Progress value={job.progress} className="h-1.5 bg-background border border-border/50"/>
                      </div>)}
                  </div>
                </wouter_1.Link>)))}
          </card_1.CardContent>
        </card_1.Card>
      </div>
    </div>);
}
