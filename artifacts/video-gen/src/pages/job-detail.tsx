import React from "react";
import { useGetJob, useCancelJob } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { ArrowLeft, Ban, PlaySquare, Settings2, Download, AlertTriangle, MonitorPlay } from "lucide-react";
import { JobStatusBadge } from "@/components/job-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export default function JobDetail() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const { data: job, isLoading, refetch } = useGetJob(id, {
    query: { refetchInterval: (data) => (data?.status === 'processing' || data?.status === 'queued') ? 2000 : false }
  });

  const cancelJob = useCancelJob();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading job details...</div>;
  }

  if (!job) {
    return <div className="p-8 text-center text-destructive">Job not found</div>;
  }

  const handleCancel = () => {
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

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-white/5">
          <Link href="/jobs"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            Render Detail
            <span className="font-mono text-sm px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground font-normal border border-border">
              {job.id}
            </span>
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <JobStatusBadge status={job.status} />
          {job.status === 'queued' && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleCancel}
              disabled={cancelJob.isPending}
            >
              <Ban className="w-4 h-4 mr-2" /> Cancel Render
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column - Main Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Output Preview Area */}
          <div className="aspect-video w-full rounded-xl border border-border/50 bg-black overflow-hidden relative shadow-2xl flex flex-col items-center justify-center">
            {job.status === 'done' ? (
              <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm group">
                <Button size="lg" className="rounded-full h-16 px-8 gap-3 opacity-90 group-hover:opacity-100 transition-opacity">
                  <PlaySquare className="w-6 h-6 fill-current" />
                  Play Result
                </Button>
              </div>
            ) : job.status === 'processing' ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-card/20 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(139,92,246,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[gradient_3s_linear_infinite]" />
                <MonitorPlay className="w-12 h-12 text-primary mb-6 animate-pulse" />
                <div className="w-full max-w-md space-y-3 z-10">
                  <div className="flex justify-between text-sm font-mono text-primary">
                    <span>Rendering Frame Sequence</span>
                    <span>{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} className="h-2 bg-background/50 border border-primary/20" />
                </div>
              </div>
            ) : job.status === 'failed' ? (
              <div className="text-center text-destructive flex flex-col items-center">
                <AlertTriangle className="w-12 h-12 mb-4 opacity-80" />
                <p className="font-medium">Render Failed</p>
                {job.errorMessage && <p className="text-sm mt-2 max-w-sm opacity-80">{job.errorMessage}</p>}
              </div>
            ) : (
              <div className="text-center text-muted-foreground flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/50 animate-[spin_10s_linear_infinite] mb-4 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                </div>
                <p className="font-medium">Waiting in Queue</p>
              </div>
            )}
          </div>

          <Card className="bg-card/40 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-foreground leading-relaxed font-serif">
                "{job.prompt}"
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          <Card className="bg-card/40 border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-muted-foreground" />
                Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">Resolution</span>
                <span className="font-mono text-sm">{job.resolutionWidth} × {job.resolutionHeight}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">Duration</span>
                <span className="font-mono text-sm">{job.duration} sec</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">Created</span>
                <span className="text-sm">{format(new Date(job.createdAt), "MMM d, HH:mm")}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground text-sm">Updated</span>
                <span className="text-sm">{format(new Date(job.updatedAt), "MMM d, HH:mm")}</span>
              </div>
            </CardContent>
          </Card>

          {job.status === 'done' && (
            <Button className="w-full" size="lg" variant="default">
              <Download className="w-4 h-4 mr-2" /> Download MP4
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
