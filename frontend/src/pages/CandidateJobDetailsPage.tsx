import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { jobsApi } from "../api/jobsApi";
import { applicationsApi } from "../api/applicationsApi";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Textarea";
import { getErrorMessage } from "../lib/error";

export function CandidateJobDetailsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const jobId = useMemo(() => Number(params.id), [params.id]);
  const [sop, setSop] = useState("");
  const [message, setMessage] = useState("");

  const jobQuery = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => jobsApi.getById(jobId),
    enabled: Number.isInteger(jobId) && jobId > 0,
  });

  const myApplicationQuery = useQuery({
    queryKey: ["my-application", jobId],
    queryFn: () => applicationsApi.getMyByJob(jobId),
    enabled: Number.isInteger(jobId) && jobId > 0,
  });

  const alreadyApplied = Boolean(myApplicationQuery.data?.application);

  const applyMutation = useMutation({
    mutationFn: () => applicationsApi.apply({ jobId, sop }),
    onSuccess: () => {
      setMessage("Applied successfully");
      setSop("");
      queryClient.invalidateQueries({ queryKey: ["my-application", jobId] });
    },
    onError: (error) => setMessage(getErrorMessage(error)),
  });

  if (!Number.isInteger(jobId) || jobId <= 0) {
    return (
      <Card>
        <p className="text-sm text-slate-700">Invalid job id</p>
        <Link to="/candidate/jobs" className="text-indigo-700 underline">
          Back to jobs
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <h1>{jobQuery.data?.title ?? "Job details"}</h1>
          <Button variant="secondary" onClick={() => navigate("/candidate/jobs")}>
            Back
          </Button>
        </div>

        {jobQuery.isLoading ? <p className="mt-3 text-sm text-slate-600">Loading...</p> : null}
        {jobQuery.data ? (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border bg-white/70 p-3">
              <p className="text-sm text-slate-600">Job Type</p>
              <p className="font-semibold">{jobQuery.data.jobType}</p>
            </div>
            <div className="rounded-xl border bg-white/70 p-3">
              <p className="text-sm text-slate-600">Salary</p>
              <p className="font-semibold">{jobQuery.data.salary}</p>
            </div>
            <div className="rounded-xl border bg-white/70 p-3">
              <p className="text-sm text-slate-600">Deadline</p>
              <p className="font-semibold">{jobQuery.data.deadline}</p>
            </div>
            <div className="rounded-xl border bg-white/70 p-3">
              <p className="text-sm text-slate-600">Skills</p>
              <p className="font-semibold">{jobQuery.data.skills.join(", ")}</p>
            </div>
          </div>
        ) : null}
      </Card>

      <Card>
        <h2 className="mb-2">Apply</h2>
        {alreadyApplied ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              You already applied to this job. You can only apply once.
            </p>
            <Textarea
              label="Your cover letter"
              rows={6}
              value={myApplicationQuery.data?.application?.sop ?? ""}
              readOnly
              className="bg-slate-50"
            />
            <Button type="button" disabled>
              Applied
            </Button>
            {message ? <p className="text-sm text-slate-700">{message}</p> : null}
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-600">
              Cover letter is optional. You can leave it empty.
            </p>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                setMessage("");
                applyMutation.mutate();
              }}
            >
              <Textarea
                label="Cover letter (optional)"
                rows={5}
                value={sop}
                onChange={(e) => setSop(e.target.value)}
                placeholder="Write a short cover letter (optional)"
              />
              <Button type="submit" disabled={applyMutation.isPending || jobQuery.isLoading}>
                {applyMutation.isPending ? "Applying..." : "Apply to this job"}
              </Button>
              {message ? <p className="text-sm text-slate-700">{message}</p> : null}
            </form>
          </>
        )}
      </Card>
    </div>
  );
}

