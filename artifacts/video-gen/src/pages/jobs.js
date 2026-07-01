"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Jobs;
const react_query_1 = require("@tanstack/react-query");
const lucide_react_1 = require("lucide-react");
async function getJobs() {
    const res = await fetch("/api/jobs");
    return res.json();
}
async function retryJob(id) {
    const res = await fetch(`/api/jobs/${id}/retry`, { method: "POST" });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erro ao tentar novamente");
    }
    return res.json();
}
function Jobs() {
    const queryClient = (0, react_query_1.useQueryClient)();
    const { data, error, isLoading } = (0, react_query_1.useQuery)({
        queryKey: ["jobs"],
        queryFn: getJobs,
        refetchInterval: 2000,
    });
    const retry = (0, react_query_1.useMutation)({
        mutationFn: retryJob,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
    });
    if (isLoading)
        return <div>Carregando...</div>;
    if (error)
        return <div>Erro ao carregar jobs</div>;
    return (<main>
      <h1>Jobs</h1>

      {data?.jobs?.map((job) => (<div key={job.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span>{job.id} - {job.status}</span>
          {(job.status === "failed" || job.status === "cancelled") && (<button onClick={() => retry.mutate(job.id)} disabled={retry.isPending} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <lucide_react_1.RefreshCw size={14}/>
              Tentar novamente
            </button>)}
        </div>))}
    </main>);
}
