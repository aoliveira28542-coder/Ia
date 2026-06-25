import React from "react";
import { useListJobs, useCancelJob } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatDistanceToNow, format } from "date-fns";
import { Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { JobStatusBadge } from "@/components/job-status-badge";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

export default function JobsList() {
  const [filter, setFilter] = React.useState<string>("all");
  const { toast } = useToast();
  
  const { data, isLoading, refetch } = useListJobs({
    query: { refetchInterval: 3000 }
  });

  const cancelJob = useCancelJob();

  const handleCancel = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // prevent navigation
    cancelJob.mutate({ id }, {
      onSuccess: () => {
        toast({ description: "Job cancelled successfully" });
        refetch();
      },
      onError: (err) => {
        toast({ title: "Error", description: err.error, variant: "destructive" });
      }
    });
  };

  const jobs = data?.jobs || [];
  const filteredJobs = filter === "all" ? jobs : jobs.filter(j => j.status === filter);
  
  // Sort descending by creation date
  const sortedJobs = [...filteredJobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Job History</h1>
          <p className="text-muted-foreground mt-1">All renders, past and present.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search prompts..." 
              className="pl-9 bg-card/50 border-border/50 focus-visible:ring-primary/50"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px] bg-card/50 border-border/50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="done">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border/50 text-sm font-medium text-muted-foreground bg-background/50">
          <div className="col-span-5">Prompt & ID</div>
          <div className="col-span-2">Settings</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        
        <div className="divide-y divide-border/30">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading jobs...</div>
          ) : sortedJobs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No jobs found matching your criteria.
            </div>
          ) : (
            sortedJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group">
                <div className="col-span-5 space-y-1 pr-4">
                  <p className="text-sm text-foreground/90 font-medium truncate" title={job.prompt}>
                    {job.prompt}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {job.id}
                  </p>
                </div>
                
                <div className="col-span-2">
                  <div className="inline-flex gap-2">
                    <span className="px-2 py-0.5 rounded bg-background border border-border/50 text-xs text-muted-foreground font-mono">
                      {job.duration}s
                    </span>
                    <span className="px-2 py-0.5 rounded bg-background border border-border/50 text-xs text-muted-foreground font-mono">
                      {job.resolutionWidth}x{job.resolutionHeight}
                    </span>
                  </div>
                </div>
                
                <div className="col-span-2 flex flex-col gap-1.5 justify-center">
                  <JobStatusBadge status={job.status} />
                  {job.status === 'processing' && (
                    <Progress value={job.progress} className="h-1 bg-background border border-border/50 w-24" />
                  )}
                </div>
                
                <div className="col-span-2 text-sm text-muted-foreground">
                  {format(new Date(job.createdAt), "MMM d, HH:mm")}
                </div>
                
                <div className="col-span-1 text-right flex justify-end">
                  {job.status === 'queued' ? (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={(e) => handleCancel(e, job.id)}
                      disabled={cancelJob.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <span className="w-8 h-8 inline-block" /> // spacer
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
