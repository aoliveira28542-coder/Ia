import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

type Job = {
  id: string;
  status: string;
  prompt?: string;
};

type ListJobs200 = {
  jobs: Job[];
};

async function getJobs(): Promise<ListJobs200> {
  const res = await fetch("/api/jobs");
  return res.json();
}

async function retryJob(id: string): Promise<Job> {
  const res = await fetch(`/api/jobs/${id}/retry`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Erro ao tentar novamente");
  }
  return res.json();
}

export default function Jobs() {
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery<ListJobs200>({
    queryKey: ["jobs"],
    queryFn: getJobs,
    refetchInterval: 2000,
  });

  const retry = useMutation({
    mutationFn: retryJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  });

  if (isLoading) return <div>Carregando...</div>;

  if (error) return <div>Erro ao carregar jobs</div>;

  return (
    <main>
      <h1>Jobs</h1>

      {data?.jobs?.map((job) => (
        <div key={job.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span>{job.id} - {job.status}</span>
          {(job.status === "failed" || job.status === "cancelled") && (
            <button
              onClick={() => retry.mutate(job.id)}
              disabled={retry.isPending}
              style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}
            >
              <RefreshCw size={14} />
              Tentar novamente
            </button>
          )}
        </div>
      ))}
    </main>
  );
}
