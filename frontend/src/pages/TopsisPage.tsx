import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jobsApi } from "../api/jobsApi";
import { topsisApi } from "../api/topsisApi";
import { applicationsApi } from "../api/applicationsApi";
import { useAppSelector } from "../hooks/redux";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { getErrorMessage } from "../lib/error";

export function TopsisPage() {
  const queryClient = useQueryClient();
  const user = useAppSelector((state) => state.auth.user);
  const jobsQuery = useQuery({
    queryKey: ["jobs", 1, 50],
    queryFn: () => jobsApi.getAll({ page: 1, limit: 50 }),
  });

  const recruiterJobs = useMemo(
    () => (jobsQuery.data?.items ?? []).filter((job) => job.userId === user?._id),
    [jobsQuery.data, user?._id]
  );

  const [jobId, setJobId] = useState<number>(0);
  const [weights, setWeights] = useState({ skills: 4, experience: 3, rating: 2, salary: 1, topN: 5 });
  const [errorText, setErrorText] = useState("");

  const rankingMutation = useMutation({
    mutationFn: () => topsisApi.rank(jobId, weights),
    onError: (error) => setErrorText(getErrorMessage(error)),
  });

  const updateApplicationMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: number; status: "accepted" | "rejected" }) =>
      applicationsApi.updateStatus(applicationId, { status }),
    onSuccess: () => {
      setErrorText("");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      if (jobId > 0) {
        rankingMutation.mutate();
      }
    },
    onError: (error) => setErrorText(getErrorMessage(error)),
  });

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="mb-4 text-2xl font-semibold">TOPSIS Ranking</h1>
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            setErrorText("");
            rankingMutation.mutate();
          }}
        >
          <label className="block space-y-1 text-sm md:col-span-2">
            <span className="font-medium text-slate-700">Job</span>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              value={jobId}
              onChange={(e) => setJobId(Number(e.target.value))}
            >
              <option value={0}>Select job</option>
              {recruiterJobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </select>
          </label>
          <Input label="Skills Weight" type="number" value={weights.skills} onChange={(e) => setWeights((w) => ({ ...w, skills: Number(e.target.value) }))} />
          <Input label="Experience Weight" type="number" value={weights.experience} onChange={(e) => setWeights((w) => ({ ...w, experience: Number(e.target.value) }))} />
          <Input label="Rating Weight" type="number" value={weights.rating} onChange={(e) => setWeights((w) => ({ ...w, rating: Number(e.target.value) }))} />
          <Input label="Salary Weight" type="number" value={weights.salary} onChange={(e) => setWeights((w) => ({ ...w, salary: Number(e.target.value) }))} />
          <Input label="Top N" type="number" value={weights.topN} onChange={(e) => setWeights((w) => ({ ...w, topN: Number(e.target.value) }))} />
          <div className="md:col-span-2">
            <Button type="submit" disabled={rankingMutation.isPending || !jobId}>
              {rankingMutation.isPending ? "Ranking..." : "Apply Ranking"}
            </Button>
          </div>
        </form>
        {errorText ? <p className="mt-2 text-sm text-rose-600">{errorText}</p> : null}
      </Card>

      {rankingMutation.data ? (
        <Card>
          <h2 className="mb-3 text-xl font-semibold">Ranked Candidates</h2>
          <p className="mb-3 text-sm text-slate-600">
            Total ranked: {rankingMutation.data.totalRankedCandidates}. Average score:{" "}
            {rankingMutation.data.averageScore}
          </p>
          <div className="space-y-2">
            {rankingMutation.data.topCandidates.map((candidate, index) => (
              <div key={candidate.applicationId} className="rounded border p-3 text-sm">
                <p className="font-semibold">
                  #{index + 1} {candidate.name} (score: {candidate.score})
                </p>
                <p>
                  Skills: {candidate.criteria.skills.toFixed(1)} | Experience:{" "}
                  {candidate.criteria.experience} | Rating: {candidate.criteria.rating} | Salary:{" "}
                  {candidate.criteria.salary}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      updateApplicationMutation.mutate({
                        applicationId: candidate.applicationId,
                        status: "accepted",
                      })
                    }
                    disabled={updateApplicationMutation.isPending}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      updateApplicationMutation.mutate({
                        applicationId: candidate.applicationId,
                        status: "rejected",
                      })
                    }
                    disabled={updateApplicationMutation.isPending}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
