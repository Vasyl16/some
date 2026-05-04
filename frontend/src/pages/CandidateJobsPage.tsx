import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { jobsApi } from "../api/jobsApi";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { SwiperPager } from "../components/ui/SwiperPager";

export function CandidateJobsPage() {
  const [page, setPage] = useState(1);
  const limit = 8;
  const jobsQuery = useQuery({
    queryKey: ["jobs", page, limit],
    queryFn: () => jobsApi.getAll({ page, limit }),
  });

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-3 text-xl font-semibold">Available Jobs</h2>
        <div className="space-y-3">
          {jobsQuery.data?.items.map((job) => (
            <div key={job._id} className="rounded border p-3">
              <p className="font-semibold">{job.title}</p>
              <p className="text-sm text-slate-600">Skills: {job.skills.join(", ")}</p>
              <p className="text-sm text-slate-600">Salary: {job.salary}</p>
              <div className="mt-2 flex gap-2">
                <Link to={`/candidate/jobs/${job._id}`}>
                  <Button>View</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        <SwiperPager
          page={jobsQuery.data?.page ?? page}
          totalPages={jobsQuery.data?.totalPages ?? 1}
          onChange={(p) => setPage(p)}
        />
      </Card>
    </div>
  );
}
