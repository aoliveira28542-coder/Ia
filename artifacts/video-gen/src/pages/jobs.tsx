import { useQuery } from "@tanstack/react-query";

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

export default function Jobs() {
  const { data, error, isLoading } = useQuery<ListJobs200>({
    queryKey: ["jobs"],
    queryFn: getJobs,
    refetchInterval: 2000,
  });

  if (isLoading) return <div>Carregando...</div>;

  if (error) return <div>Erro ao carregar jobs</div>;

  return (
    <main>
      <h1>Jobs</h1>

      {data?.jobs?.map((job) => (
        <div key={job.id}>
          {job.id} - {job.status}
        </div>
      ))}
    </main>
  );
}
