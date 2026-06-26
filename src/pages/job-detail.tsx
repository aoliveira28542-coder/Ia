import { useQuery } from "@tanstack/react-query";

type Job = {
  id: string;
  status: string;
  prompt: string;
  duration: number;
  resolution: string;
};

async function getJob(): Promise<Job> {
  const res = await fetch("/api/job");
  return res.json();
}

export default function JobDetail() {
  const { data, error, isLoading } = useQuery<Job>({
    queryKey: ["job-detail"],
    queryFn: getJob,
    refetchInterval: 2000,
  });

  if (isLoading) return <div>Carregando...</div>;

  if (error) return <div>Erro</div>;

  return (
    <main>
      <h1>{data?.id}</h1>
      <p>{data?.prompt}</p>
      <p>{data?.duration}s</p>
      <p>{data?.resolution}</p>
    </main>
  );
}
