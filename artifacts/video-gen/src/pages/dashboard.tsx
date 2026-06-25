import React from "react";
import { useListJobs, useCreateJob } from "@workspace/api-client-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Play, Sparkles, Activity, Clock, Image as ImageIcon, Plus, Loader2 } from "lucide-react";
import { JobStatusBadge } from "@/components/job-status-badge";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  prompt: z.string().min(5, "Prompt must be at least 5 characters.").max(500, "Prompt is too long."),
  duration: z.string().transform((v) => parseInt(v, 10)),
  resolution: z.string()
});

export default function Dashboard() {
  const { toast } = useToast();
  
  // Refetch every 3s to get real-time updates for processing/queued
  const { data, isLoading } = useListJobs({
    query: { refetchInterval: 3000 }
  });

  const createJob = useCreateJob();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      duration: "4",
      resolution: "1920x1080",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const [width, height] = values.resolution.split('x').map(n => parseInt(n, 10));
    
    createJob.mutate({
      data: {
        prompt: values.prompt,
        duration: values.duration,
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
      onError: (err) => {
        toast({
          title: "Failed to queue job",
          description: err.error || "An unknown error occurred",
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Workspace</h1>
          <p className="text-muted-foreground">Submit prompts and monitor your render queue.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Total Jobs</span>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-3xl font-mono font-medium">{stats.total}</span>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <CardContent className="p-6 flex flex-col justify-center relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-primary">In Progress</span>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
            <span className="text-3xl font-mono font-medium text-primary">{stats.processing}</span>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Queued</span>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-3xl font-mono font-medium">{stats.queued}</span>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Completed</span>
              <Sparkles className="w-4 h-4 text-emerald-500/70" />
            </div>
            <span className="text-3xl font-mono font-medium">{stats.completed}</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* New Job Form */}
        <Card className="col-span-1 lg:col-span-1 bg-card/80 border-border/60 shadow-2xl backdrop-blur-md h-fit">
          <CardHeader>
            <CardTitle className="text-xl">New Render</CardTitle>
            <CardDescription>Configure parameters for the AI model</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">Cinematic Prompt</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="A futuristic city at night, neon lights reflecting on wet pavement, cinematic lighting, 8k resolution..." 
                          className="resize-none h-32 bg-background/50 border-border/50 focus-visible:ring-primary/50 text-sm"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Duration</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50 border-border/50">
                              <SelectValue placeholder="Select length" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="2">2 seconds</SelectItem>
                            <SelectItem value="4">4 seconds</SelectItem>
                            <SelectItem value="8">8 seconds</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="resolution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80 flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5"/> Resolution</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50 border-border/50">
                              <SelectValue placeholder="Select res" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1920x1080">1080p (16:9)</SelectItem>
                            <SelectItem value="1080x1920">1080p (9:16)</SelectItem>
                            <SelectItem value="2560x1440">1440p (16:9)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={createJob.isPending}
                  className="w-full mt-4 group relative overflow-hidden transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  {createJob.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enqueueing...</>
                  ) : (
                    <><Play className="mr-2 h-4 w-4 fill-current" /> Submit to Render Farm</>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Active Jobs Queue */}
        <Card className="col-span-1 lg:col-span-2 bg-transparent border-none shadow-none">
          <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Active Queue</CardTitle>
              <CardDescription>Real-time render progress</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="border-border/50 hover:bg-white/5">
              <Link href="/jobs">View History</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 rounded-lg bg-card/40 border border-border/30 animate-pulse" />
                ))}
              </div>
            ) : activeJobs.length === 0 ? (
              <div className="h-48 rounded-lg border border-dashed border-border/50 flex flex-col items-center justify-center text-muted-foreground bg-card/20">
                <Sparkles className="w-8 h-8 mb-3 opacity-50" />
                <p>No active renders.</p>
                <p className="text-sm opacity-70">Submit a prompt to start building.</p>
              </div>
            ) : (
              activeJobs.map(job => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block group">
                  <div className="p-4 rounded-lg bg-card/40 border border-border/50 hover:border-primary/50 hover:bg-card/60 transition-all duration-300 relative overflow-hidden">
                    {job.status === 'processing' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 animate-pulse pointer-events-none" />
                    )}
                    
                    <div className="flex justify-between items-start mb-3 relative z-10">
                      <div className="flex items-center gap-3">
                        <JobStatusBadge status={job.status} />
                        <span className="text-xs font-mono text-muted-foreground">{job.id.substring(0, 8)}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground/90 line-clamp-1 mb-4 relative z-10">
                      "{job.prompt}"
                    </p>
                    
                    {job.status === 'processing' && (
                      <div className="space-y-1.5 relative z-10">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-primary">Rendering</span>
                          <span className="text-primary">{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-1.5 bg-background border border-border/50" />
                      </div>
                    )}
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
