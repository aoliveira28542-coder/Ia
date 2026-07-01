"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = JobDetail;
const react_query_1 = require("@tanstack/react-query");
async function getJob() {
    const res = await fetch("/api/job");
    return res.json();
}
function JobDetail() {
    const { data, error, isLoading } = (0, react_query_1.useQuery)({
        queryKey: ["job-detail"],
        queryFn: getJob,
        refetchInterval: 2000,
    });
    if (isLoading)
        return <div>Carregando...</div>;
    if (error)
        return <div>Erro</div>;
    return (<main>
      <h1>{data?.id}</h1>
      <p>{data?.prompt}</p>
      <p>{data?.duration}s</p>
      <p>{data?.resolution}</p>
    </main>);
}
