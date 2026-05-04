import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { applicationsApi } from "../api/applicationsApi";
import { Card } from "../components/ui/Card";
import { SwiperPager } from "../components/ui/SwiperPager";

export function CandidateApplicationsPage() {
  const [page, setPage] = useState(1);
  const limit = 8;
  const appsQuery = useQuery({
    queryKey: ["my-applications", page, limit],
    queryFn: () => applicationsApi.getMine({ page, limit }),
  });

  return (
    <Card>
      <h2 className="mb-3 text-xl font-semibold">My Applications</h2>
      <div className="space-y-2">
        {appsQuery.data?.items.map((app) => (
          <div key={app._id} className="rounded-xl border bg-white/60 p-3 text-sm">
            <p>Job ID: {app.jobId}</p>
            <p>
              Status:{" "}
              <span
                className={
                  app.status === "accepted"
                    ? "font-semibold text-emerald-700"
                    : app.status === "rejected"
                      ? "font-semibold text-rose-700"
                      : "font-semibold text-amber-700"
                }
              >
                {app.status}
              </span>
            </p>
            <p>Applied at: {new Date(app.dateOfApplication).toLocaleString()}</p>
            <p className="mt-1 text-slate-600">Cover letter: {app.sop || "(empty)"}</p>
          </div>
        ))}
      </div>
      <SwiperPager
        page={appsQuery.data?.page ?? page}
        totalPages={appsQuery.data?.totalPages ?? 1}
        onChange={(p) => setPage(p)}
      />
    </Card>
  );
}

